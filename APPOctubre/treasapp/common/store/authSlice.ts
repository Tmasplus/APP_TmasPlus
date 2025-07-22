import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from './types';

interface AuthState {
  isAuthenticated: boolean;
  isEmailVerified: boolean; // Estado para verificar si el email ha sido verificado
  user: UserProfile | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isEmailVerified: false, // Inicialmente no verificado
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserProfile>) {
      // Verificar si el email está verificado antes de autenticar
      if (action.payload.isEmailVerified) {
        state.isAuthenticated = true;
        state.isEmailVerified = true;
        state.user = action.payload;
      } else {
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.user = action.payload; // Mantener la información del usuario pero no autenticarlo
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.isEmailVerified = false;
      state.user = null;
    },
    verifyEmail(state) {
      // Actualizar el estado cuando el email sea verificado
      state.isEmailVerified = true;
      if (state.user) {
        state.isAuthenticated = true; // Ahora se puede autenticar al usuario
      }
    },
  },
});

export const { login, logout, verifyEmail } = authSlice.actions;
export default authSlice.reducer;