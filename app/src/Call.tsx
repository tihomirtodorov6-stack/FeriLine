import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const STUN = [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }];

export default function Call({ callId, userId, onEnd }: { callId: number, userId: string, onEnd: () => void }) {
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState<string|null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const pcRef = useRef<RTCPeerConnection|null>(null);
  const localStreamRef = useRef<MediaStream|null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let cancelled = false;
    let callChannel: any = null;
    let iceChannel: any = null;

    const start = async () => {
      try {
        setStatus("Requesting mic...");
        // ТУК Е ФИКСА ЗА МИКРОФОНИЯТА
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
            channelCount: 1,
          }
        });
        if(cancelled) return;
        localStreamRef.current = stream;

        const pc = new RTCPeerConnection({ iceServers: STUN });
        pcRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          if(remoteAudioRef.current){
            remoteAudioRef.current.srcObject = e.streams[0];
            remoteAudioRef.current.play().catch(()=>{});
          }
          setStatus("Connected");
        };

        pc.onicecandidate = async (e) => {
          if(e.candidate &&!cancelled){
            await supabase.from("call_ice_candidates").insert({ call_id: callId, user_id: userId, candidate: e.candidate.toJSON() });
          }
        };

        const { data: callData, error: fetchError } = await supabase.from("calls").select("*").eq("id", callId).single();
        if(fetchError) throw fetchError;
        if(!callData) throw new Error("No call row");

        const { data: { user } } = await supabase.auth.getUser();
        const myId = user?.id;
        // Ако ползваш custom users таблица, вземи isCaller по друг начин
        const isCaller = myId? callData.caller_id === myId : callData.caller_id === userId;

        if(isCaller){
          setStatus("Creating offer...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await supabase.from("calls").update({ offer }).eq("id", callId);

          callChannel = supabase.channel(`call-${callId}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "calls", filter: `id=eq.${callId}` }, async (payload:any) => {
            if(payload.new.answer &&!pc.currentRemoteDescription){
              setStatus("Got answer...");
              await pc.setRemoteDescription(new RTCSessionDescription(payload.new.answer));
            }
          }).subscribe();
        } else {
          setStatus("Waiting for offer...");
          let offer = callData.offer;
          if(!offer){
            offer = await new Promise<any>((resolve, reject) => {
              const timeout = setTimeout(()=> reject(new Error("Offer timeout")), 10000);
              const ch = supabase.channel(`call-offer-${callId}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "calls", filter: `id=eq.${callId}` }, (p:any) => { if(p.new.offer){ clearTimeout(timeout); supabase.removeChannel(ch); resolve(p.new.offer); } }).subscribe();
              callChannel = ch;
            });
          }
          setStatus("Creating answer...");
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await supabase.from("calls").update({ answer, status: "connected" }).eq("id", callId);
        }

        iceChannel = supabase.channel(`ice-${callId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "call_ice_candidates", filter: `call_id=eq.${callId}` }, async (p:any) => {
          if(p.new.user_id!== userId && p.new.candidate){
            try { await pc.addIceCandidate(new RTCIceCandidate(p.new.candidate)); } catch {}
          }
        }).subscribe();

        const { data: existing } = await supabase.from("call_ice_candidates").select("*").eq("call_id", callId).neq("user_id", userId);
        for(const row of existing || []){ try { await pc.addIceCandidate(new RTCIceCandidate(row.candidate)); } catch {} }

      } catch(err:any){
        console.error(err);
        if(!cancelled) setError(err.message || "Unknown call error");
      }
    };
    start();

    return () => {
      cancelled = true;
      if(callChannel) supabase.removeChannel(callChannel);
      if(iceChannel) supabase.removeChannel(iceChannel);
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t=>t.stop());
    };
  }, [callId, userId]);

  const toggleMute = () => {
    if(localStreamRef.current){
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled =!t.enabled);
      setIsMuted(!isMuted);
    }
  }

  if(error) return <div style={{background:"black",color:"white",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,textAlign:"center"}}><h2>FeriLine Call</h2><p style={{color:"red"}}>{error}</p><button onClick={onEnd} style={{marginTop:20,padding:"12px 24px",borderRadius:12}}>End call</button></div>;

  return (
    <div style={{background:"black",color:"white",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <h2>FeriLine Call</h2>
      <p>{status}</p>
      <p style={{fontSize:12, opacity:0.6}}>Ако сте в една стая, единия сложете Mute</p>
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div style={{display:"flex", gap:12, marginTop:20}}>
        <button onClick={toggleMute} style={{padding:"12px 24px",borderRadius:12, background: isMuted? "red" : "#333", color:"white"}}>{isMuted? "Unmute" : "Mute"}</button>
        <button onClick={onEnd} style={{padding:"12px 24px",borderRadius:12}}>End call</button>
      </div>
    </div>
  );
}