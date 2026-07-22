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

// 1. ЗА СЪОБЩЕНИЯ И ОБАЖДАНИЯ ПРЕЗ FIREBASE
messaging.onBackgroundMessage((payload) => {
  const isCall = payload.data?.type === 'call';
  console.log("FeriLine background:", payload);
  
  self.registration.showNotification(
    payload.notification?.title || payload.data?.title || "FeriLine",
    {
      body: payload.notification?.body || payload.data?.body || "Ново съобщение",
      icon: "/IMG_2480.jpeg",
      badge: "/IMG_2480.jpeg",
      data: { url: payload.data?.url || "/", type: payload.data?.type || "message" },
      vibrate: isCall ? [500, 200, 500, 200, 500] : undefined,
      requireInteraction: isCall ? true : false,
      tag: isCall ? 'incoming-call' : 'message'
    }
  );
});

// 2. ЗАДЪЛЖИТЕЛНО ЗА PWA
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// 3. ЗА ОБИКНОВЕН WEB PUSH (ако пращаме през VAPID)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    // ако е от Firebase, вече е обработено горе, не дублирай
    if (data.notification || data.data) return;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(list => {
      for(const client of list){
        if('focus' in client) return client.focus();
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});