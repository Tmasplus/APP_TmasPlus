import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateCarType } from '../actions/carTypesActions';

interface EditModalProps {
  onClose: () => void;
  categoryData: any;
  onSave: (updatedData: any) => void;
}

const EditCategoryModal: React.FC<EditModalProps> = ({ onClose, categoryData, onSave }) => {
    const [formData, setFormData] = useState(categoryData || {});
    const dispatch = useDispatch();

    useEffect(() => {
      if (categoryData) {
        setFormData(categoryData);
      }
    }, [categoryData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleOptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedOptions = formData.options.map((option: any, i: number) =>
        i === index ? { ...option, [e.target.name]: e.target.value } : option
      );
      setFormData({ ...formData, options: updatedOptions });
    };

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.id) {
        dispatch(updateCarType(formData.id, formData));
      }
      onClose();
    };

    if (!formData || !formData.name) {
      return <div className="text-center text-lg font-bold">Cargando...</div>;
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 text-2xl hover:text-red-500 transition-colors"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Editar Categoría de Servicio</h2>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa Base</label>
              <input
                type="number"
                name="base_fare"
                value={formData.base_fare || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa Base Intermunicipal</label>
              <input
                type="number"
                name="base_fare_inter"
                value={formData.base_fare_inter || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa Mínima</label>
              <input
                type="number"
                name="min_fare"
                value={formData.min_fare || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa Mínima Intermunicipal</label>
              <input
                type="number"
                name="min_fare_inter"
                value={formData.min_fare_inter || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tipo de Servicio</label>
              <input
                type="text"
                name="typeService"
                value={formData.typeService || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa por Hora</label>
              <input
                type="number"
                name="rate_per_hour"
                value={formData.rate_per_hour || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa por Hora/Intermunicipal</label>
              <input
                type="number"
                name="rate_per_hour_inter"
                value={formData.rate_per_hour_inter || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa por Unidad de Distancia</label>
              <input
                type="number"
                name="rate_per_unit_distance"
                value={formData.rate_per_unit_distance || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tarifa por Unidad de Distancia Intermunicipal</label>
              <input
                type="number"
                name="rate_per_unit_distance_inter"
                value={formData.rate_per_unit_distance_inter || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Comisión por Conveniencia</label>
              <input
                type="number"
                name="convenience_fees"
                value={formData.convenience_fees || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Tipo de Comisión</label>
              <select
                name="convenience_fee_type"
                value={formData.convenience_fee_type || ''}
                onChange={handleInputChange}
                className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
          
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Opciones</h3>
          <div className="space-y-4">
            {formData.options && formData.options.map((option: any, index: number) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold">Descripción Opción {index + 1}</label>
                  <input
                    type="text"
                    name="description"
                    value={option.description || ''}
                    onChange={(e) => handleOptionChange(index, e)}
                    className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">Monto</label>
                  <input
                    type="number"
                    name="amount"
                    value={option.amount || ''}
                    onChange={(e) => handleOptionChange(index, e)}
                    className="w-full mt-2 px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-red-300 focus:outline-none transition-shadow"
                  />
                </div>
              </div>
            ))}
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
