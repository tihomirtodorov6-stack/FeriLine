export default function VerifyCode() {
  return (
    <div>
      <h1>Verify code</h1>

      <p>
        Enter the 6-digit code sent to your phone.
      </p>

      <input
        type="text"
        placeholder="000000"
        maxLength={6}
      />

      <button>
        Verify
      </button>
    </div>
  );
}
