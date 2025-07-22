import React, { useState } from 'react';
import ButtonSend from './ButtonSend';
interface ModalPromoFormProps {
  onClose: () => void;
  onSubmit: (title: string, body: string, usertype: string, devicetype: string) => void;
}

const ModalNotificationForm: React.FC<ModalPromoFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [usertype, setUsertype] = useState('driver'); // Default a "Conductor"
  const [devicetype, setDevicetype] = useState('All'); // Default a "Todos"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(title, body, usertype, devicetype);
      setIsSubmitting(false);
      onClose();
    }, 1000); // Simular un retraso en la sumisión
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 p-6 relative transform scale-95 transition-transform duration-300 ease-in-out animate-modalIn">
        {/* Botón de Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition-colors duration-300"
        >
          ✕
        </button>

        {/* Encabezado del Modal */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Crear Notificación
        </h2>

        {/* Cuerpo del Modal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entrada de Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-transform duration-300 ease-in-out transform hover:scale-105"
              placeholder="Introduce el título"
              required
            />
          </div>

          {/* Entrada de Mensaje */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-600 mb-1">
              Mensaje
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-transform duration-300 ease-in-out transform hover:scale-105"
              placeholder="Escribe el mensaje de la notificación"
              rows={4}
              required
            />
          </div>

          {/* Selección de Tipo de Usuario */}
          <div>
            <label htmlFor="usertype" className="block text-sm font-medium text-gray-600 mb-1">
              Tipo de Usuario
            </label>
            <select
              id="usertype"
              value={usertype}
              onChange={(e) => setUsertype(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-transform duration-300 ease-in-out transform hover:scale-105"
              required
            >
              <option value="driver">Conductor</option>
              <option value="customer">Cliente</option>
            </select>
          </div>

          {/* Selección de Tipo de Celular */}
          <div>
            <label htmlFor="devicetype" className="block text-sm font-medium text-gray-600 mb-1">
              Tipo de Celular
            </label>
            <select
              id="devicetype"
              value={devicetype}
              onChange={(e) => setDevicetype(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-transform duration-300 ease-in-out transform hover:scale-105"
              required
            >
              <option value="All">Todos</option>
              <option value="IOS">iOS</option>
              <option value="ANDROID">Android</option>
            </select>
          </div>

          {/* Botones de Envío y Cancelación */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Cancelar
            </button>
          
            <ButtonSend isSubmitting={isSubmitting} onClick={handleSubmit} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNotificationForm;