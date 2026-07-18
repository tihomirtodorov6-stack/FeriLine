const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FeriLine Server is running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log("Registered:", userId);
  });

  socket.on("message", (data) => {
    const receiverSocket = users[data.receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("message", {
        sender: data.sender,
        text: data.text,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`FeriLine server running on port ${PORT}`);
});