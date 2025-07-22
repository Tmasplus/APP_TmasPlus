import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../slices/authSlice'; // Ajusta la ruta si es necesario
import carTypesReducer from '../slices/carTypesSlice'; // Ajusta la ruta si es necesario
import usersReducer from '../slices/usersSlice';
import bookingReducer from '../slices/bookingSlice';
import promosReducer from '../slices/promosSlice'; // Nuevo slice de promos
import complainReducer from '../slices/complainSlice'; // Importar el nuevo slice
import cancelReasonsReducer from '../slices/cancelReasonsSlice'; // Importa el nuevo slice
import walletReducer from '../slices/walletSlice';
import settingsReducer from '../slices/settings';
  import languageReducer from '../slices/languageSlice'
  import notificationsReducer from '../slices/notificationSlice'

import chatReducer from '../slices/chatSlice';

import tollsReducer from '../slices/tollsSlice'
const authPersistConfig = {
  key: 'auth',
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    carTypes: carTypesReducer,
    users: usersReducer,
    tolls: tollsReducer,
    booking: bookingReducer,
    promos: promosReducer, 
    complain: complainReducer, // Agregar el nuevo slice al store
    cancelReasons: cancelReasonsReducer, // Agrega el nuevo slice al store
    wallet: walletReducer,
    settings: settingsReducer,
    language: languageReducer, // Añádelo aquí
    notifications: notificationsReducer,
    chat: chatReducer,




    
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
