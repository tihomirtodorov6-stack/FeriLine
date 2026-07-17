import React, { useState } from "react";

export default function ChatRoom({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "Alex",
      text: "Hello!",
      mine: false
    },
    {
      sender: "You",
      text: "Hi, welcome to FeriLine",
      mine: true
    }
  ]);

  function sendMessage() {
    if (message.trim() === "") return;

    setMessages([
      ...messages,
      {
        sender: "You",
        text: message,
        mine: true
      }
    ]);

    setMessage("");
  }

  return (
    <div className="chat-room">

      <div className="chat-header">
        <button onClick={onBack}>
          ←
        </button>

        <h2>Alex</h2>
      </div>


      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.mine ? "message mine" : "message"}
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
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
}
