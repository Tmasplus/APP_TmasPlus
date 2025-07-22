import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../slices/authSlice';
import { useDispatch } from 'react-redux';

const ShiftManagement: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(28800); // Cambiado a 8 horas (28,800 segundos)
  const [newSubuserName, setNewSubuserName] = useState('');
  const [newSubuserEmail, setNewSubuserEmail] = useState('');
  const [newSubuserPassword, setNewSubuserPassword] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
console.log(user)
  useEffect(() => {
    const storedTime = localStorage.getItem('remainingTime');
    const storedUser = localStorage.getItem('activeUser');
    if (storedTime && storedUser) {
      setRemainingTime(Number(storedTime));
      setActiveUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('remainingTime', String(remainingTime));
      localStorage.setItem('activeUser', activeUser);
    }
  }, [remainingTime, activeUser]);

  useEffect(() => {
    if (remainingTime > 0 && activeUser) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (remainingTime <= 0 && activeUser) {
      handleEndShift(); // Llamar a la función para cerrar turno
    }
  }, [remainingTime, activeUser]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleStartShift = () => {
    if (selectedUser) {
      const selectedSubuser = user?.subusers.find(subuser => subuser.id === selectedUser);

      if (selectedSubuser && selectedSubuser.password === password) {
        setActiveUser(selectedUser);
        setRemainingTime(28800); // Reiniciar a 8 horas (28,800 segundos)
        setErrorMessage(null); // Limpiar mensaje de error

        // Actualizar inTurn a true para el usuario seleccionado
        dispatch(updateUser({ 
          ...user, 
          subusers: user?.subusers.map(subuser =>
            subuser.id === selectedUser ? { ...subuser, InTurn: true } : subuser
          )
        }));
      } else {
        setErrorMessage('Funcionario o contraseña incorrectos.');
      }
    }
  };

  const handleEndShift = () => {
    if (activeUser) {
      dispatch(updateUser({ 
        ...user, 
        subusers: user?.subusers.map(subuser =>
          subuser.id === activeUser ? { ...subuser, InTurn: false } : subuser
        )
      }));
    }
    setActiveUser(null);
    setPassword('');
    localStorage.removeItem('remainingTime');
    localStorage.removeItem('activeUser');
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleViewReservations = () => {
    navigate('/bookingCorp');
  };
  const handleCreateSubuser = () => {
    if (newSubuserName && newSubuserEmail && newSubuserPassword) {
      const newSubuser = {
        id: Date.now().toString(),
        Name: newSubuserName,
        email: newSubuserEmail,
        password: newSubuserPassword,
        InTurn: false,
      };

      const updatedSubusers = [...(user?.subusers || []), newSubuser];

      dispatch(updateUser({ ...user, subusers: updatedSubusers }));

      // Limpiar el formulario
      setNewSubuserName('');
      setNewSubuserEmail('');
      setNewSubuserPassword('');
    }
  };
  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Turno en {user?.bussinesName}</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <div className="mb-4">
            <label className="block text-gray-700">Empleado</label>
            <select
              className="w-full mt-1 p-2 border rounded"
              value={selectedUser ?? ''}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar Empleado
              </option>
              {user?.subusers && user.subusers.length > 0 ? (
                user.subusers.map((subuser, index) => (
                  <option key={index} value={subuser.id}>
                    {subuser.Name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No hay empleados disponibles
                </option>
              )}
            </select>
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`w-full mt-1 p-2 border rounded ${errorMessage ? 'border-red-500' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={togglePasswordVisibility} className="absolute top-0 right-0 mt-3 mr-3">
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
          </div>
          <div className="flex justify-between mb-4">
            <button
              className="bg-red-600 text-white py-2 px-4 rounded"
              onClick={handleStartShift}
              disabled={!selectedUser || !password}
            >
              INICIAR TURNO
            </button>
            <button className="bg-red-600 text-white py-2 px-4 rounded" onClick={handleEndShift}>
              CERRAR TURNO
            </button>
          </div>
          <button className="bg-red-600 text-white py-2 px-4 w-full rounded mb-4" onClick={toggleCreateForm}>
            CREAR EMPLEADOS
          </button>
          {showCreateForm && (
            <div className="bg-gray-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Crear Nuevo Empleado</h3>
              <input
                type="text"
                placeholder="Nombre"
                value={newSubuserName}
                onChange={(e) => setNewSubuserName(e.target.value)}
                className="w-full mt-1 p-2 border rounded mb-2"
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                value={newSubuserEmail}
                onChange={(e) => setNewSubuserEmail(e.target.value)}
                className="w-full mt-1 p-2 border rounded mb-2"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={newSubuserPassword}
                onChange={(e) => setNewSubuserPassword(e.target.value)}
                className="w-full mt-1 p-2 border rounded mb-4"
              />
              <button
                className="bg-red_treas text-white py-2 px-4 rounded"
                onClick={handleCreateSubuser}
              >
                Guardar Empleado
              </button>
            </div>
          )}
          {activeUser && (
            <div className="bg-gray-200 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Empleado Activo</h3>
              <p>{user?.subusers.find((subuser) => subuser.id === activeUser)?.Name}</p>
              <p>Tiempo restante: {formatTime(remainingTime)}</p>
              <button className="bg-red-600 text-white py-2 px-4 w-full rounded mt-4" onClick={handleViewReservations}>
                RESERVAS
              </button>
            </div>
          )}
          {!user?.subusers || user.subusers.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              Por favor crea funcionarios.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;