import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import Select from "react-select";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { formatBookingObject } from "./../other/sharedFunctions";
import { saveBooking } from "../actions/bookingActions";
import { GetDistance } from "../other/GeoFunctions";
import { requestDrivers } from "../utils/requestDrivers";
import SuccessModal from "./SuccessModal";
import Swal from "sweetalert2";
import ButtonCustom from "./ButtonCustom";
import { useDispatch } from 'react-redux';
import { getDatabase, ref, query, orderByChild, equalTo, limitToLast, get } from 'firebase/database';
import { setRecentBookings } from '../slices/bookingSlice'; // Asegúrate de que esta acción esté definida en tu slice
import { Autocomplete } from "@react-google-maps/api";
import AutocompleteInput from "./AutocompleteInput";
import moment from "moment";

interface ModalAddBookingProps {
  isOpen: boolean;
  onClose: () => void;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const center = {
  lat: 4.711,
  lng: -74.0721,
};

const ModalAddBooking: React.FC<ModalAddBookingProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const {
    carTypes,
    loading: carTypesLoading,
    error: carTypesError,
  } = useSelector((state: RootState) => state.carTypes);
  const {
    allUsers,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state: RootState) => state.users);
  const {
    tolls,
    loading: tollsLoading,
    error: tollsError,
  } = useSelector((state: RootState) => state.tolls);

  const [addressOrigin, setAddressOrigin] = useState("");
  const [addressDestination, setAddressDestination] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const authState = useSelector((state: RootState) => state.auth);

  const [directions, setDirections] = useState<any>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [tripType, setTripType] = useState("Solo Ida");
  const [selectedUser, setSelectedUser] = useState(null);
  const [passedTolls, setPassedTolls] = useState<any[]>([]);
  const [fareDetails, setFareDetails] = useState<any>(null);
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
  });
  const user = useSelector((state: RootState) => state.auth.user);
  const { filteredUsers } = useSelector((state: RootState) => state.users);
  const [observationsEnabled, setObservationsEnabled] = useState(false);
  const [observations, setObservations] = useState("");
  const [hours, setHours] = useState(0); // Nuevo estado para las horas
  const dispatch = useDispatch(); // Obtén el dispatch usando el hook
  const recentBookings = useSelector((state: RootState) => state.booking.recentBookings);
  const [selectedField, setSelectedField] = useState(''); // Valor predeterminado
  const settings = {
    decimal: 2,
    distanceIntermunicipal: 25,
    min_fare: 5000,
    convenienceFee: 10,
  };
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Estado para controlar el SuccessModal
 
  const [autocompleteOrigin, setAutocompleteOrigin] = useState(null);
  const [autocompleteDestination, setAutocompleteDestination] = useState(null);

  const calculateEstimatedCost = (estimate: number, isPeakHour: boolean) => {
    if (isPeakHour) {
      return `${roundPrice(estimate + 5000)} - ${roundPrice(estimate + 5000 + (estimate * 0.3))}`;
    }
    return `${roundPrice(estimate)} - ${roundPrice(estimate + (estimate * 0.3))}`;
  };

  const isPeakHour = (tripDate: string) => {
    const hour = moment(tripDate).hour();
    return (hour >= 5 && hour < 8) || (hour >= 16 && hour < 20);
  };

  useEffect(() => {
    const ahora = new Date();
    ahora.setTime(ahora.getTime() + 2 * 60 * 60 * 1000); // Añadir 2 horas a la hora actual

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${año}-${mes}-${dia}T${horas}:${minutos}`;

    setDateTime(formattedDateTime);
  }, []);
  useEffect(() => {
    const fetchDirections = async () => {
      if (selectedOrigin && selectedDestination) {
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
          origin: selectedOrigin,
          destination: selectedDestination,
          travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirections(result);
        if (result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);

          if (tripType === "Ida y regreso") {
            console.log("selectedPaymentMethod estamos en ida y regreso")
            const returnResult = await directionsService.route({
              origin: selectedDestination,
              destination: selectedOrigin,
              travelMode: google.maps.TravelMode.DRIVING,
            });
            const combinedRoute = {
              ...result,
              routes: [
                {
                  ...route,
                  legs: [...route.legs, ...returnResult.routes[0].legs],
                  overview_path: [
                    ...route.overview_path,
                    ...returnResult.routes[0].overview_path,
                  ],
                },
              ],
            };
            setDirections(combinedRoute);
            const totalDistance =
              leg.distance.value +
              returnResult.routes[0].legs[0].distance.value;
            const totalDuration =
              leg.duration.value +
              returnResult.routes[0].legs[0].duration.value;
            setDistance((totalDistance / 1000).toFixed(2) + " km");
            setDuration(Math.floor(totalDuration / 60) + " mins");
          }

          const autoPassed = tolls.filter((toll: { CoordToll: string }) => {
            if (!toll.CoordToll) return false;
            const [lat, lng] = toll.CoordToll.split(",").map(Number);
            if (isNaN(lat) || isNaN(lng)) return false;
            return route.overview_path.some(
              (point: any) =>
                google.maps.geometry.spherical.computeDistanceBetween(
                  point,
                  new google.maps.LatLng(lat, lng)
                ) < 500 // Adjust this value as needed
            );
          });
          setPassedTolls(autoPassed);

          const selectedCar = carTypes.find(
            (car) => car.id === selectedCarType
          );

          if (!selectedCar) {
            console.error("Invalid carType selected", {
              selectedCar,
              carTypes,
              selectedCarType,
            });
            return;
          }

          const rateDetails = {
            rate_per_unit_distance: selectedCar.rate_per_unit_distance,
            rate_per_hour: selectedCar.rate_per_hour,
            base_fare: selectedCar.base_fare,
            min_fare: selectedCar.min_fare,
            convenienceFee: selectedCar.convenience_fees,
            convenience_fee_type: selectedCar.convenience_fee_type,
          };

          const bookingData = {
            roundedDistance: parseFloat(leg.distance.value) / 1000, // km
            durationMinutes: leg.duration.value / 60, // minutes
            carType: rateDetails,
            booking_from_web: true,
            booking_from_chat: false,
            booking_type_admin: false,
          };
          console.log("--rouded----", bookingData.roundedDistance);
          console.log("--durato----", bookingData.durationMinutes);
          console.log("------", passedTolls);
          console.log("------", isScheduled);

          const response = await fetch('https://us-central1-treasupdate.cloudfunctions.net/calculatePrice2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingData,
              tolls: autoPassed,
              isScheduled,
              settings: { decimal: 2, distanceIntermunicipal: 50 }, // Asegúrate de enviar la configuración necesaria
              addressOrigin,
              addressDestination,
              selectedPaymentMethod,
              selectedUser,
              authState,
              filteredUsers
            }),
          });

          if (!response.ok) {
            console.error('Error al calcular el precio:', response.statusText);
            return;
          }

          const fareDetails = await response.json();
          // Incluir también los peajes seleccionados manualmente
         
          console.log(selectedPaymentMethod, "selectedPaymentMethod")
          console.log(tripType, "tripType")
          if (tripType === "Ida y regreso") {
            fareDetails.estimateFare *= 2;
          }
          /*  if (selectedPaymentMethod === "corp" && selectedUser) {
              console.log("selectedPaymentMethod estamos en corp")
              const response = await fetch('https://us-central1-treasupdate.cloudfunctions.net/calculatePrice2', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  bookingData,
                  tolls: autoPassed,
                  isScheduled,
                  settings: { decimal: 2, distanceIntermunicipal: 50 }, // Asegúrate de enviar la configuración necesaria
                  addressOrigin,
                  addressDestination,
                  selectedPaymentMethod,
                  selectedUser,
                  authState,
                }),
              });
  
              if (!response.ok) {
                console.error('Error al calcular el precio:', response.statusText);
                return;
              }
  
              const fareDetailsCorp = await response.json();
  
              
              fareDetails.cost_corp = fareDetailsCorp.cost_corp;
            }*/
          console.log(fareDetails, "fareDetails")
          setFareDetails(fareDetails);
        }
      }
    };
    fetchDirections();
  }, [
    selectedOrigin,
    selectedDestination,
    tripType,
    tolls,
    carTypes,
    selectedCarType,
    isScheduled,
    selectedPaymentMethod,
    selectedUser,
     // Añadido para recalcular cuando se seleccionan peajes manualmente
  ]);
  useEffect(() => {
    const userId = user.uid; // Reemplaza con el ID del usuario autenticado
    fetchRecentBookings(userId);
  }, [dispatch])
  useEffect(() => {
    if (fareDetails) {
      let updatedFareDetails = { ...fareDetails };

      if (isScheduled) {
        console.log("Reserva programada, sumando costo adicional...");
        updatedFareDetails.estimateFare += 4000;
      } else {
        console.log(
          "Reserva no programada, restando costo adicional si estaba sumado..."
        );
        updatedFareDetails.estimateFare -= 4000;
      }

      if (
        selectedPaymentMethod === "corp" ||
        authState.user.usertype === "company"
      ) {
        console.log("Actualizando cost_corp para reserva empresarial...");

        const commissionPercentage = authState.user.commission || 0;
        const trip_cost = updatedFareDetails.estimateFare;
        const comisioCompany = trip_cost * commissionPercentage;
        const PolicyPackage = 800;
        const Base_de_IVA = trip_cost * 0.08;
        const Iva = Base_de_IVA * 0.19;

        updatedFareDetails.cost_corp = Math.round(
          trip_cost + comisioCompany + PolicyPackage + Base_de_IVA + Iva
        );

        console.log("cost_corp actualizado:", updatedFareDetails.cost_corp);
      }

      console.log(
        "FareDetails actualizados después de cambio en programación:",
        updatedFareDetails
      );
      setFareDetails(updatedFareDetails);
    }
  }, [isScheduled, selectedPaymentMethod, authState.user.usertype]);
  const handleObservationsChange = (e) => {
    setObservations(e.target.value);
  };
  const handleObservationsToggle = () => {
    setObservationsEnabled(!observationsEnabled);
  };
  const handleLoadOrigin = (autocomplete) => {
    setAutocompleteOrigin(autocomplete);
  };
  const handleLoadDestination = (autocomplete) => {
    setAutocompleteDestination(autocomplete);
  };
  const handlePlaceChangedOrigin = () => {
    if (autocompleteOrigin !== null) {
      const place = autocompleteOrigin.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        console.log(lat, lng, "ltttttttt")
        console.log(place.formatted_address, "address")
        setSelectedOrigin({ lat, lng });
        setAddressOrigin(place.formatted_address);
      } else {
        console.log("No geometry available for the selected place.");
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };
  const handlePlaceChangedDestination = () => {
    if (autocompleteDestination !== null) {
      const place = autocompleteDestination.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSelectedDestination({ lat, lng });
        setAddressDestination(place.formatted_address);
      } else {
        console.log("No geometry available for the selected place.");
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };
  const handleSelectOrigin = (address: string, lat: number, lng: number) => {
    setAddressOrigin(address);
    setSelectedOrigin({ lat, lng });
  };
  const handleSelectDestination = (address: string, lat: number, lng: number) => {
    setAddressDestination(address);
    setSelectedDestination({ lat, lng });
  };
  const getPrice = (bookingData, tolls, isScheduled) => {
    const { roundedDistance, durationMinutes, carType } = bookingData;

    if (!carType) {
      console.error("carType is undefined");
      return null;
    }

    let { totalCost, grandTotal, convenience_fees } = FareCalculator(
      roundedDistance,
      durationMinutes * 60,
      carType,
      {},
      settings.decimal
    );
    if (roundedDistance > settings.distanceIntermunicipal) {
      grandTotal *= 2;
    }

    if (tripType === "Ida y regreso") {
      grandTotal *= 2; // Multiplica el costo total por 2 si es ida y regreso
      if (hours > 0) {
        grandTotal += carType.rate_per_hour * hours; // Suma el costo por horas
      }
    }
    const tollsCost = tolls.reduce((acc, toll) => acc + toll.PriceToll, 0);
    grandTotal += tollsCost * 2;
    console.log(tollsCost * 2, "holaaaa");

    console.log(grandTotal);
    if (isScheduled) {
      grandTotal += 4000; // Suma adicional por reserva programada
    }
    console.log(grandTotal);

    if (
      addressOrigin.toLowerCase().includes("aero") ||
      addressDestination.toLowerCase().includes("aero")
    ) {
      grandTotal += 7000; // Suma adicional por dirección que contiene "Aero"
    }
    console.log("daniel olano", grandTotal);

    let cost_corp = grandTotal;

    if (
      (selectedPaymentMethod === "corp" && selectedUser) ||
      authState.user.usertype === "company"
    ) {
      const selectedUserData = filteredUsers.find(
        (user) =>
          user.uid === selectedUser.company || user.id === selectedUser.company
      );
      if (selectedUserData) {
        console.log(filteredUsers);

        const commissionPercentage = selectedUserData.commission || 0;

        console.log("---------------", commissionPercentage, "---------------");
        const trip_cost = grandTotal;
        const comisioCompany = trip_cost * commissionPercentage;
        const Profitreas = trip_cost * 0.3;
        const PolicyPackage = 800;
        const Base_de_IVA = trip_cost * 0.08;
        const Iva = Base_de_IVA * 0.19;

        cost_corp =
          trip_cost +
          comisioCompany +
          PolicyPackage +
          Base_de_IVA +
          Iva +
          Profitreas;
        // console.log("holaaaaaaaaaa", cost_corp);
      }
    }

    return {
      fareCost: Math.round(totalCost),
      estimateFare: Math.round(grandTotal),
      estimateTime: Math.round((durationMinutes * 60) / 60),
      convenienceFees: Math.round(convenience_fees),
      driverShare: Math.round(grandTotal - convenience_fees),
      tollsCost: Math.round(tollsCost),
      cost_corp: Math.round(cost_corp),
    };
  };

  const FareCalculator = (distance, time, rateDetails, decimal) => {
    distance = parseFloat(distance);
    time = parseFloat(time);
    const ratePerUnitDistance = parseFloat(rateDetails.rate_per_unit_distance);
    const ratePerHour = parseFloat(rateDetails.rate_per_hour);
    const baseFare = parseFloat(rateDetails.base_fare || 0);
    const minFare = parseFloat(rateDetails.min_fare);
    const convenienceFees = parseFloat(rateDetails.convenienceFee);
    decimal = parseInt(decimal, 10);

    let baseCalculated =
      ratePerUnitDistance * distance + ratePerHour * (time / 3600);
    if (baseFare > 0) {
      baseCalculated += baseFare;
    }

    let total =
      baseCalculated > parseFloat(rateDetails.min_fare)
        ? baseCalculated
        : parseFloat(rateDetails.min_fare);
    let convenienceFee = 0;

    if (rateDetails.convenience_fee_type === "flat") {
      convenienceFee = convenienceFees;
    } else {
      convenienceFee = (total * convenienceFees) / 100;
    }

    let grand = total + convenienceFee;

    return {
      totalCost: Math.round(total),
      grandTotal: Math.round(grand),
      convenience_fees: Math.round(convenienceFee),
    };
  };

  const showAlert = () => {
    Swal.fire({
      icon: "success",
      title: "Reserva Exitosa",
      text: "Tu Reserva fue Creada con Exito!",
      showConfirmButton: false,
      timer: 3000,
    });
  };
  const confirmBooking = async (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("entro");
    event.preventDefault();
    console.log(observations);

    console.log("confirmBooking started");
    let requestedDrivers = {};
    let driverEstimates = {};
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const broadcastDistance = 150; // Radio de 150 km para la reserva
    let foundDriver = false;

    if (!selectedUser) {
      console.log("Error: Usuario no seleccionado");
      setNotification({ open: true, message: "Seleccione un usuario" });
      return;
    }

    if (!selectedOrigin || !selectedOrigin.lat || !selectedOrigin.lng) {
      console.log("Error: Origen no válido", selectedOrigin);
      setNotification({ open: true, message: "Origen no válido" });
      return;
    }

    if (
      !selectedDestination ||
      !selectedDestination.lat ||
      !selectedDestination.lng
    ) {
      console.log("Error: Destino no válido", selectedDestination);
      setNotification({ open: true, message: "Destino no válido" });
      return;
    }

    if (authState.user.usertype === "company") {
      console.log("Estableciendo método de pago para compañía");
      setSelectedPaymentMethod("corp");
    }

    const bookLater = isScheduled;
    console.log("isScheduled: ", isScheduled);

    const findDrivers = () => {
      console.log("Buscando conductores disponibles...");
      const drivers = allUsers.filter(
        (user) =>
          user.usertype === "driver" &&
          user.driverActiveStatus === true &&
          user.city === "Bogota"
      );

      console.log("Conductores filtrados: ", drivers);

      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];

        if (!driver.id) {
          console.log("Conductor sin ID encontrado, omitiendo...");
          continue;
        }

        if (!driver.location || !driver.location.lat || !driver.location.lng) {
          console.log("Conductor sin ubicación válida, omitiendo: ", driver);
          continue;
        }

        let distance = GetDistance(
          selectedOrigin.lat,
          selectedOrigin.lng,
          driver.location.lat,
          driver.location.lng
        );

        console.log(`Distancia al conductor ${driver.id}: ${distance} km`);

        if (distance <= broadcastDistance) {
          requestedDrivers[driver["id"]] = true;
          driverEstimates[driver["id"]] = {
            distance: distance,
            timein_text: (distance * 2 + 1).toFixed(0) + " min",
          };
          foundDriver = true;
        }
      }
    };

    findDrivers();

    const intervalId = setInterval(() => {
      if (foundDriver) {
        console.log("Conductor encontrado, limpiando intervalo...");
        clearInterval(intervalId);
        return;
      }
    }, 60000);

    console.log("Creando objeto de reserva...");

    const bookingObject = {
      bookLater: isScheduled,
      bookingDate: new Date().getTime(),
      booking_from_web: true,
      booking_type_admin: false,
      carImage: selectedCarType
        ? carTypes.find((car) => car.id === selectedCarType)?.image
        : "TREAS-X",
      carType: selectedCarType
        ? carTypes.find((car) => car.id === selectedCarType)?.name
        : "TREAS-X",
      commission_rate: selectedCarType
        ? carTypes.find((car) => car.id === selectedCarType)?.convenience_fees
        : "0",
      commission_type: "percentage",
      convenience_fees: selectedCarType
        ? carTypes.find((car) => car.id === selectedCarType)?.convenience_fees
        : "0",
      tollsCost: fareDetails ? fareDetails.tollsCost : "No contiene",
      drop: {
        lat: selectedDestination.lat,
        lng: selectedDestination.lng,
        add: addressDestination || "Dirección no disponible",
      },
      pickup: {
        lat: selectedOrigin.lat,
        lng: selectedOrigin.lng,
        add: addressOrigin || "Dirección no disponible",
      },
      pickupAddress: addressOrigin,
      dropAddress: addressDestination,
      customer: selectedUser.value,
      customer_contact: selectedUser.contact,
      customer_email: selectedUser.email,
      customer_city: selectedUser.City,
      customer_image: selectedUser ? selectedUser.image : "",
      customer_name: selectedUser.label,
      customer_token: selectedUser.Token,
      discount: 0,
      distance,
      estimate: fareDetails ? fareDetails.estimateFare : "No calculado",
      estimateDistance: distance,
      estimateTime: duration,
      otp: Math.floor(Math.random() * 90000) + 10000,
      payment_mode:
        user.usertype === "company" ? "corp" : selectedPaymentMethod,
      driver_share:
        fareDetails.estimateFare -
        (selectedCarType
          ? carTypes.find((car) => car.id === selectedCarType)?.convenience_fees
          : "0"),
      reference: [...Array(6)]
        .map((_) => c[~~(Math.random() * c.length)])
        .join(""),
      requestedDrivers: requestedDrivers,
      driverEstimates: driverEstimates,
      status: "NEW",
      tripType: tripType,
      tripUrban: "Urbano",
      trip_cost: fareDetails ? fareDetails.estimateFare : "No calculado",
      tripdate: isScheduled ? dateTime : new Date().getTime(),
      cost_corp: fareDetails ? fareDetails.cost_corp : 0,
      company:
        selectedPaymentMethod === "corp" || user.usertype === "company"
          ? selectedUser.company
          : "", // Condicional para company
      observations: observationsEnabled ? observations : "", // Añade el nuevo campo
      customer_status: `${selectedUser.value}_NEW`,
    };

    console.log("Booking Object: ", bookingObject);

     try {
      console.log("Solicitando conductores...");
      const updatedBooking = await requestDrivers(
        { lat: selectedOrigin.lat, lng: selectedOrigin.lng },
        allUsers,
        bookingObject
      );

      if (!updatedBooking) {
        console.log(
          "Error: No se encontraron conductores disponibles tras la solicitud"
        );
        setNotification({
          open: true,
          message: "No se encontraron conductores disponibles",
        });
        return;
      }

      console.log(
        "Actualizando el objeto de reserva con la respuesta de los conductores..."
      );
      const formattedBookingObject = await formatBookingObject(
        updatedBooking,
        settings
      );
      console.log("Objeto de reserva formateado: ", formattedBookingObject);

      console.log("Guardando la reserva...");
      const result = await saveBooking(formattedBookingObject);
      if (result.success) {
        console.log("Reserva guardada con éxito");
        showAlert();

        resetInputs();
      } else {
        console.log("Error al guardar la reserva: ", result);
      }
    } catch (error) {
      console.error("Error al crear la reserva: ", error);
    }
 
  };

  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const handleDateTimeChange = (e) => {
    setDateTime(e.target.value);
  };

  const getOptions = () => {
    return allUsers
      .filter((user) => {
        if (authState.user.usertype === "company") {
          // Filtra los usuarios con rol "customer" y cuyo campo "company" coincida con el ID del usuario autenticado
          return (
            user.usertype === "customer" && user.company === authState.user.uid
          );
        }
        // Si el usuario no es de tipo "company", muestra todos los usuarios de tipo "customer"
        return user.usertype === "customer";
      })
      .map((user) => {
        const companyName = user.company
          ? filteredUsers.find((companyUser) => companyUser.id === user.company)
            ?.bussinesName || ""
          : "";
        const label = `${user.firstName ?? "Nombre no disponible"} ${user.lastName ?? "Apellido no disponible"
          }${companyName ? ` - ${companyName}` : ""}`;
        return {
          value: user.id,
          company: user.company,
          label,
          email: user.email,
          contact: user.mobile,
          Token: user.pushToken,
          image: user.profile_image,
          savedaddresed: user.savedAddresses || [],
          City: user.city,
        };
      });
  };

  const resetInputs = () => {
    setAddressOrigin("");
    setAddressDestination("");
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setDirections(null); // Reiniciar el mapa
    setIsScheduled(false);
    setTripType("Solo Ida");
    setSelectedUser(null);
    setPassedTolls([]);
    setFareDetails(null);
    setSelectedCarType(null);
    setDateTime("");
    setSelectedPaymentMethod("cash");
  };
  const handleHoursChange = (e) => {
    const newHours = parseInt(e.target.value, 10) || 0; // Asegurarse de que newHours siempre sea un número, incluso si el input está vacío
    const previousHours = hours; // Guardar el valor de horas anterior para compararlo después
    setHours(newHours);
    console.log("Nuevo valor de horas:", newHours);
    console.log("Valor anterior de horas:", previousHours);

    if (tripType === "Ida y regreso" && selectedCarType) {
      console.log(
        "Tipo de viaje es 'Ida y regreso' y selectedCarType está definido:",
        selectedCarType
      );
      console.log("Lista de carTypes:", carTypes);

      const selectedCar = carTypes.find((car) => car.id === selectedCarType);

      if (selectedCar) {
        console.log("Vehículo seleccionado encontrado:", selectedCar);
        console.log(
          "Rate per hour del vehículo seleccionado:",
          selectedCar.rate_per_hour
        );

        const currentEstimateFare = fareDetails?.estimateFare || 0;
        const ratePerHour = selectedCar.rate_per_hour || 0;

        // Calcular la diferencia en las horas para ajustar el estimateFare
        const hourDifference = newHours - previousHours;
        const updatedEstimateFare =
          currentEstimateFare + ratePerHour * hourDifference;

        const updatedFareDetails = {
          ...fareDetails,
          estimateFare: isNaN(updatedEstimateFare)
            ? currentEstimateFare
            : updatedEstimateFare,
        };

        // Si el método de pago es empresarial, actualizar cost_corp
        if (
          selectedPaymentMethod === "corp" ||
          authState.user.usertype === "company"
        ) {
          console.log(
            "Método de pago es empresarial, actualizando cost_corp..."
          );

          const commissionPercentage = authState.user.commission || 0;
          const trip_cost = updatedFareDetails.estimateFare;
          const comisioCompany = trip_cost * commissionPercentage;
          const PolicyPackage = 800;
          const Base_de_IVA = trip_cost * 0.08;
          const Iva = Base_de_IVA * 0.19;

          updatedFareDetails.cost_corp = Math.round(
            trip_cost + comisioCompany + PolicyPackage + Base_de_IVA + Iva
          );

          console.log("cost_corp actualizado:", updatedFareDetails.cost_corp);
        }

        console.log("FareDetails actualizados:", updatedFareDetails);
        setFareDetails(updatedFareDetails);
      } else {
        console.log(
          "No se encontró un vehículo que coincida con el selectedCarType (id):",
          selectedCarType
        );
      }
    } else {
      console.log(
        "Condición no cumplida: tripType:",
        tripType,
        "newHours:",
        newHours,
        "selectedCarType:",
        selectedCarType
      );
    }
  };

 


  const roundPrice = (price) => {
    const remainder = price % 50;
    if (remainder > 0) {
      return price - remainder + 50;
    }
    return price;
  };
  const fetchRecentBookings = async (userId) => {
    const db = getDatabase();
    const bookingsRef = query(
      ref(db, 'bookings'),
      orderByChild('company'),
      equalTo(userId),
      limitToLast(5)
    );

    try {
      const snapshot = await get(bookingsRef);
      const data = snapshot.val();
      if (data) {
        const bookingsArray = Object.keys(data).map((key) => ({
          ...data[key],
          uid: key,
        })).reverse(); // Asegúrate de que estén en orden del más reciente al más antiguo

        // Despacha la acción para guardar en Redux
        dispatch(setRecentBookings(bookingsArray));
      }
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    }
  };
  return (
    <>
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}{" "}
      {/* Modal de éxito */}
      <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
        <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-full overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-black"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl mb-4">Añadir Reserva</h2>
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700">
                  Seleccionar usuario
                </label>
                <Select
                  value={selectedUser}
                  onChange={(selectedOption) => setSelectedUser(selectedOption)}
                  options={getOptions()}
                  isLoading={usersLoading}
                  className="w-full mt-1"
                  placeholder="Seleccionar usuario..."
                  noOptionsMessage={() =>
                    usersError ? "Error al cargar" : "No hay opciones"
                  }
                />
              </div>
              {selectedUser && selectedUser.savedaddresed && user?.usertype !== "company" && (
                <div>
                  <label className="block text-gray-700">Direcciones guardadas </label>
                  <select
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={(e) => {
                      const selectedAddress = selectedUser.savedaddresed[e.target.value];
                      if (selectedField === 'origin') {
                        setAddressOrigin(selectedAddress.description);
                        setSelectedOrigin({ lat: selectedAddress.lat, lng: selectedAddress.lng });
                      } else {
                        setAddressDestination(selectedAddress.description);
                        setSelectedDestination({ lat: selectedAddress.lat, lng: selectedAddress.lng });
                      }
                    }}
                  
                    
                    defaultValue=""
                  >
                    <option value="" disabled>Seleccionar dirección guardada...</option>
                    {Object.keys(selectedUser.savedaddresed).map((key) => {
                      const address = selectedUser.savedaddresed[key];
                      return (
                        <option key={key} value={key}>
                          {address.nameAddressFavorite ? `${address.nameAddressFavorite} - ${address.typeAddress}` : address.description}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              {user?.usertype === "company" && user.uid && (
                <div>
                  <label className="block text-gray-700">Direcciones Recientes {user.bussinesName}</label>
                  <select
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={(e) => {
                      const selectedBooking = recentBookings[e.target.value];
                      if (selectedField === 'origin') {
                        setAddressOrigin(selectedBooking.pickup.add);
                        setSelectedOrigin({ lat: selectedBooking.pickup.lat, lng: selectedBooking.pickup.lng });
                      } else {
                        setAddressDestination(selectedBooking.drop.add);
                        setSelectedDestination({ lat: selectedBooking.drop.lat, lng: selectedBooking.drop.lng });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Seleccionar dirección...</option>
                    {recentBookings.map((booking, index) => (
                      <option key={booking.uid} value={index}>
                        {booking.pickup.add} - {booking.drop.add}
                      </option>
                    ))}
                  </select>

                </div>
              )}

              <div>
                <label className="block text-gray-700">Tipo de vehículo</label>
                <select
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  onChange={(e) => setSelectedCarType(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar tipo de vehículo...
                  </option>
                  {carTypesLoading ? (
                    <option>Cargando...</option>
                  ) : carTypesError ? (
                    <option>Error al cargar</option>
                  ) : (
                    carTypes.map(
                      (carType: {
                        id: string;
                        name: string;
                        image: string;
                        typeService: string;
                        convenience_fees: string;
                      }) => (
                        <option key={carType.id} value={carType.id}>
                          {carType.name} {carType.typeService}
                        </option>
                      )
                    )
                  )}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-gray-700">
                  Dirección de Origen
                </label>
                <AutocompleteInput onSelect={handleSelectOrigin} />

              </div>
              <div className="relative">
                <label className="block text-gray-700">
                  Dirección de destino
                </label>
                <AutocompleteInput onSelect={handleSelectDestination} />

              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700">Tipo de Reserva</label>
                <select
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  onChange={(e) =>
                    setIsScheduled(e.target.value === "Programado")
                  }
                >
                  <option value="Inmediato">Inmediato</option>
                  <option value="Programado">Programado</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Tipo de recorrido</label>
                <select
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  onChange={(e) => setTripType(e.target.value)}
                >
                  <option value="Solo Ida">Solo Ida</option>
                  <option value="Ida y regreso">Ida y regreso</option>
                  <option value="Solo Ida (Checkout)">
                    Solo Ida (Checkout)
                  </option>
                </select>
              </div>

              {tripType === "Ida y regreso" && (
                <div>
                  <label className="block text-gray-700">Horas estimadas</label>
                  <input
                    type="number"
                    value={hours}
                    onChange={handleHoursChange}
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    min="1"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700">Metodo de Pago</label>
                <select
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  onChange={handlePaymentMethodChange}
                  value={
                    authState.user.usertype === "company"
                      ? "corp"
                      : selectedPaymentMethod
                  }
                  disabled={authState.user.usertype === "company"}
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="corp">Empresarial</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
              {isScheduled && (
                <div>
                  <label className="block text-gray-700">Fecha y hora</label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={handleDateTimeChange}
                    min={new Date().toISOString().slice(0, 16)} // Bloquear fechas y horas anteriores a la actual
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              )}
            </div>
            {distance && duration && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700">
                    Distancia estimada
                  </label>
                  <input
                    type="text"
                    value={distance}
                    readOnly
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Tiempo estimado</label>
                  <input
                    type="text"
                    value={duration}
                    readOnly
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            )}
            {fareDetails && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700">
                    Tarifa estimada Empresarial
                  </label>
                  <input
                    type="text"
                    value={
                      (selectedPaymentMethod === "corp" && selectedUser) ||
                        authState.user.usertype === "company"
                        ? "$" +
                        roundPrice(fareDetails.cost_corp) +
                        " - $" +
                        roundPrice(fareDetails.cost_corp + 7000)
                        : "$" + roundPrice(fareDetails.estimateFare)
                    }
                    readOnly
                    className={
                      (selectedPaymentMethod === "corp" && selectedUser) ||
                        authState.user.usertype === "company"
                        ? "w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-red-500"
                        : "w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    }
                  />
                </div>

                <div>
                  <label className="block text-gray-700">
                    Costo de peajes * 2
                  </label>
                  <input
                    type="text"
                    value={fareDetails.tollsCost * 2}
                    readOnly
                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            )}
            {user?.usertype === "admin" && fareDetails && (
              <div className="flex justify-end mt-4">
                <div className="text-right text-red-500">
                  <p className="text-2xl">
                    Tarifa estimada: {calculateEstimatedCost(fareDetails.estimateFare, isPeakHour(dateTime))}
                  </p>
                </div>
              </div>
            )}

            {passedTolls.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl">Peajes en la ruta:</h3>
                <ul>
                  {passedTolls.map((toll) => (
                    <li key={toll.CoordToll}>
                      {toll.NameToll} $ {toll.PriceToll}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Checkbox de observaciones */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="observationsCheckbox"
                checked={observationsEnabled}
                onChange={handleObservationsToggle}
                className="mr-2"
              />
              <label htmlFor="observationsCheckbox" className="text-gray-700">
                Observaciones
              </label>
            </div>

            {/* Input de observaciones, solo visible si el checkbox está activado */}
            {observationsEnabled && (
              <div className="mt-4">
                <label className="block text-gray-700">
                  Escriba sus observaciones
                </label>
                <textarea
                  value={observations}
                  onChange={handleObservationsChange}
                  className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  rows={4}
                />
              </div>
            )}
            <div className="w-full h-80 mt-4">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedOrigin || center}
                zoom={12}
                options={{
                  mapId: "64b34bb5f72e28a9",
                }}
              >
                {selectedOrigin && <Marker position={selectedOrigin} />}
                {selectedDestination && (
                  <Marker position={selectedDestination} />
                )}
                {directions && (
                  <Polyline
                    path={directions.routes[0].overview_path}
                    options={{
                      strokeColor: "#FF0000",
                      strokeOpacity: 1.0,
                      strokeWeight: 2,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={onClose}
                className="bg-gray-500 text-white py-2 px-4 rounded-2xl hover:bg-gray-700"
              >
                Cancelar
              </button>
              <ButtonCustom confirmBooking={confirmBooking} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalAddBooking;
