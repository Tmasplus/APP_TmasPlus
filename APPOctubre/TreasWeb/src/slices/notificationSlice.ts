import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabase, ref, onValue, push, remove } from 'firebase/database';

interface Notification {
  id?: string;
  body: string;
  createdAt: number;
  devicetype: string;
  title: string;
  usertype: string;
}

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

// Acción para obtener notificaciones en tiempo real
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    const db = getDatabase();
    const notificationsRef = ref(db, 'notifications');
    return new Promise<Notification[]>((resolve, reject) => {
      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const notifications = Object.keys(data).map((key) => ({
            ...data[key],
            id: key,
          }));
          resolve(notifications);
        } else {
          reject(rejectWithValue('No notifications found'));
        }
      });
    });
  }
);

// Acción para agregar una nueva notificación
export const addNotification = createAsyncThunk(
  'notifications/addNotification',
  async (newNotification: Notification, { rejectWithValue }) => {
    const db = getDatabase();
    const notificationsRef = ref(db, 'notifications');
    try {
      await push(notificationsRef, newNotification);
      return newNotification;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Acción para eliminar una notificación
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id: string, { rejectWithValue }) => {
    const db = getDatabase();
    const notificationRef = ref(db, `notifications/${id}`);
    try {
      await remove(notificationRef);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Notification
      .addCase(addNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications.push(action.payload);
      })
      .addCase(addNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = state.notifications.filter(
          (notification) => notification.id !== action.payload
        );
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default notificationsSlice.reducer;