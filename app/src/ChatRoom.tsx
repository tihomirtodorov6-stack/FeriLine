import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import { playMessageSound } from "./sound";

export default function ChatRoom({ name, contact, onBack }: any) {

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(false);

  const bottomRef = useRef<any>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("ferilineUser") || "{}"
  );

  const otherUser = contact || {
    id: null,
    name: name
  };

  async function updateMyStatus(){
    if(!currentUser.id) return;
    await supabase
      .from("user_status")
      .upsert({
        user_id: currentUser.id,
        online: true,
        last_active: new Date()
      });
  }

  async function checkFriendStatus(){
    if(!otherUser.id) return;
    const {data} = await supabase
      .from("user_status")
      .select("last_active")
      .eq("user_id", otherUser.id)
      .single();

    if(data?.last_active){
      const last = new Date(data.last_active).getTime();
      const now = new Date().getTime();
      setOnline(now - last < 60000);
    } else {
      setOnline(false);
    }
  }

  async function loadHistory(){
    const {data} = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`
      )
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  useEffect(()=>{
    if(!currentUser.id || !otherUser.id){
      return;
    }

    loadHistory();
    updateMyStatus();
    checkFriendStatus();

    const timer = setInterval(()=>{
      updateMyStatus();
      checkFriendStatus();
    },10000);

    const channel = supabase
      .channel("chat-" + currentUser.id + "-" + otherUser.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        (payload)=>{
          const msg: any = payload.new;

          if(
            (msg.sender_id === currentUser.id && msg.receiver_id === otherUser.id)
            ||
            (msg.sender_id === otherUser.id && msg.receiver_id === currentUser.id)
          ){
            setMessages(old=>{
              if(old.some(x=>x.id===msg.id)){
                return old;
              }
              if(msg.sender_id === otherUser.id){
                playMessageSound();
              }
              return [...old, msg];
            });
          }
        }
      )
      .subscribe();

    return ()=>{
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  },[]);

  // ПРАВИЛНАТА ЛОГИКА - взима push_token автоматично
  async function send