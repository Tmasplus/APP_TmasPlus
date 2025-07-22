import React, { useState ,useEffect} from 'react';
import { useDispatch } from 'react-redux';
//import { addNewCarType } from '../store/actions/carTypeActions'; // Asegúrate de tener esta acción en tu store
import { addNewCarType } from '../actions/carTypesActions'; // Importa la nueva acción

const NewCategoryModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [
   formData , setFormData] = useState({
    Iva: 19,
    base_fare: '',
    convenience_fee_type: 'percentage',
    convenience_fees: '',
    extra_info: '',
    fleet_admin_fee: '',
    image: '',
    intermunicipal_value: '',
    min_fare: '',
    name: '',
    options: [
      { amount: '', description: 'Inmediato' },
      { amount: '', description: 'Programado' },
      { amount: '', description: 'Aeropuerto y Programado' },
      { amount: '', description: 'Aeropuerto' }
    ],
    rate_per_hour: '',
    rate_per_unit_distance: '',
    recargo_aeropuerto: '',
    recargo_programado: '',
    typeService: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null); // Estado para manejar la imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const dispatch = useDispatch();
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedOptions = formData.options.map((option, i) =>
      i === index ? { ...option, amount: e.target.value } : option
    );
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addNewCarType(formData, imageFile)); // Despacha la acción con el formulario y la imagen
    onClose();
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]); // Almacena la imagen seleccionada
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-red-500 transition-colors"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Crear Nueva Categoría de Servicio</h2>

        <form onSubmit={handleSave}>
        <div className="flex justify-center mb-4">
            {imagePreview ? (
              <img 
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Sin Imagen</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Campos del formulario */}
            
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Imagen del Tipo de Vehículo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa Base</label>
              <input
                type="number"
                name="base_fare"
                value={formData.base_fare}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa Mínima</label>
              <input
                type="number"
                name="min_fare"
                value={formData.min_fare}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tipo de Servicio</label>
              <input
                type="text"
                name="typeService"
                value={formData.typeService}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa por Hora</label>
              <input
                type="number"
                name="rate_per_hour"
                value={formData.rate_per_hour}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa por Unidad de Distancia</label>
              <input
                type="number"
                name="rate_per_unit_distance"
                value={formData.rate_per_unit_distance}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Comisión por Conveniencia</label>
              <input
                type="number"
                name="convenience_fees"
                value={formData.convenience_fees}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tipo de Comisión</label>
              <select
                name="convenience_fee_type"
                value={formData.convenience_fee_type}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Valor Intermunicipal</label>
              <input
                type="number"
                name="intermunicipal_value"
                value={formData.intermunicipal_value}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Opción Inmediato</label>
              <input
                type="number"
                name="option_inmediato"
                value={formData.options[0].amount}
                onChange={(e) => handleOptionChange(0, e)}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Opción Programado</label>
              <input
                type="number"
                name="option_programado"
                value={formData.options[1].amount}
                onChange={(e) => handleOptionChange(1, e)}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Opción Aeropuerto y Programado</label>
              <input
                type="number"
                name="option_aeropuerto_programado"
                value={formData.options[2].amount}
                onChange={(e) => handleOptionChange(2, e)}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Opción Aeropuerto</label>
              <input
                type="number"
                name="option_aeropuerto"
                value={formData.options[3].amount}
                onChange={(e) => handleOptionChange(3, e)}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCategoryModal;