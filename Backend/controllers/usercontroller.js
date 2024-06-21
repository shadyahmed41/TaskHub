const User = require("../models/usermodel");
const Project = require("../models/projectmodel");
const Post = require("../models/postmodel");
const Analysis = require("../models/analysismodel");
const bcrypt = require("bcryptjs");
const sendVerificationEmail = require("../classes/emailverfy");
const sendVerificationPhone = require("../classes/phoneverify");
const randomstring = require("randomstring");
const jwt = require("jsonwebtoken");
const { createNotification } = require("../socket/notificationHandler");
require('dotenv').config();
const crypto = require('crypto');
require('../classes/deleteuserscheduler');

function generateOTP(length) {
  const digits = '0123456789';
  const buf = crypto.randomBytes(length);
  let OTP = '';

  for (let i = 0; i < length; i++) {
      OTP += digits.charAt(buf[i] % 10);
  }

  return OTP;
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, password });

    const user = await User.findOne({ "email.address": email }).select(
      "+password"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not Found" });
    }

    console.log(user.email.isVerified);
    // console.log(await bcrypt.compare(password, user.password));

    if (
      user &&
      (await bcrypt.compare(password, user.password)) &&
      user.email.isVerified
    ) {
      // req.session.user = user; // Store user data in session
      // emaillogedin = email;
      const tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 24 hours from now
      const UserToken = jwt.sign({ email: email, exp: Math.floor(tokenExpiration.getTime() / 1000) }, process.env.TOKEN_SECRET);
      res.json({ success: true, UserToken, tokenExpiration: tokenExpiration.toISOString(), message: "login successful" });
    } else {
      res.status(404).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.resetpassword = async (req, res) => {
  const { email } = req.body;

  // Check if email exists in the database
  const user = await User.findOne({ "email.address": email });

  if (user) {
    // Generate and send OTP to user's email
    const userOTP = generateAndSendOTP(email);
    // Generate JWT token containing user's email and wrong attempts
    const token = jwt.sign(
      { email: user.email.address, OTP: userOTP, wrongAttempts: 0 },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, message: "verify-otp" });
  } else {
    res.json({ success: false, message: "Email not found" });
  }
};

function generateAndSendOTP(email) {
  OTP = generateOTP(6);

  // Send verification email
  sendVerificationEmail(email, OTP)
    .then(() => {
      console.log("OTP sent successfully:", OTP);
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
    });

  return OTP;
}

exports.verifyotp = (req, res) => {
  const { otp } = req.body;

  console.log(`otp is ${otp}`);

  // Increment wrong attempts
  req.user.wrongAttempts++;

  let message = "Invalid OTP";

  if (otp === req.user.OTP) {
    // Reset wrong attempts on successful OTP verification
    req.user.wrongAttempts = 0;
    message = "valid OTP";
  } else if (req.user.wrongAttempts >= 3) {
    // If wrong attempts reach 3, redirect to login page
    req.user.wrongAttempts = 0;
    message = "Redirect to login page";
  }

  const token = jwt.sign(
    {
      email: req.user.email,
      OTP: req.user.OTP,
      wrongAttempts: req.user.wrongAttempts,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ success: message === "valid OTP", message, token });
};

