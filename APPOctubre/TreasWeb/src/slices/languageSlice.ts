import { createSlice } from '@reduxjs/toolkit';
import { getDatabase, ref, onValue } from 'firebase/database';

interface LanguageState {
  languages: any[];
  loading: boolean;
  error: string | null;
}

const initialState: LanguageState = {
  languages: [],
  loading: false,
  error: null,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
    },
    setLanguages(state, action) {
      state.languages = action.payload;
      state.loading = false;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoading, setLanguages, setError } = languageSlice.actions;

export const fetchLanguages = () => (dispatch: any) => {
  dispatch(setLoading());
  const db = getDatabase();
  const languagesRef = ref(db, 'languages');

  onValue(
    languagesRef,
    (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const languagesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        dispatch(setLanguages(languagesArray));
      } else {
        dispatch(setLanguages([]));
      }
    },
    (error) => {
      dispatch(setError(error.message));
    }
  );
};

export default languageSlice.reducer;
