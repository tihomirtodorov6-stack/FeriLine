import React, { useEffect, useState } from "react";
import ChatRoom from "./ChatRoom";
import AddFriend from "./AddFriend";
import { supabase } from "./supabase";
import { requestNotificationPermission, disableNotifications } from "./firebase-messaging";


export default function ChatList() {

  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [addFriend, setAddFriend] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {

  loadContacts();


  const savedUser = localStorage.getItem("ferilineUser");

  if (!savedUser) return;


  const currentUser = JSON.parse(savedUser);


  const channel = supabase
    .channel("incoming-calls-" + currentUser.id)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "calls",
        filter: `receiver_id=eq.${currentUser.id}`
      },
      async (payload) => {

        const call = payload.new;


        const { data } = await supabase
          .from("users")
          .select("id,name")
          .eq("id", call.caller_id)
          .single();


        setIncomingCall({
          ...call,
          caller: data
        });

      }
    )
    .subscribe();


  return () => {
    supabase.removeChannel(channel);
  };


}, []);



  async function loadContacts() {

    const savedUser = localStorage.getItem("ferilineUser");

    if (!savedUser) return;


    const currentUser = JSON.parse(savedUser);



    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .or(
        `user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`
      );


    if(error){
      console.log(error);
      return;
    }



    const friendIds = data.map((item)=>(
      item.user_id === currentUser.id
      ? item.friend_id
      : item.user_id
    ));



    if(friendIds.length === 0){
      setContacts([]);
      return;
    }



    const { data:users } = await supabase
      .from("users")
      .select("id,name,phone")
      .in("id",friendIds);



    setContacts(users || []);

  }




  async function enableNotifications(){

  const token = await requestNotificationPermission();

  if(token){

    const user = JSON.parse(
      localStorage.getItem("ferilineUser") || "{}"
    );

    if(user.id){

      const { error } = await supabase
        .from("users")
        .update({
          push_token: token
        })
        .eq(
          "id",
          user.id
        );


      if(error){
        console.log(error);
      }

    }

    alert("🔔 Известията са включени!");

  } else {

    alert("Неуспешно включване.");

  }

}




  async function turnOffNotifications(){

    const result = await disableNotifications();


    if(result){

      alert("🔕 Известията са изключени!");

    } else {

      alert("Неуспешно изключване.");

    }

  }





  function logout(){

    localStorage.setItem(
      "ferilineLoggedIn",
      "false"
    );

    localStorage.removeItem(
      "ferilineUser"
    );

    window.location.reload();

  }





  if(selectedContact){

    return(
      <ChatRoom
        contact={selectedContact}
        name={selectedContact.name}
        onBack={()=>
          setSelectedContact(null)
        }
      />
    );

  }





  if(addFriend){

    return(
      <AddFriend
        onBack={()=>
          setAddFriend(false)
        }

        onStartChat={(user)=>{

          setSelectedContact(user);
          setAddFriend(false);

        }}
      />
    );

  }





  return(

    <div className="chat-list">


      <div className="chat-list-header">

        <h1>
          FeriLine
        </h1>


        <button
          onClick={()=>
            setAddFriend(true)
          }
        >
          + Friend
        </button>

      </div>



      <button
        className="primary-btn"
        onClick={enableNotifications}
      >
        🔔 Включи известия
      </button>


      <button
        className="primary-btn"
        onClick={turnOffNotifications}
      >
        🔕 Изключи известия
      </button>





      <div className="contacts">


        {contacts.map((user)=>(


          <div

            key={user.id}

            className="contact"

            onClick={()=>
              setSelectedContact(user)
            }

          >


            <div className="avatar">

              {user.name
                .charAt(0)
                .toUpperCase()
              }

            </div>



            <div className="contact-info">


              <h3>
                {user.name}
              </h3>



              <p>
                Hi
              </p>


            </div>


          </div>


        ))}


      </div>





      <button
        className="logout-btn"
        onClick={logout}
      >
        Logout
      </button>



    </div>

  );

}