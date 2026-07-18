import { io } from "socket.io-client";

const SERVER_URL = "https://feriline.onrender.com";

export const socket = io(SERVER_URL);