import React, { useState } from "react";
import Modal from "./ModalHistoy";
import { Booking } from "../interfaces/Booking"; // Cambiado a importación nombrada
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const CardCorp: React.FC<Booking> = (booking) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const authState = useSelector((state: RootState) => state.auth);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "CANCELLED":
        return "text-gray-500 bg-gray-500";
      case "COMPLETE":
        return "text-red_treas bg-red_treas";
      case "NEW":
        return "text-red_treas bg-red_treas";
      case "REACHED":
        return "text-gray-500 bg-gray-500";
      case "STARTED":
        return "text-gray-500 bg-gray-500";
      case "ACCEPTED":
        return "text-green-500 bg-green-500";
      case "PENDING":
        return "text-rose-300 bg-rose-300";
      default:
        return "text-rose-500 bg-rose-500 font-bold";
    }
  };

  const roundPrice = (price) => {
    const remainder = price % 50;
    if (remainder > 0) {
      return price - remainder + 50;
    }
    return price;
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "CANCELLED":
        return "CANCELADO";
      case "COMPLETE":
        return "COMPLETADO";
      case "NEW":
        return "NUEVO";
      case "REACHED":
        return "ALCANZADO";
      case "STARTED":
        return "INICIADO";
      case "ACCEPTED":
        return "ACEPTADO";
      case "PENDING":
        return "PENDIENTE";
      default:
        return status;
    }
  };

  return (
    <>
      <div
        className="max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-transform hover:scale-105 hover:shadow-lg m-4 cursor-pointer"
        onClick={handleOpenModal}
      >
        <div className="flex flex-col md:flex-row items-center p-4">
          <img
            src={booking.carImage}
            alt="Car"
            className="w-full md:w-20 lg:w-20 h-36 lg:h-full object-cover m-2 rounded-full shadow-2xl"
          />
          <div className="flex flex-col justify-between w-full">
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  {booking.customer_name}
                </h3>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <span
                    className={`text-sm ${
                      getStatusColor(booking.status).split(" ")[0]
                    }`}
                  >
                    {translateStatus(booking.status)}
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      getStatusColor(booking.status).split(" ")[1]
                    }`}
                  ></div>
                </div>
              </div>
              <p className="text-red-600 text-sm md:text-base">
                {booking.carType}
              </p>
              <p className="text-gray-700 text-sm md:text-base">
                Codigo OTP :{" "}
                <span className="text-neutral-500">{booking.otp}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p className="text-gray-700 text-sm md:text-base">
                  Fecha de Reserva:{" "}
                  <span className="text-neutral-500">
                    {new Date(booking.bookingDate).toLocaleString()}
                  </span>
                </p>
                <p className="text-gray-700 text-sm md:text-base">
                  Hora Programada:{" "}
                  <span className="text-neutral-500">
                    {new Date(booking.tripdate).toLocaleString()}
                  </span>
                </p>
                <p className="text-gray-700 text-sm md:text-base">
                  Dirección de Origen :{" "}
                  <span className="text-neutral-500">{booking.pickup.add}</span>
                </p>
                <p className="text-gray-700 text-sm md:text-base">
                  Dirección de Destino:{" "}
                  <span className="text-neutral-500">{booking.drop.add}</span>
                </p>
                {authState?.user.usertype !== "company" ? (
                  <>
                    <p className="text-gray-700 text-sm md:text-base">
                      Desde:{" "}
                      <span className="text-neutral-500 font-bold">
                        ${roundPrice(Number(booking.estimate))}
                      </span>
                    </p>
                    <p className="text-gray-700 text-sm md:text-base">
                      Hasta:{" "}
                      <span className="text-neutral-500 font-bold">
                        ${roundPrice(Number(booking.estimate) + 7000)}
                      </span>
                    </p>
                    <p className="text-gray-700 text-sm md:text-base">
                      Costo Real:{" "}
                      <span className="text-red_treas font-bold">
                        ${roundPrice(Number(booking.trip_cost))}
                      </span>
                    </p>
                  </>
                ) : null}
                <p className="text-gray-700 text-sm md:text-base">
                  <span
                    className={`text-neutral-500 font-bold p-1 rounded-md ${
                      booking.booking_from_web
                        ? "bg-black text-white"
                        : "bg-red_treas text-white "
                    }`}
                    style={{ marginRight: "2px" }}
                  >
                    {booking.booking_from_web ? "Web" : "Aplicación"}
                  </span>
                  <span
                    className={`text-neutral-500 font-bold p-1 rounded-md ${
                      booking.bookLater
                        ? "border border-red-500 bg-white text-red-500"
                        : "border border-black bg-white text-black"
                    }`}
                    style={{ marginLeft: "2px" }}
                  >
                    {booking.bookLater ? "Programado" : "Inmediato"}
                  </span>
                </p>
                <p className="text-gray-700 text-sm md:text-base"></p>
              </div>
            </div>
            <div className="mt-4 ml-auto">
              <button className="text-red-500 hover:text-rose-300 font-semibold">
                Ver más detalles
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        booking={booking}
      />
    </>
  );
};

export default CardCorp;
