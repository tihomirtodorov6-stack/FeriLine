import { supabase } from "./supabase";

const VAPID_KEY = "BIGYBBLbIhqTuqaHLLkQTu9MZSessV2f-WvQAgCaA6AoLolY73xBc-0sxv17ESKJmQOlPlifKW2Ete4mve2VmD0";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  try {
    console.log("START WEB PUSH");
    const permission = await Notification.requestPermission();
    console.log("PERMISSION:", permission);

    if (permission!== "granted") {
      console.log("NO PERMISSION");
      return null;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("SERVICE WORKER OK:", registration);

    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log("CREATE NEW SUBSCRIPTION");
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });
    }

    console.log("PUSH SUB:", subscription);
    console.log("ENDPOINT:", subscription