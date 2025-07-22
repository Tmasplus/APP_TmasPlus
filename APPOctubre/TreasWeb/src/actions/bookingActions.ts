import {
    CONFIRM_BOOKING,
    CONFIRM_BOOKING_SUCCESS,
    CONFIRM_BOOKING_FAILED,
    CLEAR_BOOKING
} from "../interfaces/actionTypes";
import { RequestPushMsg } from '../other/NotificationFunctions';
//import store from '../store/store';
import { firebase } from '../common/configFirebase';
import { formatBookingObject } from '../other/sharedFunctions';
import { get, onValue, push, set, ref,update ,getDatabase} from "firebase/database";
import { Dispatch } from 'redux';
import { UPDATE_BOOKING } from '../interfaces/actionTypes';

export const saveBooking = async (bookingData: any) => {
    const { database } = firebase;
  
    console.log("Booking data to save:", bookingData); // Verifica los datos antes de guardarlos
  
    try {
      const newBookingRef = push(ref(database, 'bookings'));
      await set(newBookingRef, bookingData);
      console.log("Booking saved at path:", newBookingRef.toString()); // Añade este log
      return { success: true, key: newBookingRef.key };
    } catch (error) {
      console.error("Error saving booking: ", error);
      throw error;
    }
  };

export const clearBooking = () => (dispatch) => {
    dispatch({
        type: CLEAR_BOOKING,
        payload: null,
    });
}

export const addBooking = (bookingData: any) => async (dispatch: any) => {
    const { database } = firebase;
  
    const bookingRef = ref(database, 'bookings');
    const settingsRef = ref(database, 'settings');
    const singleUserRef = (uid: string) => ref(database, `users/${uid}`);
  
    dispatch({
      type: CONFIRM_BOOKING,
      payload: bookingData,
    });
  
    try {
      const settingsData = await get(settingsRef);
      const settings = settingsData.val();
  
      let data = await formatBookingObject(bookingData, settings);
  
      if (bookingData.requestedDrivers) {
        const drivers = bookingData.requestedDrivers;
        Object.keys(drivers).forEach((uid) => {
          onValue(singleUserRef(uid), snapshot => {
            if (snapshot.val()) {
              const pushToken = snapshot.val().pushToken;
              const ios = snapshot.val().userPlatform === "IOS";
              if (pushToken) {
                RequestPushMsg(pushToken, {
                  title: 'Notificación de TREASAPP',
                  msg: 'Tiene una nueva solicitud de reserva',
                  screen: 'DriverTrips',
                  channelId: 'bookings-repeat',
                  ios: ios
                });
              }
            }
          }, { onlyOnce: true });
        });
      }
  
      const res = await push(bookingRef, data);
      const bookingKey = res.key;
  
      dispatch({
        type: CONFIRM_BOOKING_SUCCESS,
        payload: {
          booking_id: bookingKey,
          mainData: {
            ...data,
            id: bookingKey
          }
        }
      });
    } catch (error) {
      dispatch({
        type: CONFIRM_BOOKING_FAILED,
        payload: error.code + ": " + error.message,
      });
    }
  };
 