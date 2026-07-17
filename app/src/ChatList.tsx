import React from "react";
import ChatRoom from "./ChatRoom";

export default function ChatList() {
  const [activeChat, setActiveChat] = React.useState("");

  function logout() {
    localStorage.setItem(
      "ferilineLoggedIn",
      "false"
    );

    window.location.reload();
  }

  if (activeChat === "Alex") {
    return (
      <ChatRoom
        onBack={() => setActiveChat("")}
      />
    );
  }

  return (
    <div className="chat-list">

      <h1>FeriLine</h1>

      <h2>Chats</h2>

      <div
        onClick={() => setActiveChat("Alex")}
        style={{ cursor: "pointer" }}
      >
        <p>👤 Alex</p>
        <p>Last message: Hello!</p>
      </div>

      <div>
        <p>👤 Maria</p>
        <p>Last message: See you soon</p>
      </div>

      <button>
        New chat
      </button>

      <br />

      <button
        className="primary-btn"
        onClick={logout}
      >
        Logout
      </button>

    </div>
  );
}