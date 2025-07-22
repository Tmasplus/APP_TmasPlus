import React, { useState } from 'react';
import EditUserModal from './EditUserModal';
import { useDispatch } from 'react-redux';
import { updateUserWithoutAuth } from '../slices/authSlice';
import defaultProfileImage from '../assets/1.png'; // Añade una imagen predeterminada

const UserCard: React.FC<{ user: any }> = ({ user }) => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = (updatedUser: any) => {
        dispatch(updateUserWithoutAuth(updatedUser));
        handleCloseModal();
    }; 
    return (
        <>
<div
    className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-transform hover:scale-105 hover:shadow-lg m-4 cursor-pointer"
    onClick={handleOpenModal}
>
    <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center p-4">
        <img src={user.profile_image || defaultProfileImage} alt="User Profile" className="w-24 h-24 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover m-2 rounded-full shadow-2xl" />
        <div className="flex flex-col justify-between w-full mt-4 md:mt-0 md:ml-4">
            <div>
                <div className="flex flex-col items-start">
                    {user.usertype === 'company' ? (
                        <h3 className="text-lg md:text-xl font-bold text-gray-800">{user.bussinesName}</h3>
                    ) : (
                        <h3 className="text-lg md:text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</h3>
                    )}
                    <h2 className="text-sm md:text-lg lg:text-xl text-red_treas truncate">{user.id}</h2>
                </div>
                <p className="text-gray-700 text-sm md:text-base">{user.usertype}</p>
                <div className="grid grid-cols-1 gap-2">
                    <p className="text-gray-700 text-sm md:text-base">Usuario Creado: <span className="text-neutral-500">{new Date(user.createdAt).toLocaleString()}</span></p>
                    <p className="text-gray-700 text-sm md:text-base">Email: <span className="text-neutral-500">{user.email}</span></p>
                    <p className="text-gray-700 text-sm md:text-base">Teléfono: <span className="text-neutral-500">{user.mobile}</span></p>
                    <p className="text-gray-700 text-sm md:text-base">Ciudad: <span className="text-neutral-500">{user.city}</span></p>
                    {user.usertype === 'company' ? (
                        <p className="text-gray-700 text-sm md:text-base">NIT: <span className="text-neutral-500">{user.NIT} - {user.verifyId}</span></p>
                    ) : (
                        <p className="text-gray-700 text-sm md:text-base">Documento: <span className="text-neutral-500">{user.docType} - {user.verifyId}</span></p>
                    )}
                    {user.usertype === 'driver' && (
                        <>
                            <p className="text-gray-700 text-sm md:text-base">Vehículo: <span className="text-neutral-500">{user.vehicleMake} - {user.vehicleModel}</span></p>
                            <p className="text-gray-700 text-sm md:text-base">Placa del Vehículo: <span className="text-neutral-500">{user.vehicleNumber}</span></p>
                        </>
                    )}
                    <p className="text-gray-700 text-sm md:text-base">Balance de la Billetera: <span className="text-neutral-500">{user.walletBalance}</span></p>
                    {user.usertype === 'company' ? (
                        <p className="text-gray-700 text-sm md:text-base">Comisión: <span className="text-neutral-500">{user.commission}</span></p>
                    ) : (
                        <p className="text-gray-700 text-sm md:text-base">Referral ID: <span className="text-neutral-500">{user.referralId}</span></p>
                    )}
                </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-auto w-full md:w-auto">
                <button
                    onClick={handleOpenModal}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-2xl w-full md:w-auto"
                >
                    Editar
                </button>
            </div>
        </div>
    </div>
</div>




            {isModalOpen && <EditUserModal
                user={user}
                onClose={handleCloseModal}
                onSave={handleSave}
                isUpdateUser={user.isUpdateUser} // Pasar la propiedad isUpdateUser
            />}
        </>
    );
};

export default UserCard;
