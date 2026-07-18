import React, { useState } from "react";
import ChatRoom from "./ChatRoom";
import AddFriend from "./AddFriend";

export default function ChatList() {

  const [selectedContact, setSelectedContact] = useState<string | null>(null);

  const [addFriend, setAddFriend] = useState(false);


  const contacts: any[] = [];



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
        onBack={() =>
          setSelectedContact(null)
        }
      />
    );

  }



  if (addFriend) {

    return (
      <AddFriend
        onBack={() =>
          setAddFriend(false)
        }
      />
    );

  }




  return (

    <div className="chat-list">


      <h1>
        FeriLine
      </h1>


      <h2>
        Chats
      </h2>



      {contacts.length === 0 && (

        <p>
          No chats yet
        </p>

      )}



      {contacts.map((contact) => (

        <div
          key={contact.id}
          onClick={() =>
            setSelectedContact(contact.name)
          }

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





      <button
        className="primary-btn"
        onClick={() =>
          setAddFriend(true)
        }
      >
        + Add Friend
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