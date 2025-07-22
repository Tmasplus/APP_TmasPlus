// src/slices/tollsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface Toll {
  id: string;
  name: string;
  location: string;
}
interface TollsState {
  tolls: Toll[];
  loading: boolean;
  error: string | null;
}
const initialState: TollsState = {
  tolls: [],
  loading: false,
  error: null,
};
const tollsSlice = createSlice({
  name: 'tolls',
  initialState,
  reducers: {
    fetchTollsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTollsSuccess(state, action: PayloadAction<Toll[]>) {
      state.loading = false;
      state.tolls = action.payload;
    },
    fetchTollsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
export const { fetchTollsStart, fetchTollsSuccess, fetchTollsFailure } = tollsSlice.actions;
export default tollsSlice.reducer;