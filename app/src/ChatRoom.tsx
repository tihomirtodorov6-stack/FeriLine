import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({ name, contact, onBack }: any) {

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const bottomRef = useRef<any>(null);

  const currentUser = JSON.parse(
    localStorage.getItem("ferilineUser") || "{}"
  );


  const otherUser = contact || {
    id:null,
    name:name
  };



  async function loadHistory(){

    const { data } = await supabase
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



    const channel = supabase
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

            setMessages(old=>[
              ...old,
              msg
            ]);

          }

        }
      )
      .subscribe();



    return ()=>{
      supabase.removeChannel(channel);
    };


  },[]);





  async function sendMessage(){

    if(!text.trim()){
      return;
    }


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
          {otherUser.name.charAt(0).toUpperCase()}
        </div>



        <h2>
          {otherUser.name}
        </h2>


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


            <div>
              {msg.text}
            </div>


            <span className="message-time">

              {new Date(
                msg.created_at
              ).toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit"
              })}

            </span>


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


        <button
          onClick={sendMessage}
        >
          Send
        </button>


      </div>


    </div>

  );

}