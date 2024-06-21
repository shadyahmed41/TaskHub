const Notification = require("../models/notificationmodel");

// async function createNotification(recipientId, message) {
//   try {
//     const notification = new Notification({
//       recipient: recipientId,
//       message: message,
//     });
//     await notification.save();
//   } catch (error) {
//     console.error("Error creating notification:", error);
//   }
// }

// exports.createNotification = createNotification;

exports.getnotifications = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Query the database for notifications for the specified user
    const notifications = await Notification.find({ recipient: userId }).sort({
      timestamp: -1,
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.markasread = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Mark notifications as read for the specified user
    await Notification.updateMany({ recipient: userId }, { view: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.read = async (req, res) => {
  try {
    const notificationId = req.params.id;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
