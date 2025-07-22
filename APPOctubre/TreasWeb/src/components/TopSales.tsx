import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Para obtener el estado de allUsers
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FaCarSide, FaUserTie, FaUserCheck, FaUserMinus, FaSpinner, FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';

const TopSales: React.FC = () => {
  const { allUsers, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users); // Obtener los usuarios desde Redux

  const [salesData, setSalesData] = useState({
    TREASX: 0,
    T: 0,
    Van: 0,
    E: 0,
  });
  const [totalDrivers, setTotalDrivers] = useState(0); // Estado para el total de conductores
  const [totalActiveUsers, setTotalActiveUsers] = useState(0); // Estado para el total de usuarios activos
  const [driversWithoutCity, setDriversWithoutCity] = useState(0); // Estado para conductores sin el campo "city"
  const [driversByCarType, setDriversByCarType] = useState({ TREASX: [], TREASE: [], TREAST: [], TREASVan: [] }); // Conductores activos separados por tipo de carro
  const [showDriverDetails, setShowDriverDetails] = useState(false); // Estado para mostrar detalles de conductores
  const [loading, setLoading] = useState(true);
  const [showActiveDetails, setShowActiveDetails] = useState(false); // Estado para mostrar detalles de usuarios activos
  const [activeByCarType, setActiveByCarType] = useState({ TREASX: 0, TREASE: 0, TREAST: 0, TREASVan: 0, Otro: 0 }); // Conductores activos por tipo de carro
  const [citySummary, setCitySummary] = useState([]); // Estado para el resumen por ciudad
  const [platformSummary, setPlatformSummary] = useState({ Android: 0, iOS: 0, Web: 0 }); // Estado para el resumen por plataforma
  const [showPlatformDetails, setShowPlatformDetails] = useState(false); // Estado para mostrar detalles de usuarios por plataforma
  const [platformDetails, setPlatformDetails] = useState({
    Android: { customers: 0, drivers: 0 },
    iOS: { customers: 0, drivers: 0 },
    Web: { customers: 0, drivers: 0 },
  });
  const [bookings, setBookings] = useState([]);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false); // Estado para mostrar detalles de clientes
  const [customersByCity, setCustomersByCity] = useState([]); // Estado para clientes separados por ciudad
  const [customersWithoutCity, setCustomersWithoutCity] = useState(0); // Estado para clientes sin ciudad
  const [totalCustomers, setTotalCustomers] = useState(0); // Estado para el total de clientes

  const handleDownloadCSV = (carType) => {
    const filteredBookings = bookings.filter(booking => booking.carType === carType);

    if (usersLoading || !allUsers) {
      alert('Los usuarios aún están cargando. Por favor, intenta nuevamente en unos momentos.');
      return;
    }

    if (filteredBookings.length === 0) {
      alert(`No hay reservas disponibles para ${carType}.`);
      return;
    }

    const csvData = filteredBookings.map((booking) => {
      const userCompany = allUsers.find(user => user.uid === booking.company);
      const businessName = userCompany ? userCompany.bussinesName : '';
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
        'Duracion del Servicio': booking.total_trip_time
          ? `${Math.round(booking.total_trip_time / 60)} min`
          : 'N/A',
        'Metodo de Pago': booking.payment_mode === 'cash' ? 'Efectivo' : 'Empresarial',
        'Costo del Viaje': booking.trip_cost,
        'El Cliente Pago Empresarial': booking.cost_corp,
        'Comision Hotel': booking.comisioCompany,
        'Hosting Tecnologico': booking.Technological_Hosting,
        'Base de Impuestos': booking.Base_de_IVA,
        'IVA': booking.Iva,
        'Paquete de Polizas': 800,
        'Participacion de los Conductores': booking.trip_cost,
        'Tasa de Conveniencia': convenienceFeesCalculated,
        'Nombre de la Empresa': businessName,
        'Estado del Servicio': booking.status,
      };
    });

    if (csvData.length === 0) {
      alert('No hay datos disponibles para exportar.');
      return;
    }

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => {
      return Object.values(row)
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    }).join('\n');
    const csvContent = headers + '\n' + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${carType}_bookings.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Función para descargar CSV de Conductores por Ciudad y CarType
  const handleDownloadDriversCSV = (city, carType) => {
    try {
      console.log(`Iniciando descarga de CSV para Conductores en ${city} con tipo de servicio ${carType}...`);

      // Filtrar los conductores según la ciudad y el tipo de servicio
      const filteredDrivers = allUsers.filter(user =>
        user.usertype === 'driver' &&
        normalizeCity(user.city) === normalizeCity(city) &&
        user.carType === carType
      );

      console.log('Conductores filtrados:', filteredDrivers);

      if (filteredDrivers.length === 0) {
        alert(`No hay conductores disponibles para ${carType} en ${city}.`);
        console.warn(`No hay conductores para ${carType} en ${city}.`);
        return;
      }

      // Definir los encabezados del CSV
      const headers = [
        'Fecha de creación', 'UID', 'Nombre', 'Apellido', 'Tipo de documento', 'N° Documento',
        'Número de móvil', 'Correo Electrónico', 'Billetera', 'Billetera de Kms', 'Ciudad', 'Placa',
        'Tipo de servicio', 'Cantidad de documentos', 'Id. de referido', 'Inscripción por recomendación',
        'Imagen de perfil', 'Gestión de Contácto', 'Bloqueado', 'Cuenta aprobada', 'Ocupado',
        'Estado del conductor', 'Licencia', 'Licencia Posterior', 'SOAT', 'Carta de Propiedad',
        'Carta de Propiedad posterior', 'Documento', 'Documento Posterior'
      ];

      let csvContent = headers.join(',') + '\n';

      // Mapear los conductores a filas del CSV
      filteredDrivers.forEach(user => {
        const documentCount = [
          user.SOATImagev2, user.SOATImage, user.cardPropImage, user.cardPropImageBK, user.cardPropImagev2,
          user.licenseImage, user.licenseImageBack, user.verifyIdImage, user.verifyIdImageBk
        ].filter(field => field).length;

        const row = [
          formatDate(user.createdAt),
          user.id,
          user.firstName,
          user.lastName,
          user.docType,
          user.verifyId,
          user.mobile,
          user.email,
          user.walletBalance,
          user.kmWallet,
          user.city,
          user.vehicleNumber,
          user.carType,
          documentCount,
          user.referralId,
          user.recommendationEnrollment,
          user.profile_image,
          user.validContac,
          user.blocked || false,
          user.approved || false,
          user.queue || false,
          user.driverActiveStatus,
          user.licenseImage,
          user.licenseImageBack,
          user.SOATImage,
          user.cardPropImage,
          user.cardPropImageBK,
          user.verifyIdImage,
          user.verifyIdImageBk
        ];

        // Escapar comillas dobles y unir los campos con comas
        const escapedRow = row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
        csvContent += escapedRow + '\n';
      });

      console.log('Contenido CSV de Conductores:', csvContent);

      // Crear un blob y descargar el archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Conductores_${carType}_${city}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Descarga de CSV para Conductores en ${city} con tipo de servicio ${carType} iniciada exitosamente.`);
    } catch (error) {
      console.error('Error al generar el CSV de Conductores:', error);
      alert('Ocurrió un error al generar el CSV de Conductores. Por favor, revisa la consola para más detalles.');
    }
  };
  const formatDate = (date: any) => {
    let formattedDate = '';

    if (typeof date === 'number') {
      formattedDate = new Date(date).toLocaleString();
    } else if (typeof date === 'string') {
      formattedDate = new Date(date).toLocaleString();
    }

    // Reemplazar la coma que separa la fecha y hora con un colon
    return formattedDate.replace(',', ':');
  };
  useEffect(() => {
    // Conectar con Firebase Realtime Database
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');

    get(bookingsRef).then((snapshot) => {
      const bookingsData = snapshot.val();
      let treasXCount = 0;
      let tCount = 0;
      let vanCount = 0;
      let eCount = 0;

      const bookingsArray = [];

      // Recorrer cada reserva por su UID único
      for (let uid in bookingsData) {
        const booking = bookingsData[uid];
        bookingsArray.push(booking); // Guardar la reserva en el array
        switch (booking.carType) {
          case 'TREAS-X':
            treasXCount++;
            break;
          case 'TREAS-T':
            tCount++;
            break;
          case 'TREAS-Van':
            vanCount++;
            break;
          case 'TREAS-E':
            eCount++;
            break;
          default:
            break;
        }
      }

      // Actualizar los datos de ventas y las reservas
      setSalesData({
        TREASX: treasXCount,
        T: tCount,
        Van: vanCount,
        E: eCount,
      });
      setBookings(bookingsArray); // Actualizar el estado con todas las reservas
      setLoading(false); // Deshabilitar la pantalla de carga
    });

    // Calcular el total de conductores diferenciados por tipo de carro y por ciudad
    if (allUsers && allUsers.length > 0) {
      const driversByTREASX = allUsers.filter(user => user.usertype === 'driver' && user.carType === 'TREAS-X');
      const driversByTREASE = allUsers.filter(user => user.usertype === 'driver' && user.carType === 'TREAS-E');
      const driversByTREAST = allUsers.filter(user => user.usertype === 'driver' && user.carType === 'TREAS-T');
      const driversByTREASVan = allUsers.filter(user => user.usertype === 'driver' && user.carType === 'TREAS-Van');

      const driverCount = driversByTREASX.length + driversByTREASE.length + driversByTREAST.length + driversByTREASVan.length;
      const activeUserCount = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus).length;

      const missingCityCount = allUsers.filter(user => user.usertype === 'driver' && !user.city).length;
      const activeTREASX = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus && user.carType === 'TREAS-X').length;
      const activeTREASE = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus && user.carType === 'TREAS-E').length;
      const activeTREAST = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus && user.carType === 'TREAS-T').length;
      const activeTREASVan = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus && user.carType === 'TREAS-Van').length;
      const activeusersinsu = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus && user.carType !== 'TREAS-Van' && user.carType !== 'TREAS-E' && user.carType !== 'TREAS-T' && user.carType !== 'TREAS-X').length;

      const androidUsers = allUsers.filter(user => user.userPlatform === 'ANDROID').length;
      const iosUsers = allUsers.filter(user => user.userPlatform === 'IOS').length;
      const webUsers = allUsers.filter(user => user.userPlatform !== 'ANDROID' && user.userPlatform !== 'IOS').length;
      setPlatformSummary({ Android: androidUsers, iOS: iosUsers, Web: webUsers });
      setTotalDrivers(driverCount);
      setTotalActiveUsers(activeUserCount);
      console.log(activeUserCount);
      console.log(activeusersinsu);

      setDriversWithoutCity(missingCityCount);
      setDriversByCarType({
        TREASX: driversByTREASX,
        TREASE: driversByTREASE,
        TREAST: driversByTREAST,
        TREASVan: driversByTREASVan,
      });
      setActiveByCarType({
        TREASX: activeTREASX,
        TREASE: activeTREASE,
        TREAST: activeTREAST,
        TREASVan: activeTREASVan,
        Otro: activeusersinsu,
      });
      const androidCustomers = allUsers.filter(user => user.userPlatform === 'ANDROID' && user.usertype === 'customer').length;
      const androidDrivers = allUsers.filter(user => user.userPlatform === 'ANDROID' && user.usertype === 'driver').length;
      const iosCustomers = allUsers.filter(user => user.userPlatform === 'IOS' && user.usertype === 'customer').length;
      const iosDrivers = allUsers.filter(user => user.userPlatform === 'IOS' && user.usertype === 'driver').length;
      const webCustomers = allUsers.filter(user => user.userPlatform !== 'ANDROID' && user.userPlatform !== 'IOS' && user.usertype === 'customer').length;
      const webDrivers = allUsers.filter(user => user.userPlatform !== 'ANDROID' && user.userPlatform !== 'IOS' && user.usertype === 'driver').length;

      setPlatformDetails({
        Android: { customers: androidCustomers, drivers: androidDrivers },
        iOS: { customers: iosCustomers, drivers: iosDrivers },
        Web: { customers: webCustomers, drivers: webDrivers },
      });

      // Generar resumen por ciudad
      const allDrivers = allUsers.filter(user => user.usertype === 'driver' && user.city);
      const cityCount = countCities(allDrivers);
      setCitySummary(formatCityDisplay(cityCount));

      // Filtrar todos los clientes
      const allCustomers = allUsers.filter(user => user.usertype === 'customer');
      setTotalCustomers(allCustomers.length);

      // Generar resumen de clientes por ciudad
      const customersWithCity = allCustomers.filter(user => user.city);
      const customerCityCount = countCities(customersWithCity);
      setCustomersByCity(formatCityDisplay(customerCityCount));

      // Contar clientes sin ciudad
      const missingCityCountCustomers = allCustomers.filter(user => !user.city).length;
      setCustomersWithoutCity(missingCityCountCustomers);
    }
  }, [allUsers]);

  const countCities = (drivers) => {
    const cityCount = {};
    drivers.forEach(driver => {
      const normalizedCity = normalizeCity(driver.city);
      if (normalizedCity) {
        cityCount[normalizedCity] = (cityCount[normalizedCity] || 0) + 1;
      }
    });
    return cityCount;
  };

  const formatCityDisplay = (cityCount) => {
    const displayMap = {
      "bogota": "Bogota",
      "medellin": "Medellin",
      "chia": "Chia",
      "zipaquira": "Zipaquira",
      "rionegro": "Rionegro",
      "cali": "Cali",
      "pereira": "Pereira",
      "bucaramanga": "Bucaramanga",
      "cucuta": "Cucuta",
      "villavicencio": "Villavicencio",
      "ibague": "Ibague",
      "funza": "Funza",
      "bello": "Bello",
      "floridablanca": "Floridablanca",
      "cartagena": "Cartagena",
      "barranquilla": "Barranquilla",
      "santa marta": "Santa Marta",
      "armenia": "Armenia",
      "sincelejo": "Sincelejo",
      "mosquera": "Mosquera"
    };

    const displayResult = [];
    for (let city in cityCount) {
      const formattedCity = displayMap[city] || city;
      displayResult.push(`${formattedCity}: ${cityCount[city]}`);
    }
    return displayResult;
  };

  const normalizeCity = (city) => {
    if (!city) return '';
    return city.trim().toLowerCase()
      .replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
      .replace('bogotá', 'bogota').replace(' ', ''); // Normalización específica para Bogota
  };
  const exportCSV = (users: any[], userType: string, cityFilter: string = '') => {
    let csvContent = '';
    let filename = '';

    if (userType === 'customers') {
      const headers = [
        'Fecha de creación', 'UID', 'Nombre', 'Apellido', 'Tipo de documento', 'N° Documento',
        'Número de móvil', 'Correo Electrónico', 'Ciudad', 'Plataforma'
      ];
      // Escapar y encerrar los encabezados entre comillas
      csvContent = headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n';

      users
        .filter(user => cityFilter === '' || normalizeCity(user.city) === normalizeCity(cityFilter))
        .forEach(user => {
          const row = [
            formatDate(user.createdAt), 
            user.id, 
            user.firstName, 
            user.lastName, 
            user.docType, 
            user.verifyId,
            user.mobile, 
            user.email, 
            user.city, 
            user.userPlatform
          ];
          // Escapar y encerrar cada campo entre comillas
          const escapedRow = row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
          csvContent += escapedRow + '\n';
        });
      filename = cityFilter ? `clientes_${cityFilter}.csv` : 'clientes.csv';
    } else if (userType === 'drivers') {
      // Implementar de manera similar para 'drivers'
      const headers = [
        'Fecha de creación', 'UID', 'Nombre', 'Apellido', 'Tipo de documento', 'N° Documento',
        'Número de móvil', 'Correo Electrónico', 'Billetera', 'Billetera de Kms', 'Ciudad', 'Placa',
        'Tipo de servicio', 'Cantidad de documentos', 'Id. de referido', 'Inscripción por recomendación',
        'Imagen de perfil', 'Gestión de Contácto', 'Bloqueado', 'Cuenta aprobada', 'Ocupado',
        'Estado del conductor', 'Licencia', 'Licencia Posterior', 'SOAT', 'Carta de Propiedad',
        'Carta de Propiedad posterior', 'Documento', 'Documento Posterior'
      ];
      csvContent = headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n';

      users
        .filter(user => cityFilter === '' || normalizeCity(user.city) === normalizeCity(cityFilter))
        .forEach(user => {
          const documentCount = [
            user.SOATImagev2, user.SOATImage, user.cardPropImage, user.cardPropImageBK, 
            user.cardPropImagev2, user.licenseImage, user.licenseImageBack, 
            user.verifyIdImage, user.verifyIdImageBk
          ].filter(field => field).length;

          const row = [
            formatDate(user.createdAt), 
            user.id, 
            user.firstName, 
            user.lastName, 
            user.docType, 
            user.verifyId,
            user.mobile, 
            user.email, 
            user.walletBalance, 
            user.kmWallet, 
            user.city, 
            user.vehicleNumber,
            user.carType, 
            documentCount, 
            user.referralId, 
            user.recommendationEnrollment,
            user.profile_image, 
            user.validContac, 
            user.blocked || false, 
            user.approved || false, 
            user.queue || false,
            user.driverActiveStatus, 
            user.licenseImage, 
            user.licenseImageBack, 
            user.SOATImage, 
            user.cardPropImage,
            user.cardPropImageBK, 
            user.verifyIdImage, 
            user.verifyIdImageBk
          ];
          const escapedRow = row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
          csvContent += escapedRow + '\n';
        });
      filename = cityFilter ? `conductores_${cityFilter}.csv` : 'conductores.csv';
    } else if (userType === 'companies') {
      // Implementar según sea necesario
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-md transition-all transform duration-300">
      <h2 className="text-xl font-bold mb-4 text-center">Reservaciones y Usuarios</h2>

      {/* Mostrar un indicador de carga mientras los datos se obtienen */}
      {loading || usersLoading ? (
        <div className="flex justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-red-950 text-3xl" />
          <span className="text-lg font-medium text-gray-700">Cargando datos...</span>
        </div>
      ) : (
        <ul className="space-y-4">
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleDownloadCSV('TREAS-X')}
          >
            <div className="flex items-center">
              <FaCarSide className="text-blue-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-blue-700">TREAS-X</p>
                <p className="text-gray-500 text-sm">Bookings: {salesData.TREASX}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-blue-700">{salesData.TREASX}</span>
          </li>

          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleDownloadCSV('TREAS-T')}
          >
            <div className="flex items-center">
              <FaCarSide className="text-green-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-green-700">TREAS-T</p>
                <p className="text-gray-500 text-sm">Bookings: {salesData.T}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-green-700">{salesData.T}</span>
          </li>
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleDownloadCSV('TREAS-Van')}
          >
            <div className="flex items-center">
              <FaCarSide className="text-yellow-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-yellow-700">TREAS-Van</p>
                <p className="text-gray-500 text-sm">Bookings: {salesData.Van}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-yellow-700">{salesData.Van}</span>
          </li>
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleDownloadCSV('TREAS-E')}
          >
            <div className="flex items-center">
              <FaCarSide className="text-purple-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-purple-700">TREAS-E</p>
                <p className="text-gray-500 text-sm">Bookings: {salesData.E}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-purple-700">{salesData.E}</span>
          </li>

          {/* Nueva tarjeta para el total de conductores */}
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowDriverDetails(!showDriverDetails)}
          >
            <div className="flex items-center">
              <FaUserTie className="text-indigo-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-indigo-700">Conductores</p>
                <p className="text-gray-500 text-sm">Total: {totalDrivers}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-indigo-700">{totalDrivers}</span>
          </li>

          {/* Mostrar detalles de conductores por tipo de carro y ciudades si la tarjeta fue clickeada */}
          {showDriverDetails && (
            <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
              <p className="font-bold text-gray-700">Conductores por Tipo de Vehículo y Ciudades:</p>
              <ul className="mt-2 space-y-4">
                {/* TREAS-X */}
                <li className="text-blue-700">
                  <strong>TREAS-X: {driversByCarType.TREASX.length}</strong>
                  <ul className="mt-2 space-y-2">
                    {driversByCarType.TREASX.length > 0 ? (
                      formatCityDisplay(countCities(driversByCarType.TREASX)).map((city, index) => (
                        <li key={index} className="text-gray-500 text-sm flex justify-between items-center">
                          {city}
                          <FaDownload
                            className="text-green-500 cursor-pointer"
                            onClick={() => {
                              const [formattedCity, count] = city.split(': ');
                              handleDownloadDriversCSV(formattedCity, 'TREAS-X');
                            }}
                            title={`Descargar Conductores TREAS-X en ${city.split(': ')[0]}`}
                          />
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No hay conductores TREAS-X disponibles.</li>
                    )}
                  </ul>
                </li>

                {/* TREAS-E */}
                <li className="text-green-700">
                  <strong>TREAS-E: {driversByCarType.TREASE.length}</strong>
                  <ul className="mt-2 space-y-2">
                    {driversByCarType.TREASE.length > 0 ? (
                      formatCityDisplay(countCities(driversByCarType.TREASE)).map((city, index) => (
                        <li key={index} className="text-gray-500 text-sm flex justify-between items-center">
                          {city}
                          <FaDownload
                            className="text-green-500 cursor-pointer"
                            onClick={() => {
                              const [formattedCity, count] = city.split(': ');
                              handleDownloadDriversCSV(formattedCity, 'TREAS-E');
                            }}
                            title={`Descargar Conductores TREAS-E en ${city.split(': ')[0]}`}
                          />
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No hay conductores TREAS-E disponibles.</li>
                    )}
                  </ul>
                </li>

                {/* TREAS-T */}
                <li className="text-yellow-700">
                  <strong>TREAS-T: {driversByCarType.TREAST.length}</strong>
                  <ul className="mt-2 space-y-2">
                    {driversByCarType.TREAST.length > 0 ? (
                      formatCityDisplay(countCities(driversByCarType.TREAST)).map((city, index) => (
                        <li key={index} className="text-gray-500 text-sm flex justify-between items-center">
                          {city}
                          <FaDownload
                            className="text-green-500 cursor-pointer"
                            onClick={() => {
                              const [formattedCity, count] = city.split(': ');
                              handleDownloadDriversCSV(formattedCity, 'TREAS-T');
                            }}
                            title={`Descargar Conductores TREAS-T en ${city.split(': ')[0]}`}
                          />
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No hay conductores TREAS-T disponibles.</li>
                    )}
                  </ul>
                </li>

                {/* TREAS-Van */}
                <li className="text-purple-700">
                  <strong>TREAS-Van: {driversByCarType.TREASVan.length}</strong>
                  <ul className="mt-2 space-y-2">
                    {driversByCarType.TREASVan.length > 0 ? (
                      formatCityDisplay(countCities(driversByCarType.TREASVan)).map((city, index) => (
                        <li key={index} className="text-gray-500 text-sm flex justify-between items-center">
                          {city}
                          <FaDownload
                            className="text-green-500 cursor-pointer"
                            onClick={() => {
                              const [formattedCity, count] = city.split(': ');
                              handleDownloadDriversCSV(formattedCity, 'TREAS-Van');
                            }}
                            title={`Descargar Conductores TREAS-Van en ${city.split(': ')[0]}`}
                          />
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 text-sm">No hay conductores TREAS-Van disponibles.</li>
                    )}
                  </ul>
                </li>
              </ul>

              {/* Resumen de Conductores por Ciudad */}
              <div className="bg-gray-200 p-4 mt-4 rounded-lg shadow-sm">
                <p className="font-bold text-gray-700">Resumen de Conductores por Ciudad:</p>
                <ul className="mt-2 space-y-2">
                  {citySummary.length > 0 ? (
                    citySummary.map((city, index) => (
                      <li key={index} className="text-gray-500 text-sm">{city}</li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">No hay conductores disponibles por ciudad.</li>
                  )}
                </ul>
              </div>
            </div>
          )}


          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowActiveDetails(!showActiveDetails)}
          >
            <div className="flex items-center">
              <FaUserCheck className="text-green-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-green-700">Usuarios Activos</p>
                <p className="text-gray-500 text-sm">Total: {totalActiveUsers}</p>
              </div> </div> <span className="font-bold text-lg text-green-700">{totalActiveUsers}</span> </li>


          {showActiveDetails && (
            <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
              <p className="font-bold text-gray-700">Conductores Activos por Tipo de Vehículo:</p>
              <ul className="mt-2 space-y-2">
                <li className="text-blue-700">
                  TREAS-X: {activeByCarType.TREASX}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.driverActiveStatus && user.carType === 'TREAS-X'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-green-700">
                  TREAS-E: {activeByCarType.TREASE}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.driverActiveStatus && user.carType === 'TREAS-E'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-yellow-700">
                  TREAS-T: {activeByCarType.TREAST}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.driverActiveStatus && user.carType === 'TREAS-T'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-purple-700">
                  TREAS-Van: {activeByCarType.TREASVan}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.driverActiveStatus && user.carType === 'TREAS-Van'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-red-700">
                  Cartype Declarado diferente: {activeByCarType.Otro}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.driverActiveStatus && !['TREAS-X', 'TREAS-E', 'TREAS-T', 'TREAS-Van'].includes(user.carType)), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Nueva tarjeta para conductores sin campo "city" */}
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => exportCSV(allUsers.filter(user => user.usertype === 'driver' && !user.city), 'drivers')}
          >
            <div className="flex items-center">
              <FaUserMinus className="text-red-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-red-700">Conductores sin ciudad</p>
                <p className="text-gray-500 text-sm">Total: {driversWithoutCity}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-red-700">{driversWithoutCity}</span>
          </li>
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowPlatformDetails(!showPlatformDetails)}
          >
            <div className="flex items-center">
              <FaUserCheck className="text-blue-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-blue-700">Usuarios por Plataforma</p>
                <p className="text-gray-500 text-sm">Android: {platformSummary.Android}</p>
                <p className="text-gray-500 text-sm">iOS: {platformSummary.iOS}</p>
                <p className="text-gray-500 text-sm">Web: {platformSummary.Web}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-blue-700">
              Android: {platformSummary.Android} / iOS: {platformSummary.iOS} / Web: {platformSummary.Web}
            </span>
          </li>
          {showPlatformDetails && (
            <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
              <p className="font-bold text-gray-700">Detalles de Usuarios por Plataforma:</p>
              <ul className="mt-2 space-y-2">
                <li className="text-blue-700">
                  Android - Clientes: {platformDetails.Android.customers}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.userPlatform === 'ANDROID' && user.usertype === 'customer'), 'customers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-blue-700">
                  Android - Conductores: {platformDetails.Android.drivers}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.userPlatform === 'ANDROID' && user.usertype === 'driver'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-green-700">
                  iOS - Clientes: {platformDetails.iOS.customers}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.userPlatform === 'IOS' && user.usertype === 'customer'), 'customers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-green-700">
                  iOS - Conductores: {platformDetails.iOS.drivers}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.userPlatform === 'IOS' && user.usertype === 'driver'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-purple-700">
                  Web - Clientes: {platformDetails.Web.customers}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.userPlatform !== 'ANDROID' && user.userPlatform !== 'IOS' && user.usertype === 'customer'), 'customers')}
                  >
                    Exportar
                  </button>
                </li>
                <li className="text-purple-700">
                  Web - Conductores: {platformDetails.Web.drivers}
                  <button
                    className="ml-2 text-red-500 underline"
                    onClick={() => exportCSV(allUsers.filter(user => user.userPlatform !== 'ANDROID' && user.userPlatform !== 'IOS' && user.usertype === 'driver'), 'drivers')}
                  >
                    Exportar
                  </button>
                </li>
              </ul>
            </div>
          )}

          {/* Nueva tarjeta para el total de clientes */}
          <li
            className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
          >
            <div className="flex items-center">
              <FaUserTie className="text-indigo-500 w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold text-indigo-700">Clientes</p>
                <p className="text-gray-500 text-sm">Total: {totalCustomers}</p>
              </div>
            </div>
            <span className="font-bold text-lg text-indigo-700">{totalCustomers}</span>
          </li>

          {/* Mostrar detalles de clientes por ciudad si la tarjeta fue clickeada */}
          {showCustomerDetails && (
            <div className="bg-gray-100 p-4 mt-4 rounded-lg shadow-sm">
              <p className="font-bold text-gray-700">Clientes por Ciudad:</p>
              <ul className="mt-2 space-y-4">
                {customersByCity.length > 0 ? (
                  customersByCity.map((city, index) => (
                    <li key={index} className="text-gray-500 text-sm flex justify-between items-center">
                      {city}
                      <FaDownload
                        className="text-green-500 cursor-pointer"
                        onClick={() => {
                          const [formattedCity, count] = city.split(': ');
                          exportCSV(
                            allUsers.filter(user => 
                              user.usertype === 'customer' && normalizeCity(user.city) === normalizeCity(formattedCity)
                            ), 
                            'customers', 
                            formattedCity
                          );
                        }}
                        title={`Descargar Clientes en ${city.split(': ')[0]}`}
                      />
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm">No hay clientes disponibles por ciudad.</li>
                )}
              </ul>

              {/* Nueva tarjeta para clientes sin campo "city" */}
              <div className="bg-gray-200 p-4 mt-4 rounded-lg shadow-sm">
                <p className="font-bold text-gray-700">Clientes sin ciudad:</p>
                <ul className="mt-2 space-y-2">
                  <li className="text-gray-500 text-sm flex justify-between items-center">
                    Sin ciudad: {customersWithoutCity}
                    <FaDownload
                      className="text-green-500 cursor-pointer"
                      onClick={() => exportCSV(
                        allUsers.filter(user => user.usertype === 'customer' && !user.city), 
                        'customers'
                      )}
                      title="Descargar Clientes sin ciudad"
                    />
                  </li>
                </ul>
              </div>
            </div>
          )}
        </ul>
      )}

    </div >
  );
};

export default TopSales;