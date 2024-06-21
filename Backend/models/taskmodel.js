const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["not assigned", "in progress", "not submitted", "completed"],
      default: "not assigned",
    },
    phase: {
      type: String,
      enum: ["planing", "design", "development", "launch"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "low"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    upcomingtask: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    assignedMember: {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming you have a 'User' model for user information
      },
      dateofAssigning: {
        type: Date,
      },
    },
    sourcetask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    pretask: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    subtasks: [
      {
        title: {
          type: String,
          required: true,
        },
        checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    versionKey: false, // Disable the version key (__v)
  }
);

// Custom validation function
taskSchema.pre("save", function (next) {
  // Check if member is provided
  if (this.assignedMember && this.assignedMember.member) {
    // Set dateofAssigning to current date if not already set
    if (
      !this.assignedMember.dateofAssigning ||
      this.isModified("assignedMember")
    ) {
      this.assignedMember.dateofAssigning = new Date();
      this.status = "in progress";
    }
  } else {
    // If member is not provided, set assignedMember to undefined
    this.assignedMember = undefined;
    this.dueDate = undefined;
    this.subtasks = undefined;
  }
  // Check if the pretask array is empty
  if (!this.pretask || this.pretask.length === 0) {
    // If it's empty, set it to undefined to drop it from the database
    this.pretask = undefined;
  }
  if (!this.subtasks || this.subtasks.length === 0) {
    // If it's empty, set it to undefined to drop it from the database
    this.subtasks = undefined;
  }

  next();
});

const Task = mongoose.model("task", taskSchema);

module.exports = Task;
