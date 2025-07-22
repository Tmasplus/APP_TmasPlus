import React from 'react';
import Modal from './ModalBase';
import imageCheck from '../assets/succes.png'
 const SuccessModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center z-50	">
        <div className=" rounded-full p-4 mb-4">
          <img src={imageCheck}></img>
        </div>
        <h2 className="text-xl font-semibold mb-2">Felicidades!</h2>
        <p className="text-gray-600 mb-4">Guardado con Exito.</p>
        <button onClick={onClose} className="bg-red_treas text-white px-4 py-2 rounded-2xl">
          Aceptar
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
