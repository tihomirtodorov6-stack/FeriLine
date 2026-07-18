import { useState } from "react";
import { supabase } from "./supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  async function registerUser() {
    const { error } = await supabase
      .from("users")
      .insert([
        {
          name: name,
          phone: phone,
          pin: pin
        }
      ]);

    if (error) {
      setMessage("Грешка: " + error.message);
      return;
    }

    setMessage("Регистрацията е успешна!");
  }

  return (
    <div>
      <h2>FeriLine регистрация</h2>

      <input
        placeholder="Име"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={4}
      />

      <button onClick={registerUser}>
        Регистрация
      </button>

      <p>{message}</p>
    </div>
  );
}