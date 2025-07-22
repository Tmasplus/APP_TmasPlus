import {
  FETCH_BOOKINGS,
  FETCH_BOOKINGS_SUCCESS,
  FETCH_BOOKINGS_FAILED,
  UPDATE_BOOKING,
  CANCEL_BOOKING,
  FETCH_REPORT_INCIDENTS
} from "../store/types";
import { fetchBookingLocations } from '../actions/locationactions';
import { RequestPushMsg } from '../other/NotificationFunctions';
import store from '../store/store';
import { firebase } from '../config/configureFirebase';
import { addActualsToBooking, saveAddresses, updateDriverQueue } from "../other/sharedFunctions";
import { get, onValue, update, off, remove, push } from "firebase/database";
import { uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const fetchBookings = () => (dispatch) => {

  const {
    bookingListRef,
  } = firebase;

  dispatch({
    type: FETCH_BOOKINGS,
    payload: null,
  });

  const userInfo = store.getState().auth.profile;

  off(bookingListRef(userInfo.uid, userInfo.usertype));
  onValue(bookingListRef(userInfo.uid, userInfo.usertype),(snapshot) => {
    if (snapshot.val()) {
      const data = snapshot.val();
      const active = [];
      let tracked = null;
      const bookings = Object.keys(data)
        .map((i) => {
          data[i].id = i;
          data[i].pickupAddress = data[i].pickup.add;
          data[i].dropAddress = data[i].drop.add;
          data[i].discount = data[i].discount
            ? data[i].discount
            : 0;
          data[i].cashPaymentAmount = data[i].cashPaymentAmount
            ? data[i].cashPaymentAmount
            : 0;
          data[i].cardPaymentAmount = data[i].cardPaymentAmount
            ? data[i].cardPaymentAmount
            : 0;
          return data[i];
        });
      for (let i = 0; i < bookings.length; i++) {
        if (['PAYMENT_PENDING','NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'PAID'].indexOf(bookings[i].status) != -1) {
          active.push(bookings[i]);
        }
        if ((['ACCEPTED', 'ARRIVED', 'STARTED'].indexOf(bookings[i].status) != -1) && userInfo.usertype == 'driver') {
          tracked = bookings[i];
          fetchBookingLocations(tracked.id)(dispatch);
        }
      }
      dispatch({
        type: FETCH_BOOKINGS_SUCCESS,
        payload: {
          bookings: bookings.reverse(),
          active: active,
          tracked: tracked
        },
      });
      if (tracked) {
        dispatch({
          type: FETCH_BOOKINGS_SUCCESS,
          payload: null
        });
      }
    } else {
      dispatch({
        type: FETCH_BOOKINGS_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_bookings,
      });
    }
  });
};

export const updateBooking = (booking) => async (dispatch) => {

  const {
    auth,
    trackingRef,
    singleBookingRef,
    singleUserRef,
    settingsRef,
    userRatingsRef
  } = firebase;

  dispatch({
    type: UPDATE_BOOKING,
    payload: booking,
  });

  if (booking.status == 'PAYMENT_PENDING') {
    update(singleBookingRef(booking.id),booking);
  }
  if (booking.status == 'NEW' || booking.status == 'ACCEPTED') {
    update(singleBookingRef(booking.id), updateDriverQueue(booking));
  }
  if (booking.status == 'ARRIVED') {
    let dt = new Date();
    booking.driver_arrive_time = dt.getTime().toString();
    console.log("estos es customer tpken ", booking.customer_token);
    update(singleBookingRef(booking.id),booking);
    if(booking.customer_token){
      RequestPushMsg(
        booking.customer_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.driver_near,
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        });
    }
  }
  
  if (booking.status == 'STARTED') {
    let dt = new Date();
    let localString = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    let timeString = dt.getTime();
    booking.trip_start_time = localString;
    booking.startTime = timeString;
    update(singleBookingRef(booking.id),booking);

    const driverLocation = store.getState().gpsdata.location;
    
    push(trackingRef(booking.id),{
      at: new Date().getTime(),
      status: 'STARTED',
      lat: driverLocation.lat,
      lng: driverLocation.lng
    });

    if(booking.customer_token){
      RequestPushMsg(
        booking.customer_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.driver_journey_msg + booking.reference,
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        });
      }
   }


  if (booking.status == 'REACHED') {

    const driverLocation = store.getState().gpsdata.location;

    push(trackingRef(booking.id),{
      at: new Date().getTime(),
      status: 'REACHED',
      lat: driverLocation.lat,
      lng: driverLocation.lng
    });

    let address = await saveAddresses(booking,driverLocation);

    let bookingObj = await addActualsToBooking(booking, address, driverLocation);
    
    console.log("plocicty", bookingObj.trip_cost);
    // Verificar si el costo del viaje es menor que el estimado
    if (bookingObj.trip_cost < bookingObj.estimate) {
        bookingObj.trip_cost = bookingObj.estimate;
         // Asignar el costo del viaje al valor estimado
         let feePercentage = 0; // Porcentaje por defecto para casos que no cumplen ninguna condición
         switch (bookingObj.carType) {
             case "TREAS-X":
                 feePercentage = 0.105; // 10.5%
                 break;
             case "TREAS-E":
                 feePercentage = 0.15; // 15%
                 break;
             case "TREAS-VAN":
                 feePercentage = 0.184; // 18.4%
                 break;
             case "TREAS-T":
                 feePercentage = 0; // 0% para TREAS-T
                 break;
             default:
                 feePercentage = 0; // Ningún porcentaje aplicable si no es ninguno de los anteriores
                 break;
         }
         const trip_cost = Number(bookingObj.trip_cost) || 0;
         if (bookingObj.payment_mode === "corp") {
          
          
          bookingObj.comicomisionCorpsion = trip_cost * 0.15;
          bookingObj.Base_de_IVA = trip_cost * 0.08;
          bookingObj.Iva = bookingObj.Base_de_IVA * 0.19;
          const PolicyPackage = 800;
          const ProfitsTreas = trip_cost * 0.30;
          bookingObj.cost_corp = trip_cost + ProfitsTreas + bookingObj.comicomisionCorpsion + bookingObj.Base_de_IVA + bookingObj.Iva + PolicyPackage;
          bookingObj.Technological_Hosting = ProfitsTreas;
      }
      

    // Calcular convenience_fees basado en el porcentaje determinado
    bookingObj.convenience_fees = bookingObj.trip_cost * feePercentage;
    }

    update(singleBookingRef(bookingObj.id),bookingObj); // Actualizar la reserva con los nuevos detalles

    if(booking.customer_token){
      RequestPushMsg(
        booking.customer_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.driver_completed_ride,
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        });
    }
}

  if (booking.status == 'PENDING') {
    update(singleBookingRef(booking.id),booking);
    update(singleUserRef(booking.driver), { queue: false });
  }
  if (booking.status == 'PAID') {
    if(booking.booking_from_web){
      booking.status = 'COMPLETE';
    }
    update(singleBookingRef(booking.id), booking);
    if(booking.driver == auth.currentUser.uid && (booking.prepaid || booking.payment_mode == 'cash' || booking.payment_mode == 'wallet')){
      update(singleUserRef(booking.driver), { queue: false });
    }

    if(booking.customer_token){
      RequestPushMsg(
        booking.customer_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.success_payment,
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        });
    }

    if(booking.driver_token){
        RequestPushMsg(
          booking.driver_token,
          {
              title: store.getState().languagedata.defaultLanguage.notification_title,
              msg: store.getState().languagedata.defaultLanguage.success_payment,
              screen: 'BookedCab',
              params: { bookingId: booking.id }
          });
      }
    }

  if (booking.status == 'COMPLETE') {
    update(singleBookingRef(booking.id), booking);
    if (booking.rating) {
      if(booking.driver_token){
        RequestPushMsg(
          booking.driver_token,
          {
              title: store.getState().languagedata.defaultLanguage.notification_title,
              msg:  store.getState().languagedata.defaultLanguage.received_rating.toString().replace("X", booking.rating.toString()),
              screen: 'BookedCab',
              params: { bookingId: booking.id }
          });
      }
      onValue(userRatingsRef(booking.driver), snapshot => {
        let ratings = snapshot.val();
        let rating;
        if(ratings){
          let sum = 0;
          const arr = Object.values(ratings);
          for (let i = 0; i< arr.length ; i++){
            sum = sum + arr[i].rate
          }
          sum = sum + booking.rating;
          rating = parseFloat(sum / (arr.length + 1)).toFixed(1);
        }else{
          rating =  booking.rating;
        }
        update(singleUserRef(booking.driver),{rating: rating});
        push(userRatingsRef(booking.driver), {
          user: booking.customer,
          rate: booking.rating
        });
      }, { onlyOnce: true});
    }
  }
};

