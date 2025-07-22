// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyCreEp8jRr57cqbzEKl-DhGdoTc5H4czAM",
  authDomain: "treasupdate.firebaseapp.com",
  databaseURL: "https://treasupdate-default-rtdb.firebaseio.com",
  projectId: "treasupdate",
  storageBucket: "treasupdate.appspot.com",
  messagingSenderId: "212923549236",
  appId: "1:212923549236:web:a44c084bd18cb373266c61",
  measurementId: "G-KSL4T771QS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


// Exportar auth y database para su uso en toda la aplicación
export { auth, database  };
export default app;

