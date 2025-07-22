import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import moment from 'moment';
import { FaSpinner } from 'react-icons/fa';

const SalesPerformance: React.FC = () => {
  const { allUsers, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);

  // Estado para manejar el rango de tiempo seleccionado
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y'>('6M');

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

  // Filtrar usuarios creados según el rango de tiempo seleccionado
  const startDate = getStartDate();
  const filteredUsers = allUsers.filter((user) =>
    moment(user.createdAt).isAfter(startDate)
  );

  // Agrupar usuarios por mes o día, dependiendo del rango de tiempo
  const groupByPeriod = (users) => {
    const periodFormat = timeRange === '1M' ? 'DD MMM YYYY' : 'MMM YYYY';
    const periods = {};
    users.forEach((user) => {
      const period = moment(user.createdAt).format(periodFormat);
      if (!periods[period]) {
        periods[period] = 0;
      }
      periods[period] += 1;
    });
    return periods;
  };

  // Obtener los usuarios agrupados por tipo
  const drivers = filteredUsers.filter((user) => user.usertype === 'driver');
  const customers = filteredUsers.filter((user) => user.usertype === 'customer');
  const companies = filteredUsers.filter((user) => user.usertype === 'company');

  // Agrupar los usuarios por el período seleccionado
  const driverDataByPeriod = groupByPeriod(drivers);
  const customerDataByPeriod = groupByPeriod(customers);
  const companyDataByPeriod = groupByPeriod(companies);

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
        label: 'Conductores',
        data: generateChartData(driverDataByPeriod),
        fill: false,
        borderColor: '#FF5733', // Color naranja para drivers
      },
      {
        label: 'Clientes',
        data: generateChartData(customerDataByPeriod),
        fill: false,
        borderColor: '#4CAF50', // Color verde para customers
      },
      {
        label: 'Empresas',
        data: generateChartData(companyDataByPeriod),
        fill: false,
        borderColor: '#2196F3', // Color azul para companies
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
      <h2 className="text-xl font-bold mb-4">Gráfica de Usuarios</h2>

      {/* Botones para seleccionar el rango de tiempo */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded ${timeRange === '1M' ? 'bg-red_treas text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('1M')}
        >
          Último Mes
        </button>
        <button
          className={`py-2 px-4 rounded ${timeRange === '6M' ? 'bg-red_treas text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('6M')}
        >
          Últimos 6 Meses
        </button>
        <button
          className={`py-2 px-4 rounded ${timeRange === '1Y' ? 'bg-red_treas text-white' : 'bg-gray-200'}`}
          onClick={() => setTimeRange('1Y')}
        >
          Último Año
        </button>
      </div>

      {usersLoading ? (




        <div className="flex justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-red-950 text-3xl" />
          <span className="text-lg font-medium text-gray-700">Cargando datos...</span>
        </div>


      ) : usersError ? (
        <p>Error al cargar los usuarios.</p>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

export default SalesPerformance;
