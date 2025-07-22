// src/actions/tollActions.ts
import { Dispatch } from 'redux';
import { getDatabase, ref, onValue, off } from 'firebase/database'; // Importamos onValue y off para escuchar y limpiar los eventos en tiempo real
import { app } from './../config/FirebaseConfig';
import { fetchTollsStart, fetchTollsSuccess, fetchTollsFailure } from '../slices/tollsSlice';

export const fetchTolls = () => {
  return (dispatch: Dispatch) => {
    dispatch(fetchTollsStart());

    const db = getDatabase(app);
    const tollsRef = ref(db, 'tolls');

    // Usamos onValue para escuchar los cambios en tiempo real
    const listener = onValue(
      tollsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const tolls = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));
          dispatch(fetchTollsSuccess(tolls)); // Despachamos los datos actualizados en tiempo real
        } else {
          dispatch(fetchTollsSuccess([])); // Si no hay datos, se envía un array vacío
        }
      },
      (error) => {
        dispatch(fetchTollsFailure(error.message)); // En caso de error
      }
    );

    // Opcional: Devuelve una función para cancelar el listener cuando ya no sea necesario
    return () => {
      off(tollsRef, listener); // Detenemos el listener si es necesario
    };
  };
};
