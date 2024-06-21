const messagecontroller = require("../controllers/messagecontroller");
const router = require("express").Router();
const bodyParser = require("body-parser");
const authenticateUserToken = require("../token/authenticateuser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/addmsg", messagecontroller.addMessage);
router.post("/getmsg", messagecontroller.getMessages);

module.exports = router;
