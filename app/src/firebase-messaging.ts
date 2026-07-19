import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

const VAPID_KEY = "BHzpMyloZq8_Nkn2hjB99kxbN45r7WvgLOXvZ4FCRdOwhMZy3UgarHiG2FoHYtHDUdFUqVGq1ayc0hSkmsGQoiY";

export async function requestNotificationPermission() {
  try {

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notifications denied");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    console.log("FeriLine Push Token:", token);

    return token;

  } catch (error) {

    console.error("Push error:", error);
    return null;

  }
}