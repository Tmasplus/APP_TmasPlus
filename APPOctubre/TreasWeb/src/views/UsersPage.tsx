import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import CustomersPage from '../components/CustomersPage';
import DriversPage from '../components/DriversPage';
import CompaniesPage from '../components/CompaniesPage';
import { RootState } from '../store/store';
import { useSelector } from 'react-redux';
import UpdatePage from '../components/UpdatePage';
import AddUserModal from '../components/AddUserModal';
import ExportUserModal from '../components/ExportUserModal';
import { saveAs } from 'file-saver';

const UsersPage: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const allUsers = useSelector((state: RootState) => state.users.allUsers);
    const filteredUsers = useSelector((state: RootState) => state.users.filteredUsers);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const openExportModal = () => setIsExportModalOpen(true);
    const closeExportModal = () => setIsExportModalOpen(false);
//console.log(user)
    const handleExport = (userType: string) => {
        let usersToExport = [];
    
        if (userType === 'customers') {
            if (user.usertype === 'company') {
                // Si el usuario autenticado es una empresa, filtrar los clientes por su empresa
                usersToExport = allUsers.filter(
                    (customer) => customer.usertype === 'customer' && customer.company === user.id
                );
            } else {
                usersToExport = allUsers.filter(user => user.usertype === 'customer');
            }
        } else if (userType === 'drivers' && user.usertype !== 'company') {
            usersToExport = allUsers.filter(user => user.usertype === 'driver');
        } else if (userType === 'companies' && user.usertype !== 'company') {
            usersToExport = filteredUsers.filter(user => user.usertype === 'company');
        }
    
        exportCSV(usersToExport, userType);
        closeExportModal();
    };
    const formatDate = (date: any) => {
        let formattedDate = '';
    
        if (typeof date === 'number') {
            formattedDate = new Date(date).toLocaleString();
        } else if (typeof date === 'string') {
            formattedDate = new Date(date).toLocaleString();
        }
    
        // Reemplazar la coma que separa la fecha y hora con un colon
        return formattedDate.replace(',', ':');
    };
    const exportCSV = (users: any[], userType: string) => {
        let csvContent = '';
        let filename = '';

        if (userType === 'customers') {
            const headers = [
                'Fecha de creación', 'UID','Nombre', 'Apellido', 'Ciudad', 'Tipo de documento', 'N° Documento',
                'Número de móvil', 'Correo Electrónico', 'Billetera', 'Imagen de perfil', 'Id. de referido',
                'Inscripción por recomendación', 'Empresas', 'Funcionario', 'Cantidad de documentos',
                'Cuenta aprobada', 'Bloqueado', 'Usuario Empresarial','Plataforma'
            ];
            csvContent = headers.join(',') + '\n';
    
            users.forEach(user => {
                // Busca el nombre de la empresa en filteredUsers
                const companyId = user.company;
                let businessName = '';
                const documentCount = [
                       user.verifyIdImage, user.verifyIdImageBk
                ].filter(field => field).length;
                if (companyId) {
                    const company = filteredUsers.find(companyUser => companyUser.id === companyId);
                    businessName = company ? company.bussinesName : '';
                    console.log(businessName)
                }
                const row = [
                    formatDate(user.createdAt),user.uid,  // Formatear la fecha
                     user.firstName, user.lastName, user.city, user.docType, user.verifyId,
                    user.mobile, user.email, user.walletBalance, user.profile_image, user.referralId,
                    user.signupViaReferral, businessName, 
                    user.officialGuest ? 'Funcionario' : 'Huesped',  // Aquí se implementa la lógica
                    documentCount, user.approved,
                    user.blocked,
                    user.company && user.company !== '' ? true : false,  // Aquí se evalúa si company tiene data
                    user.userPlatform
                ];
                csvContent += row.join(',') + '\n';
            });
            filename = 'clientes.csv';
        } else if  (userType === 'drivers') {
            const headers = [
                'Fecha de creación', 'UID', 'Nombre', 'Apellido', 'Tipo de documento', 'N° Documento',
                'Número de móvil', 'Correo Electrónico', 'Billetera', 'Billetera de Kms', 'Ciudad', 'Placa',
                'Tipo de servicio', 'Cantidad de documentos', 'Id. de referido', 'Inscripción por recomendación',
                'Imagen de perfil', 'Gestión de Contácto', 'Bloqueado', 'Cuenta aprobada', 'Ocupado',
                'Estado del conductor', 'Licencia', 'Licencia Posterior', 'SOAT', 'Carta de Propiedad',
                'Carta de Propiedad posterior', 'Documento', 'Documento Posterior', 'Plataforma'
            ];
            csvContent = headers.join(',') + '\n';
        
            users.forEach(user => {
                const documentCount = [
                    user.SOATImagev2, user.SOATImage, user.cardPropImage, user.cardPropImageBK, user.cardPropImagev2,
                    user.licenseImage, user.licenseImageBack, user.verifyIdImage, user.verifyIdImageBk
                ].filter(field => field).length;
        
                const row = [
                    formatDate(user.createdAt), user.id, user.firstName, user.lastName, user.docType, user.verifyId,
                    user.mobile, user.email, user.walletBalance, user.kmWallet, user.city, user.vehicleNumber,
                    user.carType, documentCount, user.referralId, user.recommendationEnrollment,
                    user.profile_image, user.validContac, user.blocked || false, user.approved || false, user.queue || false,
                    user.driverActiveStatus, user.licenseImage, user.licenseImageBack, user.SOATImage, user.cardPropImage,
                    user.cardPropImageBK, user.verifyIdImage, user.verifyIdImageBk, user.userPlatform
                ];
                csvContent += row.join(',') + '\n';
            });
            filename = 'conductores.csv';
        } else if  (userType === 'companies') {
            const headers = [
                'Fecha de creación', 'Uid', 'Razón Social', 'Número de Identificación Tributaria',
                'Tipo de Documento', 'Número de móvil', 'Correo Electrónico', 'Imagen de perfil',
                'Comisión', 'Cuenta aprobada', 'Crear sub usuarios', 'Hotel/Empresa'
            ];
            csvContent = headers.join(',') + '\n';
    
            users.forEach(user => {
                const row = [
                    formatDate(user.createdAt),  // Format the timestamp from createdAt
                    user.uid, 
                    user.bussinesName, 
                    user.NIT || user.verifyId,  // Número de Identificación Tributaria (NIT or verifyId)
                    user.NITType, 
                    user.mobile, 
                    user.email, 
                    user.profile_image, 
                    user.commission, 
                    user.approved, 
                    user.AccessSubUsers, 
                    user.organizations || 'N/A'  // If organizations field is empty, we return 'N/A'
                ];
                csvContent += row.join(',') + '\n';
            });
            filename = 'empresas.csv';
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, filename);
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-center mb-8">Listado de Usuarios</h1>
            <nav className="flex justify-center space-x-4">
                <NavLink
                    to="customers"
                    className={({ isActive }) =>
                        isActive
                            ? "text-red_treas font-bold underline"
                            : "text-black hover:text-red_treas hover:underline"
                    }
                >
                    Clientes
                </NavLink>

                {user?.usertype !== 'company' && (
                    <>
                        <NavLink
                            to="drivers"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-red_treas font-bold underline"
                                    : "text-black hover:text-red_treas hover:underline"
                            }
                        >
                            Conductores
                        </NavLink>
                        <NavLink
                            to="companies"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-red_treas font-bold underline"
                                    : "text-black hover:text-red_treas hover:underline"
                            }
                        >
                            Empresas
                        </NavLink>
                        <NavLink
                            to="updated"
                            className={({ isActive }) =>
                                isActive
                                    ? "text-red_treas font-bold underline"
                                    : "text-black hover:text-red_treas hover:underline"
                            }
                        >
                            Usuarios Actualizados
                        </NavLink>
                    </>
                )}
            </nav>
            <div className="flex justify-center mt-4 space-x-4">
                <button
                    onClick={openModal}
                    className="bg-red_treas text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                    Añadir Usuario
                </button>
                <button
                    onClick={openExportModal}
                    className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                    Exportar Usuarios
                </button>
            </div>
            <Routes>
                <Route path="customers" element={<CustomersPage />} />
                {user?.usertype !== 'company' && (
                    <>
                        <Route path="drivers" element={<DriversPage />} />
                        <Route path="companies" element={<CompaniesPage />} />
                        <Route path="updated" element={<UpdatePage />} />
                    </>
                )}
                <Route path="/" element={<Navigate to="customers" />} />
            </Routes>
            {isModalOpen && <AddUserModal onClose={closeModal} />}
            {isExportModalOpen && (
                <ExportUserModal
                    isOpen={isExportModalOpen}
                    onClose={closeExportModal}
                    onExport={handleExport}
                />
            )}
        </div>
    );
};

export default UsersPage;
