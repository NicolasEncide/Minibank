import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjO1bAM10G8JBA-oZd2hXRIGoLdxfpBsU",
  authDomain: "minibank-738e2.firebaseapp.com",
  projectId: "minibank-738e2",
  storageBucket: "minibank-738e2.firebasestorage.app",
  messagingSenderId: "295861826545",
  appId: "1:295861826545:web:d10b4a9610aed771960a50",
  baseUrl: "https://minibank-738e2-default-rtdb.firebaseio.com/"
};

// Inicializar firebase
const app = initializeApp(firebaseConfig);

// Inicializar e exportar serviços
export const auth = getAuth(app);
export const database = getDatabase(app);

// Necessãrio para usar o app em outros locais
export default app;