import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import SubUserCard from '../components/SubUserCard'; // Asegúrate de ajustar la ruta según corresponda

const OfficialsView: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const subusersArray = user?.subusers ? Object.values(user.subusers) : [];

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6">Funcionarios {user.bussinesName}</h1>
        <div className="min-h-screen bg-gray-100 p-8">
          {user?.usertype === 'company' && subusersArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subusersArray.map((subuser, index) => (
                <SubUserCard key={index} subuser={subuser} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay subusuarios disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficialsView;
