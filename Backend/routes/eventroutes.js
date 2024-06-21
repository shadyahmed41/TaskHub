const express = require("express");
const bodyParser = require("body-parser");
const eventcontroller = require("../controllers/eventcontroller");
const authenticateUserToken = require("../token/authenticateuser");

const router = express.Router(); // Create a Router instance

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/addevent", authenticateUserToken, eventcontroller.addevent);
router.get("/viewevent/:projectId/", authenticateUserToken, eventcontroller.viewevent);
router.delete("/deleteevent/:eventId/:projectId", authenticateUserToken, eventcontroller.deleteevent);
router.get('/geteventbyday/:projectId/:date', authenticateUserToken, eventcontroller.geteventbyday);

module.exports = router;
