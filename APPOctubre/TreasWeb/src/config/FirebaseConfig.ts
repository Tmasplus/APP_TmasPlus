import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

// Definición del tipo para la configuración de Firebase
interface FirebaseConfig {
  projectId: string;
  appId: string;
  databaseURL: string;
  storageBucket: string;
  locationId: string;
  apiKey: string;
  authDomain: string;
  messagingSenderId: string;
  measurementId: string;
}

// Configuración de Firebase
const firebaseConfig: FirebaseConfig = {
  projectId: "treasupdate",
  appId: "1:212923549236:web:a44c084bd18cb373266c61",
  databaseURL: "https://treasupdate-default-rtdb.firebaseio.com",
  storageBucket: "treasupdate.appspot.com",
  locationId: "us-central",
  apiKey: "AIzaSyCreEp8jRr57cqbzEKl-DhGdoTc5H4czAM",
  authDomain: "treasupdate.firebaseapp.com",
  messagingSenderId: "212923549236",
  measurementId: "G-KSL4T771QS"
};

// Inicializar Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Exportar la autenticación
export const auth: Auth = getAuth(app);
export { app, firebaseConfig }; // Exportar app y firebaseConfig
