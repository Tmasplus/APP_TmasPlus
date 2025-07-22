import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getDatabase, ref, onValue } from 'firebase/database';
import moment from 'moment';
import { FaSpinner } from 'react-icons/fa';

const BookingsFromPerformance: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y'>('6M'); // Estado para manejar el rango de tiempo

  // Conectar con Firebase y obtener las reservas
  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');

    onValue(bookingsRef, (snapshot) => {
      const bookingsData = snapshot.val();
      const bookingList = [];
      for (let id in bookingsData) {
        bookingList.push(bookingsData[id]);
      }
      setBookings(bookingList);
      setLoading(false);
    });
  }, []);

  // Obtener la fecha actual y ajustar según el rango de tiempo seleccionado
  const getStartDate = () => {
    switch (timeRange) {
      case '1M':
        return moment().subtract(1, 'months');
      case '1Y':
        return moment().subtract(1, 'years');
      default:
        return moment().subtract(6, 'months');
    }
  };

  // Filtrar reservas según el rango de tiempo seleccionado
  const startDate = getStartDate();
  const filteredBookings = bookings.filter((booking) =>
    moment(booking.bookingDate).isAfter(startDate)
  );

  // Agrupar reservas por origen (web o app) y período
  const groupByBookingSourceAndPeriod = (bookings, fromWeb = null) => {
    const periodFormat = timeRange === '1M' ? 'DD MMM YYYY' : 'MMM YYYY';
    const periods = {};
    bookings.forEach((booking) => {
      if (fromWeb === null || booking.booking_from_web === fromWeb) {
        const period = moment(booking.bookingDate).format(periodFormat);
        if (!periods[period]) {
          periods[period] = 0;
        }
        periods[period] += 1;
      }
    });
    return periods;
  };

  // Obtener las reservas agrupadas para todas y cada origen
  const bookingsByAll = groupByBookingSourceAndPeriod(filteredBookings); // Todas las reservas
  const bookingsByWeb = groupByBookingSourceAndPeriod(filteredBookings, true);
  const bookingsByApp = groupByBookingSourceAndPeriod(filteredBookings, false);

  // Crear un array de etiquetas basadas en el rango de tiempo
  const labels = timeRange === '1M'
    ? Array.from({ length: 30 }, (_, i) => moment().subtract(29 - i, 'days').format('DD MMM YYYY'))
    : Array.from({ length: timeRange === '1Y' ? 12 : 6 }, (_, i) => moment().subtract(timeRange === '1Y' ? 11 - i : 5 - i, 'months').format('MMM YYYY'));

  // Generar los datasets para el gráfico
  const generateChartData = (dataByPeriod) => {
    return labels.map((label) => dataByPeriod[label] || 0);
  };

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Todas las Reservas',
        data: generateChartData(bookingsByAll),
        fill: false,
        borderColor: '#000000', // Color para todas las reservas (negro)
      },
      {
        label: 'Reservas desde Web',
        data: generateChartData(bookingsByWeb),
        fill: false,
        borderColor: '#0036FF', // Color para las reservas desde Web
      },
      {
        label: 'Reservas desde App',
        data: generateChartData(bookingsByApp),
        fill: false,
        borderColor: '#FF0000', // Color para las reservas desde App
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          maxTicksLimit: 10,
        },
        suggestedMax: Math.max(...data.datasets.flatMap(dataset => dataset.data)) + 1,
        suggestedMin: 0,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Reservas desde Web y App</h2>

      {/* Botones para seleccionar el rango de tiempo */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${timeRange === '1M' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('1M')}
        >
          Último Mes
        </button>
        <button
          className={`py-2 px-4 rounded ${timeRange === '6M' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('6M')}
        >
          Últimos 6 Meses
        </button>
        <button
          className={`py-2 px-4 rounded ${timeRange === '1Y' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('1Y')}
        >
          Último Año
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-red-500 text-3xl" />
          <span className="text-lg font-medium text-gray-700">Cargando datos...</span>
        </div>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

export default BookingsFromPerformance;