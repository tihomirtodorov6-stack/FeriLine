import React, { useState } from "react";

export default function ChatRoom({ onBack }: { onBack: () => void }) {
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

      <button
        className="secondary-btn"
        onClick={onBack}
      >
        ← Back
      </button>

      <h1>Chat with Alex</h1>

      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <b>{msg.sender}:</b> {msg.text}
          </p>
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
