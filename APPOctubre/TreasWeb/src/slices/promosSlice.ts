import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Promo } from '../interfaces/Promos';

interface PromosState {
  promos: Promo[];
  loading: boolean;
  error: string | null;
}

const initialState: PromosState = {
  promos: [],
  loading: false,
  error: null,
};

const promosSlice = createSlice({
  name: 'promos',
  initialState,
  reducers: {
    fetchPromosStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPromosSuccess(state, action: PayloadAction<Promo[]>) {
      state.promos = action.payload;
      state.loading = false;
    },
    fetchPromosFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchPromosStart, fetchPromosSuccess, fetchPromosFailure } = promosSlice.actions;

export default promosSlice.reducer;
