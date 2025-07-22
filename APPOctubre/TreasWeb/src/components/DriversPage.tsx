import React, { useEffect, useState } from 'react';
import { RootState } from '../store/store'; // Ajusta la ruta según corresponda
import { useDispatch, useSelector } from 'react-redux';
import UserList from './UserList';
import { fetchUsers } from '../actions/userActions';
import Loader from './Loader';

const DriversPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const usersState = useSelector((state: RootState) => state.users);
    const users = usersState.allUsers;
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);
    useEffect(() => {
        if (users && Array.isArray(users)) {
            setLoading(false);
        }
    }, [users]);
    const parseDate = (date) => {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            // Si la fecha no es válida, regresa un valor de fecha mínimo (por ejemplo, epoch)
            return new Date(0); // 1 de enero de 1970
        }
        return parsedDate;
    };
    // Filtrar los usuarios que son de tipo "driver"
    let filteredUsers = users.filter(user => user.usertype === 'driver');
    filteredUsers.sort((a, b) => {
        const dateA = parseDate(a.createdAt);
        const dateB = parseDate(b.createdAt);
    
        // Compara las fechas y devuelve el resultado de la comparación
        return dateB.getTime() - dateA.getTime();
    });
   
    // Aplicar filtro de búsqueda con verificación de propiedades
    filteredUsers = filteredUsers.filter(user =>
        (typeof user.firstName === 'string' && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.lastName === 'string' && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.email === 'string' && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.secondName === 'string' && user.secondName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.verifyId === 'string' && user.verifyId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.mobile === 'string' && user.mobile.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.id === 'string' && user.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.vehicleMake === 'string' && user.vehicleMake.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.vehicleNumber === 'string' && user.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof user.carType === 'string' && user.carType.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-2xl font-semibold"><Loader/></div>
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
            <UserList title="Conductores" users={filteredUsers} />
        </div>
    );
};

export default DriversPage;
