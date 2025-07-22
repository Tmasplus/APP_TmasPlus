import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplains } from '../slices/complainSlice';
import { RootState } from '../store/store';
import Papa from 'papaparse';
import { Switch } from '@headlessui/react';
import AddComplainForm from '../components/AddComplainForm'; // Importa el formulario de añadir quejas
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as databaseRef, update } from "firebase/database";

const ComplaintsView: React.FC = () => {
  const dispatch = useDispatch();
  const { complains, loading, error } = useSelector((state: RootState) => state.complain);
  const user = useSelector((state: RootState) => state.auth.user);

  const [selectedComplain, setSelectedComplain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [details, setDetails] = useState('');
  const [fromResponse, setFromResponse] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchComplains());
  }, [dispatch]);

  const exportToCSV = () => {
    const csvData = complains.map((complain) => ({
      'Fecha de la Queja': new Date(complain.complainDate).toLocaleString(),
      'Descripción': complain.body,
      'Usuario': complain.email,
      'Nombre': complain.firstName,
      'Estado': complain.check ? 'Resuelto' : 'Pendiente',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'complains.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSwitchChange = (complainId: string, currentCheck: boolean) => {
    const db = getDatabase();
    const complainRef = databaseRef(db, `complain/${complainId}`);
    const newCheckStatus = !currentCheck;

    // Update the check status in the database
    update(complainRef, { check: newCheckStatus })
      .then(() => {
        console.log(`Complain ID: ${complainId} updated to ${newCheckStatus ? 'Resuelto' : 'Pendiente'}`);
      })
      .catch((error) => {
        console.error('Error updating complain:', error);
      });
  };

  const getCheckColor = (check: boolean) => {
    return check ? 'text-green-500 bg-red-300' : 'text-white bg-gray-500';
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && selectedComplain) {
      const storage = getStorage();
      const fileRef = storageRef(storage, `complains/${selectedComplain.id}`);

      try {
        const snapshot = await uploadBytes(fileRef, file);
        console.log(`Imagen subida para la queja ID: ${selectedComplain.id}`, snapshot);

        // Obtener la URL de descarga de la imagen
        const downloadURL = await getDownloadURL(fileRef);
        console.log(`URL de descarga: ${downloadURL}`);

        // Actualizar el campo imageResponse en Realtime Database
        const db = getDatabase();
        const complainRef = databaseRef(db, `complain/${selectedComplain.id}`);
        await update(complainRef, { imageResponse: downloadURL });

        // Actualizar el estado local
        setSelectedComplain((prevComplain) => ({
          ...prevComplain,
          imageResponse: downloadURL,
        }));

        setImagePreview(downloadURL);

        console.log(`Campo imageResponse actualizado para la queja ID: ${selectedComplain.id}`);
      } catch (error) {
        console.error('Error subiendo la imagen:', error);
        console.log('Detalles del error:', error.message);
      }
    } else {
      console.log('No se seleccionó ningún archivo para subir.');
    }
  };

  const handleDetailsChange = (event) => {
    const value = event.target.value;
    setDetails(value);
  };

  const handleDetailsSubmit = () => {
    if (selectedComplain) {
      const db = getDatabase();
      const complainRef = databaseRef(db, `complain/${selectedComplain.id}`);

      update(complainRef, { details, fromResponse })
        .then(() => {
          console.log(`Campo details actualizado para la queja ID: ${selectedComplain.id} con valor: ${details}`);
          setIsModalOpen(false);
        })
        .catch((error) => {
          console.error('Error actualizando details:', error);
        });
    }
  };

  const openModal = (complain) => {
    setSelectedComplain(complain);
    setDetails(complain.details || '');
    setFromResponse(complain.fromResponse || '');
    setImagePreview(complain.imageResponse || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Ordenar las quejas por fecha de queja (complainDate) en orden descendente
  const sortedComplains = complains.slice().sort((a, b) => b.complainDate - a.complainDate);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {user.usertype === 'admin' ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Historial de Quejas</h1>
            <button
              onClick={exportToCSV}
              className="bg-red_treas hover:bg-red-950 text-white px-4 py-2 rounded-lg"
            >
              Exportar
            </button>
          </div>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">Fecha de la Queja</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">Usuario</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acciones</th>
                <th className="p-2">Imagen</th>
                <th className="p-2">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {sortedComplains.map((complain) => (
                <tr key={complain.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{new Date(complain.complainDate).toLocaleString()}</td>
                  <td className="p-2">{complain.subject}</td>
                  <td className="p-2">{complain.body}</td>
                  <td className="p-2">{complain.email}</td>
                  <td className="p-2">{complain.firstName}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-white ${getCheckColor(complain.check)}`}>
                      {complain.check ? 'Resuelto' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-2">
                    <Switch
                      checked={complain.check}
                      onChange={() => handleSwitchChange(complain.id, complain.check)}
                      className={`${complain.check ? 'bg-red-300' : 'bg-stone-500'} relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">Toggle check</span>
                      <span
                        className={`${complain.check ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform bg-white rounded-full`}
                      />
                    </Switch>
                  </td>
                  <td className="p-2">
                    <input type="file" onChange={(event) => handleImageUpload(event, complain.id)} />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => openModal(complain)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <AddComplainForm />
      )}

      {isModalOpen && selectedComplain && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">Detalles de la Queja</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Detalles:</label>
              <textarea
                className="w-full p-2 border rounded mb-4"
                rows={5}
                placeholder="Escribe los detalles aquí..."
                value={details}
                onChange={handleDetailsChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Modo de Contacto:</label>
              <select
                className="w-full p-2 border rounded"
                value={fromResponse}
                onChange={(e) => setFromResponse(e.target.value)}
              >
                <option value="" disabled>Seleccionar</option>
                <option value="Correo">Correo</option>
                <option value="Whatsapp">Whatsapp</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="mb-4">
          
              {imagePreview && (
                <div className="mt-2">
                  <a href={imagePreview} target="_blank" rel="noopener noreferrer">
                    <img src={imagePreview} alt="Imagen de la queja" className="w-32 h-32 object-cover" />
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-4 rounded mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleDetailsSubmit}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsView;
