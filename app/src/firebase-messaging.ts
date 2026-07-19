import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase";

const VAPID_KEY = "BHzpMyloZq8_Nkn2hjB99kxbN45r7WvgLOXvZ4FCRdOwhMZy3UgarHiG2FoHYtHDUdFUqVGq1ayc0hSkmsGQoiY";

export async function requestNotificationPermission() {

  try {

    const permission = await Notification.requestPermission();


    if (permission !== "granted") {

      return null;

    }


    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );


    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });



    const user = JSON.parse(
      localStorage.getItem("ferilineUser") || "null"
    );


    if (!user) {

      alert("Няма намерен потребител.");

      return token;

    }



    const { error } = await supabase
      .from("users")
      .update({
        push_token: token
      })
      .eq("id", user.id);



    if (error) {

      alert("Грешка при запис: " + error.message);

    } else {

      alert("Известията са активирани и записани!");

    }



    return token;


  } catch (error) {

    console.error(error);

    alert("Push грешка: " + error);

    return null;

  }

}