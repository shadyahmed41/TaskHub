const express = require("express");
const bodyParser = require("body-parser");
const admincontroller = require("../controllers/admincontroller");
const authenticateAdmin = require("../token/authenticateadmin");

const router = express.Router(); // Create a Router instance

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/registeradmin", admincontroller.registerAdmin);
router.post("/loginadmin", admincontroller.loginAdmin);
router.get("/analysis", authenticateAdmin, admincontroller.getAnalysis);

module.exports = router;
