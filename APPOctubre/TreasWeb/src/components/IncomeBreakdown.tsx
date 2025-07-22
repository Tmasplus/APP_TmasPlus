import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FaSpinner } from 'react-icons/fa';
import moment from 'moment';

const IncomeBreakdown: React.FC = () => {
  const [completeData, setCompleteData] = useState({
    TREASX: 0,
    T: 0,
    Van: 0,
    E: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1M'); // Añadido 'ALL' para mostrar todas

  useEffect(() => {
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');

    onValue(bookingsRef, (snapshot) => {
      const bookings = snapshot.val();
      let treasXCount = 0;
      let tCount = 0;
      let vanCount = 0;
      let eCount = 0;

      const now = moment();
      let startDate;

      // Filtrar por el rango de tiempo seleccionado
      if (timeRange !== 'ALL') {
        switch (timeRange) {
          case '1M':
            startDate = now.clone().subtract(1, 'months');
            break;
          case '6M':
            startDate = now.clone().subtract(6, 'months');
            break;
          case '1Y':
            startDate = now.clone().subtract(1, 'year');
            break;
          default:
            startDate = now.clone().subtract(1, 'months');
        }
      }

      // Filtrar reservas completadas según el rango de tiempo o mostrar todas si 'ALL' está seleccionado
      for (let uid in bookings) {
        const booking = bookings[uid];
        const bookingDate = moment(booking.bookingDate);

        if (booking.status === 'COMPLETE' && (timeRange === 'ALL' || bookingDate.isAfter(startDate))) {
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
      }

      // Actualizar los datos de reservas completadas por tipo de carro
      setCompleteData({
        TREASX: treasXCount,
        T: tCount,
        Van: vanCount,
        E: eCount,
      });
      setLoading(false);
    });
  }, [timeRange]);

  // Preparar los datos para el gráfico
  const pieData = {
    labels: ['TREAS-X', 'TREAS-T', 'TREAS-Van', 'TREAS-E'],
    datasets: [
      {
        data: [completeData.TREASX, completeData.T, completeData.Van, completeData.E],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8E44AD'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#8E44AD'],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Reservas Completadas por Tipo de Vehículo</h2>

      {/* Botones para seleccionar el rango de tiempo */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${timeRange === '1M' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('1M')}
        >
          Este Mes
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
        <button
          className={`py-2 px-4 rounded ${timeRange === 'ALL' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('ALL')}
        >
          Todas
        </button>
      </div>

      {/* Mostrar un indicador de carga mientras se obtienen los datos */}
      {loading ? (
        <div className="flex justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-red-950 text-3xl" />
          <span className="text-lg font-medium text-gray-700">Cargando datos...</span>
        </div>
      ) : (
        <Pie data={pieData} />
      )}
    </div>
  );
};

export default IncomeBreakdown;
