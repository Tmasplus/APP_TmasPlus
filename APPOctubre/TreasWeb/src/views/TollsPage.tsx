import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getDatabase, ref, update } from 'firebase/database';
import Loader from '../components/Loader';

const TollsPage: React.FC = () => {
  const { tolls, loading: tollsLoading, error: tollsError } = useSelector((state: RootState) => state.tolls);
  const dispatch = useDispatch();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToll, setSelectedToll] = useState<any>(null);
  const [percentageIncrease, setPercentageIncrease] = useState<number>(0);

  const database = getDatabase(); // Inicializamos la base de datos

  useEffect(() => {
    if (!tollsLoading && tolls && tolls.length > 0 && mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([4.60971, -74.08175], 6); // Coordenadas de Colombia
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
    }
  }, [tolls, tollsLoading]);

  // Función para mostrar el peaje en el mapa
  const handleShowOnMap = (coordToll: string, nameToll: string, priceToll: number | string) => {
    if (mapInstanceRef.current && coordToll) {
      const [lat, lon] = coordToll.split(',').map(Number);

      // Si ya existe un marcador, lo eliminamos antes de agregar el nuevo
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Creamos un nuevo marcador y centramos el mapa en el peaje seleccionado
      const marker = L.marker([lat, lon], { icon: redIcon })  // Usar el ícono personalizado rojo
      .addTo(mapInstanceRef.current)
      .bindPopup(`<strong>${nameToll}</strong><br/>Precio: $${priceToll || 'N/A'}`)
      .openPopup();

      markerRef.current = marker;

      // Centrar el mapa en las coordenadas seleccionadas
      mapInstanceRef.current.setView([lat, lon], 13);
    }
  };

  // Función para actualizar todos los peajes
  const validatePriceToll = (price: any) => {
    const validPrice = parseFloat(price);
    return isNaN(validPrice) ? 0 : validPrice; // Si es NaN o indefinido, devolvemos 0 como valor predeterminado
  };
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]; // Formato de fecha YYYY-MM-DD
  };
  const isValidToll = (toll: any) => {
    return (
      toll.NameToll &&
      !isNaN(toll.PriceToll) &&
      toll.PriceToll !== null &&
      toll.PriceToll !== undefined &&
      !isNaN(parseFloat(toll.PriceToll))
    );
  };

  // Función para sanitizar las claves


  // Función para actualizar todos los peajes
  // Function to sanitize keys
  // Function to sanitize keys (if needed for future purposes, but not used here directly)
  const sanitizeKey = (key: string): string => {
    return key.replace(/[.#$/\[\]]/g, '_'); // Replace invalid characters with an underscore or any other character
  };

  // Updated function to update all tolls by their unique IDs
  const handleUpdateAll = () => {
    const updatedTolls = tolls.map((toll) => {
      // Update only the necessary fields without removing or altering others
      const updatedToll = {
        ...toll, // Preserve all existing fields
        UpdateDate: getCurrentDate(), // Update the date
      };

      // Update the PriceToll field if valid
      if (!isNaN(toll.PriceToll) && toll.PriceToll !== null && toll.PriceToll !== undefined) {
        updatedToll.PriceToll = Math.round(toll.PriceToll * (1 + percentageIncrease / 100));
      }

      return updatedToll;
    });

    console.log('Datos a actualizar en Firebase (Todos):', updatedTolls);

    const updates: any = {};
    updatedTolls.forEach((toll) => {
      if (isValidToll(toll) && toll.id) {  // Assuming each toll has a unique 'id' field
        // Correctly reference the updated toll object
        updates[`/tolls/${toll.id}`] = {
          ...toll,  // Preserve all fields including the updated ones
          PriceToll: toll.PriceToll,
          UpdateDate: toll.UpdateDate
        };
      }
    });

    update(ref(database), updates)
      .then(() => {
        console.log('Todos los peajes actualizados correctamente en la BD');
        dispatch({ type: 'UPDATE_TOLLS', payload: updatedTolls });
        setModalOpen(false);
      })
      .catch((error) => {
        console.error('Error actualizando los peajes en la BD:', error);
      });
  };


  // Función para buscar un peaje específico
  const handleSearchToll = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const foundToll = tolls.find(toll => toll.NameToll.toLowerCase().includes(event.target.value.toLowerCase()));
    setSelectedToll(foundToll || null);
  };

  // Función para actualizar un peaje específico
  const handleUpdateToll = () => {
    if (selectedToll && selectedToll.id) {  // Ensure the toll has a unique identifier like 'id'
      const updatedToll = {
        ...selectedToll,
        UpdateDate: new Date().toISOString().split('T')[0],  // Add or update the 'UpdateDate' field
      };

      console.log('Datos a actualizar en Firebase (Peaje Específico):', updatedToll);

      // Use the 'id' field to reference the specific toll in the database
      const tollRef = ref(database, `/tolls/${selectedToll.id}`);  // Use 'id' instead of 'NameToll'

      update(tollRef, updatedToll)
        .then(() => {
          console.log('Peaje actualizado correctamente en la BD');
          // Update the local state with the modified toll
          const updatedTolls = tolls.map(toll => toll.id === selectedToll.id ? updatedToll : toll);
          dispatch({ type: 'UPDATE_TOLLS', payload: updatedTolls });
          setSelectedToll(null);
          setModalOpen(false);
        })
        .catch(error => {
          console.error('Error actualizando el peaje en la BD:', error);
        });
    }
  };
  const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',  // URL pública del ícono rojo
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',  // Sombra
    shadowSize: [41, 41],
  });
  

 
  if (tollsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (tollsError) {
    return <p>Error: {tollsError}</p>;
  }

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedToll(null);
    setPercentageIncrease(0);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="sticky top-0 bg-gray-50 z-10 p-4 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-red-600">Peajes de Colombia</h1>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            onClick={() => setModalOpen(true)}
          >
            Actualizar
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabla de Peajes */}
        <div className="bg-white shadow-lg rounded-lg lg:w-1/2 overflow-hidden max-h-[80vh] overflow-y-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="text-left py-2 px-4 font-semibold text-sm">Nombre del Peaje</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Precio</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Fecha de Actualización</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Ver en el Mapa</th>
              </tr>
            </thead>
            <tbody>
              {tolls.map((toll, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4 text-sm">{toll.NameToll}</td>
                  <td className="py-2 px-4 text-sm">{toll.PriceToll ? `$${toll.PriceToll}` : 'N/A'}</td>
                  <td className="py-2 px-4 text-sm">{toll.UpdateDate}</td>
                  <td className="py-2 px-4 text-sm">
                    {toll.CoordToll ? (
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                        onClick={() => handleShowOnMap(toll.CoordToll, toll.NameToll, toll.PriceToll)}
                      >
                        Ver en el mapa
                      </button>
                    ) : (
                      'No disponible'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mapa Estático */}
        <div className="bg-white shadow-lg rounded-lg lg:w-1/2 lg:sticky lg:top-0">
          <div ref={mapRef} id="map" className="h-96 w-full lg:h-[80vh]"></div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Actualizar Peajes</h2>

            {/* Actualizar Todos */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Porcentaje de Aumento:</label>
              <input
                type="number"
                value={percentageIncrease}
                onChange={e => setPercentageIncrease(parseFloat(e.target.value))}
                className="border rounded-lg w-full py-2 px-3"
              />
              <button
                className="border-2 border-red_treas bg-white text-red_treas px-4 py-2 mt-2 rounded-lg hover:bg-red_treas hover:text-white hover:border-red-700 w-full"
                onClick={handleUpdateAll}
              >
                Actualizar Todos
              </button>
            </div>

            {/* Buscar y Actualizar un Peaje */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Buscar Peaje:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchToll}
                className="border rounded-lg w-full py-2 px-3"
              />
            </div>

            {selectedToll && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nombre del Peaje:</label>
                <input
                  type="text"
                  value={selectedToll.NameToll}
                  onChange={e => setSelectedToll({ ...selectedToll, NameToll: e.target.value })}
                  className="border rounded-lg w-full py-2 px-3 mb-2"
                />
                <label className="block text-sm font-medium mb-2">Precio del Peaje:</label>
                <input
                  type="number"
                  value={selectedToll.PriceToll}
                  onChange={e => setSelectedToll({ ...selectedToll, PriceToll: parseFloat(e.target.value) })}
                  className="border rounded-lg w-full py-2 px-3 mb-2"
                />
                <label className="block text-sm font-medium mb-2">Coordenadas del Peaje:</label>
                <input
                  type="text"
                  value={selectedToll.CoordToll}
                  onChange={e => setSelectedToll({ ...selectedToll, CoordToll: e.target.value })}
                  className="border rounded-lg w-full py-2 px-3 mb-2"
                />
                <button
                  className="bg-red-900 text-white px-4 py-2 mt-2 rounded-lg hover:bg-red_treas w-full"
                  onClick={handleUpdateToll}
                >
                  Actualizar Peaje
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                onClick={handleCloseModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TollsPage;
