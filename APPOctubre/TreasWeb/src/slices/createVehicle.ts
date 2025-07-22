import { getDatabase, ref, push, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AppDispatch } from '../store/store'; // Ajusta esta importación según tu estructura

interface VehicleData {
  vehicleMake: string;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleColor: string;
  vehicleFuel: string;
  vehiclePassengers: string;
  vehicleDoors: string;
  vehicleLine: string;
  vehicleCylinders: string;
  vehicleNoChasis: string;
  vehicleNoSerie: string;
  vehicleNoVin: string;
  vehicleNoMotor: string;
  vehicleMetalup: string;
  vehicleForm: string;
  carType: string;
  active: boolean;
  approved: boolean;
  car_image?: string;
}

export const createVehicle = (vehicleData: VehicleData, userId: string, imageFile: File | null) => async (dispatch: AppDispatch) => {
  const db = getDatabase();
  const carsRef = ref(db, 'cars');
  const newCarRef = push(carsRef); // Crear un nuevo ID de vehículo
  const vehicleId = newCarRef.key;

  try {
    let imageUrl = '';
    if (imageFile && vehicleId) {
      // Subir la imagen a Firebase Storage
      const imageRef = storageRef(getStorage(), `cars/${vehicleId}`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    const newVehicle = {
      ...vehicleData,
      car_image: imageUrl,
      driver: userId,
      id: vehicleId,
      createdAt: Date.now(),
    };

    // Guardar el nuevo vehículo en la base de datos
    await update(newCarRef, newVehicle);

    // Si el vehículo está activo, actualizar también los datos del usuario
    if (vehicleData.active) {
      const userRef = ref(db, `users/${userId}`);
      const updatedUserFields = {
        vehicleMake: vehicleData.vehicleMake || "",
        vehicleModel: vehicleData.vehicleModel || "",
        vehicleNumber: vehicleData.vehicleNumber || "",
        cartype: vehicleData.carType || "",
        car_image: imageUrl || "",
        vehicleColor: vehicleData.vehicleColor || "",
        vehicleCylinders: vehicleData.vehicleCylinders || "",
        vehicleDoors: vehicleData.vehicleDoors || "",
        vehicleForm: vehicleData.vehicleForm || "",
        vehicleFuel: vehicleData.vehicleFuel || "",
        vehicleLine: vehicleData.vehicleLine || "",
        vehicleMetalup: vehicleData.vehicleMetalup || "",
        vehicleNoChasis: vehicleData.vehicleNoChasis || "",
        vehicleNoMotor: vehicleData.vehicleNoMotor || "",
        vehicleNoSerie: vehicleData.vehicleNoSerie || "",
        vehicleNoVin: vehicleData.vehicleNoVin || "",
        vehiclePassengers: vehicleData.vehiclePassengers || "",
        carApproved: vehicleData.approved || false,
      };
      await update(userRef, updatedUserFields);
    }

    // Aquí puedes despachar una acción para actualizar el estado de los vehículos en tu aplicación si es necesario
    // dispatch({ type: 'ADD_VEHICLE', payload: newVehicle });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    // Manejo de errores: puedes despachar una acción de error aquí si usas Redux
  }
};
