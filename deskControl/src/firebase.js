import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEUVdXr1lmvvz2bh6q0r7s_P9mkMYMcwU",
  authDomain: "gesture-control-98352.firebaseapp.com",
  projectId: "gesture-control-98352",
  storageBucket: "gesture-control-98352.firebasestorage.app",
  messagingSenderId: "159401281414",
  appId: "1:159401281414:web:1ba409f30fb78e0ebc0e07",
  measurementId: "G-DCSQZFERSJ"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();