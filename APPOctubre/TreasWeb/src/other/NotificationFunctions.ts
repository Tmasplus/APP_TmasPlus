// src/utils/NotificationFunctions.ts
import { app } from "../config/FirebaseConfig";
import { firebase } from '../common/configFirebase.tsx'
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import store from './../store/store'

// Obtener la instancia de Firebase Messaging
const messaging = getMessaging(app);

export const sendNotification = async (token: string, title: string, body: string) => {
  const message = {
    notification: {
      title,
      body,
    },
    to: token,
  };

  try {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify(message),
    });
    console.log("Notificación enviada con éxito");
  } catch (error) {
    console.error("Error al enviar la notificación:", error);
  }
};



export const RequestPushMsg = (token: string, data: string) => {
  const {
      config
  } = firebase;
  
  const settings = store.getState().settingsdata.settings;
  let host = window && window.location && settings.CompanyWebsite === window.location.origin? window.location.origin : `https://${config.projectId}.web.app`
  let url = `${host}/send_notification`;

  fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          "token": token,
          ...data
      })
  })
  .then((response) => {

  })
  .catch((error) => {
      console.log(error)
  });
}

// Función para obtener el token de notificación
export const getNotificationToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: process.env.FIREBASE_VAPID_KEY });
    if (token) {
      console.log("Token de notificación obtenido:", token);
      return token;
    } else {
      console.log("No se pudo obtener el token de notificación.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el token de notificación:", error);
    return null;
  }
};

// Función para escuchar mensajes en primer plano
export const onMessageListener = () => {
  onMessage(messaging, (payload) => {
    console.log("Mensaje recibido en primer plano:", payload);
    // Aquí puedes manejar el mensaje como desees
  });
};
