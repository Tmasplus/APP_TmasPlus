import { IoMdSearch, IoIosStats, IoIosAddCircle, IoIosHome, IoIosSettings } from 'react-icons/io';
import { MdCorporateFare } from "react-icons/md";
import { AiFillRead } from "react-icons/ai";
import { FaUser } from "react-icons/fa";
import { MdChangeCircle } from "react-icons/md";
import { FaUserTie } from "react-icons/fa6";
import { FaMoneyBillAlt } from "react-icons/fa";
import { BsFillChatSquareTextFill } from "react-icons/bs";
import { RiProfileFill } from "react-icons/ri";
import { FaPoll } from "react-icons/fa";
import { BiSolidOffer } from "react-icons/bi";
import { LiaFileContractSolid } from "react-icons/lia";
import { IoNotificationsCircle } from "react-icons/io5";

import { MdDashboard, MdMenu, MdPriceChange } from 'react-icons/md';
import { BiSolidLogOut } from "react-icons/bi";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '../slices/authSlice';
import { getAuth, signOut } from "firebase/auth";
import { RootState } from '../store/store'; // Asegúrate de ajustar la ruta según corresponda
import addIcon from '../assets/36.png'; // Importa la imagen
import defaultProfileImage from '../assets/1.png'; // Añade una imagen predeterminada
import { updateUser } from '../slices/authSlice';

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  console.log(user);

  // Verificar si algún subusuario está en turno
  const isAnySubuserInTurn = user?.subusers?.some(subuser => subuser.InTurn);

  const handleLogout = () => {
    const auth = getAuth();
  
    if (user.usertype === "company") {
      // Si el usuario es de tipo "company", actualiza todos los subusers antes de hacer logout
      const updatedSubusers = user?.subusers.map(subuser => 
        subuser.InTurn ? { ...subuser, InTurn: false } : subuser
      );
  
      dispatch(updateUser({ 
        ...user, 
        subusers: updatedSubusers
      }));
    }
    localStorage.removeItem('remainingTime');
    localStorage.removeItem('activeUser');
    signOut(auth).then(() => {
      dispatch(clearUser());
      localStorage.removeItem('user'); // Limpiar el localStorage
      navigate('/login');
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };
  

  const getDisplayName = (user: any) => {
    if (user.usertype === 'company') {
      return user.bussinesName;
    } else {
      return user.firstName;
    }
  };

  const navigateToWhatsApp = () => {
    window.location.href = 'https://wa.me/message/BTQOY5GZC7REF1';
  };

  return (
    <div className={`bg-white ${isOpen ? 'w-64' : 'w-16'} m-3 h-full transition-width duration-300 ease-in-out fixed z-10 rounded-s-2xl shadow-lg flex flex-col overflow-y-auto`}>
      <div className="flex items-center justify-between p-5">
        <button onClick={toggleSidebar}>
          <MdMenu className="text-2xl text-red-700" />
        </button>
      </div>
      {isOpen && user && (
        <div className="flex items-center ml-4 mb-4 bg-white bg-opacity-30 backdrop-blur-lg p-4 rounded-lg shadow-md">
          <img src={user.profile_image || defaultProfileImage} className="w-16 h-16 rounded-full shadow-2xl" alt="Profile" />
          <div className="ml-4">
            <span className="text-black text-lg">HOLA!</span>
            <span className="text-black text-lg"> {getDisplayName(user)}</span>
          </div>
        </div>
      )}

      <ul className="flex flex-col items-center flex-grow space-y-2">
        <li className="w-full flex justify-center">
          <Link to="/home" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
            <IoIosHome className="text-xl" />
            {isOpen && <span className="ml-2 text-black group-hover:text-white">Inicio</span>}
          </Link>
        </li>
        {/*user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/dashboard" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <MdDashboard className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Tablero de Mando</span>}
            </Link>
          </li>
        )*/}

        {user?.usertype === 'company' && (
          <li className="w-full flex justify-center">
            <Link to="/shiftchanger" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <MdChangeCircle className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Cambiar Turno</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'admin' && (

          <li className="w-full flex justify-center">
            <Link to="/bookingHistory" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <IoIosStats className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Historial de Reservas</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/addbooking" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <IoIosAddCircle className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Añadir Reservas</span>}
            </Link>
          </li>
        )}
        {(user?.usertype === 'admin' || (user?.usertype === 'company' && isAnySubuserInTurn)) && (
          <li className="w-full flex justify-center">
            <Link to="/bookingCorp" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <MdCorporateFare className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Reservas Corporativas</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'company' && !isAnySubuserInTurn && (
          <li className="w-full flex justify-center">
            <span className="flex items-center w-full text-gray-400 px-3 py-2 rounded-md cursor-not-allowed">
              <MdCorporateFare className="text-xl" />
              {isOpen && <span className="ml-2 text-black">Reservas Corporativas (Bloqueado)</span>}
            </span>
          </li>
        )}
        {(user?.usertype === 'admin' || (user?.usertype === 'company' && isAnySubuserInTurn)) && (

          <li className="w-full flex justify-center">
            <Link to="/bookingdetails" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <AiFillRead className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Detalle de reserva</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'company' && !isAnySubuserInTurn && (
          <li className="w-full flex justify-center">
            <span className="flex items-center w-full text-gray-400 px-3 py-2 rounded-md cursor-not-allowed">
              <AiFillRead className="text-xl" />
              {isOpen && <span className="ml-2 text-black">Detalle de reserva (Bloqueado)</span>}
            </span>
          </li>
        )}
        {user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/billingmodule" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <FaMoneyBillAlt className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Modulo de Facturacion</span>}
            </Link>
          </li>
        )}
        {(user?.usertype === 'admin' || (user?.usertype === 'company' && isAnySubuserInTurn)) && (

          <li className="w-full flex justify-center">
            <Link to="/users" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <FaUser className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Usuarios</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'company' && !isAnySubuserInTurn && (
          <li className="w-full flex justify-center">
            <span className="flex items-center w-full text-gray-400 px-3 py-2 rounded-md cursor-not-allowed">
              <FaUser className="text-xl" />
              {isOpen && <span className="ml-2 text-black">Usuarios (Bloqueado)</span>}
            </span>
          </li>
        )}

        {user?.usertype === 'company' && isAnySubuserInTurn && user.subusers.some(subuser => subuser.InTurn && subuser.Name === "Administrador") && (
          <li className="w-full flex justify-center">
            <Link to="/officialview" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <FaUserTie className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Funcionarios</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'company'  && !user.subusers.some(subuser => subuser.InTurn && subuser.Name === "Administrador") && (
          <li className="w-full flex justify-center">
            <span className="flex items-center w-full text-gray-400 px-3 py-2 rounded-md cursor-not-allowed">
              <FaUserTie className="text-xl" />
              {isOpen && <span className="ml-2 text-black">Funcionarios (Bloqueado por Administrador)</span>}
            </span>
          </li>
        )}
        <li className="w-full flex justify-center">
          <Link to="/complaints" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
            <BsFillChatSquareTextFill className="text-xl" />
            {isOpen && <span className="ml-2 text-black group-hover:text-white">Quejas</span>}
          </Link>
        </li>


        {user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/treasoffers" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <BiSolidOffer className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Ofertas TREAS</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'driver' && (
          <li className="w-full flex justify-center">
            <Link to="/contracts" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <LiaFileContractSolid className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Contratos</span>}
            </Link>
          </li>
        )}
        {user?.usertype !== 'company' && (
          <li className="w-full flex justify-center">
            <Link to="/userporfile" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <RiProfileFill className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Perfil</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/settings" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <IoIosSettings className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Configuracion</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/tolls" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <MdPriceChange className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Peajes</span>}
            </Link>
          </li>
        )}
        {user?.usertype === 'admin' && (
          <li className="w-full flex justify-center">
            <Link to="/notifications" className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md">
              <IoNotificationsCircle className="text-xl" />
              {isOpen && <span className="ml-2 text-black group-hover:text-white">Notificaciones</span>}
            </Link>
          </li>
        )}
        <li className="w-full flex justify-center">
          <button onClick={handleLogout} className="flex items-center w-full text-red-700 hover:text-white group hover:bg-red-600 px-3 py-2 rounded-md  ">
            <BiSolidLogOut className="text-xl" />
            {isOpen && <span className="ml-2 text-black group-hover:text-white">Cerrar Sesion</span>}
          </button>
        </li>
      </ul>
      <button onClick={navigateToWhatsApp} className="flex items-center w-full text-red-700 hover:text-white group hover:bg-gray-300 px-3 py-2 rounded-full">
        <img src={addIcon} alt="Add Booking" className="text-xl" />
      </button>
    </div>
  );
};

export default Sidebar;