exports.updatepassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const passwordValidator =
      User.schema.path("password").options.validate.validator;

    // Validate the new password against the schema
    const isValidNewPassword = passwordValidator(newPassword);

    if (isValidNewPassword) {
      // Update the user's password in the database using the email stored in the session
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.findOneAndUpdate(
        { "email.address": req.user.email },
        { password: hashedPassword }
      );
      res.json({ success: true, message: "Password updated" });
    } else {
      res.json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
        validator: isValidNewPassword,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.resendotp = async (req, res) => {
  try {
    // Check if there is a logged-in user with a stored email
    if (req.user.email) {
      // Generate and send a new OTP to the user's email
      const userOTP = generateAndSendOTP(req.user.email);
      // Generate JWT token containing user's email
      const token = jwt.sign(
        {
          email: req.user.email,
          OTP: userOTP,
          wrongAttempts: req.user.wrongAttempts,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ success: true, token, message: "OTP resent successfully" });
    } else {
      res.json({ success: false, message: "No user logged in" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.useremail = async (req, res) => {
  // const userEmail = req.params.email;
  const user = await User.findOne({ "email.address": req.user.email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ userId: user.id });
};

exports.logout = (req, res) => {
  res.json({ success: true, message: "Logout success" });
};

function generateAndSendOTPPhone(phone) {
  // const formattedPhone = `+20${phone}`;
  // console.log('Formatted Phone:', formattedPhone);
  const otp = generateOTP(6);

  // Send verification phone
  sendVerificationPhone(phone, otp)
    .then(() => {
      console.log("OTP sent successfully:", otp);
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
    });

  return otp;
}

exports.reqphoneverify = async (req, res) => {
  try {
    const { phone } = req.body;

    // Check if the phone number is valid (you may want to add additional validation)
    if (!phone) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Check if the phone number is associated with an existing user
    const existingUser = await User.findOne({ "phone.number": phone });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate and send OTP for phone number
    const userOTP = generateAndSendOTPPhone(phone);
    console.log("OTP sent successfully:", userOTP);

    // Sign the user data into a JWT token
    const token = jwt.sign(
      {
        phone: existingUser.phone.number,
        OTP: userOTP,
        wrongAttempts: 0,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Return success message along with the token
    res.status(200).json({
      message: "Phone verification initiated successfully",
      token,
      userOTP,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.verifyphone = async (req, res) => {
  try {
    const enteredOTP = req.body.otp;
    let message = "Invalid OTP";

    // Fetch the user by phone number
    const user = await User.findOne({
      "phone.number": req.user.phone,
      "phone.isVerified": false,
    });

    // If the user doesn't exist or has already been verified, return an error
    if (!user) {
      console.log("User not found or already verified");
      return res
        .status(404)
        .json({ error: "User not found or already verified" });
    }

    // Check if the entered OTP is correct
    if (enteredOTP === req.user.OTP) {
      // Update the user to set isVerified to true
      const result = await User.updateOne(
        { "phone.number": req.user.phone, "phone.isVerified": false },
        { $set: { "phone.isVerified": true } }
      );

      if (result.modifiedCount > 0) {
        console.log("User is now verified");
        // Reset the wrong attempts counter upon successful verification
        req.user.wrongAttempts = 0;
        message = "Phone verification successful";
      }
    } else {
      // Invalid OTP logic
      req.user.wrongAttempts++;
      console.log(`Invalid OTP. Attempt ${req.user.wrongAttempts}/3`);
      if (req.user.wrongAttempts >= 3) {
        console.log("Maximum OTP attempts reached");
        // await User.deleteOne({ 'phone.number': req.user.phone, 'phone.isVerified': false });
        req.user.wrongAttempts = 0;
        message = "Maximum OTP attempts reached. Account not verified.";
      }
    }

    // Sign the token only once at the end
    const token = jwt.sign(
      {
        phone: req.user.phone,
        OTP: req.user.OTP,
        wrongAttempts: req.user.wrongAttempts,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message, token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.resendphone = (req, res) => {
  try {
    if (!req.user.phone) {
      return res
        .status(400)
        .json({ error: "Phone is required for resending OTP" });
    }
    const userOTP = generateAndSendOTPPhone(req.user.phone);
    console.log("OTP sent successfully:", userOTP);
    // Generate JWT token containing user's email
    const token = jwt.sign(
      {
        phone: req.user.phone,
        OTP: userOTP,
        wrongAttempts: req.user.wrongAttempts,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "OTP resent successfully", token, userOTP });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.register = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { name, email, password, confirmpassword, phone, day, month, year } =
      req.body;
    let dayy = parseInt(day, 10) + 1;
    const birthdateString = `${+year}-${+month}-${+dayy}`;
    const bdate = new Date(birthdateString);

    const newUser = new User({
      name,
      "email.address": email,
      password,
      confirmpassword,
      "phone.number": phone,
      bdate,
    });

    try {
      // Validate the user data against the schema
      await newUser.validate();

      // Save the user to the database
      try {
        const savedUser = await newUser.save();

        // Generate and send OTP only if the user is successfully saved
        const userOTP = generateAndSendOTP(email);

        // Generate JWT token containing user's email
        const token = jwt.sign(
          { email: email, OTP: userOTP, wrongAttempts: 0 },
          process.env.TOKEN_SECRET,
          { expiresIn: "1h" }
        );

        res.status(201).json({
          message: "User registered successfully",
          token,
          user: savedUser,
        });
      } catch (saveError) {
        // Handle database save error (e.g., duplicate key error)
        console.error("Database Save Error:", saveError);
        res
          .status(400)
          .json({ error: saveError, message: "user already taken" });
      }
    } catch (validationError) {
      // Handle validation error
      return res.status(400).json({ message: validationError.message });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.verifyuser = async (req, res) => {
  try {
    const enteredOTP = req.body.otp;
    let message = "Invalid OTP";

    // Fetch the user
    const user = await User.findOne({
      "email.address": req.user.email,
      "email.isVerified": false,
    });

    // If the user doesn't exist or has already been verified, return an error
    if (!user) {
      console.log("User not found or already verified");
      return res
        .status(400)
        .json({ message: "User not found or already verified" });
    }

    // Check if the entered OTP is correct
    if (enteredOTP === req.user.OTP) {
      // Update the user to set isVerified to true
      const result = await User.updateOne(
        { "email.address": req.user.email, "email.isVerified": false },
        { $set: { "email.isVerified": true } }
      );

      if (result.modifiedCount > 0) {
        console.log("User is now verified");
        // Reset the wrong attempts counter upon successful verification
        req.user.wrongAttempts = 0;
        message = "Email verification successful";
      }
    }

    // Invalid OTP logic
    req.user.wrongAttempts++;
    console.log(`Invalid OTP. Attempt ${req.user.wrongAttempts}/3`);
    if (req.user.wrongAttempts >= 3) {
      console.log("Maximum OTP attempts reached");
      await User.deleteOne({
        "email.address": req.user.email,
        "email.isVerified": false,
      });
      req.user.wrongAttempts = 0;
      message = "Maximum OTP attempts reached. Account not verified.";
    }

    // Sign the token only once at the end
    const token = jwt.sign(
      {
        email: req.user.email,
        OTP: req.user.OTP,
        wrongAttempts: req.user.wrongAttempts,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message, token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.resenduserotp = (req, res) => {
  try {
    // Generate and send OTP
    if (!req.user.email) {
      return res
        .status(400)
        .json({ message: "Email is required for resending OTP" });
    }
    const userOTP = generateAndSendOTP(req.user.email);
    // Generate JWT token containing user's email
    const token = jwt.sign(
      {
        email: req.user.email,
        OTP: userOTP,
        wrongAttempts: req.user.wrongAttempts,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({ message: "OTP resent successfully", token, userOTP });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteaccount = async (req, res) => {
  try {
    const { password } = req.body;

    // Find the user by email
    const user = await User.findOne({ "email.address": req.user.email }).select(
      "+password"
    );
    // If the user doesn't exist, return an error
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const userid = user._id;
    const useridd = user._id.toString();

    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password is not valid, return an error
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    const leaderprojects = await Project.find({ leaderID: userid }).exec();

      if (leaderprojects.length > 0) {
        return res.status(201).json({ success: false,
           message: "Cannot delete account while leading projects. Please transfer leadership before deleting account." ,
           projects: leaderprojects.map(project => ({
            projectId: project._id,
            projectName: project.title,
          }))
          });
      }

    const result = await User.deleteOne({ "email.address": req.user.email });
    const analysis = await Analysis.findOne();
    analysis.deletedUsers = analysis.deletedUsers + 1;
    analysis.save();

    if (result.deletedCount === 1) {
      

      // for (const project of leaderprojects) {
      //   const result = await Project.deleteOne({
      //     _id: project._id,
      //   });

      //   if (result.deletedCount === 1) {
      //     await Post.deleteMany({ projectId: project._id });
      //     console.log(`Project ${project._id} deleted successfully`);
      //   } else {
      //     console.error(`Error deleting project ${project._id}`);
      //   }
      // }

      const memberprojects = await Project.find({ members: userid }).exec();
      for (const project of memberprojects) {
        if (project && project._id) {
          // Filter out the user ID from the members array
          project.members = project.members.filter(
            (id) => id.toString() !== useridd
          );

          try {
            // Save each project individually
            await project.save();
            console.log(`Removed user ${useridd} from project ${project._id}`);
          } catch (error) {
            console.error("Error saving project:", error.message);
            // Handle the error as needed
          }
        } else {
          console.log(`Skipped project with null/undefined _id`);
        }
      }

      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.viewprofile = async (req, res) => {
  try {

    // Fetch the user based on the provided email
    const user = await User.findOne({ "email.address": req.user.email });

    // If the user is not found, respond with an error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If the user is found, send the user profile data (excluding the password)
    const userProfile = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthdate: user.bdate,
      image: user.image,
      // Add other profile details as needed
    };

    res.status(200).json({ user: userProfile });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.editprofile = async (req, res) => {
  try {
    const { password, name, phone, birthdate } = req.body;

    // Fetch the user based on the provided email
    const user = await User.findOne({ "email.address": req.user.email }).select(
      "+password"
    );

    // Check if the user exists and the password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      // Update the user data with the provided values
      const updateData = {
        name: name || user.name,
        "phone.number": phone || user.phone.number,
        bdate: birthdate ? new Date(birthdate) : user.bdate,
      };

      // Check if the phone number has changed
      if (phone && phone !== user.phone.number) {
        updateData["phone.isVerified"] = false;
      }

      try {
        // Update the user data in the database
        const result = await User.updateOne(
          { "email.address": req.user.email },
          { $set: updateData },
          { new: true, runValidators: true }
        );

        // console.log('Update Result:', result);

        // Check if the update was successful
        if (result.modifiedCount > 0) {
          console.log("User data updated successfully");
          res.status(200).json({ success: true });
        } else {
          console.error("User data not updated");
          res
            .status(400)
            .json({ success: false, error: "Failed to update user data" });
        }
      } catch (error) {
        // Handle the error
        console.error("Error updating user data:", error.message);
        res.status(400).json({ success: false, error: error.message });
      }
    } else {
      res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.updateimage = async (req, res) => {
  try {
    // New: Check if an image file was uploaded
    const profileImage = req.file;

    const user = await User.findOne({ "email.address": req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (profileImage) {
      // New: Update the user's image fields
      const result = await User.updateOne(
        { "email.address": req.user.email },
        {
          $set: {
            "image.imageURL": profileImage.buffer.toString("base64"),
            "image.imageName": profileImage.originalname,
          },
        }
      );

      // Check if the image was updated successfully
      if (result.modifiedCount > 0) {
        return res
          .status(200)
          .json({ success: true, message: "Image updated successfully" });
      } else {
        return res.status(200).json({
          success: false,
          message: "No changes made to the image",
        });
      }
    } else {
      // No image uploaded, so return success with a message
      return res
        .status(200)
        .json({ success: true, message: "No image uploaded" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


exports.editpassword = async (req, res) => {
  try {
    const { password, newpassword } = req.body;

    // Fetch the user based on the provided email
    const user = await User.findOne({ "email.address": req.user.email }).select(
      "+password"
    );

    // Check if the user exists and the password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      // Access the password validator from the schema
      const passwordValidator =
        User.schema.path("password").options.validate.validator;

      // Validate the new password against the schema
      const isValidNewPassword = passwordValidator(newpassword);

      if (isValidNewPassword) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newpassword, 12);

        // Update the user data in the database
        await User.updateOne(
          { "email.address": req.user.email },
          { $set: { password: hashedPassword } }
        );

        res.status(200).json({ success: true, message: "Password changed" });
      } else {
        res.status(400).json({
          success: false,
          error: "Invalid new password or confirm password",
          validator: isValidNewPassword,
        });
      }
    } else {
      res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.userid = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Step 1: Extract projectid from the request body
    const { projectId } = req.body;

    // Step 2: Fetch the project using the projectid
    const project = await Project.findById(projectId);
    console.log(project.title);

    // Step 3: Extract the leaderid from the project data
    const leaderID = project.leaderID;
    const currentUser = await User.findOne({
      "email.address": req.user.email,
    }).select("_id");

    // Step 4: Fetch the leader's data
    const currentUserData = await User.findById(currentUser).select([
      "email",
      "name",
      "image",
      "_id",
    ]);

    // Step 5: Fetch the members of the project
    // const members = await project.find({ project: members });
    const members = project.members;

    // Step 6: Retrieve the necessary information for each member
    const usersPromises = members.map(async (member) => {
      const user = await User.findById(member._id).select([
        "email",
        "name",
        "image",
        "_id",
      ]);
      return user;
    });
    // Fetch leader's data separately and push it to usersPromises
    const leaderData = await User.findById(leaderID).select([
      "email",
      "name",
      "image",
      "_id",
    ]);

    const groupData = {
      name: project.title,
      image: {
        imageURL: "",
        imageName: "",
      },
      _id: project._id,
    };
    // usersPromises.push(Promise.resolve(leaderData));
    console.log(groupData);
    const users = await Promise.all(usersPromises);
    // console.log(users)
    // Step 7: Return the leader's data along with the members' data

    res.json({
      currentUser: currentUserData,
      leaderData: leaderData,
      members: users,
      groupData: groupData,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getimage = async (req, res) => {
  try {
    const user = await User.findOne({ 'email.address': req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const firstName = user.name.split(" ")[0]; // Extract first name
    const secondName = user.name.split(" ")[1]; // Extract second name

    const firstLetter = firstName.charAt(0); // Get the first letter of the first name
    const secondLetter = secondName ? secondName.charAt(0) : "";
    console.log(firstLetter, secondLetter);

    const image = user.image.imageURL;
    
    res.status(200).json({ image, firstLetter, secondLetter });

  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  } 
};

exports.getname = async (req, res) => {
  try {
    const { projectId } = req.params;
    // console.log("ggggggggggggggggggggggggggggggg", projectId);
    const project = await Project.findById(projectId).populate("members", "name email");
    // console.log(project);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const user = await User.findOne({ _id: project.leaderID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Initialize an empty array to store member names
    const memberNames = [];
    
    // Add the leader's name to the array
    memberNames.push({ email: user.email.address, name: user.name });

    // Loop through each member in the project
    for (const member of project.members) {
      // console.log(member);
      const memberUser = await User.findOne({ 'email.address': member.email.address });
      if (memberUser) {
        // Add the member's name to the array
        memberNames.push({ email: member.email.address, name: memberUser.name });
      }
    }

    console.log(memberNames);
    
    // Send the array as the response
    res.status(200).json(memberNames);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
