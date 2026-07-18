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



    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id,name,phone")
      .in("id", friendIds);



    if (usersError) {

      console.log(usersError);
      return;

    }



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
        contact={selectedContact}
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


      <div className="chat-header">

        <h1>
          FeriLine
        </h1>


        <button
          onClick={() => setAddFriend(true)}
        >
          Add Friend
        </button>


      </div>





      <div className="contacts">


        {contacts.map((user) => (

          <div

            key={user.id}

            className="contact"

            onClick={() =>
              setSelectedContact(user)
            }

          >

            <h3>
              {user.name}
            </h3>


            <p>
              {user.phone}
            </p>


          </div>

        ))}


      </div>





      <button
        onClick={logout}
      >

        Logout

      </button>



    </div>

  );

}