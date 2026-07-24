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
      supabase.from("users").select("id, name").eq("name", otherUser.name).single().then(({data})=>{ if(data) setOtherUser(data); });
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
  if(!currentUser.id || !otherUser.id) return;

  console.log("CALL SYSTEM READY");

}, [currentUser.id, otherUser.id]);

  function createPeer(){
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] });
    pc.onicecandidate = (e)=>{ if(e.candidate){ callChannelRef.current?.send({ type:'broadcast', event:'ice', payload:{ candidate:e.candidate, sender: currentUser.id } }); } };
    pc.ontrack = (e)=>{ if(remoteAudioRef.current){ remoteAudioRef.current.srcObject = e.streams[0]; remoteAudioRef.current.muted = isSpeakerMuted; remoteAudioRef.current.volume = 1; remoteAudioRef.current.play().catch(()=>{}); } };
    pcRef.current = pc; return pc;
  }

  async function startCall(){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      localStreamRef.current = stream; setIsMicMuted(false); setIsSpeakerMuted(false);
      const pc = createPeer(); stream.getTracks().forEach(t=> pc.addTrack(t, stream));
      const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
      setCallStatus('calling');
      callChannelRef.current?.send({ type:'broadcast', event:'offer', payload:{ offer, sender: currentUser.id } });
    }catch(err){ alert('Трябва да разрешиш микрофона!'); }
  }

  async function answerCall(){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      localStreamRef.current = stream; setIsMicMuted(false); setIsSpeakerMuted(false);
      const pc = createPeer(); stream.getTracks().forEach(t=> pc.addTrack(t, stream));
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer(); await pc.setLocalDescription(answer);
      callChannelRef.current?.send({ type:'broadcast', event:'answer', payload:{ answer, sender: currentUser.id } });
      setCallStatus('in-call');
    }catch(err){ alert('Не можа да се вземе микрофона'); }
  }

  function toggleMicMute(){
    const s = localStreamRef.current; if(!s) return;
    const track = s.getAudioTracks()[0]; if(!track) return;
    track.enabled =!track.enabled;
    setIsMicMuted(!track.enabled);
  }
  function toggleSpeakerMute(){
    if(!remoteAudioRef.current) return;
    remoteAudioRef.current.muted =!remoteAudioRef.current.muted;
    setIsSpeakerMuted(remoteAudioRef.current.muted);
  }

  function endCall(){ callChannelRef.current?.send({ type:'broadcast', event:'end', payload:{ sender: currentUser.id } }); endCallCleanup(); }
  function endCallCleanup(){ pcRef.current?.close(); pcRef.current=null; localStreamRef.current?.getTracks().forEach(t=>t.stop()); setCallStatus('idle'); setIncomingOffer(null); setIsMicMuted(false); setIsSpeakerMuted(false); if(remoteAudioRef.current) remoteAudioRef.current.srcObject=null; }

  async function loadHistory() { const { data } = await supabase.from("messages").select("*").or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`).order("created_at", { ascending: true }); setMessages(data || []); }
  async function sendMessage() { if (!text.trim() ||!otherUser.id) return; const { data } = await supabase.from("messages").insert([{ sender_id: currentUser.id, receiver_id: otherUser.id, text: text.trim() }]).select().single(); if (data) { setText(""); setMessages((o:any)=>[...o, data]); } }
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="chat-room" style={{position:'relative'}}>
      {callStatus === 'in-call'? (
        <div className="chat-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px', background:'#2ecc71', color:'white'}}>
          <span>🔊 {otherUser.name}</span>
          <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <button onClick={toggleMicMute} style={{background: isMicMuted? 'red' : 'white', color: isMicMuted? 'white' : '#2ecc71', border:'none', width:'38px', height:'38px', borderRadius:'50%'}}>{isMicMuted? '🔇' : '🎤'}</button>
            <button onClick={toggleSpeakerMute} style={{background: isSpeakerMuted? 'red' : 'white', color: isSpeakerMuted? 'white' : '#2ecc71', border:'none', width:'38px', height:'38px', borderRadius:'50%'}}>{isSpeakerMuted? '🔈' : '🔊'}</button>
            <button onClick={endCall} style={{background:'red', color:'white', border:'none', padding:'8px 15px', borderRadius:'20px'}}>Край</button>
          </div>
        </div>
      ) : (
        <div className="chat-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <button className="back-btn" onClick={onBack}>← Back</button>
            <h2 style={{margin:0}}>{otherUser.name}</h2>
          </div>
          <button onClick={startCall} disabled={callStatus!=='idle'} style={{fontSize:'24px', background:'#2ecc71', border:'none', borderRadius:'50%', width:'42px', height:'42px'}}>📞</button>
        </div>
      )}
      {callStatus==='calling' && (<div style={{position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white'}}><h2>Звъниш на {otherUser.name}...</h2><button onClick={endCall} style={{marginTop:'20px', background:'red', color:'white', border:'none', padding:'15px 30px', borderRadius:'30px'}}>Затвори ✕</button></div>)}
      {callStatus==='incoming' && (<div style={{position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white'}}><h2>{otherUser.name} ти звъни!</h2><div style={{display:'flex', gap:'30px', marginTop:'30px'}}><button onClick={endCall} style={{background:'red', color:'white', border:'none', width:'70px', height:'70px', borderRadius:'50%'}}>✕</button><button onClick={answerCall} style={{background:'#2ecc71', color:'white', border:'none', width:'70px', height:'70px', borderRadius:'50%'}}>📞</button></div></div>)}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="messages">{messages.map((msg:any) => (<div key={msg.id} className={msg.sender_id === currentUser.id? "message mine" : "message"}>{msg.text}</div>))}<div ref={bottomRef} /></div>
      <div className="message-input"><input type="text" placeholder="Message..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} /><button onClick={sendMessage}>Send</button></div>
    </div>
  );
}