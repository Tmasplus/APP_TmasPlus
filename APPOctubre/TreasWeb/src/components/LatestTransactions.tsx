import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FaSpinner } from 'react-icons/fa';
import moment from 'moment'; // Usamos moment para manejar fechas

const LatestTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [visibleTransactions, setVisibleTransactions] = useState(5); // Mostrar 10 transacciones al inicio
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [lastSixMonthsProfit, setLastSixMonthsProfit] = useState<number>(0);
  const [thisMonthProfit, setThisMonthProfit] = useState<number>(0);
  const [lastYearProfit, setLastYearProfit] = useState<number>(0);
  const [lastMonthProfit, setLastMonthProfit] = useState<number>(0); // Nuevo estado para el mes pasado

  useEffect(() => {
    // Conectar con Firebase Realtime Database
    const db = getDatabase();
    const bookingsRef = ref(db, 'bookings');

    onValue(bookingsRef, (snapshot) => {
      const bookings = snapshot.val();
      let filteredTransactions = [];
      let total = 0;
      let lastSixMonthsTotal = 0;
      let thisMonthTotal = 0;
      let lastYearTotal = 0;
      let lastMonthTotal = 0; // Total del mes pasado

      const sixMonthsAgo = moment().subtract(6, 'months');
      const startOfMonth = moment().startOf('month');
      const oneYearAgo = moment().subtract(1, 'year');
      const startOfLastMonth = moment().subtract(1, 'months').startOf('month');
      const endOfLastMonth = moment().subtract(1, 'months').endOf('month');

      // Filtrar las reservas que tienen `status: "COMPLETE"` y `payment_mode === "corp"`
      for (let uid in bookings) {
        const booking = bookings[uid];
        if (booking.status === 'COMPLETE' && booking.payment_mode === 'corp') {
          const costCorp = Number(booking.ProfitsTreas) || 0;

          // Si la fecha está en formato timestamp, convertirla a fecha válida
          const bookingDate = moment(booking.bookingDate, 'x').isValid()
            ? moment(booking.bookingDate, 'x') // Convertir timestamp a fecha válida con 'x' en moment
            : null;

          if (bookingDate) {
            filteredTransactions.push({
              id: uid,
              date: bookingDate.toISOString(),
              email: booking.company,
              cost_corp: costCorp,
            });

            total += costCorp;

            // Ganancias para los últimos 6 meses
            if (bookingDate.isAfter(sixMonthsAgo)) {
              lastSixMonthsTotal += costCorp;
            }

            // Ganancias para este mes
            if (bookingDate.isAfter(startOfMonth)) {
              thisMonthTotal += costCorp;
            }

            // Ganancias para el último año
            if (bookingDate.isAfter(oneYearAgo)) {
              lastYearTotal += costCorp;
            }

            // Ganancias del mes pasado
            if (bookingDate.isBetween(startOfLastMonth, endOfLastMonth, 'day', '[]')) {
              lastMonthTotal += costCorp;
            }
          }
        }
      }

      // Ordenar las transacciones de la más reciente a la más antigua
      filteredTransactions.sort((a, b) => moment(b.date).diff(moment(a.date)));

      // Actualizar los datos de transacciones filtradas y el total de `cost_corp`
      setTransactions(filteredTransactions);
      setTotalCost(total || 0);
      setLastSixMonthsProfit(lastSixMonthsTotal || 0);
      setThisMonthProfit(thisMonthTotal || 0);
      setLastYearProfit(lastYearTotal || 0);
      setLastMonthProfit(lastMonthTotal || 0); // Actualizar el total del mes pasado
      setLoading(false); // Desactivar el indicador de carga
    });
  }, []);

  // Función para mostrar más transacciones al hacer clic en "Ver más"
  const handleShowMore = () => {
    setVisibleTransactions((prevVisible) => prevVisible + 5); // Aumentar el número de transacciones visibles
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Calculo de Ganancia TREAS</h2>

      {/* Mostrar un indicador de carga mientras se obtienen los datos */}
      {loading ? (
        <div className="flex justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-red-950 text-3xl" />
          <span className="text-lg font-medium text-gray-700">Cargando datos...</span>
        </div>
      ) : (
        <div>
          {/* Mostrar la suma total de `cost_corp` */}
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-bold">Ganancia TREAS Total</h3>
            <p className="text-2xl font-semibold text-red_treas">${Number(totalCost).toFixed(2)}</p>
          </div>

          {/* Mostrar las ganancias por periodo */}
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-bold">Ganancia Últimos 6 Meses</h3>
            <p className="text-2xl font-semibold text-red_treas">${Number(lastSixMonthsProfit).toFixed(2)}</p>
          </div>

          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-bold">Ganancia Este Mes</h3>
            <p className="text-2xl font-semibold text-red_treas">${Number(thisMonthProfit).toFixed(2)}</p>
          </div>

          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-bold">Ganancia Último Año</h3>
            <p className="text-2xl font-semibold text-red_treas">${Number(lastYearProfit).toFixed(2)}</p>
          </div>

          {/* Mostrar la ganancia del mes pasado */}
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-bold">Ganancia Mes Pasado</h3>
            <p className="text-2xl font-semibold text-red_treas">${Number(lastMonthProfit).toFixed(2)}</p>
          </div>

          {/* Mostrar las transacciones filtradas con paginación */}
          <ul>
            {transactions.slice(0, visibleTransactions).map(transaction => (
              <li key={transaction.id} className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="bg-red-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">C</div>
                  <div>
                    <p className="font-semibold">{moment(transaction.date).format('MMM DD, YYYY')}</p> {/* Convertimos a formato legible */}
                    <p className="text-gray-500 text-sm">{transaction.email}</p>
                  </div>
                </div>
                <div>
                  <p className="font-bold">${Number(transaction.cost_corp).toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Mostrar el botón "Ver más" si hay más transacciones para mostrar */}
          {visibleTransactions < transactions.length && (
            <div className="text-center">
              <button
                onClick={handleShowMore}
                className="bg-red-700 text-white py-2 px-4 rounded-lg mt-4 hover:bg-red-900 transition duration-300"
              >
                Ver más
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LatestTransactions;
