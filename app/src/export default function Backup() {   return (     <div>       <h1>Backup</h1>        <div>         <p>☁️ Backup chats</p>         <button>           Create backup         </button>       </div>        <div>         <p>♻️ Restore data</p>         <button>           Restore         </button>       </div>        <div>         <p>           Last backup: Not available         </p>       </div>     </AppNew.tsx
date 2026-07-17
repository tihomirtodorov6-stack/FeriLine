import Register from "./Register";
import VerifyCode from "./VerifyCode";
import ProfileSetup from "./ProfileSetup";
import ChatList from "./ChatList";

export default function AppNew() {
  return (
    <div>
      <Register />

      <hr />

      <VerifyCode />

      <hr />

      <ProfileSetup />

      <hr />

      <ChatList />
    </div>
  );
}
