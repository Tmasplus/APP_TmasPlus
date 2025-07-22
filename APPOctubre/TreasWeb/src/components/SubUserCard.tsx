import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../slices/authSlice';
import { RootState } from '../store/store';
import defaultDriverImage from '../assets/1.png'; // Importa la imagen por defecto

interface SubUserCardProps {
  subuser: {
    InTurn: boolean;
    Name: string;
    email: string;
    id: string;
    password: string;
  };
}

const SubUserCard: React.FC<SubUserCardProps> = ({ subuser }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDeleteSubuser = () => {
    const updatedSubusers = user?.subusers.filter(s => s.id !== subuser.id);
    dispatch(updateUser({ ...user, subusers: updatedSubusers }));
  };

  const handleChangePassword = () => {
    const updatedSubusers = user?.subusers.map(s =>
      s.id === subuser.id ? { ...s, password: newPassword } : s
    );
    dispatch(updateUser({ ...user, subusers: updatedSubusers }));
    setNewPassword(''); // Limpiar el campo de nueva contraseña
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg w-96 h-auto m-4 transition-transform transform hover:scale-105 relative">
      <div className="flex items-center mb-4">
        <img
          src={defaultDriverImage} // Ruta a una imagen de avatar por defecto
          alt="Avatar"
          className="w-20 h-20 rounded-full mr-4"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{subuser.Name}</h3>
          <p className="text-sm">{subuser.email}</p>
        </div>
        <div className="flex space-x-2 absolute top-4 right-4">
          <button onClick={handleEditClick} className="text-yellow-300 hover:text-yellow-500">
            <FaEdit className="h-5 w-5" />
          </button>
          <button onClick={handleDeleteSubuser} className="text-red-300 hover:text-red-500">
            <FaTrash className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center mb-2">
          <div className={`w-4 h-4 rounded-full mr-2 ${subuser.InTurn ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-sm">{subuser.InTurn ? 'Activo' : 'Inactivo'}</p>
        </div>
        <p className="text-sm">ID: {subuser.id}</p>
        <div className="relative">
          <p className="text-sm">Password: {showPassword ? subuser.password : '••••••••'}</p>
          <button onClick={togglePasswordVisibility} className="absolute top-0 right-0 mt-1 mr-2">
            {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
          </button>
        </div>
        {isEditing && (
          <div className="mt-2">
            <input
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded text-black"
            />
            <button
              className="bg-black text-white py-1 px-4 rounded mt-2 hover:bg-red-600"
              onClick={handleChangePassword}
            >
              Cambiar Contraseña
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubUserCard;