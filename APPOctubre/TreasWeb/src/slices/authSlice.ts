import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../interfaces/types'; // Ajusta la ruta si es necesario
import { getDatabase, ref, update, remove, get } from "firebase/database";
import { AppDispatch } from '../store/store';
import { getAuth, deleteUser as firebaseDeleteUser } from "firebase/auth";

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  users: any[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  users: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUserSuccess(state, action: PayloadAction<any>) {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    updateUserWithoutAuthSuccess(state, action: PayloadAction<any>) {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUserSuccess(state, action: PayloadAction<string>) {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
  },
});

export const { setUser, clearUser, updateUserSuccess, updateUserWithoutAuthSuccess, deleteUserSuccess } = authSlice.actions;

export const updateUser = (user: any) => async (dispatch: AppDispatch) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${user.uid || user.id}`);

  try {
    // Verificar si el UID existe en la base de datos
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      console.error("User not found in the database.");
      return true; // Indica fallo porque el usuario no existe
    }

    // Agregar el campo updatedFrom antes de actualizar
    const updatedUser = {
      ...user,
      updatedFrom: "NEW_Web"
    };

    // Proceder a actualizar si el usuario existe
    await update(userRef, updatedUser);
    dispatch(updateUserSuccess(updatedUser));
    dispatch(fetchUserData(user.uid || user.id));
    return false; // Indica éxito
  } catch (error) {
    console.error("Error updating user:", error);
    return true; // Indica fallo
  }
};

export const updateUserWithoutAuth = (user: any) => async (dispatch: AppDispatch) => {
  console.log("Iniciando actualización de usuario sin autenticación...");
  const db = getDatabase();
  const userRef = ref(db, `users/${user.uid || user.id}`);
  console.log("Referencia de usuario obtenida:", userRef);

  try {
    console.log("Verificando si el UID existe en la base de datos...");
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
      console.error("Usuario no encontrado en la base de datos.");
      return true; // Indica fallo porque el usuario no existe
    }
    console.log("Usuario encontrado en la base de datos.");

    // Agregar el campo updatedFrom antes de actualizar
    const updatedUser = {
      ...user,
      updatedFrom: "NEW_Web"
    };
    console.log("Usuario actualizado con el campo 'updatedFrom':", updatedUser);

    // Proceder a actualizar si el usuario existe
    await update(userRef, updatedUser);
    console.log("Usuario actualizado en la base de datos.");
    dispatch(updateUserWithoutAuthSuccess(updatedUser));
    console.log("Acción updateUserWithoutAuthSuccess despachada.");
    return false; // Indica éxito
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    return true; // Indica fallo
  }
};

export const deleteUser = (userId: string) => async (dispatch: AppDispatch) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  try {
    await remove(userRef);
    dispatch(deleteUserSuccess(userId));
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const fetchUserData = (uid: string) => {
  return (dispatch: AppDispatch) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${uid}`);
    
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        dispatch(setUser(userData));
      } else {
        console.error('No user data found!');
      }
    }).catch((error) => {
      console.error("Error fetching user data:", error);
    });
  };
};

export default authSlice.reducer;
