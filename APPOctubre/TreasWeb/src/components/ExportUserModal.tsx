import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (userType: string) => void;
}

const ExportUserModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-2xl font-semibold">Exportar Usuarios</h2>
                <p>Seleccione el tipo de usuarios que desea exportar:</p>
                <div className="space-y-2">
                    <button
                        onClick={() => onExport('customers')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
                    >
                        Exportar Clientes
                    </button>
                    {user?.usertype !== 'company' && (

                        <>
                            <button
                                onClick={() => onExport('drivers')}
                                className="bg-pink-300 text-white px-4 py-2 rounded-lg w-full"
                            >
                                Exportar Conductores
                            </button>
                            <button
                                onClick={() => onExport('companies')}
                                className="bg-red-950 text-white px-4 py-2 rounded-lg w-full"
                            >
                                Exportar Empresas
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 bg-red_treas text-white px-4 py-2 rounded-lg w-full"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default ExportUserModal;
