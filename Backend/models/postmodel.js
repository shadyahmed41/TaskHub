const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            message: {
              type: String,
              required: true,
            },
            date: {
              type: Date,
              default: Date.now,
            },
            likes: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            ],
          },
        ],
      },
    ],
    file: {
      fileURL: { type: String },
      fileName: { type: String },
    },
    image: {
      imageURL: { type: String },
      imageName: { type: String },
    },
  },
  {
    versionKey: false, // Disable the version key (__v)
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
