import React from 'react';

const ExportModal = ({ isOpen, onRequestClose, onConfirm }) => {
  if (!isOpen) return null; // No renderizar el modal si no está abierto

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg w-96 p-6">
        <h2 className="text-xl font-bold mb-4">¿Qué deseas descargar?</h2>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => onConfirm('visible')}
            className="bg-red_treas text-white py-2 px-4 rounded-2xl hover:bg-red-300"
          >
            Descargar los visibles
          </button>
          <button
            onClick={() => onConfirm('all')}
            className="bg-red_treas text-white py-2 px-4 rounded-2xl hover:bg-red-300"
          >
            Descargar todos
          </button>
          <button
            onClick={onRequestClose}
            className="bg-gray-500 text-white py-2 px-4 rounded-2xl hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
