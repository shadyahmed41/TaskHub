const express = require("express");
const bodyParser = require("body-parser");
const projectcontroller = require("../controllers/projectcontroller");
const authenticateUserToken = require("../token/authenticateuser");

const router = express.Router(); // Create a Router instance

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/createprojects", authenticateUserToken, projectcontroller.createproject);
router.get("/get-project-details/:projectId", authenticateUserToken, projectcontroller.getprojectdetails);
router.delete("/delete-project", authenticateUserToken, projectcontroller.deleteproject);//
router.get("/project/:projectId/leader", projectcontroller.getprojectleader);
router.get("/projects", authenticateUserToken, projectcontroller.getprojectsforleader);
router.get("/projects/member", authenticateUserToken, projectcontroller.getprojectsformember);
router.get("/requestedMembers/:projectId", projectcontroller.requestedmembers);
router.post("/acceptJoiningRequest", projectcontroller.acceptrequestedmembers);
router.post("/rejectJoiningRequest", projectcontroller.rejectrequestedmembers);
router.post("/joinProjectByLink", authenticateUserToken, projectcontroller.joinbylink);
router.post("/joinProjectByEmail",  projectcontroller.joinbyemail);
router.post("/joinProjectByCode", authenticateUserToken, projectcontroller.joinbycode);
router.get("/project/:projectId/users/emails", projectcontroller.getmembersemail);
router.get("/project/:projectId/addusers/emails", projectcontroller.getmemberstoadd);
router.put("/edit-project/:projectId", authenticateUserToken, projectcontroller.updateprojectdetails);
router.get("/project-members/:projectId", projectcontroller.fetchallmembersforproject);
router.delete("/delete-member/:projectId/:memberId", projectcontroller.removemember);
router.post("/leave-project/:projectId", authenticateUserToken, projectcontroller.leaveproject);
router.put("/update-project-leader/:projectId", projectcontroller.updateleaderandleave);
router.put("/promote-project-leader/:projectId", projectcontroller.promoteleader);
router.get("/projectProgress/:projectId", projectcontroller.projectprogress);
router.get("/memberDetails/:projectId", projectcontroller.getmemberdetails);
router.get("/memberProgress/:projectId/:memberId", projectcontroller.membersprogress);
router.get("/allmemberProgress/:projectId", projectcontroller.allmembersprogress);
router.get("/project/:projectId/leader-and-user", authenticateUserToken, projectcontroller.getProjectLeaderAndCurrentUser);

module.exports = router;
