
const Notification = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-5 right-5 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between w-96">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white">
        &times;
      </button>
    </div>
  );
};

export default Notification;