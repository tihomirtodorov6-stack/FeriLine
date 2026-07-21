import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export default function Call({ contact, onBack, mode, callData }: any) {

  const [status, setStatus] = useState("Starting call...");
  const [callId, setCallId] = useState<number | null>(null);

  const peer = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("ferilineUser") || "{}"
  );


  async function startCall(){

    if(!currentUser.id || !contact.id){
      setStatus("Missing user");
      return;
    }


    const stream = await navigator.mediaDevices.getUserMedia({
      audio:true
    });


    localStream.current = stream;


    const pc = new RTCPeerConnection({
      iceServers:[
        {
          urls:"stun:stun.l.google.com:19302"
        }
      ]
    });
console.log("PEER CREATED");

    peer.current = pc;


    stream.getTracks().forEach(track=>{
      pc.addTrack(track,stream);
    });



    pc.ontrack = (event)=>{

      if(audioRef.current){

        audioRef.current.srcObject =
          event.streams[0];

      }

    };



    const { data, error } = await supabase
      .from("calls")
      .insert([
        {
          caller_id: currentUser.id,
          receiver_id: contact.id,
          status:"ringing"
        }
      ])
      .select()
      .single();



    if(error){

      console.log(error);
      setStatus("Call error");
      return;

    }


    setCallId(data.id);



    pc.onicecandidate = async(event)=>{

      if(event.candidate){

  const { error } = await supabase
  .from("call_ice_candidates")
  .insert({

    call_id:data.id,

    user_id:currentUser.id,

    candidate:event.candidate

  });

if(error){
  console.log("ICE ERROR", error);
}
else{
  console.log("ICE SAVED");
}

      }

    };



    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);



    await supabase
      .from("calls")
      .update({

        offer:offer

      })
      .eq(
        "id",
        data.id
      );



    setStatus(
      "Calling " + contact.name
    );


  }





useEffect(()=>{

  startCall();


},[]);





useEffect(()=>{
if(mode === "receiver"){
  setStatus("Connected");
  return;
}
if(!callId) return;



const channel = supabase
.channel("answer-"+callId)

.on(
"postgres_changes",
{
event:"UPDATE",
schema:"public",
table:"calls",
filter:`id=eq.${callId}`
},
async(payload)=>{


const call:any = payload.new;



if(call.status==="accepted"){

 setStatus("Connected");

}


if(call.answer && peer.current){

 await peer.current.setRemoteDescription(
  call.answer
 );

}



if(call.status==="rejected"){

 setStatus("Call declined");

}



}

)

.subscribe();




const iceChannel = supabase
.channel("ice-"+callId)

.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"call_ice_candidates",
filter:`call_id=eq.${callId}`
},
async(payload)=>{


const item:any = payload.new;


if(
item.user_id !== currentUser.id &&
peer.current
){

 await peer.current.addIceCandidate(
  item.candidate
 );

}



}

)

.subscribe();




return ()=>{

supabase.removeChannel(channel);

supabase.removeChannel(iceChannel);

};



},[callId]);





return (

<div
style={{
height:"100vh",
background:"#111",
color:"#fff",
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center"
}}
>

<h2>
📞 FeriLine Call
</h2>


<p>
{status}
</p>


<audio
ref={audioRef}
autoPlay
/>


<button
onClick={async()=>{

  if(callId){

    await supabase
      .from("calls")
      .update({
        status:"ended"
      })
      .eq("id", callId);

  }


  if(localStream.current){

    localStream.current
      .getTracks()
      .forEach(track=>track.stop());

  }


  onBack();

}}
style={{
width:"120px",
height:"50px"
}}
>
End call
</button>


</div>

);


}