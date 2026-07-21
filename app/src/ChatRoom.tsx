import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import { playMessageSound } from "./sound";
import Call from "./Call";
export default function ChatRoom({ name, contact, onBack }: any) {

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [online, setOnline] = useState(false);
const [calling, setCalling] = useState(false);const [incomingCall, setIncomingCall] = useState<any>(null);
  const bottomRef = useRef<any>(null);
const callPeer = useRef<RTCPeerConnection | null>(null);
const callStream = useRef<MediaStream | null>(null);
const callAudio = useRef<HTMLAudioElement | null>(null);
  const currentUser = JSON.parse(
    localStorage.getItem("ferilineUser") || "{}"
  );


  const otherUser = contact || {
    id:null,
    name:name
  };



  async function updateMyStatus(){

    if(!currentUser.id) return;

    await supabase
      .from("user_status")
      .upsert({
        user_id: currentUser.id,
        online:true,
        last_active:new Date()
      });

  }



  async function checkFriendStatus(){

    if(!otherUser.id) return;


    const {data}=await supabase
      .from("user_status")
      .select("last_active")
      .eq("user_id", otherUser.id)
      .single();


    if(data?.last_active){

      const last = new Date(data.last_active).getTime();
      const now = new Date().getTime();

      setOnline(
        now - last < 60000
      );

    } else {

      setOnline(false);

    }

  }





  async function loadHistory(){

    const {data}=await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`
      )
      .order(
        "created_at",
        {
          ascending:true
        }
      );


    setMessages(data || []);

  }







  useEffect(()=>{

    if(!currentUser.id || !otherUser.id){
      return;
    }


    loadHistory();

    updateMyStatus();

    checkFriendStatus();



    const timer=setInterval(()=>{

      updateMyStatus();

      checkFriendStatus();

    },10000);




    const channel=supabase
      .channel(
        "chat-" + currentUser.id + "-" + otherUser.id
      )
      .on(
        "postgres_changes",
        {
          event:"INSERT",
          schema:"public",
          table:"messages"
        },
        (payload)=>{

          const msg:any = payload.new;


          if(
            (msg.sender_id===currentUser.id &&
             msg.receiver_id===otherUser.id)
            ||
            (msg.sender_id===otherUser.id &&
             msg.receiver_id===currentUser.id)
          ){


            setMessages(old=>{

              if(old.some(x=>x.id===msg.id)){
                return old;
              }


              // звук само при получено съобщение
              if(msg.sender_id===otherUser.id){
                playMessageSound();
              }


              return [
                ...old,
                msg
              ];

            });


          }

        }
      )
      .subscribe();


const callChannel = supabase
  .channel("calls-" + currentUser.id)
  .on(
    "postgres_changes",
    {
      event:"INSERT",
      schema:"public",
      table:"calls",
      filter:`receiver_id=eq.${currentUser.id}`
    },
    (payload)=>{

      const call:any = payload.new;

      if(call.status === "ringing"){
        console.log("INCOMING CALL", call);
        setIncomingCall(call);
      }

    }
  )
  .subscribe();
    return ()=>{

  clearInterval(timer);

  supabase.removeChannel(channel);

  supabase.removeChannel(callChannel);

};


  },[]);








  async function sendMessage(){

    if(!text.trim()) return;


    const {data,error}=await supabase
      .from("messages")
      .insert([
        {
          sender_id:currentUser.id,
          receiver_id:otherUser.id,
          text:text.trim()
        }
      ])
      .select()
      .single();



    if(error){

      console.log(error);
      return;

    }


    setText("");


    setMessages(old=>[

      ...old,
      data

    ]);

  }








  useEffect(()=>{

    bottomRef.current?.scrollIntoView({
      behavior:"smooth"
    });

  },[messages]);





async function acceptCall(){

  const stream = await navigator.mediaDevices.getUserMedia({
    audio:true
  });

  callStream.current = stream;


  const pc = new RTCPeerConnection({
    iceServers:[
      {
        urls:"stun:stun.l.google.com:19302"
      }
    ]
  });


  callPeer.current = pc;


  stream.getTracks().forEach(track=>{
    pc.addTrack(track, stream);
  });


  pc.ontrack = (event)=>{

    if(callAudio.current){

      callAudio.current.srcObject =
        event.streams[0];

    }

  };


  pc.onicecandidate = async(event)=>{

    if(event.candidate){

      await supabase
        .from("call_ice_candidates")
        .insert({

          call_id: incomingCall.id,

          user_id: currentUser.id,

          candidate:event.candidate

        });

    }

  };


  await pc.setRemoteDescription(
    incomingCall.offer
  );


  const answer = await pc.createAnswer();

  await pc.setLocalDescription(answer);


  await supabase
    .from("calls")
    .update({

      status:"accepted",

      answer:answer

    })
    .eq(
      "id",
      incomingCall.id
    );
await supabase
  .from("calls")
  .update({
    status:"accepted",
    answer:answer
  })
  .eq(
    "id",
    incomingCall.id
  );

  setInco

 setIncomingCall(null);
setCalling(true);

}
if(incomingCall){

  return(
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

      <h2>📞 Incoming call</h2>

      <p>Someone is calling you</p>

  


  <button
  onClick={acceptCall}
  style={{
    width:"150px",
    height:"150px",
    borderRadius:"50%",
    background:"green",
    color:"white",
    fontSize:"22px",
    margin:"20px",
    border:"none"
  }}
>
  Приеми
</button>
<button
  onClick={async()=>{

    await supabase
      .from("calls")
      .update({
        status:"rejected"
      })
      .eq("id", incomingCall.id);

    setIncomingCall(null);

  }}
  style={{
    width:"150px",
    height:"150px",
    borderRadius:"50%",
    background:"red",
    color:"white",
    fontSize:"22px",
    border:"none"
  }}
>
  Откажи
</button>

    </div>
  );

}
if (calling) {
  return (
    <Call
      contact={otherUser}
      onBack={() => setCalling(false)}
    />
  );
}
  return (

    <div className="chat-room">


      <div className="chat-header">


        <button
          className="back-btn"
          onClick={onBack}
        >
          ←
        </button>



        <div className="chat-avatar">

          {otherUser.name
            ? otherUser.name.charAt(0).toUpperCase()
            : "F"
          }

        </div>




        <div className="user-title">

          <h2>
            {otherUser.name}
          </h2>


          <span className="online-status">

            {online
              ? "🟢 Online"
              : "⚪ Offline"
            }

          </span>


        </div>





        <div className="call-buttons">

          <button
  onClick={() => setCalling(true)}
>
  📞
</button>

          <button>📷</button>

        </div>



      </div>






      <div className="messages">


        {messages.map(msg=>(

          <div

            key={msg.id}

            className={
              msg.sender_id===currentUser.id
              ? "message mine"
              : "message"
            }

          >

            {msg.text}


          </div>


        ))}


        <div ref={bottomRef}/>


      </div>







      <div className="message-input">


        <input

          value={text}

          placeholder="Message..."

          onChange={(e)=>setText(e.target.value)}

          onKeyDown={(e)=>
            e.key==="Enter" && sendMessage()
          }

        />



        <button onClick={sendMessage}>

          Send

        </button>



      </div>


    </div>

  );

}