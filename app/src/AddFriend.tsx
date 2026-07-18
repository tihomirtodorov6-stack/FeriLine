import React, { useState } from "react";
import { supabase } from "./supabase";

export default function AddFriend({
  onBack,
  onStartChat
}: {
  onBack: () => void;
  onStartChat: (user: any) => void;
}) {

  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");


  async function searchUser() {

    setUser(null);
    setMessage("");

    const { data, error } = await supabase
      .from("users")
      .select("id, name, phone")
      .eq("phone", phone.trim())
      .single();


    if (error || !data) {
      setMessage("Потребителят не е намерен.");
      return;
    }


    setUser(data);

  }



  async function addFriend() {

    const savedUser = localStorage.getItem("ferilineUser");

    if (!savedUser || !user) {
      return;
    }


    const currentUser = JSON.parse(savedUser);


    const { error } = await supabase
      .from("contacts")
      .insert([
        {
          user_id: currentUser.id,
          friend_id: user.id
        }
      ]);


    if (error) {

      setMessage("Грешка: " + error.message);
      return;

    }


    setMessage("✅ Добавен приятел");


    onStartChat(user);

  }



  return (

    <div className="chat-list">

      <button onClick={onBack}>
        ← Назад
      </button>


      <h1>
        Add Friend
      </h1>


      <input
        placeholder="Телефон"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
      />


      <button
        className="primary-btn"
        onClick={searchUser}
      >
        Search
      </button>


      <p>
        {message}
      </p>



      {user && (

        <div>

          <h2>
            👤 {user.name}
          </h2>


          <p>
            {user.phone}
          </p>


          <button
            className="primary-btn"
            onClick={addFriend}
          >
            Start Chat
          </button>


        </div>

      )}


    </div>

  );

}