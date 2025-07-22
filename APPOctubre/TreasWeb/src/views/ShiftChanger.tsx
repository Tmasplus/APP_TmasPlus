import React from 'react'
import ShiftManagement from '../components/ShiftManagement';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const ShiftChanger = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className="p-4">
          <div className="overflow-x-auto">
          <h1 className="text-2xl font-bold mb-6 ">Iniciar Turno en {user?.bussinesName}</h1>
          <div className="min-h-screen bg-gray-100 p-8">
            <ShiftManagement />
            </div>
          </div>
        </div>
      );
    };

export default ShiftChanger
