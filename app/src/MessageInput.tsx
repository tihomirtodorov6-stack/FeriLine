import { useState } from "react";

export default function MessageInput() {
  const [message, setMessage] = useState("");

  function sendMessage() {
    if (message.trim() === "") return;

    console.log(message);
    setMessage("");
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
