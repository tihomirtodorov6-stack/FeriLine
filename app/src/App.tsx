import React, { useState } from "react";
import "./styles.css";
import Register from "./Register";
import ChatList from "./ChatList";

export default function App() {
  const [page, setPage] = useState("home");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  function login() {
    const savedUser = localStorage.getItem("ferilineUser");

    if (!savedUser) {
      alert("No account found. Create an account first.");
      return;
    }

    const user = JSON.parse(savedUser);

    if (
      (name === user.firstName || name === user.lastName) &&
      pin === user.pin
    ) {
      setPage("chat");
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

      <h1>FeriLine</h1>

      <p>
        Connect. Chat. Share.
      </p>

      <button
        className="primary-btn"
        onClick={() => setPage("register")}
      >
        Create account
      </button>

      <h2>Login</h2>

      <input
        type="text"
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
        className="secondary-btn"
        onClick={login}
      >
        Login
      </button>
    </div>
  );
}