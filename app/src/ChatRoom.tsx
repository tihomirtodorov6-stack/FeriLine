import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function ChatRoom({
  name,
  onBack
}: {
  name: string;
  onBack: () => void;
}) {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [friend, setFriend] = useState<any>(null);



  useEffect(() => {

    loadFriend();

  }, []);



  async function loadFriend() {

    const { data } = await supabase
      .from("users")
      .select("id,name,phone")
      .eq("name", name)
      .single();


    if (data) {

      setFriend(data);
      loadMessages(data.id);

    }

  }



  async function loadMessages(friendId: string) {

    const savedUser =
      localStorage.getItem("ferilineUser");


    if (!savedUser) {
      return;
    }


    const currentUser =
      JSON.parse(savedUser);



    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUser.id})`
      )
      .order("created_at", {
        ascending: true
      });


    setMessages(data || []);

  }



  async function sendMessage() {

    if (!message.trim() || !friend) {
      return;
    }


    const savedUser =
      localStorage.getItem("ferilineUser");


    if (!savedUser) {
      return;
    }


    const currentUser =
      JSON.parse(savedUser);



    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: currentUser.id,
          receiver_id: friend.id,
          text: message
        }
      ])
      .select()
      .single();



    if (error) {

      console.log(error);
      return;

    }


    setMessages((prev) => [
      ...prev,
      data
    ]);


    setMessage("");

  }



  return (

    <div className="chat-room">


      <div className="chat-header">

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>


        <h2>
          {name}
        </h2>


      </div>



      <div className="messages">

        {messages.map((msg) => (

          <div
            key={msg.id}
            className={
              msg.sender_id ===
              JSON.parse(
                localStorage.getItem("ferilineUser") || "{}"
              ).id
              ? "message mine"
              : "message"
            }
          >

            {msg.text}

          </div>

        ))}

      </div>



      <div className="message-input">

        <input
          placeholder="Message..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
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