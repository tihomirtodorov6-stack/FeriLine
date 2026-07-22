import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export default function Call({ contact, onBack, mode, callData }: any) {
  const [status, setStatus] = useState(mode === "caller"? "Starting call..." : "Incoming call...");
  const [callId, setCallId] = useState<number | null>(callData?.id || null);
  const peer = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUser = useRef(JSON.parse(localStorage.getItem("ferilineUser") || "{}"));

  function createPeerConnection(id: number) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.ontrack = (event) => { if (audioRef.current) audioRef.current.srcObject = event.streams[0]; };
    pc.onicecandidate = async (event) => {
      if (event.candidate && id) {
        await supabase.from("call_ice_candidates").insert({
          call_id: id,
          user_id: currentUser.current.id,
          candidate: event.candidate.toJSON()
        });
      }
    };
    peer.current = pc;
    return pc;
  }

  async function getMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;
      return stream;
    } catch (e) {
      console.log("MIC ERROR", e);
      setStatus("Microphone permission denied");
      return null;
    }
  }

  // CALLER - само тук правим INSERT, никъде другаде
  async function startCaller() {
    const stream = await getMicrophone();
    if (!stream) return;

    let id = callData?.id;
    // ако идваме от ChatRoom без id, създаваме обаждането сега
    if (!id) {
      const { data, error } = await supabase.from("calls").insert([{
        caller_id: currentUser.current.id,
        receiver_id: contact?.id || callData.receiver_id,
        status: "ringing"
      }]).select().single();
      if (error ||!data) { setStatus("Call error"); return; }
      id = data.id;
      setCallId(id);
    } else {
      setCallId(id);
    }

    const pc = createPeerConnection(id);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await supabase.from("calls").update({ offer }).eq("id", id);
    setStatus("Calling " + (contact?.name || "user") + "...");
  }

  // RECEIVER - чака offer ако го няма
  async function startReceiver() {
    if (!callData?.id) return;
    setCallId(callData.id);
    const stream = await getMicrophone();
    if (!stream) return;
    const pc = createPeerConnection(callData.id);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    let offer = callData.offer;
    if (!offer) {
      setStatus("Waiting for offer...");
      const { data } = await supabase.from("calls").select("offer").eq("id", callData.id).single();
      offer = data?.offer;
    }
    if (!offer) return; // ще дойде през realtime

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await supabase.from("calls").update({ answer, status: "accepted" }).eq("id", callData.id);
    setStatus("Connected");
  }

  useEffect(() => {
    if (mode === "caller") startCaller();
    else startReceiver();
  }, []);

  // Слушаме за answer и ICE и за край на разговора - САМО СЛЕД като имаме callId
  useEffect(() => {
    if (!callId) return;

    const callChannel = supabase.channel("call-update-" + callId)
     .on("postgres_changes", { event: "UPDATE", schema: "public", table: "calls", filter: `id=eq.${callId}` }, async (payload) => {
        const call: any = payload.new;
        // Caller получава answer
        if (call.answer && peer.current && mode === "caller") {
          try {
            const remoteDesc = peer.current.remoteDescription;
            if (!remoteDesc) {
              await peer.current.setRemoteDescription(new RTCSessionDescription(call.answer));
              setStatus("Connected");
            }
          } catch (e) { console.log("ANSWER ERROR", e); }
        }
        // Receiver е чакал offer
        if (call.offer && peer.current && mode === "receiver" &&!peer.current.remoteDescription) {
          try {
            await peer.current.setRemoteDescription(new RTCSessionDescription(call.offer));
            const answer = await peer.current.createAnswer();
            await peer.current.setLocalDescription(answer);
            await supabase.from("calls").update({ answer, status: "accepted" }).eq("id", callId);
            setStatus("Connected");
          } catch {}
        }
        if (call.status === "ended") { setStatus("Call ended"); setTimeout(onBack, 1000); }
        if (call.status === "rejected") { setStatus("Call declined"); setTimeout(onBack, 1000); }
      }).subscribe();

    const iceChannel = supabase.channel("ice-" + callId)
     .on("postgres_changes", { event: "INSERT", schema: "public", table: "call_ice_candidates", filter: `call_id=eq.${callId}` }, async (payload) => {
        const item: any = payload.new;
        if (item.user_id!== currentUser.current.id && peer.current) {
          try { await peer.current.addIceCandidate(new RTCIceCandidate(item.candidate)); } catch {}
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(callChannel);
      supabase.removeChannel(iceChannel);
    };
  }, [callId]);

  useEffect(() => {
    return () => {
      localStream.current?.getTracks().forEach(t => t.stop());
      peer.current?.close();
    };
  }, []);

  async function endCall() {
    if (callId) await supabase.from("calls").update({ status: "ended" }).eq("id", callId);
    localStream.current?.getTracks().forEach(t => t.stop());
    peer.current?.close();
    onBack();
  }

  return (
    <div style={{ height: "100vh", background: "#111", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <h2>📞 FeriLine Call</h2>
      <p>{status}</p>
      <audio ref={audioRef} autoPlay />
      <button onClick={endCall} style={{ width: 120, height: 50, marginTop: 20, borderRadius: 10, background: "red", color: "#fff", border: "none" }}>End call</button>
    </div>
  );
}