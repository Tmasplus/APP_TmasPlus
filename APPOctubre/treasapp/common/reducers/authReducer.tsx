import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import firebase from "@/config/FirebaseConfig";

interface AuthState {
  isAuthenticated: boolean;
  user: firebase.User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: {
    flag: boolean;
    msg: string | null;
  };
  verificationId: string | null;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  usertype: string;
  // Añade otros campos del perfil según sea necesario
}

const initialState: AuthState = {
  isAuthenticated: true || null,
  user: null,
  profile: null,
  loading: false,
  error: {
    flag: false,
    msg: null,
  },
  verificationId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<firebase.User | null>) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = { flag: false, msg: null };
      } else {
        state.error = { flag: true, msg: "Autenticación fallida." };
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.profile = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (
      state,
      action: PayloadAction<{ flag: boolean; msg: string | null }>
    ) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error.flag = false;
      state.error.msg = null;
    },
    setVerificationId: (state, action: PayloadAction<string | null>) => {
      state.verificationId = action.payload;
    },
    updatePushToken: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user = {
          ...state.user,
          pushToken: action.payload,
        };
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    loadSession: (state, action: PayloadAction<firebase.User | null>) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = { flag: false, msg: null }; // Limpiar errores al cargar sesión
      } else {
        state.isAuthenticated = false;
        state.user = null;
      }
    },
  },
});

export const {
  loadSession,
  login,
  logout,
  setProfile,
  setLoading,
  setError,
  clearError,
  setVerificationId,
  updatePushToken,
  updateUserProfile,
} = authSlice.actions;

export default authSlice.reducer;