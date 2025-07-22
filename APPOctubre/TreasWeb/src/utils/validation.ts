export const validateBookingObj = ( bookingObject) => {
    delete bookingObject.driverEstimates;
    return { bookingObject };
}