self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  self.registration.showNotification(data.title || "FeriLine", {
    body: data.body || "Имате ново съобщение",
    icon: "/IMG_2480.jpeg",
    badge: "/IMG_2480.jpeg"
  });
});