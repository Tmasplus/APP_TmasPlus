import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';  // Importa el icono de basura
import { getDatabase, ref, remove } from 'firebase/database';
import EditVehicleModal from './EditVehicleModal';

const VehicleCard: React.FC<{ vehicle: any, userId: string, onUpdateUser: (updatedUser: any) => void }> = ({ vehicle, userId, onUpdateUser }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState(vehicle);

  const handleSave = (updatedVehicle: any, updatedUser: any) => {
    setVehicleData(updatedVehicle);
    onUpdateUser(updatedUser);
  };

  const handleDelete = async () => {
    const db = getDatabase();
    const vehicleRef = ref(db, `cars/${vehicle.id}`);

    try {
      await remove(vehicleRef);
      console.log('Vehículo eliminado exitosamente');
      // Aquí podrías actualizar la UI para reflejar que el vehículo fue eliminado, por ejemplo, removiéndolo del estado local o notificando al usuario.
    } catch (error) {
      console.error('Error al eliminar el vehículo:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-md flex justify-between">
      <div className="flex">
        <img src={vehicleData.car_image} alt={vehicleData.vehicleMake} className="w-32 h-20 object-cover mr-4" />
        <div>
          <h3 className="text-xl font-bold">{vehicleData.vehicleMake} {vehicleData.vehicleModel}</h3>
          <h3 className="text-xl text-red_treas">{vehicleData.id}</h3>
          <p className="text-gray-600">{vehicleData.carType}</p>
          <p className="text-gray-600">Pasajeros: {vehicleData.vehiclePassengers}</p>
          <p className="text-gray-600">Placa del Vehiculo: {vehicleData.vehicleNumber}</p>
          <p className="text-gray-600">Fecha de Creacion del Vehiculo: {new Date(vehicleData.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="bg-red_treas hover:bg-red-300 text-white px-4 py-2 rounded-2xl mt-2"
        >
          Editar vehiculo
        </button>
        <div className="flex justify-center w-full mt-2">
          <p className={`text-lg font-semibold ${vehicleData.active ? 'text-red-500' : 'text-gray-500'}`}>
            {vehicleData.active ? 'Activo' : 'Inactivo'}
          </p>
        </div>
        <div className="flex justify-center w-full mt-2">
          <p className={`text-lg font-semibold ${vehicleData.approved ? 'text-red-500' : 'text-gray-500'}`}>
            {vehicleData.approved ? 'Aprobado' : 'No Aprobado'}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 mt-4"
        >
          <FaTrash size={24} /> {/* Ícono de basura */}
        </button>
      </div>
      {isEditModalOpen && (
        <EditVehicleModal
          vehicle={vehicleData}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
          userId={userId}
        />
      )}
    </div>
  );
};

export default VehicleCard;
