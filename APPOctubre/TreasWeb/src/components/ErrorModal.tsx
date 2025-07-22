import React from 'react';
import Modal from './ModalBase';
import imageCheck from '../assets/error.png'
const ErrorModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center">
        <div className="rounded-full p-4 mb-4">
        <img src={imageCheck}></img>

        </div>
        <h2 className="text-xl font-semibold mb-2">Upsss Hubo un ERROR!</h2>
        <p className="text-gray-600 mb-4">Por favor Intente de Nuevo .</p>
        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-2xl">
          Aceptar
        </button>
      </div>
    </Modal>
  );
};

export default ErrorModal;
