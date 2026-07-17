import React, { useState } from "react";

export default function ChatRoom() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "Alex",
      text: "Hello!"
    },
    {
      sender: "You",
      text: "Hi, welcome to FeriLine"
    }
  ]);

  function sendMessage() {
    if (message.trim() === "") return;

    setMessages([
      ...messages,
      {
        sender: "You",
        text: message
      }
    ]);

    setMessage("");
  }

  return (
    <div className="feriline-home">

      <h1>Chat with Alex</h1>

      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>
              <b>{msg.sender}:</b> {msg.text}
            </p>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={sendMessage}
      >
        Send
      </button>

    </div>
  );
}
