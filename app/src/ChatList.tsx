import React from "react";

export default function ChatList() {

  function logout() {
    localStorage.setItem(
      "ferilineLoggedIn",
      "false"
    );

    window.location.reload();
  }

  return (
    <div className="chat-list">

      <h1>FeriLine</h1>

      <h2>Chats</h2>

      <div>
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