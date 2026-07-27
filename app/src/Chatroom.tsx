import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Chatroom() {
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "Ghh", me: false },
    { id: 2, text: "Fd", me: false },
    { id: 3, text: "Hssh", me: false },
    { id: 4, text: "Hsx", me: true },
    { id: 5, text: "D", me: true },
    { id: 6, text: "Js", me: false },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMessages([...messages, { id: Date.now(), text, me: true }]);
    setText("");
  };

  return (
    <div style={{ height: "100vh", background: "#0a0a0f", color: "white", display: "flex", flexDirection: "column" }}>
      {/* HEADER - като на снимката ти */}
      <div style={{ height: 64, background: "#15151f", display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid #222" }}>
        <div style={{ width: 36, height: 36, borderRadius: 20, background: "#2a2a35", display: "flex", alignItems: "center", justifyContent: "center" }}>←</div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "white", color: "black", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>BO</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold" }}>BonJovi</div>
          <div style={{ fontSize: 12, color: "#888" }}>+447511230086</div>
        </div>
        {/* ТУК Е ТВОЯ БУТОН - сега е активен */}
        <button 
          onClick={() => window.location.href = `/calling/test`} 
          style={{ width: 40, height: 40, borderRadius: 20, background: "#2a2a35", border: "none", fontSize: 18 }}
        >
          📞
        </button>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</div>
      </div>

      {/* MESSAGES - като на снимката */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
        {messages.map(m => (
          <div key={m.id} style={{ 
            alignSelf: m.me ? "flex-end" : "flex-start",
            background: m.me ? "white" : "#1e1e2a",
            color: m.me ? "black" : "white",
            padding: "10px 16px",
            borderRadius: 20,
            maxWidth: "60%"
          }}>
            {m.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div style={{ padding: 12, display: "flex", gap: 8, background: "#0a0a0f", borderTop: "1px solid #222" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message..."
          style={{ flex: 1, background: "#1e1e2a", border: "none", borderRadius: 24, padding: "12px 18px", color: "white", outline: "none" }}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} style={{ width: 48, height: 48, borderRadius: 24, background: "white", border: "none", fontSize: 18 }}>↑</button>
      </div>
    </div>
  );
}