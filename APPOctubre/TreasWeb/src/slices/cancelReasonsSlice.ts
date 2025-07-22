// src/slices/cancelReasonsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDatabase, ref, get } from 'firebase/database';
import { AppDispatch, RootState } from '../store/store';

interface CancelReason {
  id: string;
  reason: string;
}

interface CancelReasonsState {
  cancelReasons: CancelReason[];
  loading: boolean;
  error: string | null;
}

const initialState: CancelReasonsState = {
  cancelReasons: [],
  loading: false,
  error: null,
};

const cancelReasonsSlice = createSlice({
  name: 'cancelReasons',
  initialState,
  reducers: {
    fetchCancelReasonsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCancelReasonsSuccess(state, action: PayloadAction<CancelReason[]>) {
      state.loading = false;
      state.cancelReasons = action.payload;
    },
    fetchCancelReasonsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchCancelReasonsStart,
  fetchCancelReasonsSuccess,
  fetchCancelReasonsFailure,
} = cancelReasonsSlice.actions;

export const fetchCancelReasons = () => async (dispatch: AppDispatch) => {
  dispatch(fetchCancelReasonsStart());
  try {
    const db = getDatabase();
    const cancelReasonsRef = ref(db, 'cancel_reason');
    const snapshot = await get(cancelReasonsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const cancelReasonsArray = Object.keys(data).map((key) => ({
        id: key,
        reason: data[key],
      }));
      dispatch(fetchCancelReasonsSuccess(cancelReasonsArray));
    } else {
      dispatch(fetchCancelReasonsSuccess([]));
    }
  } catch (error: any) {
    dispatch(fetchCancelReasonsFailure(error.message));
  }
};

export const selectCancelReasons = (state: RootState) => state.cancelReasons;

export default cancelReasonsSlice.reducer;
