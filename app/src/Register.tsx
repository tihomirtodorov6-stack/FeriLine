import React, { useState } from "react";
import ChatList from "./ChatList";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [registered, setRegistered] = useState(false);

  function createAccount() {
    if (!firstName || !lastName || !birthDate || !pin) {
      alert("Fill all fields");
      return;
    }

    if (pin !== confirmPin) {
      alert("PIN codes do not match");
      return;
    }

    const feriId =
      "FL-" + Math.floor(10000000 + Math.random() * 90000000);

    const user = {
      firstName,
      lastName,
      birthDate,
      pin,
      feriId
    };

    localStorage.setItem(
      "ferilineUser",
      JSON.stringify(user)
    );

    setRegistered(true);
  }

  if (registered) {
    return <ChatList />;
  }

  return (
    <div className="feriline-home">

      <div className="logo">
        F
      </div>

      <h1>Create account</h1>

      <input
        placeholder="First name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        placeholder="Last name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        placeholder="Birth date DD/MM/YYYY"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />

      <input
        type="password"
        placeholder="Create PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm PIN"
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={createAccount}
      >
        Register
      </button>

    </div>
  );
}