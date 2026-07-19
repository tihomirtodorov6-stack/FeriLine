import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCVLEKjAnXRaUID4MnLSyPTjKpiV656SzA",
  authDomain: "feriline-dfb95.firebaseapp.com",
  projectId: "feriline-dfb95",
  storageBucket: "feriline-dfb95.firebasestorage.app",
  messagingSenderId: "685728122948",
  appId: "1:685728122948:web:bc1f57870adb3699e8d411"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);