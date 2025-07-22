import React, { useEffect, useState } from 'react';
import CardCorp from '../components/CardCorp';
import { getDatabase, ref, query, limitToLast, orderByKey, onValue, orderByChild, equalTo, endAt, get, startAt } from 'firebase/database';
import { useSelector } from 'react-redux';
import ModalAddBooking from '../components/ModalAddBooking'; // Asegúrate de ajustar la ruta
import AddUserModal from '../components/AddUserModal'; // Importa el componente del modal
import { RootState } from '../store/store';
import Papa from 'papaparse';
import GoogleMapsLoader from '../components/GoogleMapsLoader';
import ExportModal from '../components/ExportModal';
import Loader from '../components/Loader';
import { useDispatch } from 'react-redux';
import { cancelBooking, completeBooking } from '../slices/bookingSlice';

const BookingCorp: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [endOfList, setEndOfList] = useState(false);
  const [pageSize] = useState(30); // Número de elementos por página
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenUser, setIsModalOpenUser] = useState(false);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // Nuevo estado para el select
  const user = useSelector((state: RootState) => state.auth.user);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { filteredUsers } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    const fetchBookings = async () => {
      const db = getDatabase();
      let bookingsRef;

      if (user?.usertype === 'admin') {
        bookingsRef = query(ref(db, 'bookings'), orderByKey(), limitToLast(pageSize));
      } else if (user?.usertype === 'company') {
        bookingsRef = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), limitToLast(pageSize));
      }

      onValue(bookingsRef, (snapshot) => {
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
      });
    };

    fetchBookings();

    return () => { };
  }, [pageSize, user]);
  useEffect(() => {
    const now = Date.now();
    bookings.forEach((booking) => {
      if (booking.status === 'NEW' && now - booking.bookingDate > 5 * 60 * 1000 && !booking.bookLater) {
        console.log('Cancelando reserva:', booking.uid);
        dispatch(cancelBooking(booking.uid, "Cancelacion Automatica", "web", 'CANCELLED', booking));

        // Enviar notificación
        fetch('https://us-central1-treasupdate.cloudfunctions.net/sendMassNotification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokens: [booking.customer_token],
            title: 'Tu servicio fue cancelado de manera automática',
            body: `No tenemos vehículos disponibles en tu zona en este momento. Por favor, prueba con un servicio programado u otro tipo de servicio.`,
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Notificación enviada:', data);
        })
        .catch(error => {
          console.error('Error al enviar la notificación:', error);
        });
      }
    });
  }, [bookings]);
  const loadMore = async () => {
    if (lastKey && !endOfList) {
      setLoadingMore(true);
      const db = getDatabase();
      let bookingsRef;

      if (user?.usertype === 'admin') {
        bookingsRef = query(ref(db, 'bookings'), orderByKey(), endAt(lastKey), limitToLast(pageSize + 1));
      } else if (user?.usertype === 'company') {
        bookingsRef = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), limitToLast(pageSize + 1), endAt(lastKey));
      }

      try {
        const snapshot = await get(bookingsRef);
        const data = snapshot.val();
        if (data) {
          const newBookingsArray = Object.keys(data).map((key) => ({
            ...data[key],
            uid: key,
          })).reverse();

          // Elimina el último elemento, que es el duplicado del último lote
          if (newBookingsArray.length > 1) {
            newBookingsArray.pop();
          }

          const newLastKey = newBookingsArray.length > 0 ? newBookingsArray[newBookingsArray.length - 1].uid : lastKey;
          setLastKey(newLastKey); // Actualiza la clave del último elemento cargado
          setBookings(prevBookings => [...prevBookings, ...newBookingsArray]);
          setFilteredBookings(prevBookings => [...prevBookings, ...newBookingsArray]);

          setEndOfList(newBookingsArray.length < pageSize);
        } else {
          setEndOfList(true);
        }
      } catch (error) {
        console.error('Error fetching more bookings:', error);
      }

      setLoadingMore(false);
    }
  };

  const searchBookings = async (searchQuery: string) => {
    setLoading(true);
    const db = getDatabase();
    let bookingsRefByName, bookingsRefByReference, bookingsRefByStatus;

    if (user?.usertype === 'admin') {
      bookingsRefByName = query(ref(db, 'bookings'), orderByChild('customer_name'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByReference = query(ref(db, 'bookings'), orderByChild('reference'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByStatus = query(ref(db, 'bookings'), orderByChild('status'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
    } else if (user?.usertype === 'company') {
      bookingsRefByName = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByReference = query(ref(db, 'bookings'), orderByChild('company'), equalTo(user?.uid), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
      bookingsRefByStatus = query(ref(db, 'bookings'), orderByChild('status'), startAt(searchQuery), endAt(searchQuery + "\uf8ff"));
    }

    const [snapshotByName, snapshotByReference, snapshotByStatus] = await Promise.all([
      get(bookingsRefByName),
      get(bookingsRefByReference),
      get(bookingsRefByStatus)
    ]);

    const dataByName = snapshotByName.val();
    const dataByReference = snapshotByReference.val();
    const dataByStatus = snapshotByStatus.val();

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
    if (dataByStatus) {
      bookingsArray = bookingsArray.concat(Object.keys(dataByStatus).map((key) => ({
        ...dataByStatus[key],
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
    if (selectedStatus) {
      searchBookings(selectedStatus); // Usa el estado seleccionado para buscar
    } else {
      searchBookings(searchTerm);
    }
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openModalUser = () => setIsModalOpenUser(true);
  const closeModalUser = () => setIsModalOpenUser(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }
  const exportToCSV = async (scope) => {
    let dataToExport = filteredBookings;
  
    if (scope === 'all') {
      // Cargar todos los bookings de la base de datos
      const db = getDatabase();
      const allBookingsRef = ref(db, 'bookings');
      const snapshot = await get(allBookingsRef);
      const data = snapshot.val();
  
      if (data) {
        dataToExport = Object.keys(data).map((key) => ({
          ...data[key],
          uid: key,
        }));
      }
    }
  
    // Reversa el orden de los bookings para mostrar del más reciente al más antiguo
    dataToExport = dataToExport.reverse();
  
    const csvData = dataToExport.map((booking) => {
      // Busca el businessName correspondiente al company en filteredUsers
      const userCompany = filteredUsers.find(user => user.uid === booking.company);
      const businessName = userCompany ? userCompany.bussinesName : ''; // Si no se encuentra el usuario, poner 'N/A'
      const convenienceFeesCalculated = booking.convenience_fees * booking.trip_cost;

      return {
        'Fecha y Hora de Creacion de Reserva': new Date(booking.bookingDate).toLocaleString().replace(/,/g, " "),
        'Hora Programada del Servicio': new Date(booking.tripdate).toLocaleString().replace(/,/g, " "),
        'Direccion de Origen': booking.pickupAddress,
        'Direccion de Destino': booking.dropAddress,
        'Hora de Inicio del Viaje': booking.trip_start_time 
        ? booking.trip_start_time.toString().replace(/\./g, ":") 
        : 'N/A',
      'Hora de Finalizacion del Viaje': booking.trip_end_time 
        ? booking.trip_end_time.toString().replace(/\./g, ":") 
        : 'N/A',
        'Cliente': booking.customer_name,
        'Conductor Asignado': booking.driver_name,
        'Placa del Vehiculo': booking.vehicle_number,
        'Tipo de Servicio': booking.carType,
        'Codigo de seguridad OTP': booking.otp,
        'Codigo de Referencia': booking.reference,
        'Duracion del Servicio': `${Math.round(booking.total_trip_time / 60)} min`,
        'Metodo de Pago': booking.payment_mode === 'cash' ? 'Efectivo' : 'Empresarial',
        'Costo del Viaje': booking.trip_cost,
        'El Cliente Pago Empresarial': booking.cost_corp,
        'Comision Hotel': booking.comisioCompany,
        'Hosting Tecnologico': booking.Technological_Hosting,
        'Base de Impuestos': booking.Base_de_IVA,
        'IVA': booking.Iva,
        'Paquete de Polizas': 800,
        'Participacion de los Conductores': booking.trip_cost,
        'Tasa de Convenienencia':convenienceFeesCalculated,

        'Nombre de la Empresa': businessName, // Nuevo campo añadido

        'Estado del Servicio': booking.status,
        'Plataforma de Solicitante': booking.booking_from_web ? 'WEB' : 'APP',
      };
    });
  
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'booking_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  


  const handleExport = (scope) => {
    exportToCSV(scope);
    setIsExportModalOpen(false);
  };
  return (
    <GoogleMapsLoader>
      <div className="min-h-screen bg-slate-50 p-8">
        <header className="sticky top-0 bg-slate-50 z-10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-black">Historial</h1>
          </div>
          <div className="flex flex-wrap justify-center md:justify-between gap-4">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={openModal}
                className="bg-red-700 text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
              >
                Crear una nueva reserva
              </button>
              <button
                onClick={openModalUser}
                className="bg-red_treas text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Añadir Usuario
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-red-700 text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-600"
              >
                Exportar CSV
              </button>
              <ExportModal
                isOpen={isExportModalOpen}
                onRequestClose={() => setIsExportModalOpen(false)}
                onConfirm={handleExport}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4">

            <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-2 rounded bg-white text-black"
              >
                <option value="">Seleccionar estado</option>
                <option value="NEW">NEW</option>
                <option value="ACCEPTED">ACEPTADO</option>
                <option value="STARTED">EN PROCESO</option>
                <option value="ARRIVED">LLEGÓ</option>
                <option value="COMPLETED">COMPLETADO</option>
                <option value="CANCELLED">CANCELADO</option>
              </select>
              <input
                type="text"
                placeholder="Buscar..."
                className="p-2 rounded bg-white text-black placeholder:text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            
              <button
                onClick={handleSearch}
                className="bg-red_treas text-white py-2 px-4 rounded-lg shadow-2xl hover:bg-red-950 focus:outline-none focus:ring-2 focus:bg-red-400 focus:ring-opacity-50 transition duration-300 ease-in-out"
              >
                Buscar
              </button>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <CardCorp key={booking.uid} {...booking} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-gray-500">
              Por favor crea tu primera reserva.
            </div>
          )}
        </div>
        {!endOfList && !loadingMore && (
          <button onClick={loadMore} className="bg-red_treas text-white py-2 px-4 mt-4 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 transition duration-300 ease-in-out">
            Cargar más
          </button>
        )}
        {loadingMore && (
          <div className="text-center py-4">
            <span>Cargando más...</span>
          </div>
        )}
        <ModalAddBooking isOpen={isModalOpen} onClose={closeModal} />
        {isModalOpenUser && <AddUserModal onClose={closeModalUser} />}
      </div>
    </GoogleMapsLoader>
  );
};


export default BookingCorp;
