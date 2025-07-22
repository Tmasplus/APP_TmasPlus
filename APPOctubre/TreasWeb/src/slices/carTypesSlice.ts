// src/slices/carTypesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CarType {
  id: string;
  name: string;
  // Añade otros campos según sea necesario
}

interface CarTypesState {
  carTypes: CarType[];
  loading: boolean;
  error: string | null;
}

const initialState: CarTypesState = {
  carTypes: [],
  loading: false,
  error: null,
};

const carTypesSlice = createSlice({
  name: 'carTypes',
  initialState,
  reducers: {
    fetchCarTypesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCarTypesSuccess(state, action: PayloadAction<CarType[]>) {
      state.loading = false;
      state.carTypes = action.payload;
    },
    fetchCarTypesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchCarTypesStart, fetchCarTypesSuccess, fetchCarTypesFailure } = carTypesSlice.actions;
export default carTypesSlice.reducer;
