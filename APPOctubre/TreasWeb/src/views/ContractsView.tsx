import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Asegúrate de ajustar la ruta según corresponda
import { updateUser } from '../slices/authSlice'; // Importa tu acción para actualizar el usuario
import ContractDisplay from '../components/ContractDisplay';
import { fetchAndDispatchUserData } from '../actions/actions';

const ContractsView = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [formValues, setFormValues] = useState(user);
    const dispatch = useDispatch();
console.log("user",user)
    // Función para manejar los cambios en el formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    // Función para manejar la actualización de datos
    const handleSave = async () => {
        const isError = await dispatch(updateUser(formValues));
        fetchAndDispatchUserData(user.uid,dispatch)
    };

    // Verificar si faltan datos esenciales
    const isDataMissing = !user.CompanyName || !user.NIT || !user.addresCompany || !user.cityCompany || !user.Full_Name_Legal_Representative || !user.docTypelegalrepresentative || !user.verifyIdRepresentativeLegal;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="sticky top-0 bg-slate-50 z-10 p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-black">Contratos</h1>
                </div>
            </header>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {isDataMissing ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4 text-red-600">Por favor complete la información de la empresa:</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    name="CompanyName"
                                    value={formValues.CompanyName || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIT</label>
                                <input
                                    type="text"
                                    name="NIT"
                                    value={formValues.NIT || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dirección de la Empresa</label>
                                <input
                                    type="text"
                                    name="addresCompany"
                                    value={formValues.addresCompany || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                <input
                                    type="text"
                                    name="cityCompany"
                                    value={formValues.cityCompany || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombres y apellidos Representante Legal</label>
                                <input
                                    type="text"
                                    name="Full_Name_Legal_Representative"
                                    value={formValues.Full_Name_Legal_Representative
                                        || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo de Documento</label>
                                <input
                                    type="text"
                                    name="docTypelegalrepresentative"
                                    value={formValues.docTypelegalrepresentative
                                         || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Documento del Representante Legal</label>
                                <input
                                    type="text"
                                    name="verifyIdRepresentativeLegal"
                                    value={formValues.verifyIdRepresentativeLegal || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={handleSave}
                                    className="bg-red_treas hover:bg-red-900 text-white font-bold py-2 px-4 rounded"
                                >
                                    Guardar y Continuar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ContractDisplay auth={user} />
                )}
            </div>
        </div>
    );
};

export default ContractsView;
