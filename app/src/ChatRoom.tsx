import React, { useEffect, useState } from "react";
import { socket } from "./socket";

export default function ChatRoom({
  name,
  onBack
}: {
  name: string;
  onBack: () => void;
}) {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      text: "Hello!",
      mine: false
    }
  ]);


  useEffect(() => {

    socket.on("message", (data) => {

      setMessages((prev) => [
        ...prev,
        {
          text: data.text,
          mine: false
        }
      ]);

    });


    return () => {
      socket.off("message");
    };

  }, []);



  function sendMessage() {

    if (message.trim() === "") return;


    const currentUser =
      localStorage.getItem("ferilineUser");


    socket.emit("message", {

      sender: currentUser,

      receiver: name,

      text: message

    });


    setMessages((prev) => [
      ...prev,
      {
        text: message,
        mine: true
      }
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

        {messages.map((msg, index) => (

          <div
            key={index}
            className={
              msg.mine
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
          type="text"
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