import React, { useEffect, useState } from 'react';
import { RootState } from '../store/store'; // Ajusta la ruta según corresponda
import { useDispatch, useSelector } from 'react-redux';
import UserList from './UserList';
import dayjs from 'dayjs'; // Asegúrate de tener instalado dayjs: npm install dayjs
import { fetchUsers } from '../actions/userActions';

const UpdatePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const usersState = useSelector((state: RootState) => state.users);
    const authState = useSelector((state: RootState) => state.auth);
    const users = usersState.allUsers;
    const companyUid = authState.user?.uid;
    const userType = authState.user?.usertype;

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        if (users && Array.isArray(users)) {
            setLoading(false);
        }
    }, [users]);

    // Obtiene la fecha actual y la fecha límite para los 5 días recientes
    const currentDate = new Date();
    const fiveDaysAgo = new Date(currentDate);
    fiveDaysAgo.setDate(currentDate.getDate() - 5);

    // Filtrar los usuarios que son de tipo "driver", que fueron actualizados en los últimos 5 días o que tienen updatedAt vacío
    let filteredUsers = users.filter(user => {
        const updatedAt = user.updateAt ? dayjs(user.updateAt) : null;
        const createdAt = user.createdAt ? dayjs(user.createdAt) : null;
        const isRecentCreation = createdAt && createdAt.isValid() ? createdAt.isAfter(dayjs().subtract(5, 'day')) : false;

        const isRecent = updatedAt && updatedAt.isValid() ? updatedAt.isAfter(dayjs().subtract(5, 'day')) : false;
        
        // Incluir usuarios que no tengan el campo updatedAt o hayan sido actualizados en los últimos 5 días
        const isMissingUpdatedAt = !user.updateAt || user.updateAt === '' || !user.createdAt || user.createdAt === ''; // Verifica si updatedAt está vacío o es una cadena vacía
        return user.usertype === 'driver' && (isRecent || isMissingUpdatedAt || isRecentCreation) && (user.reviewed === false || !user.reviewed || user.reviewed === '');
    });

    // Si el usuario autenticado es de tipo "company", filtrar por el uid de la empresa
    if (userType === 'company') {
        filteredUsers = filteredUsers.filter(user => user.company === companyUid);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold">Cargando...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar..."
                    className="p-2 rounded bg-white text-black placeholder:text-gray-500 border-red_treas border-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <UserList title="Conductores Recientes" users={filteredUsers.map(user => ({ ...user, isUpdateUser: true }))} />
        </div>
    );
};

export default UpdatePage;
