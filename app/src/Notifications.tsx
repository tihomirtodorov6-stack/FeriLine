import { useState, useEffect } from "react";
import { requestNotificationPermission, disableNotifications } from "./firebase-messaging";

export default function Notifications() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    if("Notification" in window){
      setEnabled(Notification.permission === "granted");
    }
  },[]);

  async function handleOn(){
    setLoading(true);
    const sub = await requestNotificationPermission();
    setLoading(false);
    if(sub){
      setEnabled(true);
      alert("✅ TRUE PUSH ВКЛЮЧЕН! Сега ще звъни и на заключен екран!");
    } else {
      alert("❌ Дай разрешение за известия от Safari!");
    }
  }

  async function handleOff(){
    setLoading(true);
    await disableNotifications();
    setEnabled(false);
    setLoading(false);
  }

  return (
    <div style={{padding:20}}>
      <h1>Notifications</h1>
      <div style={{marginTop:20, padding:15, border:'1px solid #ccc', borderRadius:10}}>
        <p>💬 True Push на заключен екран</p>
        <p style={{color: enabled ? 'green' : 'red', fontWeight:'bold'}}>
          Статус: {enabled ? 'PUSH ✅ ВКЛ' : 'PUSH ❌ ИЗКЛ'}
        </p>
        {!enabled ? (
          <button onClick={handleOn} disabled={loading} style={{padding:'10px 20px', background:'green', color:'white', borderRadius:8}}>
            {loading ? 'Включване...' : 'ВКЛЮЧИ TRUE PUSH ON'}
          </button>
        ) : (
          <button onClick={handleOff} disabled={loading} style={{padding:'10px 20px', background:'gray', color:'white', borderRadius:8}}>
            Изключи
          </button>
        )}
        <p style={{marginTop:10, fontSize:12, color:'#666'}}>
          ВАЖНО: Трябва да си инсталирал от Safari -> Share -> Add to Home Screen!
        </p>
      </div>
    </div>
  );
}