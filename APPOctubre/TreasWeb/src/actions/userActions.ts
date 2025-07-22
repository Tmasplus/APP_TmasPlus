import { Dispatch } from 'redux';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../config/FirebaseConfig';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, setFilteredUsers } from '../slices/usersSlice';

export const fetchUsers = () => {
  return (dispatch: Dispatch) => {
    dispatch(fetchUsersStart());
    try {
      const db = getDatabase(app);
      const usersRef = ref(db, 'users');

      // Usar onValue para escuchar los cambios en tiempo real
      onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const users = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));
          dispatch(fetchUsersSuccess(users));

          // Filtrar usuarios con usertype "company"
          const filteredUsers = users.filter(user => user.usertype === "company");
          dispatch(setFilteredUsers(filteredUsers));
        } else {
          dispatch(fetchUsersSuccess([]));
          dispatch(setFilteredUsers([]));
        }
      }, (error) => {
        dispatch(fetchUsersFailure(error.message));
      });
    } catch (error: any) {
      dispatch(fetchUsersFailure(error.message));
    }
  };
};
