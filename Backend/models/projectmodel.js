const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    leaderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a 'User' model for user information
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming you have a 'User' model for user information
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    joiningCode: {
      type: String,
      unique: true,
      // sparse: true  // Allow multiple documents to have no joining code (null or undefined), but enforce uniqueness if present
    },
    requestedmembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming you have a 'User' model for user information
      },
    ],
    field: {
      type: String,
      enum: [
        "Marketing Campaigns",
        "Product Development",
        "Sales Initiatives",
        "Healthcare IT Implementation",
        "Engineering Projects",
        "Clinical Trials Management",
        "Data Science and Analytics",
        "Software Engineering Projects",
        "Event Planning",
        "Cybersecurity Initiatives",
        "Others",
      ],
      default: "Others",
    },
  },
  {
    versionKey: false, // Disable the version key (__v)
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
