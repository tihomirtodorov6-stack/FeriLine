self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "FeriLine";
    const options = {
      body: data.body || "Входящо обаждане",
      icon: "/IMG_2480.jpeg",
      badge: "/IMG_2480.jpeg",
      data: { url: data.url || (data.callId ? `/call/${data.callId}` : "/"), callId: data.callId },
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500],
      tag: data.callId || 'feriline-call'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) { console.error(e); }
});
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(clients.claim()));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list => {
    for(const c of list) if('focus' in c) return c.focus();
    return clients.openWindow(e.notification.data?.url || '/');
  }));
});
