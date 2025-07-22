import { createSlice } from '@reduxjs/toolkit';
import { getDatabase, ref, onValue } from 'firebase/database';

interface ComplainState {
  complains: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ComplainState = {
  complains: [],
  loading: false,
  error: null,
};

const complainSlice = createSlice({
  name: 'complain',
  initialState,
  reducers: {
    fetchComplainsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchComplainsSuccess(state, action) {
      state.loading = false;
      state.complains = action.payload;
    },
    fetchComplainsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchComplainsStart,
  fetchComplainsSuccess,
  fetchComplainsFailure,
} = complainSlice.actions;

export const fetchComplains = () => (dispatch: any) => {
  dispatch(fetchComplainsStart());

  const db = getDatabase();
  const complainRef = ref(db, 'complain');

  onValue(
    complainRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const complainsArray = Object.keys(data).map((key) => ({
          ...data[key],
          id: key,
        }));
        dispatch(fetchComplainsSuccess(complainsArray));
      } else {
        dispatch(fetchComplainsSuccess([]));
      }
    },
    (error) => {
      dispatch(fetchComplainsFailure(error.message));
    }
  );
};

export default complainSlice.reducer;
