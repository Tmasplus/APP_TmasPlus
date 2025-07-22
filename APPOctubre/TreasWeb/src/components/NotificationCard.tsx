import React from 'react';
import { BellIcon, UserIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface NotificationProps {
  id: string;
  title: string;
  body: string;
  usertype: string;
  devicetype: string;
  createdAt: number;
  onDelete: (id: string) => void;
}

const NotificationCard: React.FC<NotificationProps> = ({
  id,
  title,
  body,
  usertype,
  devicetype,
  createdAt,
  onDelete,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 transform hover:-translate-y-1 hover:shadow-2xl transition duration-300 ease-in-out">
      <div className="flex items-center mb-4">
        <div className="bg-red-100 p-2 rounded-full">
          <BellIcon className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold ml-4">{title}</h2>
      </div>
      <p className="text-gray-700 mb-4">{body}</p>
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <UserIcon className="h-5 w-5 mr-1" />
        <span>{usertype}</span>
        <span className="mx-2">|</span>
        <DevicePhoneMobileIcon className="h-5 w-5 mr-1" />
        <span>{devicetype}</span>
        <span className="mx-2">|</span>
        <span>{new Date(createdAt).toLocaleString()}</span>
      </div>
      <button
        onClick={() => onDelete(id)}
        className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Eliminar
      </button>
    </div>
  );
};

export default NotificationCard;
