import React, { useEffect, useState } from "react";
import ChatRoom from "./ChatRoom";
import AddFriend from "./AddFriend";
import { supabase } from "./supabase";

export default function ChatList() {

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [addFriend, setAddFriend] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);


  useEffect(() => {
    loadContacts();
  }, []);



  async function loadContacts() {

    const savedUser = localStorage.getItem("ferilineUser");

    if (!savedUser) {
      return;
    }


    const currentUser = JSON.parse(savedUser);


    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .or(
        `user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`
      );


    if (error) {
      console.log(error);
      return;
    }


    const friendIds = data.map((item) =>
      item.user_id === currentUser.id
        ? item.friend_id
        : item.user_id
    );


    if (friendIds.length === 0) {
      setContacts([]);
      return;
    }


    const { data: users } = await supabase
      .from("users")
      .select("id,name,phone")
      .in("id", friendIds);


    setContacts(users || []);

  }



  function logout() {

    localStorage.setItem(
      "ferilineLoggedIn",
      "false"
    );

    localStorage.removeItem(
      "ferilineUser"
    );

    window.location.reload();

  }



  if (selectedContact) {

    return (
      <ChatRoom
        name={selectedContact.name}
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

        onStartChat={(user) => {

          setSelectedContact(user);
          setAddFriend(false);

        }}
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
            setSelectedContact(contact)
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
            {contact.phone}
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