export const cancelBooking = (data) => (dispatch) => {
  const {
    singleBookingRef,
    singleUserRef,
    requestedDriversRef
  } = firebase;

  dispatch({
    type: CANCEL_BOOKING,
    payload: data,
  });

  update(singleBookingRef(data.booking.id),{
    status: 'CANCELLED',
    reason: data.reason,
    cancelledBy: data.cancelledBy
  }).then(() => {
    if (data.booking.driver && (data.booking.status === 'NEW' || data.booking.status === 'ACCEPTED' || data.booking.status === 'ARRIVED')) {
      update(singleUserRef(data.booking.driver),{ queue: false });
      if(data.booking.driver_token){
        RequestPushMsg(
          data.booking.driver_token,
          {
              title: store.getState().languagedata.defaultLanguage.notification_title,
              msg:  store.getState().languagedata.defaultLanguage.booking_cancelled + data.booking.id,
              screen: 'BookedCab',
              params: { bookingId: data.booking.id }
          });
        }

        if(data.booking.customer_token){
          RequestPushMsg(
            data.booking.customer_token,
            {
                title: store.getState().languagedata.defaultLanguage.notification_title,
                msg:  store.getState().languagedata.defaultLanguage.booking_cancelled + data.booking.id,
                screen: 'BookedCab',
                params: { bookingId: data.booking.id }
            });
        }
   }
    if (data.booking.status === 'NEW') {
      remove(requestedDriversRef(data.booking.id));
    }
  });
};

