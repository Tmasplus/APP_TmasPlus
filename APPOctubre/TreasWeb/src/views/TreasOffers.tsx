import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import ModalPromoForm from '../components/ModalPromoForm';
import { deletePromo } from '../actions/offersActions'; // Ajusta la ruta según corresponda
import imgSource from "../assets/logoNegro.png";

const TreasOffers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPromo, setEditPromo] = useState(null);
  const promos = useSelector((state: RootState) => state.promos.promos);
  const dispatch = useDispatch();

  const handleCreatePromo = () => {
    setEditPromo(null);
    setIsModalOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditPromo(promo);
    setIsModalOpen(true);
  };

  const handleDeletePromo = (promoUid: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta promoción?")) {
      dispatch(deletePromo(promoUid));
    }
  };

  const isCentered = promos.length < 4;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="sticky top-0 bg-slate-50 z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-black">Promociones</h1>
          <button onClick={handleCreatePromo} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded">Crear Nueva Promo</button>
        </div>
      </header>
      <div className={`grid grid-cols-1 ${isCentered ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4 justify-items-center`}>
        {promos.map((promo) => (
          <PromoCard 
            key={promo.uid} 
            promo={promo} 
            onEdit={() => handleEditPromo(promo)} 
            onDelete={() => handleDeletePromo(promo.uid)} 
          />
        ))}
      </div>
      <ModalPromoForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editPromo={editPromo} />
    </div>
  );
};

interface PromoCardProps {
  promo: {
    uid: string;
    createdAt: number;
    max_promo_discount_value: number;
    min_order: number;
    promo_code: string;
    promo_description: string;
    promo_name: string;
    promo_usage_limit: string;
    promo_validity: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const formatDate = (timestamp: number) => {
  if (timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else {
    return "Sin fecha";
  }
};

const PromoCard: React.FC<PromoCardProps> = ({ promo, onEdit, onDelete }) => {
  const formattedDate = formatDate(promo.promo_validity);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-between">
      <div className="w-full text-center mb-4">
        <img className="rounded-full w-48 shadow-2xl mx-auto" src={imgSource} alt="LogoTreas" />
        <h2 className="text-lg font-bold mb-2">{promo.promo_name}</h2>
        <div className="bg-red-400 text-white font-semibold text-lg p-2 rounded-md mb-2">
          Código Promocional: {promo.promo_code}
        </div>
        <p className="text-sm mb-2">{promo.promo_description}</p>
        <p className="text-2xl font-bold text-gray-800">${promo.max_promo_discount_value}</p>
        <p className="text-gray-500">Orden Mínima: ${promo.min_order}</p>
        <p className="text-gray-500">Límite de Aplicación del Código: {promo.promo_usage_limit}</p>
        <p className="text-gray-500">Fecha de Finalización de la Promoción: {formattedDate}</p>
      </div>
      <div className="flex space-x-4">
        <button onClick={onEdit} className="bg-red-500 text-white px-4 py-2 rounded drop-shadow-2xl">Editar</button>
        <button onClick={onDelete} className="bg-gray-500 text-white px-4 py-2 rounded drop-shadow-2xl">Eliminar</button>
      </div>
    </div>
  );
};

export default TreasOffers;
