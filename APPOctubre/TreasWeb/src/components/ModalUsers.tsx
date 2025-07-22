import React, { useState, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any | null;
    onSave: (user: any) => void;
}

const ModalUsers: React.FC<ModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [editableUser, setEditableUser] = useState(user);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setEditableUser(user);
        setHasChanges(false); // Reset changes when user changes
    }, [user]);

    if (!isOpen || !user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableUser({
            ...editableUser,
            [e.target.name]: e.target.value
        });
        setHasChanges(true); // Set changes to true when any input changes
    };

    const handleSave = () => {
        if (window.confirm("¿Está seguro de actualizar este usuario con estos datos?")) {
            onSave(editableUser);
            alert("Usuario actualizado con éxito");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-1/2 relative">
                <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
                <button className="absolute top-2 right-2 text-black" onClick={onClose}>
                    &times;
                </button>
                <div className="grid grid-cols-2 gap-4">
                    {user.usertype === 'company' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Empresa</label>
                                <input type="text" name="bussinesName" value={editableUser?.bussinesName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIT</label>
                                <input type="text" name="NIT" value={editableUser?.NIT || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Comisión</label>
                                <input type="text" name="commission" value={editableUser?.commission || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input type="text" name="firstName" value={editableUser?.firstName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                <input type="text" name="lastName" value={editableUser?.lastName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                <input type="text" name="city" value={editableUser?.city || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                <input type="text" name="docType" value={editableUser?.docType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Número de Documento</label>
                                <input type="text" name="verifyId" value={editableUser?.verifyId || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </>
                    )}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">UID</label>
                        <input type="text" name="id" value={editableUser?.id || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={editableUser?.email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Celular</label>
                        <input type="text" name="mobile" value={editableUser?.mobile || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Billetera</label>
                        <input type="text" name="walletBalance" value={editableUser?.walletBalance || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Id de Referido</label>
                        <input type="text" name="referralId" value={editableUser?.referralId || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    {user.usertype === 'driver' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Servicio</label>
                                <input type="text" name="carType" value={editableUser?.carType || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID del Carro</label>
                                <input type="text" name="vehicleNumber" value={editableUser?.vehicleNumber || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </>
                    )}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Inscripción por Recomendación</label>
                        <input type="text" name="signupViaReferral" value={editableUser?.signupViaReferral || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Empresa</label>
                        <input type="text" name="company" value={editableUser?.company || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Plataforma</label>
                        <input type="text" name="userPlatform" value={editableUser?.userPlatform || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2 flex justify-between">
                        <button className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700" onClick={onClose}>
                            Cerrar Modal
                        </button>
                        <button className={`bg-red_treas text-white py-2 px-4 rounded-md hover:bg-red-400 ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleSave} disabled={!hasChanges}>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalUsers;
