import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Call({ contact, onBack }: any) {

  const [status, setStatus] = useState("Starting call...");

  const currentUser = JSON.parse(
    localStorage.getItem("ferilineUser") || "{}"
  );


  async function startCall(){

    if(!currentUser.id || !contact.id){
      setStatus("Missing user");
      return;
    }


    // включване на микрофона
    try {

      await navigator.mediaDevices.getUserMedia({
        audio:true
      });

      setStatus("Microphone ready");

    } catch(error){

      console.log(error);
      setStatus("Microphone permission denied");
      return;

    }



    const { error } = await supabase
      .from("calls")
      .insert([
        {
          caller_id: currentUser.id,
          receiver_id: contact.id,
          status:"ringing"
        }
      ]);


    if(error){

      console.log(error);
      setStatus("Call error");
      return;

    }


    setStatus("Calling " + contact.name);

  }



  useEffect(()=>{

    startCall();

  },[]);



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