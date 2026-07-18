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

    if (!savedUser) return;


    const currentUser = JSON.parse(savedUser);



    const { data: contactData, error } = await supabase
      .from("contacts")
      .select("*")
      .or(
        `user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`
      );


    if(error){
      console.log(error);
      return;
    }



    const friendIds = contactData.map((item:any)=>
      item.user_id === currentUser.id
      ? item.friend_id
      : item.user_id
    );



    const { data: users } = await supabase
      .from("users")
      .select("id,name,phone")
      .in("id", friendIds);



    const usersWithMessages = await Promise.all(
      (users || []).map(async(user:any)=>{


        const { data: lastMessage } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUser.id})`
          )
          .order("created_at", {
            ascending:false
          })
          .limit(1)
          .single();



        return {
          ...user,
          lastMessage: lastMessage || null
        };


      })
    );



    setContacts(usersWithMessages);

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

    return (

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

    return (

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





  return (

    <div className="chat-list">


      <div className="chat-header">

        <h1>
          FeriLine
        </h1>


        <button
          onClick={() => setAddFriend(true)}
        >
          + Friend
        </button>

      </div>





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

              {user.name.charAt(0).toUpperCase()}

            </div>



            <div className="contact-info">


              <h3>
                {user.name}
              </h3>


              <p>

                {user.lastMessage
                  ? user.lastMessage.text
                  : user.phone
                }

              </p>


            </div>



          </div>


        ))}


      </div>





      <button onClick={logout}>
        Logout
      </button>



    </div>

  );

}