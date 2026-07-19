const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());


// Firebase настройка от Render Environment
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",
  },
});



app.get("/", (req,res)=>{
  res.send("FeriLine Server is running");
});



// изпращане на push известие
app.post("/send-notification", async (req,res)=>{

  const {
    token,
    title,
    body
  } = req.body;


  try {


    await admin.messaging().send({

      token: token,

      notification:{
        title:title,
        body:body
      }

    });


    res.json({
      success:true
    });


  } catch(error){

    console.log(error);

    res.json({
      success:false,
      error:error.message
    });

  }

});





io.on("connection",(socket)=>{

  console.log(
    "User connected:",
    socket.id
  );


});





const PORT = 3000;


server.listen(PORT,()=>{

  console.log(
    `FeriLine server running on port ${PORT}`
  );

});