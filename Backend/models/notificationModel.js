const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  view: {
    type: Boolean,
    default: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
},
{
  versionKey: false, // Disable the version key (__v)
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
