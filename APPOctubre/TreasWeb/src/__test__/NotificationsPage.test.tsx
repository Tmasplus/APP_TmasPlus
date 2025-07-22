import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationsPage from '../views/NotificationsPage';
import notificationsReducer from '../slices/notificationSlice';
import usersReducer from '../slices/usersSlice';

// Import the entire module to access the mocked functions
import * as notificationSlice from '../slices/notificationSlice';

// Mock only the action creators
jest.mock('../slices/notificationSlice', () => {
  const originalModule = jest.requireActual('../slices/notificationSlice');

  return {
    __esModule: true,
    ...originalModule,
    fetchNotifications: jest.fn(() => (dispatch) => {
      // Mocked implementation
      dispatch({
        type: 'notifications/fetchNotificationsSuccess',
        payload: [], // Provide mock notifications data
      });
    }),
    addNotification: jest.fn(() => (dispatch) => {
      dispatch({
        type: 'notifications/addNotificationSuccess',
        payload: { /* Mock notification data */ },
      });
    }),
  };
});

describe('NotificationsPage', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        notifications: notificationsReducer,
        users: usersReducer,
      },
      // No need to specify middleware here; configureStore includes redux-thunk by default
      preloadedState: {
        notifications: {
          notifications: [],
          loading: false,
          error: null,
        },
        users: {
          allUsers: [],
        },
      },
    });

    // Clear all instances and calls to the mocked functions
    jest.clearAllMocks();
  });

  test('renders NotificationsPage without crashing', () => {
    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    expect(screen.getByText('Notificaciones')).toBeInTheDocument();
  });

  test('fetches notifications on mount', () => {
    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    expect(notificationSlice.fetchNotifications).toHaveBeenCalled(); // Check if fetchNotifications was called
  });

  test('opens modal when "Nueva Notificación" button is clicked', () => {
    render(
      <Provider store={store}>
        <NotificationsPage />
      </Provider>
    );

    fireEvent.click(screen.getByText('Nueva Notificación')); // Simulate button click
    expect(screen.getByText('Crear Notificación')).toBeInTheDocument();
  });
});
