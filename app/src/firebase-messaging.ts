import { getToken, deleteToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { supabase } from "./supabase";

const VAPID_KEY = "BHzpMyloZq8_Nkn2hjB99kxbN45r7WvgLOXvZ4FCRdOwhMZy3UgarHiG2FoHYtHDUdFUqVGq1ayc0hSkmsGQoiY";


export async function requestNotificationPermission() {

  try {

    console.log("START PUSH");

    const permission = await Notification.requestPermission();

    console.log("PERMISSION:", permission);


    if (permission !== "granted") {
      console.log("NO PERMISSION");
      return null;
    }


    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    console.log("SERVICE WORKER OK");


    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });


    console.log("FCM TOKEN:", token);


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


      if(error){
        console.log("SUPABASE ERROR:", error);
      }

    }


    return token;


  } catch (error) {

    console.log("PUSH ERROR:", error);

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

    console.log("DELETE PUSH ERROR:", error);

    return false;

  }

}