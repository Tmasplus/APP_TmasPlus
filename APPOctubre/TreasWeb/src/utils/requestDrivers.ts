import { GetDistance } from "../other/GeoFunctions";
import { User, Booking } from "../interfaces/Booking"; // Importa las interfaces necesarias

export const requestDrivers = async (
  selectedOrigin: { lat: number; lng: number },
  allUsers: User[],
  booking: Booking,
) => {
  let requestedDrivers = {};
  let driverEstimates = {};

  // Filtra los conductores disponibles que coinciden con el carType
  const drivers = allUsers
    .filter(
      (user) =>
        user.usertype === "driver" &&
       // user.driverActiveStatus === true &&
        user.carType === booking.carType &&
        user.location &&
        user.location.lat &&
        user.location.lng
    )
    .map((driver) => {
      const distance = GetDistance(
        selectedOrigin.lat,
        selectedOrigin.lng,
        driver.location.lat,
        driver.location.lng
      );
      return {
        ...driver,
        distance,
      };
    });

  // Añade todos los conductores filtrados a la lista de requestedDrivers
  drivers.forEach((driver) => {
    requestedDrivers[driver.id] = true;
    driverEstimates[driver.id] = {
      distance: driver.distance,
      timein_text: ((driver.distance * 2) + 1).toFixed(0) + ' min',
    };
  });

  const bookingObject = {
    ...booking,
    requestedDrivers,
    driverEstimates,
  };

  console.log("Final booking object: ", bookingObject);
  return bookingObject;
};
