import React, { useEffect, useState } from 'react';
import { RootState } from '../store/store'; // Ajusta la ruta según corresponda
import { useDispatch, useSelector } from 'react-redux';
import UserList from './UserList';
import { fetchUsers } from '../actions/userActions';
import Loader from './Loader';
const CustomersPage: React.FC = () => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    // Filtrar los usuarios que son de tipo "customer"
    let filteredUsers = users.filter(user => user.usertype === 'customer');

    // Si el usuario autenticado es de tipo "company", filtrar por el uid de la empresa
    if (userType === 'company') {
        filteredUsers = filteredUsers.filter(user => user.company === companyUid);
    }

    const parseDate = (date) => {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            // Si la fecha no es válida, regresa un valor de fecha mínimo (por ejemplo, epoch)
            return new Date(0); // 1 de enero de 1970
        }
        return parsedDate;
    };
    // Filtrar los usuarios que son de tipo "driver"
    filteredUsers.sort((a, b) => {
        const dateA = parseDate(a.createdAt);
        const dateB = parseDate(b.createdAt);
    
        // Compara las fechas y devuelve el resultado de la comparación
        return dateB.getTime() - dateA.getTime();
    });
    // Aplicar filtro de búsqueda con verificación de propiedades
    filteredUsers = filteredUsers.filter(user =>
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.secondName && user.secondName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.verifyId && user.verifyId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.mobile && String(user.mobile).toLowerCase().includes(searchTerm.toLowerCase())) || // Aquí convertimos a cadena
        (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <UserList title="Clientes" users={filteredUsers} />
        </div>
    );
};

export default CustomersPage;
