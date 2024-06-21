const express = require("express");
const bodyParser = require("body-parser");
const taskcontroller = require("../controllers/taskcontroller");
const authenticateUserToken = require("../token/authenticateuser");

const router = express.Router(); // Create a Router instance

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/tasks", authenticateUserToken, taskcontroller.createtask);
router.put("/tasks/:taskId/assign", taskcontroller.assigntask);
router.post("/viewtasks", authenticateUserToken, taskcontroller.viewtasks);
router.put("/tasks/:taskId/edit", authenticateUserToken, taskcontroller.edittask);
router.delete("/tasks/:taskId/delete", authenticateUserToken, taskcontroller.deletetask);
router.get("/tasks/:taskId", taskcontroller.taskdetails);
router.get("/taskProgress/:taskId", taskcontroller.taskprogress);
router.post("/tasks/subtask/:taskId", authenticateUserToken, taskcontroller.createsubtask);
router.put('/tasks/:taskId/subtasks/:subtaskId',  taskcontroller.submitsubtask);
router.get("/subtasks/:taskId", taskcontroller.getallsubtasks);
router.delete("/tasks/subtasks/:taskId/:subtaskId", authenticateUserToken, taskcontroller.deletesubtask);
router.put('/tasks/:taskId/in-progress', taskcontroller.unsubmitTask);
router.put('/unatasks/:taskId/submit', taskcontroller.submitTask);
router.get("/gantttasks/:projectId", authenticateUserToken, taskcontroller.gantttasks);

module.exports = router;