export const updateBookingImage = (booking, imageType, imageBlob) => (dispatch) => {
  const   {
    singleBookingRef,
    bookingImageRef
  } = firebase;
  uploadBytesResumable(bookingImageRef(booking.id,imageType), imageBlob).then(() => {
    imageBlob.close()
    return getDownloadURL(bookingImageRef(booking.id,imageType))
  }).then((url) => {
    if(imageType == 'pickup_image'){
      booking.pickup_image = url;
    }
    if(imageType == 'deliver_image'){
      booking.deliver_image = url;
    }
    update(singleBookingRef(booking.id), booking);
    dispatch({
      type: UPDATE_BOOKING,
      payload: booking,
    });
  })
};

export const forceEndBooking = (booking) => async (dispatch) => {

  const {
    trackingRef,
    singleBookingRef,
    singleUserRef,
    walletHistoryRef,
    settingsRef,
  } = firebase;

  dispatch({
    type: UPDATE_BOOKING,
    payload: booking,
  });
  
  if (booking.status == 'STARTED') {

    push(trackingRef(booking.id),{
      at: new Date().getTime(),
      status: 'REACHED',
      lat: booking.drop.lat,
      lng: booking.drop.lng
    });

    const end_time = new Date();
    const diff = (end_time.getTime() - parseFloat(booking.startTime)) / 1000;
    const totalTimeTaken = Math.abs(Math.round(diff));
    booking.trip_end_time = end_time.getHours() + ":" + end_time.getMinutes() + ":" + end_time.getSeconds();
    booking.endTime = end_time.getTime();
    booking.total_trip_time = totalTimeTaken;

    if(booking.customer_token){
      RequestPushMsg(
        booking.customer_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.driver_completed_ride,
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        });
    }

    update(singleUserRef(booking.driver),{ queue: false });

    if(booking.prepaid){

      const settingsdata = await get(settingsRef);
      const settings = settingsdata.val();

      onValue(singleUserRef(booking.driver), snapshot => {
        let walletBalance = parseFloat(snapshot.val().walletBalance);
        walletBalance = walletBalance + parseFloat(booking.driver_share);
        if(parseFloat(booking.cashPaymentAmount)>0){
          walletBalance = walletBalance - parseFloat(booking.cashPaymentAmount);
        }
        update(singleUserRef(booking.driver),{"walletBalance": parseFloat(walletBalance.toFixed(settings.decimal))});

        let details = {
          type: 'Credit',
          amount: parseFloat(booking.driver_share).toFixed(settings.decimal),
          date: new Date().getTime(),
          txRef: booking.id
        }
        push(walletHistoryRef(booking.driver),details);
        
        if(parseFloat(booking.cashPaymentAmount)>0){
          let details = {
            type: 'Debit',
            amount: booking.cashPaymentAmount,
            date: new Date().getTime(),
            txRef: booking.id
          }
          push(walletHistoryRef(booking.driver), details);
        }  
      },{onlyOnce: true});

      if(booking.customer_token){
        RequestPushMsg(
          booking.customer_token,
          {
              title: store.getState().languagedata.defaultLanguage.notification_title,
              msg: store.getState().languagedata.defaultLanguage.success_payment,
              screen: 'BookedCab',
              params: { bookingId: booking.id }
          });
      }

      if(booking.driver_token){
        RequestPushMsg(
          booking.driver_token,
          {
              title: store.getState().languagedata.defaultLanguage.notification_title,
              msg: store.getState().languagedata.defaultLanguage.success_payment,
              screen: 'BookedCab',
              params: { bookingId: booking.id }
          });
        }
      booking.status = 'PAID';
    } else{
      booking.status = 'PENDING';
    }

    update(singleBookingRef(booking.id), booking);
  }
};

export const reportIncidence = (data) => (dispatch) => {
  const {
    singleBookingRef,
    singleUserRef,
  } = firebase;
  dispatch({
    type: FETCH_REPORT_INCIDENTS,
    payload: data,
  })
  update(singleBookingRef(data.booking.id), {
    status: 'NEW',
    reason: data.reason,
   
  }).then(() => {
    if (data.booking.driver && (data.booking.staus === 'ACCEPTED' || data.booking.status === 'ARRIVED')) {
      update(singleUserRef(data.booking.driver), { queue: true, bloked: true });
      if (data.booking.driver_token) {
        RequestPushMsg(
          data.booking.driver_token,
          {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.booking_cancelled + data.booking.id,
            screen: 'BookedCab',
            params: { bookingId: data.booking.id }
          });
      }

      if (data.booking.customer_token) {
        RequestPushMsg(
          data.booking.customer_token,
          {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.booking_cancelled + data.booking.id,
            screen: 'BookedCab',
            params: { bookingId: data.booking.id }
          });
      }
    }
  })


}