import { io } from "socket.io-client";

const SERVER_URL = "http://YOUR_SERVER_ADDRESS:3000";

export const socket = io(SERVER_URL, {
  autoConnect: false
});