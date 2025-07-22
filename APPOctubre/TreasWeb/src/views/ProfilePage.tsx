import React from 'react';
import ProfileForm from '../components/ProfileForm';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Mi Perfil</h2>
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;
