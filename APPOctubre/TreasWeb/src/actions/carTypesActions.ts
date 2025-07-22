// src/actions/carTypesActions.ts
import { getDatabase, ref, push,update,get } from 'firebase/database';
import { Dispatch } from 'redux';
import { fetchCarTypesStart, fetchCarTypesSuccess, fetchCarTypesFailure } from '../slices/carTypesSlice';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export const fetchCarTypes = () => async (dispatch: Dispatch) => {
  dispatch(fetchCarTypesStart());
  
  const db = getDatabase();
  const carTypesRef = ref(db, 'cartypes');

  try {
    const snapshot = await get(carTypesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const carTypesArray = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
      dispatch(fetchCarTypesSuccess(carTypesArray));
    } else {
      dispatch(fetchCarTypesSuccess([]));
    }
  } catch (error) {
    dispatch(fetchCarTypesFailure("error"));
  }
};
export const updateCarType = (id: string, updatedData: any) => async (dispatch: Dispatch) => {
  dispatch(fetchCarTypesStart());

  const db = getDatabase();
  const carTypeRef = ref(db, `cartypes/${id}`);

  try {
    await update(carTypeRef, updatedData);
    dispatch(fetchCarTypes());  // Vuelve a cargar los datos para actualizar el estado
  } catch (error) {
    dispatch(fetchCarTypesFailure("Error updating car type"));
  }
};
export const addNewCarType = (newCarType: any, file: File | null) => async (dispatch: Dispatch) => {
  dispatch(fetchCarTypesStart());

  const db = getDatabase();
  const carTypesRef = ref(db, 'cartypes');
  const storage = getStorage();

  try {
    // Crear una nueva entrada en Firebase y obtener su UID
    const newCarTypeRef = push(carTypesRef);
    const newCarTypeKey = newCarTypeRef.key;

    if (file && newCarTypeKey) {
      // Subir la imagen al Storage con el nombre del UID
      const storagePath = `cartypes/${newCarTypeKey}.jpg`;
      const imageRef = storageRef(storage, storagePath);

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      // Asigna la URL de la imagen al campo `image` del carType
      newCarType.image = downloadURL;
    }

    // Guarda el carType en Realtime Database
    await update(newCarTypeRef, newCarType);
    dispatch(fetchCarTypes()); // Refresca los carTypes después de la inserción
  } catch (error) {
    dispatch(fetchCarTypesFailure("Error adding new car type"));
  }
};