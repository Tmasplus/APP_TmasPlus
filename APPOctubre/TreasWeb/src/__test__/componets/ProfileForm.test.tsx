import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ProfileForm from '../../components/ProfileForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, * as authActions from '../../slices/authSlice';
import axios from 'axios';
import Swal from 'sweetalert2';

jest.mock('axios');
jest.mock('sweetalert2');

// Crear la tienda con el reducer real
const initialState = {
  auth: {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '1234567890',
      city: 'City',
      docType: 'ID',
      verifyId: '123456',
      usertype: 'customer',
    },
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: initialState,
});

describe('ProfileForm', () => {
  it('renders ProfileForm without crashing', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ProfileForm />
      </Provider>
    );

    expect(getByText('Primer Nombre')).toBeInTheDocument();
  });

  it('actualiza los campos del formulario correctamente', () => {
    const { getByLabelText } = render(
      <Provider store={store}>
        <ProfileForm />
      </Provider>
    );

    const firstNameInput = getByLabelText('Primer Nombre') as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    expect(firstNameInput.value).toBe('Jane');
  });

  it('llama a handleSave al hacer clic en el botón Guardar', async () => {
    // Espía y mockea la implementación de updateUser
    jest.spyOn(authActions, 'updateUser').mockImplementation(() => async () => {});

    const { getByText } = render(
      <Provider store={store}>
        <ProfileForm />
      </Provider>
    );

    const saveButton = getByText('Guardar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(authActions.updateUser).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
