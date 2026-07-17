import React, { useState } from "react";
import ChatList from "./ChatList";

export default function Register() {
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  if (verified) {
    return <ChatList />;
  }

  return (
    <div className="feriline-home">
      <div className="logo">F</div>

      <h1>Create account</h1>

      {!codeSent ? (
        <>
          <p>Enter your phone number</p>

          <input
            type="tel"
            placeholder="+44 7000 000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={() => setCodeSent(true)}
          >
            Send code
          </button>
        </>
      ) : (
        <>
          <p>Enter SMS code</p>

          <input
            type="number"
            placeholder="000000"
          />

          <button
            className="primary-btn"
            onClick={() => setVerified(true)}
          >
            Verify
          </button>
        </>
      )}
    </div>
  );
}
