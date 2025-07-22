import { AppDispatch } from '../store/store';
import { getDatabase, ref, onValue, update, remove, push, set } from 'firebase/database'; // Asegúrate de importar 'set'
import { app } from '../config/FirebaseConfig'; // Ajusta la ruta según corresponda
import { fetchPromosFailure, fetchPromosStart, fetchPromosSuccess } from '../slices/promosSlice';
import { Promo } from '../interfaces/Promos';

export const fetchPromos = () => async (dispatch: AppDispatch) => {
    dispatch(fetchPromosStart());

    const db = getDatabase(app);
    const promosRef = ref(db, 'promos');

    onValue(promosRef, (snapshot) => {
        const data = snapshot.val();
        const promosArray: Promo[] = Object.keys(data).map(uid => ({ uid, ...data[uid] }));
        dispatch(fetchPromosSuccess(promosArray));
    }, (error) => {
        dispatch(fetchPromosFailure(error.message));
    });
};

export const updatePromo = (promo: Promo) => async (dispatch: AppDispatch) => {
    dispatch(fetchPromosStart());

    const db = getDatabase(app);
    const promoRef = ref(db, `promos/${promo.uid}`);

    try {
        await update(promoRef, promo);
        dispatch(fetchPromos()); // Recargar la lista de promos después de actualizar una
    } catch (error: any) {
        dispatch(fetchPromosFailure(error.message));
    }
};

export const deletePromo = (promoUid: string) => async (dispatch: AppDispatch) => {
    dispatch(fetchPromosStart());

    const db = getDatabase(app);
    const promoRef = ref(db, `promos/${promoUid}`);  // Aquí se referencia correctamente a la promoción específica

    try {
        console.log("Eliminando promoción con ID:", promoUid);
        await remove(promoRef);  // Elimina solo la promoción específica
        console.log("Promoción eliminada correctamente");
        dispatch(fetchPromos());  // Recargar la lista de promos después de eliminar una
    } catch (error: any) {
        console.error("Error al eliminar la promoción:", error.message);
        dispatch(fetchPromosFailure(error.message));
    }
};


export const createPromo = (promo: Promo) => async (dispatch: AppDispatch) => {
    dispatch(fetchPromosStart());

    const db = getDatabase(app);
    const promosRef = ref(db, 'promos');

    try {
        const newPromoRef = push(promosRef); // Aquí obtenemos la nueva referencia
        await set(newPromoRef, promo); // Aquí usamos el método set() con la referencia correcta
        dispatch(fetchPromos()); // Recargar la lista de promos después de crear una nueva
    } catch (error: any) {
        dispatch(fetchPromosFailure(error.message));
    }
};
