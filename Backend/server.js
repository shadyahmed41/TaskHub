const mongoose = require('mongoose');
const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const { Server } = require('socket.io');
const authSocket = require('./token/authenticatesocket');
const roomHandler = require('./socket/roomHandler');
const chatHandler = require('./socket/chatHandler');
const notificationHandler = require("./socket/notificationHandler");
require('./classes/analysisscheduler')
// require()
require('dotenv').config();

const io = new Server(server, {
  cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
  }
});

global.onlineUsers = new Map();
global.onlineAccounts = new Map();

io.use((socket, next) => {
  authSocket(socket, next);
});

io.on("connection", (socket) =>{
  console.log("User connected");
  console.log(socket.user.email);
  onlineAccounts.set(socket.user.email, socket.id);
  console.log('online users ', onlineAccounts);
  
  roomHandler(socket);
  
  chatHandler(socket);
  
  notificationHandler.setSocketInstance(socket);
  notificationHandler.notificationHandler(socket);
  
  socket.on('disconnect', ()=>{
      console.log("user disconnected");
      onlineAccounts.delete(socket.user.email);
  })

})

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`App running on port ${process.env.PORT}...`);
    });
    console.log("DB connection successful!");
  });

