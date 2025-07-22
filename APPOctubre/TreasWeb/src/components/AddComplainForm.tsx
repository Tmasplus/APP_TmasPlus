import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
// import { addComplain } from '../slices/complainSlice'; // Importa la acción para añadir una queja

const AddComplainForm: React.FC = () => {
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newComplain = {
      description,
      email,
      firstName,
      status: false, // Estado inicial de la queja
      complainDate: new Date().toISOString(),
    };
    // dispatch(addComplain(newComplain));
    setDescription('');
    setEmail('');
    setFirstName('');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Añadir Nueva Queja</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Descripción</label>
          <textarea
            className="w-full p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-red_treas text-white px-4 py-2 rounded-lg">
            Añadir Queja
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddComplainForm;
