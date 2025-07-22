import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RootState } from '../store/store';
import redIcon from '../assets/3.png';  // Importa tu ícono local
import Loader from './Loader';

// Ícono por defecto en color rojo cuando no hay imagen del vehículo
const defaultRedIcon = new L.Icon({
  iconUrl: redIcon,  // Usa la imagen del ícono rojo local
  iconSize: [35, 45], // Tamaño del ícono más grande
  iconAnchor: [17, 45],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DriverMap: React.FC = () => {
  const { allUsers, loading: usersLoading, error: usersError } = useSelector((state: RootState) => state.users);
  const { carTypes, loading: carTypesLoading, error: carTypesError } = useSelector((state: RootState) => state.carTypes);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

  // Filtrar los conductores activos
  const activeDrivers = allUsers.filter(user => user.usertype === 'driver' && user.driverActiveStatus);

  // Filtrar los conductores por nombre, email o placa
  const filteredDrivers = activeDrivers.filter(driver => {
    const fullName = `${driver.firstName || ''} ${driver.lastName || ''}`.toLowerCase();
    const email = driver.email ? driver.email.toLowerCase() : '';
    const plate = driver.vehicleNumber ? driver.vehicleNumber.toLowerCase() : ''; // Asegurar que la placa exista

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      plate.includes(searchTerm.toLowerCase())
    );
  });

  // Obtener el car_image correspondiente según el carType
  const getCarIcon = (carType) => {
    const carTypeData = carTypes.find(type => type.name === carType);
    return carTypeData && carTypeData.image
      ? new L.Icon({
        iconUrl: carTypeData.image,
        iconSize: [40, 50], // Tamaño del ícono más grande
        iconAnchor: [20, 50],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      : defaultRedIcon; // Si no hay `car_image`, usar el ícono rojo
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* Buscador para filtrar los conductores */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-full"
        />
      </div>

      {usersLoading || carTypesLoading ? (

        <div className="flex justify-center items-center min-h-screen">
          <Loader />
        </div>


      ) : usersError || carTypesError ? (
        <p>Error al cargar los datos.</p>
      ) : (
        <MapContainer
          center={[4.7110, -74.0721]}  // Coordenadas iniciales (Bogotá)
          zoom={12}
          style={{ height: "85%", width: "100%" }}  // Asegurar que el mapa ocupe el espacio restante
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Mostrar los conductores filtrados en el mapa */}
          {filteredDrivers.map(driver => (
            driver.location && driver.location.lat && driver.location.lng && (
              <Marker
                key={driver.id}
                position={[driver.location.lat, driver.location.lng]}
                icon={getCarIcon(driver.carType)}  // Ícono personalizado basado en carType o ícono rojo por defecto
              >
                <Popup>
                  {/* Mejor presentación visual de la tarjeta */}
                  <div className="p-2">
                    {/* Mostrar imagen de perfil si existe */}
                    {driver.profile_image ? (
                      <img
                        src={driver.profile_image}
                        alt={`${driver.firstName} ${driver.lastName}`}
                        className="rounded-full w-24 h-24 mb-3 border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-24 h-24 mb-3 rounded-full bg-red-500 text-white flex items-center justify-center">
                        Sin Imagen
                      </div>
                    )}
                    <p className="font-bold text-lg">{`${driver.firstName || ''} ${driver.lastName || ''}`}</p>
                    <p className="text-gray-500">{driver.email || 'Email no disponible'}</p>
                    <p><strong>Placa:</strong> {driver.vehicleNumber || 'No disponible'}</p> {/* Mostrar la placa */}
                    <p><strong>Tipo:</strong> {driver.cartype || 'No disponible'}</p> {/* Mostrar la placa */}
                    <p><strong>Latitud:</strong> {driver.location.lat}</p>
                    <p><strong>Longitud:</strong> {driver.location.lng}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default DriverMap;
