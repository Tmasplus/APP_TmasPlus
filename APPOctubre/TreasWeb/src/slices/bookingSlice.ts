// bookingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDatabase, ref, update,orderByChild,query,equalTo,limitToLast } from "firebase/database";
import { AppDispatch } from "../store/store";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Booking } from "../interfaces/Booking";
import { useDispatch } from 'react-redux';

interface BookingState {
  booking: any;
  loading: boolean;
  error: string | null;
  bookings: any[];
  recentBookings: any[];
}

const initialState: BookingState = {
  booking: null,
  loading: false,
  error: null,
  bookings: [],
  recentBookings: [],

};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    addBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addBookingSuccess: (state, action: PayloadAction<any>) => {
      state.booking = action.payload;
      state.loading = false;
    },
    addBookingFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearBooking: (state) => {
      state.booking = null;
    },
    cancelBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    cancelBookingSuccess: (state, action: PayloadAction<string>) => {
      if (state.booking && state.booking.uid === action.payload) {
        state.booking.status = "CANCELED";
      }
      state.loading = false;
    },
    cancelBookingFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBookingSuccess: (state, action: PayloadAction<any>) => {
      state.booking = action.payload;
      state.loading = false;
    },
    updateBookingFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    completeBookingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    completeBookingSuccess: (
      state,
      action: PayloadAction<{ uid: string; tripCost: number }>
    ) => {
      const { uid, tripCost } = action.payload;
      const booking = state.bookings.find((b) => b.uid === uid);
      if (booking) {
        booking.status = "COMPLETE";
        booking.tripCost = tripCost;
      }
      state.loading = false;
    },
    completeBookingFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setRecentBookings: (state, action) => {
      state.recentBookings = action.payload;
    },
  },
});

