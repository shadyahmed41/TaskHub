const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a 'User' model for user information
      required: true,
    },
  },
  {
    versionKey: false, // Disable the version key (__v)
  }
);
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
