import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { fetchNotifications, addNotification } from '../slices/notificationSlice';
import ModalNotificationForm from '../components/ModalNotificationForm';
import axios from 'axios';
import Loader from '../components/Loader';
import NotificationCard from '../components/NotificationCard';
import { deleteNotification } from '../slices/notificationSlice';

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state: RootState) => state.notifications);
  const usersState = useSelector((state: RootState) => state.users.allUsers);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const sendNotificationToAPI = async (tokens: string[], title: string, body: string) => {
    try {
      const response = await axios.post('https://us-central1-treasupdate.cloudfunctions.net/sendMassNotification', {
        tokens,
        title,
        body,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Notificación enviada con éxito:', response.data);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  };

  const getFilteredTokens = (usertype: string, devicetype: string) => {
    console.log(usertype)
    return usersState
      .filter((user) => user.usertype === usertype)
      .filter((user) => {
        if (devicetype === 'All') return user.userPlatform === 'ANDROID' || user.userPlatform === 'IOS';
        return user.userPlatform === devicetype;
      })
      .map((user) => user.pushToken);
  };

  const handleSubmitNotification = (title: string, body: string, usertype: string, devicetype: string) => {
    const newNotification = {
      title,
      body,
      usertype,
      devicetype,
      createdAt: Date.now(),
    };

  dispatch(addNotification(newNotification));

    const filteredTokens = getFilteredTokens(usertype, devicetype);
    console.log(filteredTokens)
    if (filteredTokens.length > 0) {
     sendNotificationToAPI(filteredTokens, title, body);
    } else {
      console.error('No se encontraron tokens válidos para enviar la notificación');
    }

    setShowModal(false);
  };

  const handleDeleteNotification = (id: string) => {
    dispatch(deleteNotification(id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="sticky top-0 bg-white z-10 p-4 shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Notificaciones</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-red_treas to-red-900 text-white px-6 py-2 rounded-lg shadow-lg hover:from-red-400 hover:to-red-500 transition duration-300"
          >
            Nueva Notificación
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center items-center min-h-screen">
          <Loader />
        </div>
      )}
      {error && <p>Error: {error}</p>}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id!}
            title={notification.title}
            body={notification.body}
            usertype={notification.usertype}
            devicetype={notification.devicetype}
            createdAt={notification.createdAt}
            onDelete={handleDeleteNotification}
          />
        ))}
      </div>

      {showModal && (
        <ModalNotificationForm
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitNotification}
        />
      )}

      <footer className="mt-12 text-center text-gray-600">
      </footer>
    </div>
  );
};

export default NotificationsPage;