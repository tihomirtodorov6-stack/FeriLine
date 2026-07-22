import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({ name, contact, onBack }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<any>(null);

  const currentUser = JSON.parse(localStorage.getItem("ferilineUser") || "{}");
  const [otherUser, setOtherUser] = useState(contact || { id: null, name: name });

  useEffect(() => {
    async function findOtherId() {
      if (!otherUser.id && otherUser.name) {
        const { data } = await supabase
         .from("users")
         .select("id, name")
         .eq("name", otherUser.name)
         .single();
        if (data) setOtherUser(data);
      }
    }
    findOtherId();
  }, [otherUser.name]);

  useEffect(() => {
    if (!currentUser.id ||!otherUser.id) return;

    loadHistory();

    const channel = supabase
     .channel(`messages-${currentUser.id}-${otherUser.id}`)
     .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m: any = payload.new;
          if (
            (m.sender_id === currentUser.id && m.receiver_id === otherUser.id) ||
            (m.sender_id === otherUser.id && m.receiver_id === currentUser.id)
          ) {
            setMessages((old) => old.some(x => x.id === m.id)? old : [...old, m]);
          }
        }
      )
     .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser.id, otherUser.id]);

  async function loadHistory() {
    const { data } = await supabase
     .from("messages")
     .select("*")
     .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`)
     .order("created_at", { ascending: true });
    setMessages(data || []);
  }

  async function sendMessage() {
    if (!text.trim() ||!otherUser.id) return;
    const { data } = await supabase
     .from("messages")
     .insert([{ sender_id: currentUser.id, receiver_id: otherUser.id, text: text.trim() }])
     .select()
     .single();

    if (data) {
      setText("");
      setMessages((old) => [...old, data]);
    }
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="chat-room">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>{otherUser.name}</h2>
      </div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.sender_id === currentUser.id? "message mine" : "message"}>
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}