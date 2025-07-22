import React, { useState } from 'react';
import SalesPerformance from '../components/SalesPerformance';
import TopSales from '../components/TopSales';
import LatestTransactions from '../components/LatestTransactions';
import IncomeBreakdown from '../components/IncomeBreakdown';
import PerformanceBookings from '../components/PerformanceBookings';
import BookingsFromPerformance from '../components/BookingsFromPerformance';

import { FaInfoCircle } from "react-icons/fa";
import DriverMap from '../components/DriverMap'; // Importar la nueva subpestaña
import Switch from "react-switch"; // Asegúrate de tener este componente disponible o utilizar uno que soporte React

const Dashboard: React.FC = () => {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState<'main' | 'sub'>('main');
  
  // Estados para controlar los switches de cada KPI
  const [isSalesPerformanceLoaded, setIsSalesPerformanceLoaded] = useState(false);
  const [isTopSalesLoaded, setIsTopSalesLoaded] = useState(false);
  const [isLatestTransactionsLoaded, setIsLatestTransactionsLoaded] = useState(false);
  const [isIncomeBreakdownLoaded, setIsIncomeBreakdownLoaded] = useState(false);
  const [isPerformanceBookingsLoaded, setIsPerformanceBookingsLoaded] = useState(false);
  const [isBookingsFromPerformanceLoaded, setIsBookingsFromPerformanceLoaded] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Header con nombre del Dashboard y pestañas */}
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaInfoCircle className="text-gray-600" />
          <h1 className="font-bold text-black">Tablero de Mando</h1>
        </div>
        
        {/* Navegación entre pestañas */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('main')}
            className={`py-2 px-4 rounded ${activeTab === 'main' ? 'bg-red_treas text-white ' : 'bg-gray-200 text-gray-700 hover:bg-red-950 hover:text-white'}`}
          >
            Tablero de Mandos
          </button>
          <button
            onClick={() => setActiveTab('sub')}
            className={`py-2 px-4 rounded ${activeTab === 'sub' ? 'bg-red_treas text-white ' : 'bg-gray-200 text-gray-700 hover:bg-red-950 hover:text-white'}`}
          >
            Mapa de Conductores
          </button>
        </div>
      </div>

      {/* Contenido basado en la pestaña activa */}
      {activeTab === 'main' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <Switch
                  onChange={setIsSalesPerformanceLoaded}
                  checked={isSalesPerformanceLoaded}
                  onColor="#ff0000"
                  offColor="#cccccc"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
                <span>Cargar Gráfica de Usuarios</span>
              </div>
              {isSalesPerformanceLoaded && <SalesPerformance />}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <Switch
                  onChange={setIsTopSalesLoaded}
                  checked={isTopSalesLoaded}
                  onColor="#ff0000"
                  offColor="#cccccc"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
                <span>Cargar Reservaciones y Usuarios</span>
              </div>
              {isTopSalesLoaded && <TopSales />}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <Switch
                  onChange={setIsIncomeBreakdownLoaded}
                  checked={isIncomeBreakdownLoaded}
                  onColor="#ff0000"
                  offColor="#cccccc"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
                <span>Cargar Reservas Completadas por Tipo de Vehículo</span>
              </div>
              {isIncomeBreakdownLoaded && <IncomeBreakdown />}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <Switch
                  onChange={setIsLatestTransactionsLoaded}
                  checked={isLatestTransactionsLoaded}
                  onColor="#ff0000"
                  offColor="#cccccc"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
                <span>Cargar Calculo de Ganancia TREAS</span>
              </div>
              {isLatestTransactionsLoaded && <LatestTransactions />}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <Switch
                  onChange={setIsPerformanceBookingsLoaded}
                  checked={isPerformanceBookingsLoaded}
                  onColor="#ff0000"
                  offColor="#cccccc"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
                <span>Cargar Reservas por período y método de pago</span>
              </div>
              {isPerformanceBookingsLoaded && <PerformanceBookings />}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center space-x-2">
                <Switch
                  onChange={setIsBookingsFromPerformanceLoaded}
                  checked={isBookingsFromPerformanceLoaded}
                  onColor="#ff0000"
                  offColor="#cccccc"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
                <span>Cargar Reservas desde Web y App</span>
              </div>
              {isBookingsFromPerformanceLoaded && <BookingsFromPerformance />}
            </div>
          </div>
        </>
      ) : (
        <DriverMap /> // Renderiza la nueva subpestaña
      )}
    </div>
  );
};

export default Dashboard;
