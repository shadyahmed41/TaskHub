const chatHandler = (socket) => {
  console.log("A new client connected");
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    console.log("User added:", userId);
    onlineUsers.set(userId, socket.id);
    console.log("Online users:", onlineUsers);
  });

  socket.on("send-msg", (data) => {
    console.log("Message sent:", data);
    if (Array.isArray(data.to)) {
      const toUsers = data.to;

      toUsers.forEach((toUserId) => {
        const sendUserSocket = onlineUsers.get(toUserId);
        // console.log("group",sendUserSocket);
        if (sendUserSocket) {
          // Emitting to each user
          socket
            .to(sendUserSocket)
            .emit("msg-recieve", { from: data.from, msg: data.msg, to: "group" });
        }
      });
    } else {
      const sendUserSocket = onlineUsers.get(data.to);
    //   console.log("private",sendUserSocket);
      if (sendUserSocket) {
        socket
          .to(sendUserSocket)
          .emit("msg-recieve", { from: data.from, msg: data.msg, to: data.to });
      }
    }
  });
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  if (onlineUsers.size > 0) {
    console.log("There are clients connected to the socket.");
  } else {
    console.log("There are no clients connected to the socket.");
  }
};

module.exports = chatHandler;
