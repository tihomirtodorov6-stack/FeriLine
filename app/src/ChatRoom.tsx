import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({ name, contact, onBack }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<any>(null);
  const [otherUser, setOtherUser] = useState(contact || { id: null, name: name });
  const [callStatus, setCallStatus] = useState<'idle'|'calling'|'incoming'|'in-call'>('idle');
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const callChannelRef = useRef<any>(null);
  const currentUser = JSON.parse(localStorage.getItem("ferilineUser") || "{}");

  useEffect(() => {
    if (!otherUser.id && otherUser.name) {
      supabase.from("users").select("id, name").eq("name", otherUser.name).single().then(({data})=>{
        if(data) setOtherUser(data);
      });
    }
  }, [otherUser.name]);

  useEffect(() => {
    if (!currentUser.id || !otherUser.id) return;
    const loadHistory = async () => {
      const { data } = await supabase.from("messages").select("*").or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`).order("created_at", { ascending: true });
      setMessages(data || []);
    };
    loadHistory();
    const ch = supabase.channel(`messages-${currentUser.id}-${otherUser.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p:any)=>{
      const m=p.new;
      if ((m.sender_id===currentUser.id && m.receiver_id===otherUser.id) || (m.sender_id===otherUser.id && m.receiver_id===currentUser.id)) {
        setMessages((o:any)=> o.some((x:any)=>x.id===m.id)? o : [...o, m]);
      }
    }).subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  }, [currentUser.id, otherUser.id]);

  useEffect(() => {
    if (!currentUser.id || !otherUser.id) return;
    const channelName = currentUser.id < otherUser.id? `call-${currentUser.id}-${otherUser.id}` : `call-${otherUser.id}-${currentUser.id}`;
    console.log("CALL CHANNEL SUBSCRIBE:", channelName);
    callChannelRef.current = supabase.channel(channelName);
    callChannelRef.current
    .on("broadcast", { event: "offer" }, ({ payload }) => {
      if (payload.sender === currentUser.id) return;
      setIncomingOffer(payload.offer);
      setCallStatus("incoming");
    })
    .on("broadcast", { event: "answer" }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return;
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        setCallStatus("in-call");
      }
    })
    .on("broadcast", { event: "ice" }, async ({ payload }) => {
      if (payload.sender === currentUser.id) return;
      if (pcRef.current && payload.candidate) {
        try { await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch(e){}
      }
    })
    .on("broadcast", { event: "end" }, () => { endCallCleanup(); })
    .subscribe();
    return () => { if (callChannelRef.current) { supabase.removeChannel(callChannelRef.current); callChannelRef.current = null; } };
  }, [currentUser.id, otherUser.id]);

  function createPeer(){
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'turn:open