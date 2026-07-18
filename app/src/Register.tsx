import React, { useState } from "react";
import { socket } from "./socket";

export default function Register() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");


  function register() {

    if (
      name.trim() === "" ||
      phone.trim() === "" ||
      pin.trim() === ""
    ) {
      alert("Fill all fields");
      return;
    }


    const user = {
      name,
      phone,
      pin
    };


    localStorage.setItem(
      "ferilineUser",
      JSON.stringify(user)
    );


    socket.emit(
      "registerUser",
      user
    );


    alert("Account created");


    window.location.reload();

  }



  return (
    <div className="feriline-home">

      <div className="logo">
        F
      </div>


      <h1>
        Create FeriLine account
      </h1>


      <input
        placeholder="Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
      />


      <input
        placeholder="Phone number"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
      />


      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) =>
          setPin(e.target.value)
        }
      />


      <button
        className="primary-btn"
        onClick={register}
      >
        Create account
      </button>


    </div>
  );
}