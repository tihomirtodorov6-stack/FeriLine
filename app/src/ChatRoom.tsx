import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({ name, contact, onBack }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<any>(null);

  const currentUser = JSON.parse(localStorage.getItem("ferilineUser") || "{}");
  const otherUser = contact || { id: null, name: name };

  async function loadHistory() {
    const { data } = await supabase
     .from("messages")
     .select("*")
     .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`
      )
     .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  useEffect(() => {
    if (!currentUser?.id ||!otherUser?.id) return;

    loadHistory();

    // Уникално име за канала, за да не се бъркат чатовете
    const channel = supabase
     .channel(`messages:${currentUser.id}:${otherUser.id}`)
     .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage: any = payload.new;
          if (
            (newMessage.sender_id === currentUser.id && newMessage.receiver_id === otherUser.id) ||
            (newMessage.sender_id === otherUser.id && newMessage.receiver_id === currentUser.id)
          ) {
            setMessages((old) => {
              if (old.some((m) => m.id === newMessage.id)) return old;
              return [...old, newMessage];
            });
          }
        }
      )
     .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, otherUser.id]); // <- ВАЖНО: беше []

  async function sendMessage() {
    if (!text.trim()) return;
    const messageText = text.trim();
    setText("");

    const { data, error } = await supabase
     .from("messages")
     .insert([{ sender_id: currentUser.id, receiver_id: otherUser.id, text: messageText }])
     .select()
     .single();

    if (error) {
      console.log(error);
      return;
    }

    // Слагаме проверка и тук срещу дублиране
    setMessages((old) => {
      if (old.some((m) => m.id === data.id)) return old;
      return [...old, data];
    });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}