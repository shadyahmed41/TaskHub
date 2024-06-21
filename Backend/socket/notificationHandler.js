const Notification = require("../models/notificationmodel");
const User = require("../models/usermodel");

let socketInstance; // Store the socket globally

const notificationHandler = (socket) => {
    socket.on("get-notification", async () => {
        const user = await User.findOne({ 'email.address': socket.user.email }).select('+_id');
        if (!user) {
            return;
        }
        const notifications = await Notification.find({ recipient: user._id }).sort({
            timestamp: -1,
          });
          const unreadnotifications = await Notification.find({ recipient: user._id, view: false }).sort({
            timestamp: -1,
          });
        if (!notifications) {
            return;
        }
        // console.log(notifications);
        socket.emit("notificationlist", { notifications, unreadnotifications });
    })

    socket.on("view-notifications", async () => {
        try {
            const user = await User.findOne({ 'email.address': socket.user.email }).select('+_id');
        
            // Mark notifications as read for the specified user
            await Notification.updateMany({ recipient: user._id }, { view: true });

            const notifications = await Notification.find({ recipient: user._id, }).sort({ timestamp: -1, });
            if (!notifications) {
              return;
            }
            // console.log(notifications);
        
            // res.json({ success: true });
            setInterval(() => {
                socket.emit("notificationlist", { notifications });
              }, 5000);
          } catch (error) {
            console.error("Error marking notifications as read:", error);
            // res.status(500).json({ message: "Internal server error" });
          }
    })

    socket.on("read-notification", async (data) => {
        try {
            const notificationId = data.notificationID;
            await Notification.findByIdAndUpdate(notificationId, { read: true });
          } catch (error) {
            console.error("Error marking notification as read:", error);
          }
    })
}

// Function to handle notification creation
async function createNotification(recipientId, message) {
    try {
        const notification = new Notification({
            recipient: recipientId,
            message: message,
        });
        await notification.save();
        // Emit notification event to the client
        if (socketInstance) {
            socketInstance.emit("notification", {
                recipient: recipientId,
                message: message,
            });
            onlineAccounts.forEach((socketId) => {
                socketInstance.to(socketId).emit("notification", {
                    recipient: recipientId,
                    message: message,
                });
            });
        }
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

// Function to set the socket instance
function setSocketInstance(socket) {
    socketInstance = socket;
}

module.exports = {
    notificationHandler: notificationHandler,
    setSocketInstance: setSocketInstance,
    createNotification: createNotification,
};