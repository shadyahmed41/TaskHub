const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Reference to the project associated with the meeting
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    meetType: {
      type: String,
    },
    // description: String,
    startDate: {
      type: Date,
      // required: true,
      default: Date.now,
    },
    // startTime: {
    //   type: Date,
    //   required: true,
    // },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to participants who joined the meeting
      },
    ],
    currentParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to participants who joined the meeting
      },
    ],
    keypoints: [
      {
        keypoint: {
          type: String,
        },
        outcomes: [
          {
            outcome: {
              type: String,
            },
          },
        ],
      },
    ],
    // Add more fields as needed, such as chat messages, recordings, etc.
    ended: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false, // Disable the version key (__v)
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = Meeting;
