import { Dispatch } from 'redux';
import { getDatabase, ref, onValue ,push,set} from 'firebase/database';
import { fetchChatStart, fetchChatSuccess, fetchChatFailure,sendMessageStart, sendMessageSuccess, sendMessageFailure } from '../slices/chatSlice';

export const fetchChat = (uid: string) => {
  console.log(`Iniciando fetchChat con uid: ${uid}`);
  return (dispatch: Dispatch) => {
    console.log('Dispatching fetchChatStart');
    dispatch(fetchChatStart());

    const db = getDatabase();
    console.log('Obteniendo referencia de la base de datos');
    const chatRef = ref(db, `chats/${uid}`);
    console.log(`Referencia de chat obtenida: chats/${uid}`);

    onValue(chatRef, (snapshot) => {
      console.log('onValue callback ejecutado');
      if (snapshot.exists()) {
        console.log('Snapshot existe');
        const chatData = snapshot.val();
        console.log(`Datos del chat obtenidos: ${JSON.stringify(chatData)}`);
        dispatch(fetchChatSuccess(chatData));
      } else {
        dispatch(fetchChatFailure('No chat data available'));
      }
    }, (error) => {
      dispatch(fetchChatFailure(error.message));
    });
  };
};
export const sendAdminMessage = (uid: string, message: string,role:string) => {
  console.log(`Enviando mensaje como admin para uid: ${uid}`);
  return async (dispatch: Dispatch) => {
    dispatch(sendMessageStart());

    try {
      const db = getDatabase();
      const messagesRef = ref(db, `chats/${uid}/messages`);
      const newMessageRef = push(messagesRef);
      const messageData = {
        message: message,
        Source: 'admin',
        msgDate: new Date().toLocaleString(),
        from: role,
        type: 'text',
        createdAt:new Date().toISOString()
      };      


      await set(newMessageRef, messageData);
      console.log('Mensaje enviado exitosamente');
      dispatch(sendMessageSuccess(messageData));
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      dispatch(sendMessageFailure(error.message));
    }
  };
};
