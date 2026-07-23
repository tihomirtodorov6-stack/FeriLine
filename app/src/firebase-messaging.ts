import { supabase } from "./supabase";

const VAPID_KEY = "BHzpMyloZq8_Nkn2hjB99kxbN45r7WvgLOXvZ4FCRdOwhMZy3UgarHiG2FoHYtHDUdFUqVGq1ayc0hSkmsGQoiY";

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

    // Регистрираме НОВИЯ sw.js, не стария firebase
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("SERVICE WORKER OK:", registration);

    await navigator.serviceWorker.ready;

    // Ако вече има абонамент, ползвай го
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log("CREATE NEW SUBSCRIPTION");
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });
    }

    console.log("PUSH SUB:", subscription);
    console.log("ENDPOINT:", subscription.endpoint);

    const user = JSON.parse(localStorage.getItem("ferilineUser") || "null");

    if (user && subscription) {
      // Запазваме целия абонамент + endpoint за съвместимост
      const { error } = await supabase
       .from("users")
       .update({
          push_token: subscription.endpoint,
          push_subscription: subscription.toJSON(),
        })
       .eq("id", user.id);

      if (error) {
        // Ако няма колона push_subscription, пробвай само с push_token
        console.log("TRY ONLY TOKEN, ERROR:", error);
        await supabase
         .from("users")
         .update({
            push_token: JSON.stringify(subscription.toJSON()),
          })
         .eq("id", user.id);
      }
    }

    return subscription;
  } catch (error) {
    console.log("PUSH ERROR:", error);
    return null;
  }
}

export async function disableNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    const user = JSON.parse(localStorage.getItem("ferilineUser") || "null");
    if (user) {
      await supabase
       .from("users")
       .update({
          push_token: null,
          push_subscription: null,
        })
       .eq("id", user.id);
    }

    return true;
  } catch (error) {
    console.log("DELETE PUSH ERROR:", error);