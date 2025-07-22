import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getDatabase, ref, onValue } from 'firebase/database';
import moment from 'moment';
import { FaSpinner } from 'react-icons/fa';

const PerformanceBookings: React.FC = () => {
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

  // Agrupar reservas por método de pago y período
  const groupByPaymentModeAndPeriod = (bookings, paymentMode = null) => {
    const periodFormat = timeRange === '1M' ? 'DD MMM YYYY' : 'MMM YYYY';
    const periods = {};
    bookings.forEach((booking) => {
      if (!paymentMode || booking.payment_mode === paymentMode) {
        const period = moment(booking.bookingDate).format(periodFormat);
        if (!periods[period]) {
          periods[period] = 0;
        }
        periods[period] += 1;
      }
    });
    return periods;
  };

  // Obtener las reservas agrupadas para todas y cada método de pago
  const bookingsByAll = groupByPaymentModeAndPeriod(filteredBookings); // Todas las reservas
  const bookingsByCorp = groupByPaymentModeAndPeriod(filteredBookings, 'corp');
  const bookingsByCash = groupByPaymentModeAndPeriod(filteredBookings, 'cash');
  const bookingsByWallet = groupByPaymentModeAndPeriod(filteredBookings, 'Wallet');
  const bookingsByDaviplata = groupByPaymentModeAndPeriod(filteredBookings, 'Daviplata');

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
        label: 'Servicios Pago Empresarial',
        data: generateChartData(bookingsByCorp),
        fill: false,
        borderColor: '#FF5733', // Color para los servicios por Corp
      },
      {
        label: 'Servicios en Efectivo',
        data: generateChartData(bookingsByCash),
        fill: false,
        borderColor: '#4CAF50', // Color para los servicios por Cash
      },
      {
        label: 'Servicios por Billetera',
        data: generateChartData(bookingsByWallet),
        fill: false,
        borderColor: '#2196F3', // Color para los servicios por Wallet
      },
      {
        label: 'Servicios por Daviplata',
        data: generateChartData(bookingsByDaviplata),
        fill: false,
        borderColor: '#FFC107', // Color para los servicios por Daviplata
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
      <h2 className="text-xl font-bold mb-4">Reservas por período y método de pago</h2>

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

export default PerformanceBookings;