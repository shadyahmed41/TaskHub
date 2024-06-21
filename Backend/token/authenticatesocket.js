const jwt = require("jsonwebtoken");
require('dotenv').config();

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
//   console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    socket.user = decoded;
    // console.log("socket.user", socket.user.email);
  } catch (err) {
    const socketError = new Error("NOT_AUTHORIZED");
    return next(socketError);
  }

  next();
};

module.exports = verifyTokenSocket;
