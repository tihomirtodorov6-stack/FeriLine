import { useState, useEffect } from "react";
import "./styles.css";
import Register from "./Register";
import ChatList from "./ChatList";
import { supabase } from "./supabase";

const VAPID_PUBLIC_KEY = "BJIg10OVwY6R6TaKKO2abS5N-ep2FEfxOpor8FIm_QhZ7fyd85rLYMBT_tQuVyEGZ7DD_ZQbDSdz8Kkm0SESY-Q";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function enablePushForCalls(userId: string) {
  try {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
    if (Notification.permission !== 'granted') return;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      subscription: sub.toJSON(),
      updated_at: new Date().toISOString()
    });
    console.log("Push абониран за обаждания!");
  } catch (e) {
    console.log("push error", e);
  }
}

export default function App() {

  const [page, setPage] = useState(
    localStorage.getItem("ferilineLoggedIn") === "true"
      ? "chat"
      : "home"
  );

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ferilineUser");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.id) enablePushForCalls(u.id);
      } catch {}
    }
  }, []);

  async function login() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("pin", pin)
      .single();

    if (error || !data) {
      alert("Wrong phone or PIN");
      return;
    }

    localStorage.setItem("ferilineUser", JSON.stringify(data));
    localStorage.setItem("ferilineLoggedIn", "true");
    await enablePushForCalls(data.id);
    setPage("chat");
  }

  if (page === "register") {
    return <Register onBack={() => setPage("home")} />;
  }

  if (page === "chat") {
    return <ChatList />;
  }

  return (
    <div className="feriline-home">
      <div className="logo">F</div>
      <h1>FeriLine</h1>
      <p>Connect. Chat. Share.</p>
      <button className="primary-btn" onClick={() => setPage("register")}>
        Create account
      </button>
      <h2>Login</h2>
      <input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
      <button className="primary-btn" onClick={login}>Login</button>
    </div>
  );
}