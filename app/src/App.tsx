import React, { useState } from "react";
import "./styles.css";
import Register from "./Register";
import ChatList from "./ChatList";
import { socket } from "./socket";

export default function App() {

  const savedUser = localStorage.getItem("ferilineUser");
  const loggedIn = localStorage.getItem("ferilineLoggedIn");


  const [page, setPage] = useState(
    savedUser && loggedIn === "true"
      ? "chat"
      : "home"
  );


  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");



  function login() {

    const saved =
      localStorage.getItem("ferilineUser");


    if (!saved) {

      alert("No account found");
      return;

    }


    const user =
      JSON.parse(saved);



    if (
      phone === user.phone &&
      pin === user.pin
    ) {


      localStorage.setItem(
        "ferilineLoggedIn",
        "true"
      );


      socket.connect();


      socket.emit(
        "registerUser",
        user
      );


      setPage("chat");


    } else {


      alert(
        "Wrong phone or PIN"
      );


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
        onClick={() =>
          setPage("register")
        }
      >
        Create account
      </button>



      <h2>
        Login
      </h2>



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
        onClick={login}
      >
        Login
      </button>


    </div>

  );

}