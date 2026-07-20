import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Call({ contact, onBack }: any) {

  const [status, setStatus] = useState("Starting call...");
  const [callId, setCallId] = useState<string | null>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("ferilineUser") || "{}"
  );


  async function startCall(){

    if(!currentUser.id || !contact.id){
      setStatus("Missing user");
      return;
    }


    try {

      await navigator.mediaDevices.getUserMedia({
        audio:true
      });

    } catch(error){

      setStatus("Microphone denied");
      return;

    }


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

    setStatus("Calling " + contact.name);

  }



  useEffect(()=>{

    startCall();

  },[]);



  useEffect(()=>{

    if(!callId) return;


    const channel = supabase
      .channel("call-status-" + callId)
      .on(
        "postgres_changes",
        {
          event:"UPDATE",
          schema:"public",
          table:"calls",
          filter:`id=eq.${callId}`
        },
        (payload)=>{

          const call:any = payload.new;


          if(call.status === "accepted"){

            setStatus("Connected");

          }


          if(call.status === "rejected"){

            setStatus("Call declined");

          }

        }
      )
      .subscribe();


    return ()=>{

      supabase.removeChannel(channel);

    };


  },[callId]);



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

      <h2>📞 FeriLine Call</h2>

      <p>{status}</p>


      <button
        onClick={onBack}
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