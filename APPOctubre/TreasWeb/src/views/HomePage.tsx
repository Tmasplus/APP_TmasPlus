import React, { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { CarType } from '../interfaces/CarType';
import androidLogo from '../assets/Android.png'; // Ajusta la ruta según tu estructura de proyecto
import iosLogo from '../assets/iOS.png'; // Ajusta la ruta según tu estructura de proyecto
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import imgSource from "../assets/logoNegro.png";
import EditModal from '../components/EditCategoryModal'; // Asegúrate de crear este componente
import Loader from '../components/Loader';
import NewCategoryModal from '../components/NewCategoryModal'; // Importar el nuevo componente

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState<CarType | null>(null); // Nuevo estado para almacenar el CarType seleccionado
  const navigate = useNavigate();
  const { carTypes, loading, error } = useSelector((state: RootState) => state.carTypes);
  const authState = useSelector((state: RootState) => state.auth);
  const { languages } = useSelector((state: RootState) => state.language);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false); // Estado para el nuevo modal
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  useEffect(() => {
    if (authState.user && !authState.user.securityData && authState.user.usertype !== 'admin'&& authState.user.usertype !== 'company') {
      setIsVerificationModalOpen(true);
    }
  }, [authState.user]);

  const handleNavigateToProfile = () => {
    navigate('/userporfile');
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleAddBookingClick = (event: React.MouseEvent<HTMLButtonElement>, carType: CarType) => {
    event.preventDefault();
    const userType = authState.user.usertype;

    if (userType === 'admin') {
      setSelectedCarType(carType); // Almacenar el CarType seleccionado
      setIsModalOpen(true);
    } else if (userType !== 'driver' && userType !== 'customer') {
      navigate('/addbooking');
    } else {
      console.log("Navegación bloqueada para los roles driver y customer");
    }
  };
  const handleOpenNewCategoryModal = () => {
    setIsNewCategoryModalOpen(true);
  };

  const handleCloseNewCategoryModal = () => {
    setIsNewCategoryModalOpen(false);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCarType(null); // Restablecer el estado del CarType seleccionado
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="sticky top-0 bg-slate-50 z-10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-black">Tipos de servicios</h1>
          {authState.user.usertype === 'admin' && (
            <button
              onClick={handleOpenNewCategoryModal}
              className="bg-red_treas text-white py-2 px-4 rounded-lg hover:bg-red-950 transition-colors"
            >
              Crear Nueva Categoría
            </button>
          )}
        </div>
      </header>
      <main className="flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <img className="rounded-full w-48 shadow-2xl mx-auto" src={imgSource} alt="LogoTreas" />
          <p className="text-2xl font-semibold">SOLUCIONES TECNOLOGICAS DE MOVILIDAD</p>
          <p className="text-gray-600 mt-2">Te invitamos a ser parte de este Cambio Social</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          {carTypes.map((carType: CarType) => (
            <div key={carType.id} className="bg-white p-6 rounded-lg shadow-2xl w-80 transition-transform hover:scale-105 hover:shadow-lg m-4 cursor-pointer">
              <div className="flex justify-center mb-4">
                <img src={carType.image} alt={`${carType.name} Icon`} className="w-24 h-24" />
              </div>
              <p className="text-center text-xl font-semibold">{carType.name}</p>
              <h2 className="text-center text-4xl font-bold">{carType.typeService}</h2>
              <ul className="mt-4 mb-6 space-y-2">
                {carType.options.map((option, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-red_treas mr-2"><FaCheckCircle /></span> {option.description}
                  </li>
                ))}
              </ul>
              <p className="text-center text-gray-600">{carType.extra_info}</p>
              <button
                onClick={(event) => handleAddBookingClick(event, carType)} // Pasar el CarType actual
                className="bg-red_treas text-white py-2 px-4 rounded-lg w-full mt-4"
              >
                ¡SOLICITA TU TREAS!
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
          <a href="https://treasapp.page.link/app" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-lg shadow-2xl w-80 transition-transform hover:scale-105 hover:shadow-lg m-4 cursor-pointer">
            <div className="flex justify-center mb-4">
              <img src={androidLogo} alt="Android" className="w-32 h-32" />
            </div>
          </a>
          <a href="https://treasapp.page.link/app" target="_blank" rel="noopener noreferrer" className="bg-white p-6 rounded-lg shadow-2xl w-80 transition-transform hover:scale-105 hover:shadow-lg m-4 cursor-pointer">
            <div className="flex justify-center mb-4">
              <img src={iosLogo} alt="iOS" className="w-32 h-32" />
            </div>
          </a>
        </div>
      </main>
      <footer className="text-center mt-12">
        <p className="text-gray-500">Copyright © 2016 - 2024 TREASAPP - Todos los derechos reservados.</p>
      </footer>
      {isModalOpen && selectedCarType && (
        <EditModal onClose={handleCloseModal} categoryData={selectedCarType} />
      )}
       {isNewCategoryModalOpen && (
        <NewCategoryModal onClose={handleCloseNewCategoryModal} />
      )}
       
   {isVerificationModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
    <div className="bg-white rounded-xl shadow-2xl w-96 max-w-full p-8 relative">
      {/* Cerrar Modal */}
      <button
        onClick={handleCloseModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Contenido del Modal */}
      <div className="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 18h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Verifica tus datos de seguridad
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Para continuar, por favor ingresa a tu perfil y verifica tu información.
        </p>
        <button
          onClick={handleNavigateToProfile}
          className="bg-red_treas hover:bg-red-600 transition duration-300 text-white font-semibold py-3 px-6 rounded-lg w-full"
        >
          Ir a Perfil
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default HomePage;
