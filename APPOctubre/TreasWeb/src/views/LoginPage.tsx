import React, { useState } from 'react';
import logo from '../assets/logoNegro.png';
import fondologin from '../assets/fondo.jpg';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/authSlice';
import { useFirebase } from '../common/configFirebase';  // Ajusta la ruta según corresponda
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from 'firebase/database';
import { fetchAndDispatchUserData } from '../actions/actions';
import { FaEnvelope, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa'; // Importa los íconos

const translateFirebaseError = (errorCode: string) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Correo electrónico inválido.';
    case 'auth/user-disabled':
      return 'Usuario deshabilitado.';
    case 'auth/user-not-found':
      return 'Usuario no encontrado.';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.';
    case 'auth/email-already-in-use':
      return 'El correo electrónico ya está en uso.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil.';
    case 'auth/too-many-requests':
      return 'El acceso a esta cuenta ha sido temporalmente deshabilitado debido a muchos intentos fallidos de inicio de sesión. Puede restablecer su contraseña o intentar nuevamente más tarde.';
    default:
      return 'Error desconocido. Por favor, inténtelo de nuevo.';
  }
}

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad de contraseña
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [userType, setUserType] = useState('cliente'); // Estado para el tipo de usuario
  const [phoneNumber, setPhoneNumber] = useState(''); // Estado para el número de celular
  const firebase = useFirebase();  // Usa el contexto de Firebase
  const navigate = useNavigate();  // Instancia de useNavigate
  const dispatch = useDispatch();  // Inicializa dispatch aquí

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(firebase.auth, email, password);
      const user = userCredential.user;
      const db = getDatabase(firebase.app);
      const userTypeValue = userType === 'conductor' ? 'driver' : 'customer';
      await updateProfile(user, {
        displayName: userTypeValue,
       // phoneNumber: phoneNumber,
      });
      // Agregar datos adicionales al usuario en Firebase Database
      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
        userType: userTypeValue,
        phoneNumber: phoneNumber,
      });
      dispatch(setUser({
        uid: user.uid,
        email: user.email,
        displayName: userTypeValue,
        phoneNumber: user.phoneNumber,
        usertype: userTypeValue,
      }));
      navigate('/home');  // Navegar a la página de inicio después del registro
    } catch (error: any) {
      console.error("Error registering user:", error);
      setError(translateFirebaseError(error.code));
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(firebase.auth, email, password);
      console.log("User logged in:", userCredential);
      await fetchAndDispatchUserData(userCredential.user.uid, dispatch);
      navigate('/home');
    } catch (error: any) {
      console.error("Error logging in:", error);
      setError(translateFirebaseError(error.code));
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: `url(${fondologin})` }}
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-white bg-opacity-40 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 rounded-2xl"
          />
        </div>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="mt-8 space-y-6">
          <div className="rounded-2xl shadow-sm">
            {isRegistering && (
              <>
                <div>
                  <label htmlFor="firstName" className="sr-only">Nombres</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                    placeholder="Nombres"
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="lastName" className="sr-only">Apellidos</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                    placeholder="Apellidos"
                  />
                </div>
                <div className="mt-3">
                  <label htmlFor="phone" className="sr-only">Número de celular</label>
                  <div className="flex">
                    <select
                      id="countryCode"
                      name="countryCode"
                      required
                      className="appearance-none rounded-l-2xl relative block w-1/4 px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                    >
                      <option value="+1">+1</option>
                      <option value="+57">+57</option>
                      {/* Agrega más códigos de país según sea necesario */}
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="appearance-none rounded-r-2xl relative block w-3/4 px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                      placeholder="Número de celular"
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label htmlFor="userType" className="sr-only">Tipo de Usuario</label>
                  <select
                    id="userType"
                    name="userType"
                    required
                    className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                    onChange={(e) => setUserType(e.target.value)}
                    value={userType}
                  >
                    <option value="conductor">Conductor</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
              </>
            )}
            <div className={isRegistering ? "mt-3 relative" : "relative"}>
              <label htmlFor="email" className="sr-only">Correo Electronico</label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-2xl relative block w-full px-4 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                placeholder="Correo Electronico"
              />
              <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="mt-3 relative">
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-2xl relative block w-full px-4 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                placeholder="Contraseña"
              />
              <div
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {isRegistering && (
              <div className="mt-3">
                <label htmlFor="confirmPassword" className="sr-only">Confirmar Contraseña</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-2xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red_treas focus:border-red_treas focus:z-10 sm:text-base"
                  placeholder="Confirmar Contraseña"
                />
              </div>
            )}
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold"><FaExclamationCircle className="inline mr-1" /> Error:</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-red_treas focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-black"
            >
              {isRegistering ? 'Registrate' : 'Iniciar Sesion'}
            </button>
          </div>
        </form>
        <div className="text-center">
          {isRegistering ? (
            <a href="#" onClick={toggleForm} className="text-sm text-bg-black hover:text-red_treas">
              Ya tienes cuenta ? <span className="text-red_treas">Inicia Sesion</span>
            </a>
          ) : (
            <a href="#" onClick={toggleForm} className="text-sm text-bg-black hover:text-red_treas">
              <span className="text-white">No tienes cuenta?</span> <span className="text-red_treas">Registrate</span>
            </a>
          )}
        </div>
        {!isRegistering && (
          <div className="text-center">
            <a href="#" className="text-sm text-bg-black hover:text-red_treas">
              ¿ Olvidaste tu contraseña ?
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
