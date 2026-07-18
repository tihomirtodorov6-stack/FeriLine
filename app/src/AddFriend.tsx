import React, { useState } from "react";
import { supabase } from "./supabase";

export default function AddFriend({
  onBack
}: {
  onBack: () => void;
}) {

  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");

  async function searchUser() {

    setUser(null);
    setMessage("");

    if (phone.trim() === "") {
      setMessage("Въведи телефон.");
      return;
    }

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


  return (
    <div className="chat-list">

      <button onClick={onBack}>
        ← Назад
      </button>


      <h1>
        Add Friend
      </h1>


      <input
        placeholder="Телефонен номер"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
      />


      <button
        className="primary-btn"
        onClick={searchUser}
      >
        Търси
      </button>


      <p>{message}</p>


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
          >
            Start Chat
          </button>


        </div>

      )}

    </div>
  );
}