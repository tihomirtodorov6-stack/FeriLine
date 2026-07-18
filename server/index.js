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


// активни връзки
const onlineUsers = {};



io.on("connection", (socket) => {

  console.log(
    "User connected:",
    socket.id
  );



  // регистрация с телефон
  socket.on(
    "registerUser",
    (user) => {


      users[user.phone] = {

        name: user.name,

        phone: user.phone

      };


      onlineUsers[user.phone] =
        socket.id;



      console.log(
        "Registered:",
        users[user.phone]
      );



      socket.emit(
        "registered",
        users[user.phone]
      );


    }
  );




  // търсене по телефон
  socket.on(
    "findUser",
    (phone) => {


      const user =
        users[phone];



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





  // съобщения
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
        "User disconnected:",
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