import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase";

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

    alert("TOKEN: " + token);



    const user = JSON.parse(
      localStorage.getItem("ferilineUser") || "null"
    );


    if (user && token) {

      const { error } = await supabase
        .from("users")
        .update({
          push_token: token
        })
        .eq("id", user.id);


      if (error) {
        console.log("Supabase error:", error);
      } else {
        console.log("Push token saved!");
      }

    } else {

      console.log("No user or token");

    }


    return token;


  } catch (error) {

    console.error("Push error:", error);
    alert("Push error: " + error);

    return null;

  }
}