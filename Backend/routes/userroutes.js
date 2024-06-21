const express = require("express");
const bodyParser = require("body-parser");
const authenticateToken = require("../token/authenticatetoken");
const authenticatephone = require("../token/authenticatephone");
const authenticateUserToken = require("../token/authenticateuser");
const usercontroller = require("../controllers/usercontroller");
const multer = require("multer");

const router = express.Router(); // Create a Router instance
const upload = multer();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/login", usercontroller.login);//
router.post("/reset-password", usercontroller.resetpassword);//
router.post("/verify-otp", authenticateToken, usercontroller.verifyotp);//
router.post( "/update-password", authenticateToken, usercontroller.updatepassword);
router.post("/resend-otp", authenticateToken, usercontroller.resendotp);
router.get("/user/id", authenticateUserToken, usercontroller.useremail);
router.get("/logout", usercontroller.logout);
router.post("/requestPhoneVerification", usercontroller.reqphoneverify);
router.post("/verifyPhone", authenticatephone, usercontroller.verifyphone);
router.get("/resendPhone", authenticatephone, usercontroller.resendphone);
router.post("/register", usercontroller.register);
router.post("/verify", authenticateToken, usercontroller.verifyuser);
router.get("/resend", authenticateToken, usercontroller.resenduserotp);
router.post("/deleteAccount", authenticateUserToken, usercontroller.deleteaccount);
router.post("/viewprofile", authenticateUserToken, usercontroller.viewprofile);
router.put("/editprofile", authenticateUserToken, usercontroller.editprofile);
router.patch("/updateimage", upload.single("profileImage"), authenticateUserToken, usercontroller.updateimage);
router.put("/editpassword", authenticateUserToken, usercontroller.editpassword);
router.get("/user/:id", usercontroller.userid);
router.post("/getAllUsers", authenticateUserToken, usercontroller.getAllUsers);
router.get("/getimage", authenticateUserToken, usercontroller.getimage);
router.get("/getname/:projectId", usercontroller.getname);

module.exports = router;
