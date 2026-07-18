import { useState } from "react";
import { supabase } from "./supabase";

export default function Register({
  onBack
}: {
  onBack?: () => void;
}) {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  async function registerUser() {

    setMessage("");

    if (!name.trim() || !phone.trim() || pin.length !== 4) {
      setMessage("Попълнете всички полета. PIN трябва да е 4 цифри.");
      return;
    }


    const { error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          pin: pin.trim()
        }
      ]);


    if (error) {
      setMessage("Грешка: " + error.message);
      return;
    }


    setMessage("✅ Регистрацията е успешна!");

    setName("");
    setPhone("");
    setPin("");
  }



  return (

    <div className="feriline-home">

      <div className="logo">
        F
      </div>


      <h1>
        FeriLine регистрация
      </h1>


      <input
        placeholder="Име"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />


      <input
        placeholder="Телефон"
        value={phone}
        onChange={(e)=>setPhone(e.target.value)}
      />


      <input
        type="password"
        placeholder="PIN (4 цифри)"
        value={pin}
        maxLength={4}
        onChange={(e)=>setPin(e.target.value)}
      />


      <button
        className="primary-btn"
        onClick={registerUser}
      >
        Регистрация
      </button>


      <button
        className="primary-btn"
        onClick={() => onBack && onBack()}
      >
        ⬅ Назад към Login
      </button>


      <p>
        {message}
      </p>


    </div>

  );
}