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


// временна база потребители
const users = {};


// връзки онлайн
const onlineUsers = {};


io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );


  // създаване/регистрация на потребител
  socket.on("registerUser", (user) => {

    users[user.id] = {
      id: user.id,
      name: user.name
    };


    onlineUsers[user.id] = socket.id;


    console.log(
      "Registered user:",
      user
    );


    socket.emit(
      "registered",
      users[user.id]
    );

  });



  // търсене на потребител
  socket.on(
    "findUser",
    (id) => {

      const user = users[id];


      if (user) {

        socket.emit(
          "userFound",
          user
        );

      } else {

        socket.emit(
          "userNotFound"
        );

      }

    }
  );



  // изпращане на съобщение
  socket.on(
    "message",
    (data) => {


      const receiver =
        onlineUsers[data.receiver];


      if (receiver) {

        io.to(receiver)
          .emit(
            "message",
            {
              sender: data.sender,
              text: data.text
            }
          );

      }


    }
  );



  socket.on(
    "disconnect",
    () => {

      console.log(
        "Disconnected:",
        socket.id
      );

    }
  );


});



const PORT = 3000;


server.listen(
  PORT,
  () => {

    console.log(
      `FeriLine server running on port ${PORT}`
    );

  }
);