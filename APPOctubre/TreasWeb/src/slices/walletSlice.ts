
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  history: any[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  history: [],
  loading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    fetchWalletStart(state) {
      state.loading = true;
    },
    fetchWalletSuccess(state, action: PayloadAction<any[]>) {
      state.history = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchWalletFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchWalletStart, fetchWalletSuccess, fetchWalletFailure } = walletSlice.actions;
export default walletSlice.reducer;
