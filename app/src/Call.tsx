import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

export default function Call({
  contact,
  onBack,
  mode,
  callData
}: any) {

  const [status, setStatus] = useState(
    mode === "caller"
      ? "Starting call..."
      : "Incoming call..."
  );

  const [callId, setCallId] = useState<number | null>(
    callData?.id || null
  );

  const peer = useRef<RTCPeerConnection | null>(null);

  const localStream = useRef<MediaStream | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentUser = useRef(
    JSON.parse(
      localStorage.getItem("ferilineUser") || "{}"
    )
  );


  function createPeerConnection(
    id:number
  ){

    const pc = new RTCPeerConnection({

      iceServers:[

        {
          urls:
          "stun:stun.l.google.com:19302"
        }

      ]

    });


    pc.ontrack = (event)=>{

      if(audioRef.current){

        audioRef.current.srcObject =
          event.streams[0];

      }

    };


    pc.onicecandidate = async(event)=>{

      if(
        event.candidate &&
        id
      ){

        const { error } =
          await supabase
          .from("call_ice_candidates")
          .insert({

            call_id:id,

            user_id:
            currentUser.current.id,

            candidate:
            event.candidate.toJSON()

          });


        if(error){

          console.log(
            "ICE SAVE ERROR",
            error
          );

        }

      }

    };


    peer.current = pc;


    return pc;

  }



  async function getMicrophone(){

    try{

      const stream =
        await navigator.mediaDevices
        .getUserMedia({

          audio:true

        });


      localStream.current =
        stream;


      return stream;


    }
    catch(error){

      console.log(
        "MIC ERROR",
        error
      );


      setStatus(
        "Microphone permission denied"
      );


      return null;

    }

  }



  async function startCaller(){

    if(
      !currentUser.current.id ||
      !contact?.id
    ){

      setStatus(
        "Missing user"
      );

      return;

    }


    const stream =
      await getMicrophone();


    if(!stream)
      return;


    const { data, error } =
      await supabase
      .from("calls")
      .insert([

        {

          caller_id:
          currentUser.current.id,

          receiver_id:
          contact.id,

          status:
          "ringing"

        }

      ])
      .select()
      .single();


    if(error){

      console.log(error);

      setStatus(
        "Call error"
      );

      return;

    }


    setCallId(
      data.id
    );


    const pc =
      createPeerConnection(
        data.id
      );


    stream
    .getTracks()
    .forEach(track=>{

      pc.addTrack(
        track,
        stream
      );

    });


    const offer =
      await pc.createOffer();


    await pc.setLocalDescription(
      offer
    );


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


  }  async function startReceiver(){

    if(
      !callData ||
      !callData.offer
    ){

      setStatus(
        "Missing call data"
      );

      return;

    }


    const stream =
      await getMicrophone();


    if(!stream)
      return;



    const pc =
      createPeerConnection(
        callData.id
      );



    stream
    .getTracks()
    .forEach(track=>{

      pc.addTrack(
        track,
        stream
      );

    });



    await pc.setRemoteDescription(
      callData.offer
    );



    const answer =
      await pc.createAnswer();



    await pc.setLocalDescription(
      answer
    );



    await supabase
    .from("calls")
    .update({

      answer:answer,

      status:"accepted"

    })
    .eq(
      "id",
      callData.id
    );



    setStatus(
      "Connected"
    );

  }





  async function listenForCallUpdates(){

    if(!callId)
      return;



    const channel =
      supabase
      .channel(
        "call-update-" + callId
      )
      .on(

        "postgres_changes",

        {

          event:"UPDATE",

          schema:"public",

          table:"calls",

          filter:
          `id=eq.${callId}`

        },

        async(payload)=>{


          const call:any =
            payload.new;



          if(
            call.answer &&
            peer.current &&
            mode==="caller"
          ){

            try{

              await peer.current
              .setRemoteDescription(
                call.answer
              );


              setStatus(
                "Connected"
              );

            }
            catch(error){

              console.log(
                "ANSWER ERROR",
                error
              );

            }

          }



          if(
            call.status==="ended"
          ){

            setStatus(
              "Call ended"
            );


            setTimeout(()=>{

              onBack();

            },1000);

          }



          if(
            call.status==="rejected"
          ){

            setStatus(
              "Call declined"
            );


            setTimeout(()=>{

              onBack();

            },1000);

          }


        }

      )
      .subscribe();



    return channel;

  }





  async function listenForIce(){

    if(!callId)
      return;



    const channel =
      supabase
      .channel(
        "ice-" + callId
      )
      .on(

        "postgres_changes",

        {

          event:"INSERT",

          schema:"public",

          table:"call_ice_candidates",

          filter:
          `call_id=eq.${callId}`

        },

        async(payload)=>{


          const item:any =
            payload.new;



          if(
            item.user_id !==
            currentUser.current.id &&
            peer.current
          ){

            try{

              await peer.current
              .addIceCandidate(
                item.candidate
              );

            }
            catch(error){

              console.log(
                "ICE ADD ERROR",
                error
              );

            }

          }


        }

      )
      .subscribe();



    return channel;

  }  useEffect(()=>{

    let callChannel:any;
    let iceChannel:any;


    async function init(){

      if(mode === "caller"){

        await startCaller();

      }

    }


    init();



    async function setup(){

      if(
        mode==="receiver" &&
        callData
      ){

        setCallId(
          callData.id
        );


        await startReceiver();

      }

    }


    setup();



    const timer =
      setInterval(async()=>{

        if(
          callId
        ){

          if(!callChannel){

            callChannel =
              await listenForCallUpdates();

          }


          if(!iceChannel){

            iceChannel =
              await listenForIce();

          }

        }


      },500);



    return ()=>{


      clearInterval(timer);



      if(callChannel){

        supabase
        .removeChannel(
          callChannel
        );

      }



      if(iceChannel){

        supabase
        .removeChannel(
          iceChannel
        );

      }



      if(
        localStream.current
      ){

        localStream.current
        .getTracks()
        .forEach(track=>{

          track.stop();

        });

      }



      if(
        peer.current
      ){

        peer.current.close();

      }


    };


  },[]);






  async function endCall(){

    if(callId){

      await supabase
      .from("calls")
      .update({

        status:"ended"

      })
      .eq(
        "id",
        callId
      );

    }



    if(
      localStream.current
    ){

      localStream.current
      .getTracks()
      .forEach(track=>{

        track.stop();

      });

    }



    if(
      peer.current
    ){

      peer.current.close();

    }



    onBack();


  }






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

        onClick={endCall}

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