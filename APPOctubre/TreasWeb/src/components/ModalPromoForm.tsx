// ModalPromoForm.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { createPromo, updatePromo } from '../actions/offersActions';
import { Promo } from '../interfaces/Promos';

interface ModalPromoFormProps {
  isOpen: boolean;
  onClose: () => void;
  editPromo?: Promo | null;
}

const ModalPromoForm: React.FC<ModalPromoFormProps> = ({ isOpen, onClose, editPromo }) => {
  const [promoData, setPromoData] = useState<Promo>({
    uid: editPromo?.uid || '',
    createdAt: editPromo?.createdAt || Date.now(),
    max_promo_discount_value: editPromo?.max_promo_discount_value || 0,
    min_order: editPromo?.min_order || 0,
    promo_code: editPromo?.promo_code || '',
    promo_description: editPromo?.promo_description || '',
    promo_name: editPromo?.promo_name || '',
    promo_usage_limit: editPromo?.promo_usage_limit || '',
    promo_validity: editPromo?.promo_validity || '',
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (editPromo) {
      setPromoData(editPromo);
    }
  }, [editPromo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPromoData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPromo) {
      dispatch(updatePromo(promoData));
    } else {
      dispatch(createPromo(promoData));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-black">&times;</button>
        <h2 className="text-2xl mb-4">{editPromo ? 'Editar Promo' : 'Crear Nueva Promo'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nombre de la Promo</label>
            <input
              type="text"
              name="promo_name"
              value={promoData.promo_name}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Descripción</label>
            <textarea
              name="promo_description"
              value={promoData.promo_description}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Código de Promoción</label>
            <input
              type="text"
              name="promo_code"
              value={promoData.promo_code}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Valor Máximo de Descuento</label>
            <input
              type="number"
              name="max_promo_discount_value"
              value={promoData.max_promo_discount_value}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Orden Mínima</label>
            <input
              type="number"
              name="min_order"
              value={promoData.min_order}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Límite de Uso de Promoción</label>
            <input
              type="text"
              name="promo_usage_limit"
              value={promoData.promo_usage_limit}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Fecha de Validez</label>
            <input
              type="date"
              name="promo_validity"
              value={promoData.promo_validity}
              onChange={handleChange}
              className="w-full mt-1 border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-700">Cancelar</button>
            <button type="submit" className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPromoForm;
