import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: string;
  [key: string]: any;
}

interface UsersState {
  allUsers: User[];
  filteredUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  allUsers: [],
  filteredUsers: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess(state, action: PayloadAction<User[]>) {
      state.allUsers = action.payload;
      state.loading = false;
    },
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setFilteredUsers(state, action: PayloadAction<User[]>) {
      state.filteredUsers = action.payload;
    },
    addUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    addUserSuccess(state, action: PayloadAction<User>) {
      state.allUsers.push(action.payload);
      state.loading = false;
    },
    addUserFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  setFilteredUsers,
  addUserStart,
  addUserSuccess,
  addUserFailure,
} = usersSlice.actions;

export const addUser = (user: User, password: string) => async (dispatch: any) => {
  dispatch(addUserStart());
  try {
    // Aquí es donde haces la solicitud a la Cloud Function
    const response = await axios.post('https://us-central1-treasupdate.cloudfunctions.net/createUser', {
      ...user,
      password,
    });

    if (response.status === 201) {
      dispatch(addUserSuccess({ ...user, id: response.data.uid }));
      return { success: true, user: { ...user, id: response.data.uid } };
    } else {
      throw new Error('Error creating user');
    }
  } catch (error: any) {
    dispatch(addUserFailure(error.message));
    return { success: false, error: error.message };
  }
};

export default usersSlice.reducer;
