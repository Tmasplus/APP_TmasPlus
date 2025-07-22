import React from 'react';
import { render } from '@testing-library/react';
import ProfilePage from '../views/ProfilePage';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);
const store = mockStore({
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
});

describe('ProfilePage', () => {
  it('renders ProfilePage without crashing', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    expect(getByText('Mi Perfil')).toBeInTheDocument();
  });

  it('renders ProfileForm component', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );

    expect(getByText('Primer Nombre')).toBeInTheDocument();
  });
});