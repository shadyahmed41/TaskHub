const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    email: {
      address: {
        type: String,
        required: [true, "Please provide your email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
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
    confirmpassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    phone: {
      number: {
        type: String,
        required: true,
        validate: {
          validator: function (el) {
            // Check for 11 digits and starts with 010, 011, 012, or 015
            return /^\b(010|011|012|015)\d{8}\b/.test(el);
          },
          message:
            "Please provide a valid phone number starting with 010, 011, 012, or 015 and containing 11 digits",
        },
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    bdate: {
      type: Date,
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
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.confirmpassword = undefined;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
