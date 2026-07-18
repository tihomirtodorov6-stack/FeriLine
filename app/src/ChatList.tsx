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
      .select(`
        id,
        friend_id,
        users:friend_id (
          id,
          name,
          phone
        )
      `)
      .eq("user_id", currentUser.id);



    if (error) {

      console.log(error);
      return;

    }


    setContacts(data || []);

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
            setSelectedContact(contact.users)
          }
          style={{
            cursor: "pointer",
            padding: "15px"
          }}
        >

          <h3>
            👤 {contact.users?.name}
          </h3>

          <p>
            {contact.users?.phone}
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