const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please tell us your name!"],
      unique: true,
      minlength: [4, "Username must be at least 4 characters long"],
      maxlength: [20, "Username cannot be more than 20 characters long"],
      // Example format check (alphanumeric with underscores)
      match: [
        /^\w+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      validate: {
        validator: function (el) {
          // Check for at least one uppercase letter
          return (
            /[A-Z]/.test(el) &&
            // Check for at least one lowercase letter
            /[a-z]/.test(el) &&
            // Check for at least one digit
            /\d/.test(el) &&
            // Check for at least one special character
            /[!@#$%^&*(),.?":{}|<>]/.test(el)
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      },
      select: false,
    },
  },
  {
    versionKey: false, // Disable the version key (__v)
  }
);
adminSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
