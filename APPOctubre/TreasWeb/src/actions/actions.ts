import { getDatabase, ref, get } from "firebase/database";
import { Dispatch } from "redux";
import { setUser } from '../slices/authSlice';

export const fetchAndDispatchUserData = async (uid: string, dispatch: Dispatch) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${uid}`);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log("Fetched User Data:", userData); // Log de depuración

      // Despacha los datos tal cual vienen de la base de datos
      dispatch(setUser(userData));
    } else {
      console.error("No user data available");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
