import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({ name, contact, onBack }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<any>(null);
  const [otherUser, setOtherUser] = useState(contact || { id: null, name: name });

  const [callStatus, setCallStatus] = useState<'idle'|'calling'|'incoming'|'in-call'>('idle');
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);

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
    if (!currentUser.id ||!otherUser.id) return;
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
    if(!currentUser.id ||!otherUser.id) return;
    const roomId = [currentUser.id, otherUser.id].sort().join('-');
    const channel = supabase.channel(`call-room-${roomId}`, { config: { broadcast: { self: false } } });

    channel.on('broadcast', {event:'offer'}, ({payload}:any)=>{
      if(payload.sender === currentUser.id) return;
      setIncomingOffer(payload.offer);
      setCallStatus('incoming');
    }).on('broadcast', {event:'answer'}, async ({payload}:any)=>{
      if(payload.sender === currentUser.id) return;
      if(pcRef.current){
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
        setCallStatus('in-call');
      }
    }).on('broadcast', {event:'ice'}, async ({payload}:any)=>{
      if(payload.sender === currentUser.id) return;
      if(pcRef.current && payload.candidate){
        try{ await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)); }catch(e){}
      }
    }).on('broadcast', {event:'end'}, ()=>{
      endCallCleanup();
    }).subscribe();

    callChannelRef.current = channel;
    return ()=>{ supabase.removeChannel(channel); endCallCleanup(); };
  }, [currentUser.id, otherUser.id]);

  function createPeer(){
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });
    pc.onicecandidate = (e)=>{
      if(e.candidate){
        callChannelRef.current?.send({ type:'broadcast', event:'ice', payload:{ candidate:e.candidate, sender: currentUser.id } });
      }
    };
    pc.ontrack = (e)=>{
      console.log("RECEIVED TRACK", e.streams[0]);
      if(remoteAudioRef.current){
        remoteAudioRef.current.srcObject = e.streams[0];
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.play().catch(()=>{});
      }
    };
    pcRef.current = pc;
    return pc;
  }

  async function startCall(){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log("LOCAL MIC OK", stream.getAudioTracks()[0].getSettings());
      localStreamRef.current = stream;
      setIsMuted(false);
      const pc = createPeer();
      stream.getTracks().forEach(t=> pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setCallStatus('calling');
      callChannelRef.current?.send({ type:'broadcast', event:'offer', payload:{ offer, sender: currentUser.id } });
    }catch(err){
      console.error(err);
      alert('Трябва да разрешиш микрофона! Сайтът трябва да е на https');
    }
  }

  async function answerCall(){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      localStreamRef.current = stream;
      setIsMuted(false);
      const pc = createPeer();
      stream.getTracks().forEach(t=> pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      callChannelRef.current?.send({ type:'broadcast', event:'answer', payload:{ answer, sender: currentUser.id } });
      setCallStatus('in-call');
    }catch(err){ alert('Не можа да се вземе микрофона'); }
  }

  function toggleMute(){
    if(localStreamRef.current){
      const track = localStreamRef.current.getAudioTracks()[0];
      if(track){
        track.enabled =!track.enabled;
        setIsMuted(!