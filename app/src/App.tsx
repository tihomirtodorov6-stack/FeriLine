
import React, { useState } from "react";
import "./styles.css";
import Register from "./Register";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "register") {
    return <Register />;
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

      <button className="secondary-btn">
        Login
      </button>
    </div>
  );
}