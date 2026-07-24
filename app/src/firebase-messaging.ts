import { supabase } from "./supabase";

const VAPID_KEY = "BN-PgA8Si25AgdmMRuyPx05s0HKq89_Uyi2_qQ8OmjeReNPl0R30w7DwX2iXnInKDrt36ye4I8-klacLn0-qJJI";

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
    console.log("ENDPOINT:", subscription.endpoint);

    // Записваме в базата за да може да звъним
    const savedUser = JSON.parse(localStorage.getItem("ferilineUser") || "null");
    const userId = savedUser?.id;
    if (userId && subscription) {
      const subJson = subscription.toJSON();
            await supabase
        .from("users")
        .update({
          push_subscription: subJson,
          push_token: JSON.stringify(subJson)
        })
        .eq("id", userId);

      console.log("PUSH SAVED");
    }

    return subscription;

  } catch (error) {
    console.log("PUSH ERROR:", error);
    return null;
  }
}

export async function disableNotifications() {
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");

    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    const savedUser = JSON.parse(localStorage.getItem("ferilineUser") || "null");

    if (savedUser?.id) {
      await supabase
        .from("users")
        .update({
          push_subscription: null,
          push_token: null
        })
        .eq("id", savedUser.id);
    }

    return true;

  } catch (error) {
    console.log("DISABLE PUSH ERROR:", error);
    return false;
  }
}