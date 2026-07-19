import { getToken, deleteToken } from "firebase/messaging";
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


    if (user && token) {

      await supabase
        .from("users")
        .update({
          push_token: token
        })
        .eq("id", user.id);

    }


    return token;


  } catch (error) {

    console.log(error);
    return null;

  }

}



export async function disableNotifications() {

  try {

    const user = JSON.parse(
      localStorage.getItem("ferilineUser") || "null"
    );


    await deleteToken(messaging);


    if(user){

      await supabase
        .from("users")
        .update({
          push_token: null
        })
        .eq("id", user.id);

    }


    return true;


  } catch(error){

    console.log(error);
    return false;

  }

}