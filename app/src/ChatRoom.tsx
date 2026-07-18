import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({ name, contact, onBack }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<any>(null);

  const currentUser = JSON.parse(localStorage.getItem("ferilineUser") || "{}");
  const otherUser = contact || { id: null, name: name };

  useEffect(() => {
    loadHistory();

    const channel = supabase
     .channel("realtime-messages")
     .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;
          if (
            (m.sender_id === currentUser.id && m.receiver_id === otherUser.id) ||
            (m.sender_id === otherUser.id && m.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, m]);
          }
        }
      )
     .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  async function sendMessage() {
    if (!text.trim()) return;
    const msg = {
      sender_id: currentUser.id,
      receiver_id: otherUser.id,
      text: text.trim(),
    };
    setText("");
    await supabase.from("messages").insert([msg]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh"