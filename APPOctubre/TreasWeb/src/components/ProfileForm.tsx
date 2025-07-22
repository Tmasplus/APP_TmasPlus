import React, { useState, useEffect } from 'react';
import ProfilePicture from './ProfilePicture';
import { RootState } from '../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { AdminProfile, UserProfile } from '../types';
import { updateUser } from '../slices/authSlice';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';

const ProfileForm: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user) as AdminProfile | UserProfile;
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(user)));
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState('');

  const [isChanged, setIsChanged] = useState(true);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    if (user) {
      setFormData(JSON.parse(JSON.stringify(user)));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSecurityCheck = async () => {
    console.log('Verificando seguridad...');
       // Mostrar mensaje de que la verificación está en proceso
       Swal.fire({
        title: 'Verificando antecedentes...',
        text: 'Este proceso puede tardar varios minutos. Por favor, espera.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Validar si es un cliente para hacer la verificación de antecedentes
        if (formData.docType && formData.verifyId) {
            try {
                // Llamar a la verificación en el backend (POST request con axios)
                const response = await axios.post('https://us-central1-treasupdate.cloudfunctions.net/getUserVerification', {
                  doc_type: formData.docType,
                  identification: formData.verifyId,
                  name: formData.firstName + " " + formData.lastName
                }, {
                    timeout: 300000 // 5 minutos de tiempo máximo para la solicitud
                });
               
                const results = response.data;

                setData(results);
                setFormData({...formData, securityData:[{antecedents: results, date: Date.now(),verifyId: formData.verifyId,doc_type: formData.docType,firstName: formData.firstName,lastName: formData.lastName}]})

            } catch (error) {
                console.error('Error en la verificación:', error);
                Swal.fire("Error", "Ha ocurrido un error en la verificación de antecedentes. Por favor, intente nuevamente.", "error");
                return; // Si hay un error, detener la ejecución
            }
        }
        const results = data
        if(results){
          Swal.close(); // Cerrar el modal de carga
          console.log(results)

        }else{
          Swal.fire("¡Error!", "La verificación de antecedentes no se ha realizado correctamente.", "error");
        }
    
  };




  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await dispatch(updateUser(formData));
      setIsLoading(false);
      if (!success) {
        MySwal.fire({
          title: '¡Éxito!',
          text: 'Tu perfil ha sido actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      setIsLoading(false);
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al actualizar tu perfil. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  return (
    <form className="grid grid-cols-2 gap-6">
      <ProfilePicture />
      <div className="col-span-2 grid grid-cols-2 gap-6">
        
        {/* Primer Nombre */}
        <label className="block">
          <span className="text-gray-700">Primer Nombre</span>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>

        {/* Segundo Nombre */}
        <label className="block">
          <span className="text-gray-700">Segundo Nombre</span>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>

        {/* Correo Electrónico */}
        <label className="block">
          <span className="text-gray-700">Correo Electrónico</span>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>

        {/* Celular */}
        <label className="block">
          <span className="text-gray-700">Celular</span>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>

        {/* Ciudad */}
        <label className="block">
          <span className="text-gray-700">Ciudad</span>
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>

        {/* Tipo de Documento */}
        <label className="block">
          <span className="text-gray-700">Tipo de Documento</span>
          <input
            type="text"
            name="docType"
            value={formData.docType || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>

        {/* Número de Documento */}
        <label className="block">
          <span className="text-gray-700">Número de Documento</span>
          <input
            type="text"
            name="verifyId"
            value={formData.verifyId || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
          />
        </label>
        <button
          type="button"
          onClick={handleSecurityCheck}
          className="mt-2 bg-red_treas text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-red-600"
        >
          Verificar Seguridad
        </button>

        {/* Campos adicionales para usuario admin */}
        {user.usertype === 'admin' && (
          <>
            <label className="block">
              <span className="text-gray-700">Business Name</span>
              <input
                type="text"
                name="bussinesName"
                value={(formData as AdminProfile).bussinesName || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Approved</span>
              <input
                type="text"
                name="approved"
                value={(formData as AdminProfile).approved ? 'Yes' : 'No'}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Blocked</span>
              <input
                type="text"
                name="blocked"
                value={(formData as AdminProfile).blocked ? 'Yes' : 'No'}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Referral ID</span>
              <input
                type="text"
                name="referralId"
                value={(formData as AdminProfile).referralId || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Reviewed</span>
              <input
                type="text"
                name="reviewed"
                value={(formData as AdminProfile).reviewed ? 'Yes' : 'No'}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Wallet Balance</span>
              <input
                type="number"
                name="walletBalance"
                value={(formData as AdminProfile).walletBalance ? (formData as AdminProfile).walletBalance.toString() : ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
              />
            </label>
          </>
        )}

        {/* Botones */}
        <div className="col-span-2 flex justify-between">
          <button type="button" className="bg-gray-200 px-4 py-2 rounded-lg invisible">Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            className={`bg-red_treas text-white px-4 py-2 rounded-lg transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} ${!isChanged && 'opacity-50 cursor-not-allowed'}`}
            disabled={isLoading || !isChanged} // Deshabilitar el botón si está cargando o no hay cambios
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
