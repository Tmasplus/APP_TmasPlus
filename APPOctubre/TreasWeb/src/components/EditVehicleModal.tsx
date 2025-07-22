import React, { useState, useEffect } from 'react';
import Switch from 'react-switch';
import { getDatabase, ref, update, query, orderByChild, equalTo, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface EditVehicleModalProps {
  vehicle: any;
  onClose: () => void;
  onSave: (updatedVehicle: any, updatedUser: any) => void;
  userId: string;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicle, onClose, onSave, userId }) => {
  const [formData, setFormData] = useState(vehicle);
  const [isModified, setIsModified] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [imagePreview, setImagePreview] = useState(vehicle.car_image || ''); // Previsualización de la imagen
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  console.log(vehicle.id);

  // Opciones para los selects
  const vehicleTypes = ['Automovil', 'Camioneta', 'VAN', 'Microbus', 'Campero'];
  const serviceTypes = ['TREAS-T', 'TREAS-Van', 'TREAS-X', 'TREAS-E'];
  const bodyworkTypes = ['VAN', '4x4', 'Cerrada', 'COUPÉ', 'Doble Cabina', 'Hatch Back', 'MiniVan', 'CROSSOVER', 'Sedán', 'Station Wagon',];
  const marcasDeVehiculos = [
    { label: 'Brilliance', value: 'Brilliance' },
    { label: 'Byd', value: 'Byd' },
    { label: 'Chana', value: 'Chana' },
    { label: 'Changan', value: 'Changan' },
    { label: 'Chery', value: 'Chery' },
    { label: 'Chery Tiggo', value: 'Chery Tiggo' },
    { label: 'Chevrolet', value: 'Chevrolet' },
    { label: 'Chevrolet Aveo', value: 'Chevrolet Aveo' },
    { label: 'Chevrolet Beat', value: 'Chevrolet Beat' },
    { label: 'Chevrolet Camaro', value: 'Chevrolet Camaro' },
    { label: 'Chevrolet Captiva', value: 'Chevrolet Captiva' },
    { label: 'Chevrolet Corsa', value: 'Chevrolet Corsa' },
    { label: 'Chevrolet Cruze', value: 'Chevrolet Cruze' },
    { label: 'Chevrolet Optra', value: 'Chevrolet Optra' },
    { label: 'Chevrolet Sail', value: 'Chevrolet Sail' },
    { label: 'Chevrolet Sonic', value: 'Chevrolet Sonic' },
    { label: 'Chevrolet Spark', value: 'Chevrolet Spark' },
    { label: 'Chevrolet Swift', value: 'Chevrolet Swift' },
    { label: 'Chevrolet Tracker', value: 'Chevrolet Tracker' },
    { label: 'Citroen', value: 'Citroen' },
    { label: 'Dfsk', value: 'Dfsk' },
    { label: 'Dodge', value: 'Dodge' },
    { label: 'BYD ELÉCTRICO', value: 'BYD ELÉCTRICO' },
    { label: 'FAW', value: 'FAW' },
    { label: 'Fiat', value: 'Fiat' },
    { label: 'Ford', value: 'Ford' },
    { label: 'Ford Ecosport', value: 'Ford Ecosport' },
    { label: 'Ford Fiesta', value: 'Ford Fiesta' },
    { label: 'Fotton', value: 'Fotton' },
    { label: 'Geely', value: 'Geely' },
    { label: 'Great', value: 'Great' },
    { label: 'Honda', value: 'Honda' },
    { label: 'Honda Civic', value: 'Honda Civic' },
    { label: 'Hyundai', value: 'Hyundai' },
    { label: 'Hyundai Accent', value: 'Hyundai Accent' },
    { label: 'Hyundai I10', value: 'Hyundai I10' },
    { label: 'Hyundai I25', value: 'Hyundai I25' },
    { label: 'Hyundai Tucson', value: 'Hyundai Tucson' },
    { label: 'Jac', value: 'Jac' },
    { label: 'Jac S2', value: 'Jac S2' },
    { label: 'Kia', value: 'Kia' },
    { label: 'Kia ', value: 'Kia ' },
    { label: 'Kia Carens', value: 'Kia Carens' },
    { label: 'Kia Cerato', value: 'Kia Cerato' },
    { label: 'Kia Picanto', value: 'Kia Picanto' },
    { label: 'Kia Rio', value: 'Kia Rio' },
    { label: 'Kia Soul', value: 'Kia Soul' },
    { label: 'Kia Sportage', value: 'Kia Sportage' },
    { label: 'Lifan', value: 'Lifan' },
    { label: 'Mahindra', value: 'Mahindra' },
    { label: 'Mazda', value: 'Mazda' },
    { label: 'Mazda 2', value: 'Mazda 2' },
    { label: 'Mazda 3', value: 'Mazda 3' },
    { label: 'Mazda 6', value: 'Mazda 6' },
    { label: 'Mazda Bt 50', value: 'Mazda Bt 50' },
    { label: 'Mg', value: 'Mg' },
    { label: 'Nissan', value: 'Nissan' },
    { label: 'Nissan ', value: 'Nissan ' },
    { label: 'Nissan March', value: 'Nissan March' },
    { label: 'Nissan Sentra', value: 'Nissan Sentra' },
    { label: 'Nissan Tiida', value: 'Nissan Tiida' },
    { label: 'Nissan Versa', value: 'Nissan Versa' },
    { label: 'Nissan X Trail', value: 'Nissan X Trail' },
    { label: 'Peugeot', value: 'Peugeot' },
    { label: 'Renault', value: 'Renault' },
    { label: 'Renault Clio', value: 'Renault Clio' },
    { label: 'Renault Duster', value: 'Renault Duster' },
    { label: 'Renault Koleos', value: 'Renault Koleos' },
    { label: 'Renault Kwid', value: 'Renault Kwid' },
    { label: 'Renault Logan', value: 'Renault Logan' },
    { label: 'Renault Sandero', value: 'Renault Sandero' },
    { label: 'Renault Stepway', value: 'Renault Stepway' },
    { label: 'Renault Symbol', value: 'Renault Symbol' },
    { label: 'Saic Wuling', value: 'Saic Wuling' },
    { label: 'Sail', value: 'Sail' },
    { label: 'Seat', value: 'Seat' },
    { label: 'Skoda', value: 'Skoda' },
    { label: 'Spark', value: 'Spark' },
    { label: 'Ssang Yong', value: 'Ssang Yong' },
    { label: 'Suzuki', value: 'Suzuki' },
    { label: 'Suzuki Jimny', value: 'Suzuki Jimny' },
    { label: 'Suzuki Swift', value: 'Suzuki Swift' },
    { label: 'Suzuky', value: 'Suzuky' },
    { label: 'Toyota', value: 'Toyota' },
    { label: 'Toyota Corolla', value: 'Toyota Corolla' },
    { label: 'Volkswagen', value: 'Volkswagen' },
    { label: 'Volkswagen Gol', value: 'Volkswagen Gol' },
    { label: 'Volkswagen Voyage', value: 'Volkswagen Voyage' },
    { label: 'Zotye', value: 'Zotye' },
    { label: 'Otra', value: 'Otra' },
  ];
  const CilindrajesDeVehiculos = [
    { label: 'Tipo de Cilindraje', value: '' },
    { label: 'Menos de 1.0L', value: 'Menos de 1.0L' },
    { label: '1.0L - 1.4L', value: '1.0L - 1.4L' },
    { label: '1.5L - 1.9L', value: '1.5L - 1.9L' },
    { label: '2.0L - 2.4L', value: '2.0L - 2.4L' },
    { label: '2.5L - 2.9L', value: '2.5L - 2.9L' },
    { label: '3.0L - 3.4L', value: '3.0L - 3.4L' },
    { label: '3.5L - 3.9L', value: '3.5L - 3.9L' },
    { label: '4.0L - 4.4L', value: '4.0L - 4.4L' },
    { label: '4.5L - 4.9L', value: '4.5L - 4.9L' },
    { label: 'Más de 5.0L', value: 'Más de 5.0L' },
  ];
  const TipoCombustible = [
    { label: 'Tipo de Combustible', value: '' },
    { label: 'GASOLINA', value: 'Gasolina' },
    { label: 'DIESEL', value: 'Diesel' },
    { label: 'Electrico', value: 'ELECTRICO' },
    { label: 'GAS', value: 'Gas' },
    { label: 'Gas/Gasol', value: 'GasolGas' },
    { label: 'Gasol/Elect', value: 'GasolElect' },
]
const ModelosDeVehiculos = [
  { label: 'Modelo del Vehículo', value: '' },
  { label: '2006', value: '2006' },
  { label: '2007', value: '2007' },
  { label: '2008', value: '2008' },
  { label: '2009', value: '2009' },
  { label: '2010', value: '2010' },
  { label: '2011', value: '2011' },
  { label: '2012', value: '2012' },
  { label: '2013', value: '2013' },
  { label: '2014', value: '2014' },
  { label: '2015', value: '2015' },
  { label: '2016', value: '2016' },
  { label: '2017', value: '2017' },
  { label: '2018', value: '2018' },
  { label: '2019', value: '2019' },
  { label: '2020', value: '2020' },
  { label: '2021', value: '2021' },
  { label: '2022', value: '2022' },
  { label: '2023', value: '2023' },
  { label: '2024', value: '2024' },
];

  useEffect(() => {
    setIsModified(JSON.stringify(formData) !== JSON.stringify(vehicle));
  }, [formData, vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSwitchChange = async (name: string, value: boolean) => {
    console.log(value)
    if (name === 'active' && value) {
      // Desactivar otros vehículos activos del usuario
      const db = getDatabase();
      const carsRef = ref(db, 'cars');
      const userCarsQuery = query(carsRef, orderByChild('driver'), equalTo(userId));

      try {
        const snapshot = await get(userCarsQuery);
        if (snapshot.exists()) {
          const carsData = snapshot.val();
          const updates: any = {};
          Object.keys(carsData).forEach((key) => {
            if (carsData[key].id !== formData.id && carsData[key].active) {
              updates[`/cars/${key}/active`] = false;
            }
          });
          await update(ref(db), updates);
        }
      } catch (error) {
        console.error('Error updating other vehicles:', error);
      }
    }
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setIsModified(true); // Marcar como modificado cuando se cambia la imagen
    }
  };

  const uploadImage = async (image: File, vehicleId: string): Promise<string> => {
    const storage = getStorage();
    const imageRef = storageRef(storage, `cars/${vehicleId}`);
    await uploadBytes(imageRef, image);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const handleSave = async () => {
    const db = getDatabase();
    const vehicleRef = ref(db, `cars/${vehicle.id}`);
    const userRef = ref(db, `users/${userId}`);

    try {
      if (selectedImage) {
        // Subir la imagen a Firebase Storage
        const imageUrl = await uploadImage(selectedImage, vehicle.id);
        formData.car_image = imageUrl;
      }

      // Actualizamos el vehículo
      await update(vehicleRef, formData);

      // Si el vehículo está activo, actualizamos también los datos del usuario
      if (formData.active) {
        const updatedUserFields = {
          vehicleMake: formData.vehicleMake || "",
          vehicleModel: formData.vehicleModel || "",
          vehicleNumber: formData.vehicleNumber || "",
          cartype: formData.carType || "",
          car_image: formData.car_image || "",
          carType: formData.carType || "",
          vehicleColor: formData.vehicleColor || "",
          vehicleCylinders: formData.vehicleCylinders || "",
          vehicleDoors: formData.vehicleDoors || "",
          vehicleForm: formData.vehicleForm || "",
          vehicleFuel: formData.vehicleFuel || "",
          vehicleLine: formData.vehicleLine || "",
          vehicleMetalup: formData.vehicleMetalup || "",
          vehicleNoChasis: formData.vehicleNoChasis || "",
          vehicleNoMotor: formData.vehicleNoMotor || "",
          vehicleNoSerie: formData.vehicleNoSerie || "",
          vehicleNoVin: formData.vehicleNoVin || "",
          vehiclePassengers: formData.vehiclePassengers || "",
          carApproved: formData.approved || false,  // Aseguramos que este campo se incluya correctamente
          updatedFrom: "NEW_Web"
        };
        await update(userRef, updatedUserFields);
        onSave(formData, updatedUserFields);
      } else {
        onSave(formData, null);  // Si no está activo, no actualizamos el usuario
      }
    } catch (error) {
      console.error('Error updating vehicle and user:', error);
    }
    onClose();
  };



  const handleConfirmSave = () => {
    setShowConfirmation(true);
  };

  const confirmSave = () => {
    setShowConfirmation(false);
    handleSave();
  };

  const cancelSave = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Vehículo</h2>

        {/* Contenedor que tendrá el scroll */}
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="flex justify-center mb-4">
            <div className="text-center">
              <img src={imagePreview} alt="Car" className="w-40 h-40 object-cover mx-auto rounded-lg mb-2" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Placa del Vehículo', name: 'vehicleNumber' },
              { label: 'Color del Vehiculo', name: 'vehicleColor' },
              { label: 'Pasajeros', name: 'vehiclePassengers' },
              { label: 'Puertas del Vehiculo', name: 'vehicleDoors' },
              { label: 'Linea del Vehiculo', name: 'vehicleLine' },
              { label: 'No de Chasis', name: 'vehicleNoChasis' },
              { label: 'Numero de serie del Vehiculo', name: 'vehicleNoSerie' },
              { label: 'Numero vin del Vehiculo', name: 'vehicleNoVin' },
              { label: 'Numero de Motor del Vehiculo', name: 'vehicleNoMotor' },
            ].map(({ label, name }) => (
              <div className="mb-4" key={name}>
                <label className="block text-gray-700">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
            ))}
                  <div className="mb-4">
                            <label className="block text-gray-700">Modelo del Vehículo</label>
                            <select
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                            >
                                <option value="" disabled>
                                    Selecciona un modelo
                                </option>
                                {ModelosDeVehiculos.map((modelo) => (
                                    <option key={modelo.value} value={modelo.value}>
                                        {modelo.label}
                                    </option>
                                ))}
                            </select>
                        </div>
            <div className="mb-4">
              <label className="block text-gray-700">Tipo de Carroceria</label>
              <select
                name="vehicleMetalup"
                value={formData.vehicleMetalup || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="" disabled>
                  Selecciona uno
                </option>
                {bodyworkTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Cilindraje del Vehículo</label>
              <select
                name="vehicleCylinders"
                value={formData.vehicleCylinders}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="" disabled>
                  Selecciona el cilindraje
                </option>
                {CilindrajesDeVehiculos.map((cilindraje) => (
                  <option key={cilindraje.value} value={cilindraje.value}>
                    {cilindraje.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Marca del Vehículo</label>
              <select
                name="vehicleMake"
                value={formData.vehicleMake}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="" disabled>
                  Selecciona una marca
                </option>
                {marcasDeVehiculos.map((marca) => (
                  <option key={marca.value} value={marca.value}>
                    {marca.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
                            <label className="block text-gray-700">Tipo de Combustible del Vehiculo</label>
                            <select
                                name="vehicleFuel"
                                value={formData.vehicleFuel}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                            >
                                <option value="" disabled>
                                    Selecciona una marca
                                </option>
                                {TipoCombustible.map((marca) => (
                                    <option key={marca.value} value={marca.value}>
                                        {marca.label}
                                    </option>
                                ))}
                            </select>
                        </div>
            <div className="mb-4">
              <label className="block text-gray-700">Clase de Vehiculo</label>
              <select
                name="vehicleForm"
                value={formData.vehicleForm || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="" disabled>
                  Selecciona uno
                </option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Tipo de Servicio</label>
              <select
                name="carType"
                value={formData.carType || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1"
              >
                <option value="" disabled>
                  Selecciona uno
                </option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center">
              <label className="block text-gray-700 mr-4">Activo</label>
              <Switch
                onChange={(checked) => handleSwitchChange('active', checked)}
                checked={formData.active}
                onColor="#ff0000" // Color rojo
              />
            </div>
            <div className="mb-4 flex items-center">
              <label className="block text-gray-700 mr-4">Aprobado</label>
              <Switch
                onChange={(checked) => handleSwitchChange('approved', checked)}
                checked={formData.approved}
                onColor="#ff0000" // Color rojo
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmSave}
            className={`bg-red_treas text-white px-4 py-2 rounded ${isModified ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!isModified}
          >
            Guardar
          </button>
        </div>
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Edición</h2>
            <p>¿Está seguro de que desea guardar los cambios?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={cancelSave}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSave}
                className="bg-red_treas text-white px-4 py-2 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditVehicleModal;
