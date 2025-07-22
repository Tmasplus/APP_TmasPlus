import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChat, sendAdminMessage } from '../actions/chatActions';
import { RootState } from '../store/store';

// Importamos la imagen del administrador desde assets
import adminIcon from '../assets/logoNegro.png'; // Ajusta la ruta según sea necesario

interface ChatComponentProps {
  uid: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ uid }) => {
  const dispatch = useDispatch();
  const chatState = useSelector((state: RootState) => state.chat);
  const [message, setMessage] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchChat(uid));
  }, [dispatch, uid]);

  if (chatState.loading) {
    return <div className="flex items-center justify-center h-full">Cargando chats...</div>;
  }

  if (chatState.error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error al cargar los chats: {chatState.error}
      </div>
    );
  }

  const handleSend = () => {
    if (message.trim() === '') return;
    dispatch(sendAdminMessage(uid, message, user.id));
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <h2 className="text-center text-xl font-bold mb-4">Chat</h2>
        {chatState.chat && chatState.chat.messages ? (
          <ul className="space-y-4">
            {Object.entries(chatState.chat.messages).map(([key, messageData]) => (
              <li
                key={key}
                className={`flex ${
                  messageData.Source === 'customer'
                    ? 'justify-end'
                    : messageData.Source === 'driver'
                    ? 'justify-start'
                    : messageData.Source === 'admin'
                    ? 'justify-center'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg shadow-md ${
                    messageData.Source === 'customer'
                      ? 'bg-red-500 text-white'
                      : messageData.Source === 'driver'
                      ? 'bg-gray-300 text-gray-900'
                      : messageData.Source === 'admin'
                      ? 'bg-red_treas text-white'
                      : 'bg-gray-300 text-gray-900'
                  }`}
                >
                  {/* Contenedor para el nombre y la imagen */}
                  <div className="flex items-center mb-1">
                    {messageData.Source === 'admin' && (
                      <img src={adminIcon} alt="Admin" className="w-4 h-4 mr-2 rounded-full" />
                    )}
                    <span className="block text-xs font-semibold">
                      {messageData.Source === 'customer'
                        ? 'Cliente'
                        : messageData.Source === 'driver'
                        ? 'Conductor'
                        : messageData.Source === 'admin'
                        ? 'TREASAPP'
                        : 'Desconocido'}
                    </span>
                  </div>

                  {/* Contenido del mensaje */}
                  <p>{messageData.message}</p>

                  {/* Marca de tiempo */}
                  <span className="block text-xs text-right opacity-75 mt-2">
                    {messageData.msgDate}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500">No hay chats disponibles.</div>
        )}
      </div>

      <div className="mt-4 flex items-center">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
        >
          Enviar Mensaje
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
