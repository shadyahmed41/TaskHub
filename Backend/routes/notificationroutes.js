const express = require("express");
const bodyParser = require("body-parser");
const notificationcontoller = require("../controllers/notificationcontroller");

const router = express.Router(); // Create a Router instance

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/notifications", notificationcontoller.getnotifications);
router.put("/notifications/mark-as-read", notificationcontoller.markasread);
router.put("/notifications/:id", notificationcontoller.read);

module.exports = router;
