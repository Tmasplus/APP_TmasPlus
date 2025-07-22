import React, { useEffect, useState } from 'react';
import { getDatabase, ref, query, orderByKey, limitToLast, orderByChild, equalTo, get, startAt, endAt } from 'firebase/database';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Booking } from '../interfaces/Booking';
import defaultDriverImage from '../assets/1.png'; // Importa la imagen por defecto
import Papa from 'papaparse';
import Modal from '../components/ModalHistoy'; // Asegúrate de ajustar la ruta según corresponda

const BookingHistoryTable: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [endOfList, setEndOfList] = useState(false);
  const [pageSize] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchBookings = async () => {
      const db = getDatabase();
      let bookingsRef;

      if (user?.usertype === 'admin') {
        bookingsRef = query(ref(db, 'bookings'), orderByKey(), limitToLast(pageSize));
      } else {
        bookingsRef = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), limitToLast(pageSize));
      }

      const snapshot = await get(bookingsRef);
      const data = snapshot.val();
      if (data) {
        const bookingsArray = Object.keys(data).map((key) => ({
          ...data[key],
          uid: key,
        })).reverse();
        setLastKey(bookingsArray[bookingsArray.length - 1]?.uid); // Guarda la clave del último elemento cargado
        setBookings(bookingsArray);
        setFilteredBookings(bookingsArray);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [pageSize, user]);

  const loadMore = async () => {
    if (lastKey && !endOfList) {
      setLoadingMore(true);
      const db = getDatabase();
      let bookingsRef;

      if (user?.usertype === 'admin') {
        bookingsRef = query(ref(db, 'bookings'), orderByKey(), limitToLast(pageSize + 1), endAt(lastKey));
      } else {
        bookingsRef = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), limitToLast(pageSize + 1), endAt(lastKey));
      }

      const snapshot = await get(bookingsRef);
      const data = snapshot.val();
      if (data) {
        const bookingsArray = Object.keys(data).map((key) => ({
          ...data[key],
          uid: key,
        })).reverse();

        // Elimina el último elemento, que es el duplicado del último lote
        if (bookingsArray.length > 1) {
          bookingsArray.pop();
        }

        setLastKey(bookingsArray[bookingsArray.length - 1]?.uid); // Actualiza la clave del último elemento cargado
        setBookings((prevBookings) => [...prevBookings, ...bookingsArray]);
        setFilteredBookings((prevBookings) => [...prevBookings, ...bookingsArray]);
        if (bookingsArray.length < pageSize) {
          setEndOfList(true);
        }
      } else {
        setEndOfList(true);
      }
      setLoadingMore(false);
    }
  };

  const searchBookings = async (searchQuery: string) => {
    setLoading(true);
    const db = getDatabase();
    let bookingsRefByName, bookingsRefByReference, bookingsRefByBusinessName;

    if (user?.usertype === 'admin') {
      bookingsRefByName = query(ref(db, 'bookings'), orderByChild('customer_name'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByReference = query(ref(db, 'bookings'), orderByChild('reference'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByBusinessName = query(ref(db, 'bookings'), orderByChild('bussinesName'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
    } else {
      bookingsRefByName = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByReference = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByBusinessName = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
    }

    const [snapshotByName, snapshotByReference, snapshotByBusinessName] = await Promise.all([get(bookingsRefByName), get(bookingsRefByReference), get(bookingsRefByBusinessName)]);
    const dataByName = snapshotByName.val();
    const dataByReference = snapshotByReference.val();
    const dataByBusinessName = snapshotByBusinessName.val();

    let bookingsArray = [];
    if (dataByName) {
      bookingsArray = bookingsArray.concat(Object.keys(dataByName).map((key) => ({
        ...dataByName[key],
        uid: key,
      })).reverse());
    }
    if (dataByReference) {
      bookingsArray = bookingsArray.concat(Object.keys(dataByReference).map((key) => ({
        ...dataByReference[key],
        uid: key,
      })).reverse());
    }
    if (dataByBusinessName) {
      bookingsArray = bookingsArray.concat(Object.keys(dataByBusinessName).map((key) => ({
        ...dataByBusinessName[key],
        uid: key,
      })).reverse());
    }

    // Remove duplicate bookings
    const uniqueBookings = Array.from(new Set(bookingsArray.map(b => b.uid)))
      .map(uid => bookingsArray.find(b => b.uid === uid));

    setFilteredBookings(uniqueBookings);
    setLoading(false);
  };

  const handleSearch = () => {
    searchBookings(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBookings(bookings);
    }
  }, [searchTerm, bookings]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'CANCELLED':
        return 'text-red-900 bg-red-900';
      case 'COMPLETE':
        return 'text-red_treas bg-red_treas';
      case 'NEW':
        return 'text-gray-500 bg-gray-500';
      case 'REACHED':
        return 'text-gray-500 bg-gray-500';
      case 'STARTED':
        return 'text-gray-500 bg-gray-500';
      case 'ACCEPTED':
        return 'text-green-500 bg-green-500';
      case 'PENDING':
        return 'text-rose-300 bg-rose-300';
      default:
        return 'text-rose-500 bg-rose-500 font-bold';
    }
  };

  const exportToCSV = () => {
    const csvData = filteredBookings.map((booking) => ({
      'Fecha y Hora de Creacion de Reserva': new Date(booking.bookingDate).toLocaleString(),
      'Hora Programada del Servicio': new Date(booking.tripdate).toLocaleString(),
      'Hora de Inicio del Viaje': booking.trip_start_time,
      'Hora de Finalizacion del Viaje': booking.trip_end_time,
      'Cliente': booking.customer_name,
      'Conductor Asignado': booking.driver_name,
      'Placa del Vehiculo': booking.vehicle_number,
      'Tipo de Servicio': booking.carType,
      'Codigo de seguridad OTP': booking.otp,
      'Duracion del Servicio': `${Math.round(booking.total_trip_time / 60)} min`,
      'Metodo de Pago': booking.payment_mode === 'cash' ? 'Efectivo' : 'Empresarial',
      'Costo del Viaje': booking.trip_cost,
      'El Cliente Pago Empresarial': booking.cost_corp,
      'Comision Hotel': booking.comisioCompany,
      'Hosting Tecnologico': booking.Technological_Hosting,
      'Base de Impuestos': booking.Base_de_IVA,
      'IVA': booking.Iva,
      'Paquete de Polizas': booking.PolicyPackage,
      'Participacion de los Conductores': booking.trip_cost,
      'Estado del Servicio': booking.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'booking_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  const roundPrice = (price) => {
    const remainder = price % 50;
    if (remainder > 0) {
      return price - remainder + 50;
    }
    return price;
  };
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">HISTORIAL DE RESERVAS</h1>
        <button
          onClick={exportToCSV}
          className="bg-red_treas hover:bg-red-950 text-white px-4 py-2 rounded-lg"
        >
          Exportar
        </button>
      </div>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por referencia, nombre del cliente o nombre del negocio..."
          className="p-2 rounded bg-white text-black placeholder:text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSearch}
          className="bg-red_treas text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red_treas focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
        >
          Buscar
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="px-6 py-4 whitespace-nowrap">Fecha y Hora de Creacion de Reserva</th>
              <th className="px-6 py-4 whitespace-nowrap">Hora Programada del Servicio</th>
              <th className="px-6 py-4 whitespace-nowrap">Hora de Inicio del Viaje</th>
              <th className="px-6 py-4 whitespace-nowrap">Hora de Finalizacion del Viaje</th>
              <th className="px-6 py-4 whitespace-nowrap">Referencia</th>
              <th className="px-6 py-4 whitespace-nowrap">Cliente</th>
              <th className="px-6 py-4 whitespace-nowrap">Conductor Asignado</th>
              <th className="px-6 py-4 whitespace-nowrap">Placa del Vehiculo</th>
              <th className="px-6 py-4 whitespace-nowrap">Tipo de Servicio</th>
              <th className="px-6 py-4 whitespace-nowrap">Codigo de seguridad OTP</th>
              <th className="px-6 py-4 whitespace-nowrap">Duracion del Servicio</th>
              <th className="px-6 py-4 whitespace-nowrap">Metodo de Pago</th>
              <th className="px-6 py-4 whitespace-nowrap">Costo del Viaje</th>
              <th className="px-6 py-4 whitespace-nowrap">El Cliente Pago Empresarial</th>
              <th className="px-6 py-4 whitespace-nowrap">Comision Hotel</th>
              <th className="px-6 py-4 whitespace-nowrap">Hosting Tecnologico</th>
              <th className="px-6 py-4 whitespace-nowrap">Base de Impuestos</th>
              <th className="px-6 py-4 whitespace-nowrap">IVA</th>
              <th className="px-6 py-4 whitespace-nowrap">Paquete de Polizas</th>
              <th className="px-6 py-4 whitespace-nowrap">Participacion de los Conductores</th>
              <th className="px-6 py-4 whitespace-nowrap">Estado del Servicio</th>
              <th className="px-6 py-4 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.uid} className="border-b hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.bookingDate).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.tripdate).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.trip_start_time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.trip_end_time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{booking.customer_name}</div>
                  <div className="text-gray-500">{booking.customer_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <img
                    src={booking.driver_image || defaultDriverImage}
                    alt={booking.driver_name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {booking.driver_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.vehicle_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.carType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.otp}</td>
                <td className="px-6 py-4 whitespace-nowrap">{`${Math.round(booking.total_trip_time / 60)} min`}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.payment_mode === 'cash' ? 'Efectivo' : 'Empresarial'}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.trip_cost}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.cost_corp}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.comisioCompany}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.Technological_Hosting}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.Base_de_IVA}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.Iva}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.PolicyPackage}</td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.trip_cost}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-white ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-300"
                    onClick={() => openModal(booking)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p>Showing {filteredBookings.length} items</p>
        <div className="flex items-center">
          <button
            onClick={loadMore}
            className="px-3 py-1 bg-gray-200 rounded-l-lg hover:bg-gray-300"
            disabled={loadingMore || endOfList}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      </div>
      {selectedBooking && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          booking={selectedBooking} 
        />
      )}
    </div>
  );
};

export default BookingHistoryTable;