export const {
  addBookingStart,
  addBookingSuccess,
  addBookingFailure,
  clearBooking,
  cancelBookingStart,
  cancelBookingSuccess,
  cancelBookingFailure,
  updateBookingStart,
  updateBookingSuccess,
  updateBookingFailure,
  completeBookingStart,
  completeBookingSuccess,
  completeBookingFailure,
  setRecentBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer;
export const updateBooking =
  (
    bookingId: string,
    updatedBooking: any,
    
    filteredUsers: any[]
  ) =>
  async (dispatch: AppDispatch) => {
    dispatch(updateBookingStart());
    const db = getDatabase();

    if (updatedBooking.status === "NEW") {
      updatedBooking = {
        ...updatedBooking,
        status: "NEW",
        vehicleColor: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicle_number: "",
        driver_token: "",
        driver: "",
        driverDeviceId: "",
        driverRating: "",
        driver_contact: "",
        driver_image: "",
        driver_name: "",
        car_image: "",
        driver_status: "",

        customer_status: `${updatedBooking.customer}_NEW`,
      };
      console.log("Updated booking with status NEW:", updatedBooking);
    } else if (updatedBooking.status === "PENDING") {
      if (updatedBooking.payment_mode === "cash") {
        updatedBooking = {
          ...updatedBooking,
          status: "COMPLETE",
          customer_status: `${updatedBooking.customer}_COMPLETE`,
          driver_status: `${updatedBooking.driver}_COMPLETE`,
        };
      } else {
        const company = updatedBooking.company;

        const selectedUserData = filteredUsers.find(
          (user) => user.id === company
        ); //esto compara el uid de la empresa con la comision si la obtiene la pone
        console.log(selectedUserData);
        if (selectedUserData) {
          const commissionPercentage = selectedUserData.commission || 0; //selected user comission es el valor de la tabla dinamica
          const trip_cost = updatedBooking.trip_cost; //costo del viaje
          const commissionCompany = trip_cost * commissionPercentage; //esto es el costo del viaje multiplicado por el valor de la
          const ProfitsTreas = trip_cost * 0.3;
          const Technological_Hosting = ProfitsTreas;

          const PolicyPackage = 800;
          const Base_de_IVA = trip_cost * 0.08;
          const Iva = Base_de_IVA * 0.19;
          const cost_corp =
            trip_cost +
            commissionCompany +
            PolicyPackage +
            Base_de_IVA +
            Iva +
            ProfitsTreas;

          updatedBooking = {
            ...updatedBooking,
            status: "COMPLETE",
            commissionCompany,
            PolicyPackage,
            Base_de_IVA,
            Iva,
            cost_corp,
            ProfitsTreas,
            Technological_Hosting,
            driver_status: `${updatedBooking.driver}_COMPLETE`,
          };
        } else {
          console.log("Aca andamos");
          updatedBooking = {
            ...updatedBooking,
            status: "COMPLETE",
            driver_status: `${updatedBooking.driver}_COMPLETE`,
          };
        }
      }
    } else if (updatedBooking.status === "NOSHOW_CLIENT") {
      updatedBooking = {
        ...updatedBooking,
        status: "NOSHOW_CLIENT",
        customer_status: `${updatedBooking.customer}_NOSHOW_CLIENT`,
        driver_status: `${updatedBooking.driver}_NOSHOW_CLIENT`,
      };
    } else if (updatedBooking.status === "NOSHOW_DRIVER") {
      updatedBooking = {
        ...updatedBooking,
        status: "NOSHOW_DRIVER",
        customer_status: `${updatedBooking.customer}_NOSHOW_DRIVER`,
        driver_status: `${updatedBooking.driver}_NOSHOW_DRIVER`,
      };
    } else {
      console.log("Updated booking without status NEW:", updatedBooking);
    }

    // Eliminar campos undefined
    const cleanBooking = Object.fromEntries(
      Object.entries(updatedBooking).filter(
        ([key, value]) => value !== undefined
      )
    );

    const updates = { [`/bookings/${bookingId}`]: cleanBooking };

    try {
      await update(ref(db), updates);
      dispatch(updateBookingSuccess(cleanBooking));
      console.log("Booking successfully updated:", cleanBooking);
    } catch (error: any) {
      dispatch(updateBookingFailure(error.message));
      console.error("Error updating booking:", error.message);
    }
  };

export const completeBooking =
  (uid: string, tripCost: number) => async (dispatch: AppDispatch) => {
    dispatch(completeBookingStart());
    const db = getDatabase();
    const bookingRef = ref(db, `bookings/${uid}`);

    try {
      const bookingSnapshot = await get(bookingRef);
      if (bookingSnapshot.exists()) {
        const bookingData = bookingSnapshot.val();
        await update(bookingRef, {
          status: "COMPLETE",
          tripCost: tripCost,
        });
        dispatch(completeBookingSuccess({ uid, tripCost }));
      } else {
        throw new Error("Booking not found");
      }
    } catch (error: any) {
      dispatch(completeBookingFailure(error.message));
    }
  };

export const cancelBooking =
  (
    bookingId: string,
    reason: string,
    cancelledBy: string,
    status: string,
    booking: any
  ) =>
  async (dispatch: AppDispatch) => {
    dispatch(cancelBookingStart());
    const db = getDatabase();
    const bookingRef = ref(db, `bookings/${bookingId}`);

    try {
      if (status === "NEW") {
        await update(bookingRef, {
          status: "NEW",
          vehicleColor: "",
          vehicleMake: "",
          vehicleModel: "",
          vehicle_number: "",
          driver_token: "",
          driver: "",
          driverDeviceId: "",
          driverRating: "",
          driver_contact: "",
          driver_image: "",
          driver_name: "",
          car_image: "",
        });
      } else if (status === "CANCELLED") {
        const updateData = {
          status: "CANCELLED",
          reason: reason,
          cancelledBy: cancelledBy,
          customer_status: `${booking.customer}_CANCELLED`,
        };

        // Condicionalmente añadir driver_status si existe
        if (booking.driver) {
          updateData.driver_status = `${booking.driver}_CANCELLED`;
        }

        await update(bookingRef, updateData);
      } else if (status === "COMPLETE") {
        // Aquí se debería agregar la lógica para actualizar el estado a COMPLETE si es necesario
      } else {
        throw new Error("Estado no válido");
      }
      dispatch(cancelBookingSuccess(bookingId));
    } catch (error: any) {
      dispatch(cancelBookingFailure(error.message));
    }
  };
