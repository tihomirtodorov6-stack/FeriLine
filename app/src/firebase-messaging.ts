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


    const userData = localStorage.getItem("ferilineUser");

    alert("RAW USER: " + userData);


    const user = JSON.parse(userData || "null");


    if (!user) {

      alert("No user found in local storage");
      return token;

    }


    alert("USER ID: " + user.id);


    if (token) {

      const { data, error } = await supabase
        .from("users")
        .update({
          push_token: token
        })
        .eq("id", user.id)
        .select();


      console.log("UPDATE DATA:", data);
      console.log("UPDATE ERROR:", error);


      if (error) {

        alert("Supabase error: " + error.message);

      } else {

        alert("Push token saved!");

      }

    }


    return token;


  } catch (error) {

    console.error("Push error:", error);

    alert("Push error: " + error);

    return null;

  }
}