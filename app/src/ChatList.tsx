import React, { useState } from "react";
import ChatRoom from "./ChatRoom";

export default function ChatList() {

  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const contacts = [
    {
      id: 1,
      name: "Alex",
      lastMessage: "Hello!"
    },
    {
      id: 2,
      name: "Maria",
      lastMessage: "See you soon"
    },
    {
      id: 3,
      name: "Ivan",
      lastMessage: "Hi there"
    }
  ];


  function logout() {
    localStorage.setItem(
      "ferilineLoggedIn",
      "false"
    );

    window.location.reload();
  }


  if (selectedContact) {
    return (
      <ChatRoom
        name={selectedContact}
        onBack={() => setSelectedContact(null)}
      />
    );
  }


  return (
    <div className="chat-list">

      <h1>FeriLine</h1>

      <h2>Chats</h2>


      {contacts.map((contact) => (

        <div
          key={contact.id}
          onClick={() => setSelectedContact(contact.name)}
          style={{
            cursor: "pointer",
            padding: "15px"
          }}
        >

          <h3>
            👤 {contact.name}
          </h3>

          <p>
            {contact.lastMessage}
          </p>

        </div>

      ))}


      <button>
        New chat
      </button>


      <button
        className="primary-btn"
        onClick={logout}
      >
        Logout
      </button>


    </div>
  );
}