importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCVLEKjAnXRaUID4MnLSyPTjKpiV656SzA",
  authDomain: "feriline-dfb95.firebaseapp.com",
  projectId: "feriline-dfb95",
  storageBucket: "feriline-dfb95.firebasestorage.app",
  messagingSenderId: "685728122948",
  appId: "1:685728122948:web:bc1f57870adb3699e8d411"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title || "FeriLine",
    {
      body: payload.notification.body || "Ново съобщение",
      icon: "/IMG_2480.jpeg"
    }
  );
});