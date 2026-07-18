import { useState } from "react";
import { supabase } from "./supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  async function registerUser() {
    setMessage("");

    // Проверка
    if (!name.trim()) {
      setMessage("Въведете име.");
      return;
    }

    if (!phone.trim()) {
      setMessage("Въведете телефон.");
      return;
    }

    if (pin.length !== 4) {
      setMessage("PIN трябва да бъде точно 4 цифри.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          pin: pin.trim(),
        },
      ]);

    if (error) {
      if (
        error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique")
      ) {
        setMessage("❌ Този телефон вече е регистриран.");
      } else {
        setMessage("❌ " + error.message);
      }
      return;
    }

    setMessage("✅ Регистрацията е успешна!");

    setName("");
    setPhone("");
    setPin("");
  }

  return (
    <div
      style={{
        maxWidth: 350,
        margin: "50px auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h2 style={{ textAlign: "center" }}>FeriLine регистрация</h2>

      <input
        type="text"
        placeholder="Име"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="password"
        placeholder="PIN (4 цифри)"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        maxLength={4}
      />

      <button onClick={registerUser}>
        Регистрация
      </button>

      {message && (
        <p style={{ textAlign: "center" }}>
          {message}
        </p>
      )}
    </div>
  );
}