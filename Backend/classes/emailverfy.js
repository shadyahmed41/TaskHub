const nodemailer = require("nodemailer");
require('dotenv').config();

// Function to send OTP to the user's email
const sendVerificationEmail = async (userEmail, otp) => {
  // Generate a random OTP

  // Email configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "taskhubprojectmanagment@gmail.com", // Replace with your Gmail email address
      pass: process.env.GMAIL_EMAIL_PASS, // Replace with your Gmail email password
    },
  });

  // Email content
  const mailOptions = {
    from: "taskhubprojectmanagment@gmail.com",
    to: userEmail,
    subject: "OTP Verification",
    text: `Your OTP is: ${otp}. Use this code to verify your email address.`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return otp; // Return the generated OTP
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Propagate the error
  }
};

module.exports = sendVerificationEmail;
