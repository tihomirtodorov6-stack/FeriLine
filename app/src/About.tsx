import React, { useState } from "react";
import "./styles.css";
import Register from "./Register";
import ChatList from "./ChatList";
import { supabase } from "./supabase";
import { requestNotificationPermission } from "./firebase-messaging";

export default function App() {

  const savedUser = localStorage.getItem("ferilineUser");

  const [page, setPage] = useState(
    savedUser ? "chat" : "home"
  );

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");


  async function login() {

    const saved = localStorage.getItem("ferilineUser");

    if (!saved) {
      alert("No account found");
      return;
    }


    const user = JSON.parse(saved);


    if (
      (name === user.firstName || name === user.lastName) &&
      pin === user.pin
    ) {

      setPage("chat");


      const token = await requestNotificationPermission();


      if (token) {

        await supabase
          .from("users")
          .update({
            push_token: token
          })
          .eq("id", user.id);

      }


    } else {

      alert("Wrong name or PIN");

    }

  }



  if (page === "register") {
    return <Register />;
  }


  if (page === "chat") {
    return <ChatList />;
  }



  return (
    <div className="feriline-home">

      <div className="logo">
        F
      </div>

      <h1>
        FeriLine
      </h1>

      <p>
        Connect. Chat. Share.
      </p>


      <button
        className="primary-btn"
        onClick={() => setPage("register")}
      >
        Create account
      </button>


      <h2>
        Login
      </h2>


      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />


      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />


      <button
        className="primary-btn"
        onClick={login}
      >
        Login
      </button>


    </div>
  );
}