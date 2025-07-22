import React, { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RootState } from "../store/store"; // Asegúrate de ajustar la ruta según corresponda
import { useDispatch, useSelector } from "react-redux";
import defaultImage from "../assets/1.png"; // Ruta a la imagen de respaldo
import { cancelBooking } from "../slices/bookingSlice";
import { Booking } from "../interfaces/Booking";
import { requestDrivers } from "../utils/requestDrivers";
import { updateBooking } from "../slices/bookingSlice";
import Select from "react-select";
import { User } from "../interfaces/User";
import ChatComponent from "./ChatComponent";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null; // Puede ser nulo si no hay reserva seleccionada
}

const RoutingMachine = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 1) {
      const waypoints = coords.map(coord => L.latLng(coord.latitude, coord.longitude));

      const routingControl = L.Routing.control({
        waypoints,
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: "red", weight: 4 }],
          extendToWaypoints: true,
          missingRouteTolerance: 50,
        },
        createMarker: function (i, waypoint, n) {
          return L.marker(waypoint.latLng);
        },
        itinerary: {
          show: false, // Ensure the itinerary is not shown
        },
        show: false, // Additional option to ensure no directions are shown
        addWaypoints: false, // Disable adding waypoints by clicking on the map
        draggableWaypoints: false, // Disable dragging waypoints
      }).addTo(map);

      // Fit the map to the bounds of the route
      map.fitBounds(L.latLngBounds(waypoints));

      return () => {
        map.removeControl(routingControl);
      };
    }
  }, [map, coords]);

  return null;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, booking }) => {
  const [activeSection, setActiveSection] = useState("driverDetails");
  const [isCancelReasonModalOpen, setIsCancelReasonModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const { cancelReasons } = useSelector(
    (state: RootState) => state.cancelReasons
  );
  const allUsers = useSelector((state: RootState) => state.users.allUsers);
  const carTypes = useSelector((state: RootState) => state.carTypes.carTypes);
  const { filteredUsers } = useSelector((state: RootState) => state.users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredDrivers, setFilteredDrivers] = useState<User[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const dispatch = useDispatch();
  if (!booking.trip_cost) {
    return null; // No muestra nada si no hay reserva seleccionada
  }

  const handleCancelBooking = () => {
    if (selectedReason) {
      dispatch(
        cancelBooking(
          booking.uid,
          selectedReason,
          user.usertype,
          "CANCELLED",
          booking
        )
      );
      onClose(); // Cierra el modal después de cancelar la reservación
      closeCancelReasonModal(); // Cierra el modal de razones de cancelación
    }
  };
  const handleNoShowClient = () => {
    let updatedBooking = { ...booking, status: "NOSHOW_CLIENT" };
    dispatch(updateBooking(booking.uid, updatedBooking, filteredUsers));
  };
  const handleNoShowDriver = () => {
    Swal.fire({
      title: "Nuestras más sinceras disculpas",
      text: "Lamentablemente, no pudimos realizar el servicio como estaba programado. Entendemos lo inconveniente que esto puede ser y estamos comprometidos a mejorar. Gracias por su comprensión.",
      icon: "info",
      confirmButtonText: "Aceptar",
    }).then(() => {
      let updatedBooking = { ...booking, status: "NOSHOW_DRIVER" };
      dispatch(updateBooking(booking.uid, updatedBooking, filteredUsers));
    });
  };

  const openCancelReasonModal = () => {
    setIsCancelReasonModalOpen(true);
  };

  const handleForceEndBooking = () => {
    dispatch(updateBooking(booking.uid, booking, filteredUsers));
  };

  const closeCancelReasonModal = () => {
    setIsCancelReasonModalOpen(false);
    setSelectedReason(null);
  };
  const changueBookingNew = async () => {
    if (!booking.pickup.lat || !booking.pickup.lng) {
      console.log("Origen no válido");
      return;
    }

    const updatedBooking = await requestDrivers(
      { lat: booking.pickup.lat, lng: booking.pickup.lng },
      allUsers,
      booking,
      carTypes
    );
    console.log(updatedBooking.requestedDrivers);
    if (updatedBooking) {
      updatedBooking.status = "NEW";
      dispatch(updateBooking(booking.uid, updatedBooking));
      // Lógica adicional para guardar la reserva actualizada si es necesario
    }
  };
  const changueASSINGdriver = () => {
    const drivers = allUsers.filter((user) => user.usertype === "driver");
    setFilteredDrivers(drivers);
    setIsModalOpen(true);
  };
  const assignDriver = (selectedDriver) => {
    console.log(`Conductor asignado: ${selectedDriver}`);

    if (selectedDriver) {
      // Crear una copia del objeto booking y eliminar las propiedades no deseadas
      const { requestedDrivers, driversEstimate, ...restBooking } = booking;

      // Crear el nuevo objeto booking con el driver seleccionado
      const updatedBooking = {
        ...restBooking, // Incluye todas las demás propiedades de booking
        requestedDrivers: {
          [selectedDriver]: true, // Añadir el driver seleccionado
        },
      };

      // Aquí podrías hacer lo que necesites con updatedBooking, como actualizar el estado, hacer una llamada a una API, etc.
      console.log("Updated Booking:", updatedBooking);
      dispatch(updateBooking(booking.uid, updatedBooking));

      setIsModalOpen(false);
    }
  };
  const roundPrice = (price) => {
    const remainder = price % 50;
    if (remainder > 0) {
      return price - remainder + 50;
    }
    return price;
  };

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const center = {
    lat: booking.pickup.lat || 0, // Asegúrate de que estos valores existan
    lng: booking.pickup.lng || 0,
  };

  const renderButtons = () => {
    switch (booking.status) {
      case "NEW":
        return (
          <div className="space-y-2">
            <button
              className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-300"
              onClick={openCancelReasonModal}
            >
              Cancelar Reservacion
            </button>

            <button
              className="w-full bg-white text-red-700 border-2 border-red-700 p-2 rounded-lg hover:bg-red-800 hover:text-white"
              onClick={changueBookingNew}
            >
              Cambiar a Nuevo
            </button>

            <button
              className="w-full bg-red-300 text-white p-2 rounded-lg hover:bg-red-500"
              onClick={changueASSINGdriver}
            >
              Asignar Conductor
            </button>
          </div>
        );
      case "STARTED":
        return (
          <div className="space-y-2">
            <button
              className="w-full bg-red-700 text-white p-2 rounded-lg hover:bg-red-800"
              onClick={handleForceEndBooking}
            >
              Cerrar Servicio
            </button>
          </div>
        );
      case "ACCEPTED":
        return (
          <div className="space-y-2">
            <div className="flex space-x-4">
              <button
                className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-300"
                onClick={handleNoShowClient}
              >
                No Show Cliente
              </button>
              <button
                className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-300"
                onClick={handleNoShowDriver}
              >
                No Show Conductor
              </button>
            </div>
            <button
              className="w-full bg-red-700 text-white p-2 rounded-lg hover:bg-red-800"
              onClick={openCancelReasonModal}
            >
              Cancelar Reservacion
            </button>
            <button
              className="w-full bg-white text-red-700 border-2 border-red-700 p-2 rounded-lg hover:bg-red-800 hover:text-white"
              onClick={changueBookingNew}
            >
              Cambiar a Nuevo
            </button>
          </div>
        );
      case "PENDING":
        return (
          <div className="space-y-2">
            <button
              className="w-full bg-red-700 text-white p-2 rounded-lg hover:bg-red-800"
              onClick={handleForceEndBooking}
            >
              Cambiar a Completo
            </button>
          </div>
        );

      default:
        return <div className="space-y-2"></div>;
    }
  };

  const renderContent = () => {
    const isCorporate = booking.payment_mode === "corp";

    return (
      <>
        {activeSection === "driverDetails" && (
          <>
            <label className="block text-gray-700">Primer Nombre</label>
            <input
              type="text"
              value={booking.driver_name}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Número celular</label>
            <input
              type="text"
              value={booking.driver_contact}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Placa del Vehiculo</label>
            <input
              type="text"
              value={booking.vehicle_number}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
          </>
        )}
        {activeSection === "userDetails" && (
          <>
            <label className="block text-gray-700">Nombre de Usuario</label>
            <input
              type="text"
              value={booking.customer_name}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              value={booking.customer_email}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Número de Celular</label>
            <input
              type="text"
              value={booking.customer_contact}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
          </>
        )}
        {activeSection === "addresses" && (
          <>
            <label className="block text-gray-700">Dirección de Origen</label>
            <input
              type="text"
              value={booking.pickup.add}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            {(booking.status === "COMPLETE" ||
              booking.status === "REACHED") && (
              <>
                <label className="block text-gray-700">
                  Dirección de Destino(Original)
                </label>
                <input
                  type="text"
                  value={booking.dropAddress}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
              </>
            )}

            <label className="block text-gray-700">Dirección de Destino</label>
            <input
              type="text"
              value={booking.drop.add}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Tipo de Recorrido</label>
            <input
              type="text"
              value={booking.tripType}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
          </>
        )}
        {activeSection === "costs" && (
          <>
            {user.usertype === "company" ||
              (booking.payment_mode === "corp" && (
                <>
                  <label className="block text-red_treas">
                    Estimado Empresarial{" "}
                  </label>
                  <input
                    type="text"
                    value={`${roundPrice(Number(booking.cost_corp))} - ${roundPrice(
                      Number(booking.cost_corp) + 7000
                    )}`}
                    className="w-full p-2 mb-4 border rounded"
                    readOnly
                  />
                </>
              ))}
            {user.usertype === "company" ? (
              <div>
                <label className="block text-gray-700">Costo Conductor</label>
                {/* Aquí puedes agregar el campo de entrada para el costo real */}
              </div>
            ) : (
              <div>
                <label className="block text-gray-700">Costo Real</label>
                {/* Aquí puedes agregar el campo de entrada para el costo normal */}
              </div>
            )}

            <input
              type="text"
              value={roundPrice(Number(booking.trip_cost))}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            {user.usertype === "company" || booking.payment_mode === "corp" ? (
              <>
                <label className="block text-red_treas">Comision Empresa</label>
                <input
                  type="text"
                  value={roundPrice(Number(booking.comisioCompany))}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
                <label className="block text-gray-700">
                  El Cliente Pago Empresarial
                </label>
                <input
                  type="text"
                  value={roundPrice(Number(booking.cost_corp))}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />

                <label className="block text-gray-700">
                  Hosting Tecnologico
                </label>
                <input
                  type="text"
                  value={
                    isCorporate ? roundPrice(Number(booking.Technological_Hosting)) || "" : "0"
                  }
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
                <label className="block text-gray-700">Poliza</label>
                <input
                  type="text"
                  value={isCorporate ? "800" : "0"}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
                <label className="block text-gray-700">Base de Iva</label>
                <input
                  type="text"
                  value={isCorporate ? roundPrice(Number( booking.Base_de_IVA)) || "" : "0"}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
                <label className="block text-gray-700">IVA</label>
                <input
                  type="text"
                  value={isCorporate ?roundPrice(Number( booking.Iva)) || "" : "0"}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
              </>
            ) : (
              <>
                <label className="block text-gray-700">Estimado </label>
                <input
                  type="text"
                  value={`${roundPrice(booking.estimate)} - ${roundPrice(
                    Number(booking.estimate) + 7000
                  )}`}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
              </>
            )}
          </>
        )}
        {activeSection === "appointment" && (
          <>
            <label className="block text-gray-700">Hora de Inicio</label>
            <input
              type="text"
              value={booking.trip_start_time}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">
              Hora Final del Servicio
            </label>
            <input
              type="text"
              value={booking.trip_end_time}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Tipo de Servicio</label>
            <input
              type="text"
              value={booking.tripType}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">KMS</label>
            <input
              type="text"
              value={booking.distance}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            <label className="block text-gray-700">Tiempo</label>
            <input
              type="text"
              value={booking.total_trip_time}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
          </>
        )}
        {activeSection === "status" && (
          <>
            <label className="block text-gray-700">Estado</label>
            <input
              type="text"
              value={booking.status}
              className="w-full p-2 mb-4 border rounded"
              readOnly
            />
            {(booking.status === "CANCELLED" || booking.reason) && (
              <>
                <label className="block text-gray-700 flex items-center">
                  Razon de Cancelacion
                  <span className="ml-2">
                    <i className="react-icons">❌</i>
                  </span>
                </label>
                <input
                  type="text"
                  value={booking.reason}
                  className="w-full p-2 mb-4 border rounded"
                  readOnly
                />
              </>
            )}
            {renderButtons()}
          </>
        )}
        {activeSection === "map" && booking.status === "COMPLETE" && (
          <>
            <label className="block text-gray-700 flex items-center">
              Mapa del Viaje
              <span className="ml-2">
                <i className="react-icons">🗺️</i>
              </span>
            </label>
            <div style={{ height: "400px", width: "100%" }}>
              <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <RoutingMachine coords={booking.coords} />
              </MapContainer>
            </div>
          </>
        )}
        {activeSection === "chat" && (
          <>
            <ChatComponent uid={booking.uid} />
          </>
        )}
      </>
    );
  };

  const renderImage = () => {
    if (activeSection === "driverDetails") {
      return booking.driver_image ? booking.driver_image : defaultImage;
    }
    if (activeSection === "userDetails") {
      return booking.customer_image ? booking.customer_image : defaultImage;
    }
    return booking.carImage;
  };

  function traductPaymentmode(payment_mode: string): React.ReactNode {
    if (payment_mode === "cash") {
      return "Efectivo";
    } else if (payment_mode === "corp") {
      return "Empresarial";
    } else {
      return "Billetera";
    }
  }

  return (
    <>
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-1/4 p-4">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold">
                          Reservación:{" "}
                          <span className="text-red_treas">
                            {booking.reference}
                          </span>
                        </h2>
                        <p className="text-gray-500">
                          Información de la Reserva
                        </p>
                      </div>
                      <div className="space-y-4">
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "driverDetails"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("driverDetails")}
                        >
                          Detalles del Conductor
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "userDetails"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("userDetails")}
                        >
                          Detalles del Usuario
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "addresses"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("addresses")}
                        >
                          Direcciones
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "costs"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("costs")}
                        >
                          Costos
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "appointment"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("appointment")}
                        >
                          Duración
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "chat"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("chat")}
                        >
                          Chat
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "status"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("map")}
                        >
                          Mapa del Viaje
                        </button>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-2xl ${
                            activeSection === "status"
                              ? "bg-red_treas text-white"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                          onClick={() => setActiveSection("status")}
                        >
                          Estados de la Reserva
                        </button>
                      </div>
                    </div>
                    {/* Main content */}
                    <div className="w-full md:w-3/4 p-4 flex flex-col justify-between">
                      <div className="flex items-center mb-4">
                        <img
                          src={renderImage()}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full shadow-2xl"
                        />
                        <p className="ml-10">
                          Metodo de Pago:{" "}
                          <span className="text-red_treas uppercase">
                            {traductPaymentmode(booking.payment_mode)}
                          </span>
                        </p>
                        <p className="ml-10">
                          Uid de la Reserva:{" "}
                          <span className="text-red_treas uppercase">
                            {booking.uid}
                          </span>
                        </p>
                        <div className="ml-4">
                          <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            onChange={(e) => console.log(e.target.files)}
                          />
                        </div>
                      </div>
                      <p className="text-gray-500 mb-4"></p>
                      <div>{renderContent()}</div>
                      <div className="flex justify-end space-x-4 mt-4">
                        <button
                          className="bg-gray-500 text-white px-4 py-2 rounded-2xl hover:bg-gray-700"
                          onClick={onClose}
                        >
                          Cerrar
                        </button>
                        <button
                          className="bg-red-800 text-white px-4 py-2 rounded-2xl hover:bg-red-700"
                          onClick={() => console.log("Save")}
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition show={isCancelReasonModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeCancelReasonModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Selecciona la razón de cancelación
                  </Dialog.Title>
                  <div className="mt-4">
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={selectedReason || ""}
                      onChange={(e) => setSelectedReason(e.target.value)}
                    >
                      <option value="" disabled>
                        Selecciona una razón
                      </option>
                      {cancelReasons.map((reason) => (
                        <option key={reason.id} value={reason.reason.label}>
                          {reason.reason.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                      onClick={closeCancelReasonModal}
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                      onClick={handleCancelBooking}
                    >
                      Confirmar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Esta capa cubre toda la pantalla y bloquea interacciones con elementos detrás del modal */}
            <div className="fixed inset-0 bg-black bg-opacity-25 pointer-events-none" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                {/* El panel del modal es clickeable */}
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all pointer-events-auto">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Selecciona un conductor
                  </Dialog.Title>
                  <div className="mt-4">
                    <Select
                      className="w-full"
                      value={
                        filteredDrivers.find(
                          (driver) => driver.id === selectedDriver
                        )
                          ? {
                              value: selectedDriver,
                              label: `${
                                filteredDrivers.find(
                                  (driver) => driver.id === selectedDriver
                                ).firstName
                              } ${
                                filteredDrivers.find(
                                  (driver) => driver.id === selectedDriver
                                ).lastName
                              } (${
                                filteredDrivers.find(
                                  (driver) => driver.id === selectedDriver
                                ).email
                              }) (${
                                filteredDrivers.find(
                                  (driver) => driver.id === selectedDriver
                                ).mobile
                              }) (${
                                filteredDrivers.find(
                                  (driver) => driver.id === selectedDriver
                                ).email
                              }) (${
                                filteredDrivers.find(
                                  (driver) => driver.id === selectedDriver
                                ).vehicleNumber
                              })`,
                            }
                          : null
                      }
                      onChange={(option) =>
                        setSelectedDriver(option ? option.value : "")
                      }
                      options={filteredDrivers.map((driver) => ({
                        value: driver.id,
                        label: `${driver.firstName} ${driver.lastName} (${driver.email}) (${driver.mobile}) (${driver.vehicleNumber})`,
                      }))}
                      placeholder="Selecciona un conductor"
                      noOptionsMessage={() => "No se encontraron conductores"}
                      isClearable
                    />
                  </div>

                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
                      onClick={() => {
                        if (selectedDriver) {
                          assignDriver(selectedDriver);
                        } else {
                          console.error("No se ha seleccionado un conductor.");
                        }
                        setIsModalOpen(false);
                      }}
                    >
                      Asignar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;