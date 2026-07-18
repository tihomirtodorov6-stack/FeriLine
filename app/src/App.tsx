import { useState } from "react";
import "./styles.css";
import Register from "./Register";
import ChatList from "./ChatList";
import { supabase } from "./supabase";

export default function App() {

  const [page, setPage] = useState(
    localStorage.getItem("ferilineLoggedIn") === "true"
      ? "chat"
      : "home"
  );

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");


  async function login() {

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .eq("pin", pin)
      .single();


    if (error || !data) {

      alert("Wrong phone or PIN");
      return;

    }


    localStorage.setItem(
      "ferilineUser",
      JSON.stringify(data)
    );


    localStorage.setItem(
      "ferilineLoggedIn",
      "true"
    );


    setPage("chat");

  }



  if (page === "register") {

    return (
      <Register
        onBack={() => setPage("home")}
      />
    );

  }



  if (page === "chat") {

    return (
      <ChatList />
    );

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
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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