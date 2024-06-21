require('dotenv').config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(accountSid, authToken);

const sendVerificationPhone = async (phone, otp) => {
  console.log(phone, otp);
  twilioClient.messages.create({
    body: `Your OTP for phone number verification is: ${otp}`,
    from: twilioPhoneNumber,
    to: `+20${phone}`,
  });
};

module.exports = sendVerificationPhone;
