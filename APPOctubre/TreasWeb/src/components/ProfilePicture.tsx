import React from 'react';
import defaultImage from '../assets/1.png'; // Ruta a la imagen de respaldo
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const ProfilePicture: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="col-span-2 flex justify-center mb-4">
      <div className="relative">
        <img 
          src={user?.profile_image|| defaultImage} 
          alt="Profile" 
          className="w-32 h-32 rounded-full object-cover" 
        />
        <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2">
          <i className="fas fa-camera"></i>
        </button>
      </div>
    </div>
  );
};

export default ProfilePicture;
