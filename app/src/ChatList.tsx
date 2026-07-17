import React, { useState } from "react";
import ChatRoom from "./ChatRoom";

export default function ChatList() {
  const [activeChat, setActiveChat] = useState("");

  if (activeChat) {
    return <ChatRoom />;
  }

  return (
    <div className="feriline-home">

      <h1>FeriLine</h1>

      <h2>Chats</h2>

      <div
        onClick={() => setActiveChat("Alex")}
      >
        <p>👤 Alex</p>
        <p>Last message: Hello!</p>
      </div>

      <div
        onClick={() => setActiveChat("Maria")}
      >
        <p>👤 Maria</p>
        <p>Last message: See you soon</p>
      </div>

      <button className="primary-btn">
        New chat
      </button>

    </div>
  );
}
