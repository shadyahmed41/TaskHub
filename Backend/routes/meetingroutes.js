const express = require("express");
const bodyParser = require("body-parser");
const meetingcontroller = require("../controllers/meetingcontroller");
const authenticateUserToken = require("../token/authenticateuser");

const router = express.Router(); // Create a Router instance

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/meetingDetails/:projectId", authenticateUserToken, meetingcontroller.meetingDetails);
router.get("/meetingSummary/:meetingid", authenticateUserToken, meetingcontroller.meetingsummary);
router.put("/updatemeeting/:meetingid", authenticateUserToken, meetingcontroller.updatemeeting);
router.post("/addkeypoint/:meetingid", authenticateUserToken, meetingcontroller.addkeypoint);
router.post("/addoutcome/:meetingid/:keypointid", authenticateUserToken, meetingcontroller.addoutcomes);
router.delete("/deletekeypoint/:meetingid/:keypointid", authenticateUserToken, meetingcontroller.deleteKeypoint);
router.delete("/deleteoutcome/:meetingid/:keypointid/:outcomeid", authenticateUserToken, meetingcontroller.deleteOutcome);
router.get("/getinoice/:meetingid", meetingcontroller.generatesummarypdf);

module.exports = router;