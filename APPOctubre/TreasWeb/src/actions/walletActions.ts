// src/actions/walletActions.ts

import { Dispatch } from 'redux';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../config/FirebaseConfig';
import { fetchWalletStart, fetchWalletSuccess, fetchWalletFailure } from '../slices/walletSlice';

export const listenToWalletHistory = (uid: string) => {
  return (dispatch: Dispatch) => {
    dispatch(fetchWalletStart());

    const db = getDatabase(app);
    const historyRef = ref(db, `walletHistory/${uid}`);

    let history: any[] = [];

    onValue(historyRef, (historySnapshot) => {
      history = [];
      historySnapshot.forEach((childSnapshot) => {
        history.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      dispatch(fetchWalletSuccess(history));
    }, (error) => {
      dispatch(fetchWalletFailure(error.message));
    });
  };
};
