import { createSlice } from '@reduxjs/toolkit';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { AppDispatch } from '../store/store';  // Asegúrate de tener el tipo correcto de dispatch

interface SettingsState {
  data: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SettingsState = {
  data: null,
  status: 'idle',
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    settingsLoading: (state) => {
      state.status = 'loading';
    },
    settingsReceived: (state, action) => {
      state.status = 'succeeded';
      state.data = action.payload;
    },
    settingsFailed: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    settingUpdated: (state, action) => {
      if (state.data) {
        state.data[action.payload.key] = action.payload.value;
      }
    },
  },
});

export const { settingsLoading, settingsReceived, settingsFailed, settingUpdated } = settingsSlice.actions;

export const fetchSettings = () => (dispatch: AppDispatch) => {
  dispatch(settingsLoading());
  
  const db = getDatabase();
  const settingsRef = ref(db, 'settings');

  onValue(settingsRef, (snapshot) => {
    const data = snapshot.val();
    dispatch(settingsReceived(data));
  }, (error) => {
    dispatch(settingsFailed(error.message));
  });
};

export const updateSetting = (key: string, value: any) => (dispatch: AppDispatch) => {
    const db = getDatabase();
    const settingsRef = ref(db, `settings`);
  
    update(settingsRef, { [key]: value })  // Se asegura de que solo el valor específico se actualice
      .then(() => {
        dispatch(settingUpdated({ key, value }));
      })
      .catch((error) => {
        console.error("Error updating setting:", error);
        dispatch(settingsFailed(error.message));
      });
  };
export default settingsSlice.reducer;
