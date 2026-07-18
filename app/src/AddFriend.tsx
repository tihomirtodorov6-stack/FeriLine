import React, { useState } from "react";
import { socket } from "./socket";

export default function AddFriend({
  onBack
}: {
  onBack: () => void;
}) {

  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<any>(null);


  function searchUser() {

    if (phone.trim() === "") {
      return;
    }


    socket.emit(
      "findUser",
      phone
    );


    socket.once(
      "userFound",
      (data) => {

        setUser(data);

      }
    );


    socket.once(
      "userNotFound",
      () => {

        setUser(null);

        alert(
          "User not found"
        );

      }
    );

  }



  return (
    <div className="chat-list">

      <button
        onClick={onBack}
      >
        ← Back
      </button>


      <h1>
        Add Friend
      </h1>


      <input
        placeholder="Phone number"
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



      {user && (

        <div>

          <h2>
            {user.name}
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