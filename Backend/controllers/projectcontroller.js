const bcrypt = require("bcryptjs");
const User = require("../models/usermodel");
const Project = require("../models/projectmodel");
const Post = require("../models/postmodel");
const Task = require("../models/taskmodel");
const Analysis = require("../models/analysismodel");
const { createNotification } = require("../socket/notificationHandler");

function generateJoiningCode(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
}

exports.createproject = async (req, res) => {
  try {
    // const emailLoggedIn = emaillogedin; // Get logged-in user email from the variable
    const { title, description, field } = req.body;
    console.log(field);

    // Find the user based on the email
    const user = await User.findOne({ "email.address": req.user.email });
    // console.log( title, description, email );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const leaderID = user._id; // Get the user ID
    const joiningCode = generateJoiningCode();

    const newProject = new Project({
      title,
      description,
      leaderID,
      joiningCode,
      field,
    });

    let isUnique = false;

    while (!isUnique) {
      try {
        // Validate the user data against the schema
        await newProject.validate();
        isUnique = true; // No validation error means the code is unique
      } catch (validationError) {
        // If validation error occurs, generate a new joining code
        joiningCode = generateJoiningCode();
        newProject.joiningCode = joiningCode;
      }
    }

    await newProject.save();

    res.json({
      success: true,
      message: "Project created",
      project: newProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getprojectdetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    // console.log(projectId, email);

    const user = await User.findOne({ "email.address": req.user.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { leaderID: user._id },
        { members: { $in: [user._id] } }
      ]
    });    

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    // console.log(project.joiningCode);
    res.json({
      success: true,
      project: {
        _id: project._id,
        title: project.title,
        description: project.description,
        joiningCode: project.joiningCode, // Include the joining code in the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteproject = async (req, res) => {
  try {
    // const { projectId } = req.params;
    const { projectId, password } = req.body;
    const user = await User.findOne({ "email.address": req.user.email }).select(
      "+password"
    );

    // console.log(post);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(404).json({
        success: false,
        message: "Password Don't Match!",
      });
    }

    const result = await Project.deleteOne({
      _id: projectId,
      leaderID: user._id,
    });
    const analysis = await Analysis.findOne();
    analysis.deletedProjects = analysis.deletedProjects + 1;
    analysis.save();
    if (result.deletedCount === 1) {
      await Post.deleteMany({ projectId: projectId });
      await Task.deleteMany({ projectId: projectId });
      res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Project not found or you are not the leader of this project",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getprojectleader = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const leaderId = project.leaderID;

    if (!leaderId) {
      return res.status(404).json({ message: "Project leader not found" });
    }

    res.json({ leaderId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getprojectsforleader = async (req, res) => {
  try {
    const leaderID = await User.findOne({ 'email.address': req.user.email }).select("_id");
    const Projects = await Project.find({ leaderID });

    if (!Projects || Projects.length === 0) {
      return res
        .status(200)
        .json({ status: "success", data: { projects: [] } });
    }

    res.status(200).json({
      status: "success",
      data: {
        projects: Projects,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.getprojectsformember = async (req, res) => {
  try {
    const memberID = await User.findOne({ 'email.address': req.user.email }).select("_id");

    // Find projects where the memberID is in the members array
    const Projects = await Project.find({ members: { $in: [memberID] } });

    if (!Projects || Projects.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No projects found for the member" });
    }

    res.status(200).json({
      status: "success",
      data: {
        projects: Projects,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.requestedmembers = async (req, res) => {
  try {
    const projectIdId = req.params.projectId;

    // Find projects where the requested member is in the requestedMembers array
    const projects = await Project.findById(projectIdId);
    const reqMId = projects.requestedmembers;
    let reqMName = [];
    for (let index = 0; index < reqMId.length; index++) {
      nam = await User.findOne({ _id: reqMId[index] }).select("name");
      const userName = nam ? nam.name : null;
      if (userName) {
        const myUser = {};
        myUser.name = userName;
        myUser.id = reqMId[index];
        reqMName.push(myUser);
      }
    }
    res.status(200).json({
      status: "success",
      data: {
        requestedMembers: reqMName,
      },
    });
  } catch (error) {
    console.error("Error retrieving projects:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

exports.acceptrequestedmembers = async (req, res) => {
  let project = "";
  try {
    const { projectId, userId } = req.body;

    // Check if both project ID and user ID are provided
    if (!projectId || !userId) {
      return res
        .status(400)
        .json({ message: "Invalid project or user information." });
    }

    // Check if the project exists
    project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    if (userId.length != 24) {
      return res
        .status(404)
        .json({ message: "User not found with the provided email." });
    }
    const id = await User.findOne({ _id: userId }).select("_id");
    if (id === null) {
      return res
        .status(404)
        .json({ message: "User not found with the provided email." });
    }
    //check if the user is member of the project

    // Check if the user is in the requestedmembers array
    if (!project.requestedmembers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not in the requested members list." });
    }

    // Remove the user from requestedmembers array
    project.requestedmembers = project.requestedmembers.filter(
      (id) => id.toString() !== userId
    );

    // Add the user to the members array
    project.members.push(userId);

    // Save the updated project
    await project.save();
    const leader = await User.findById(project.leaderID);
    createNotification(userId, `Leader: ${leader.name} added you to project "${project.title}"`)

    return res
      .status(200)
      .json({ message: "User accepted into the project successfully." });
  } catch (error) {
    if (project === "") {
      return res
        .status(404)
        .json({ message: "Project not found with the provided ID." });
    } else {
      console.error("Error accepting project request:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

exports.rejectrequestedmembers = async (req, res) => {
  let project = "";
  try {
    const { projectId, userId } = req.body;

    // Check if both project ID and user ID are provided
    if (!projectId || !userId) {
      return res
        .status(400)
        .json({ message: "Invalid project or user information." });
    }

    // Check if the project exists
    project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }
    if (userId.length != 24) {
      return res
        .status(404)
        .json({ message: "User not found with the provided email." });
    }
    const id = await User.findOne({ _id: userId }).select("_id");
    if (id === null) {
      return res
        .status(404)
        .json({ message: "User not found with the provided email." });
    }
    //check if the user is member of the project

    // Check if the user is in the requestedmembers array
    if (!project.requestedmembers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not in the requested members list." });
    }

    // Remove the user from requestedmembers array
    project.requestedmembers = project.requestedmembers.filter(
      (id) => id.toString() !== userId
    );

    // Save the updated project
    await project.save();
    const leader = await User.findById(project.leaderID);
    createNotification(userId, `Leader: ${leader.name} rejected you to project "${project.title}"`)

    return res
      .status(200)
      .json({ message: "User rejected to enter the project." });
  } catch (error) {
    if (project === "") {
      return res
        .status(404)
        .json({ message: "Project not found with the provided ID." });
    } else {
      console.error("Error accepting project request:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

exports.joinbylink = async (req, res) => {
  try {
    let { joiningCode, userId } = req.body;
    const user = await User.findOne({ "email.address": req.user.email });
    userId = user ? user._id : null;
    console.log(userId);

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    } else {
      // return({ userId: user.id });
      // const exist = projectMembers.find(userId);

      // Find the project with the provided joining code
      const project = await Project.findOne({ joiningCode });

      // If the project doesn't exist, return an error
      if (!project) {
        return res
          .status(404)
          .json({
            message: "Project not found with the provided joining code.",
          });
      }

      // Check if the user is the leader of the project
      if (project.leaderID.toString() === userId.toString()) {
        return res.status(400).json({
          message:
            "User is the leader of the project and cannot join as a member.",
        });
      }

      // Check if the user is already a member of the project
      if (project.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already a member of the project." });
      }

      // Check if the user exists (You may need to implement your own logic here)
      const user = await User.findOne({ _id: userId }).select(
        "_id"
      ); /* Fetch user by userId using your own data access method */
      console.log(user);
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found with the provided ID." });
      }

      if (project.requestedmembers.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already request to join the project." });
      }

      // the user request to join the project
      project.requestedmembers.push(userId);

      const username = await User.findOne({ _id: userId })
      
      createNotification(project.leaderID, `User: ${username.name} requested yo join project "${project.title}"`)
      // Save the updated project
      await project.save();

      return res
        .status(200)
        .json({ message: "User request to join the project successfully." });
    }
  } catch (error) {
    console.error("Error joining project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.joinbyemail = async (req, res) => {
  let project = "";
  try {
    const { email, projectId } = req.body;
    // Check if the email is valid

    const id = await User.findOne({ "email.address": email }).select("_id");
    if (id === null) {
      return res
        .status(404)
        .json({ message: "User not found with the provided email." });
    }
    const Uid = id._id.toString();
    // Find the project by ID
    project = await Project.findById(projectId);
    if (project.leaderID.equals(Uid)) {
      return res.status(400).json({
        message:
          "User is the leader of the project and cannot join as a member.",
      });
    }

    // Check if the user is already in the project's members array
    if (project.members.includes(Uid)) {
      return res
        .status(400)
        .json({ message: "User is already a member of the project." });
    }

    // Remove the user from requestedmembers array
    project.requestedmembers = project.requestedmembers.filter(
      (id) => id.toString() !== Uid
    );

    // Add the user to the project
    project.members.push(Uid);

    // Save the updated project
    await project.save();

    const user = await User.findOne({ "email.address": email })
    const leader = await User.findById(project.leaderID);
    createNotification(user._id, `Leader: ${leader.name} added you to project "${project.title}"`)

    res
      .status(201)
      .json({ message: "User added to the project successfully." });
  } catch (error) {
    if (project === "") {
      return res
        .status(404)
        .json({ message: "Project not found with the provided ID." });
    } else {
      console.error("Error adding user to project:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

exports.joinbycode = async (req, res) => {
  try {
    const { joiningCode } = req.body;

    // Find the project with the provided joining code
    const project = await Project.findOne({
      joiningCode,
    }); /* Fetch project by joiningCode using your own data access method */
    
    const user = await User.findOne({ 'email.address': req.user.email }).select(
      "_id"
    ); /* Fetch user by userId using your own data access method */
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with the provided ID." });
    }

    // If the project doesn't exist, return an error
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found with the provided joining code." });
    }

    // Check if the user is the leader of the project
    if (project.leaderID.equals(user._id.toString())) {
      return res.status(400).json({
        message:
          "User is the leader of the project and cannot join as a member.",
      });
    }

    // Check if the user is already a member of the project
    if (project.members.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User is already a member of the project." });
    }

    // Check if the user exists (You may need to implement your own logic here)

    // Remove the user from requestedmembers array
    project.requestedmembers = project.requestedmembers.filter(
      (id) => id.toString() !== user._id.toString()
    );

    // Add the user to the project
    project.members.push(user._id);

    // Save the updated project (You may need to implement your own save logic)
    /* Save the project using your own data access method */
    await project.save();

    // const user = await User.findOne({ "email.address": email })
    const leader = await User.findById(project.leaderID);
    createNotification(user._id, `Leader: ${leader.name} added you to project "${project.title}"`)

    return res
      .status(200)
      .json({ message: "User joined the project successfully." });
  } catch (error) {
    console.error("Error joining project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getmembersemail = async (req, res) => {
  try {
    const projectId = req.params.projectId; // Get the project ID from the request parameters

    // Find the project to get the array of user IDs
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Extract the array of user IDs from the project document
    const userIds = project.members;

    // Query the User collection to retrieve the user documents based on the IDs
    const users = await User.find(
      { _id: { $in: userIds } },
      { email: 1, _id: 0 }
    );
    // Extract emails from the user documents
    const userEmails = users.map((user) => user.email.address);

    // Return the emails as JSON
    res.json(userEmails);
  } catch (error) {
    console.error("Error retrieving user emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getmemberstoadd = async (req, res) => {
  try {
    const projectId = req.params.projectId; // Get the project ID from the request parameters

    // Find the project to get the array of user IDs
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Extract the array of user IDs from the project document
    const userIds = project.members;

    // Query the User collection to retrieve the user documents based on the IDs
    const excludedIds = [...userIds, project.leaderID];
    const users = await User.find(
      { _id: { $nin: excludedIds } },
      { email: 1, _id: 0 }
    );
    // Extract emails from the user documents
    const userEmails = users.map((user) => user.email.address);

    // Return the emails as JSON
    res.json(userEmails);
  } catch (error) {
    console.error("Error retrieving user emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateprojectdetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, password } = req.body;
    console.log(title, description, password);

    const user = await User.findOne({ "email.address": req.user.email }).select(
      "+password"
    );

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(404).json({
        success: false,
        message: "Password Don't Match!",
      });
    }

    // Fetch the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // Update project title if provided
    if (title && project.title !== title) {
      const oldTitle = project.title;
      project.title = title;
      await project.save();

      // Create a notification for the title change
      project.members.forEach((member) => {
        createNotification(
          member,
          `Project title updated from: ${oldTitle} to ${title}`
        );
      });
    }

    // Update project description if provided
    if (description && project.description !== description) {
      const oldDescription = project.description;
      project.description = description;
      await project.save();

      // Create a notification for the description change
      project.members.forEach((member) => {
        createNotification(
          member,
          `${project.title} description updated from: ${oldDescription} to ${description}`
        );
      });
    }

    res.json({ success: true, message: "Project updated successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.fetchallmembersforproject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Query the database for the project details including members
    const project = await Project.findOne({ _id: projectId }).populate({
      path: "members",
      select: "name email.address phone.number image.imageURL", // Select the fields you want to populate
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Return the list of members
    res.json({ members: project.members });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removemember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    // Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Find the member to be deleted
    const memberToDelete = await User.findById(memberId);

    if (!memberToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    // Remove the member from the project
    const index = project.members.indexOf(memberId);
    if (index === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found in the project" });
    }

    project.members.splice(index, 1);
    await project.save();

    // Attempt to find tasks assigned to the user for this project
    const tasks = await Task.find({
      "assignedMember.member": memberId,
      projectId: projectId,
    });

    if (tasks.length > 0) {
      // Update the status of each task and remove the assigned member
      tasks.forEach(async (task) => {
        task.status = "not assigned";
        task.assignedMember.member = undefined;
        await task.save();
      });
    }

    // Create notification with member's name
    project.members.forEach((member) => {
      createNotification(
        member._id,
        `${memberToDelete.name} is removed from the project ${project.title}`
      );
    });

    res.json({ success: true, message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.leaveproject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the user by email
    const user = await User.findOne({ "email.address": req.user.email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find the project and its leader
    const project = await Project.findById(projectId).populate("leaderID");
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found." });
    }

    // Remove the user from the project members array
    const index = project.members.indexOf(user._id);
    if (index !== -1) {
      project.members.splice(index, 1);
      await project.save();

      // Attempt to find tasks assigned to the user for this project
      const tasks = await Task.find({
        "assignedMember.member": user._id,
        projectId: projectId,
      });

      if (tasks.length > 0) {
        // Update the status of each task and remove the assigned member
        tasks.forEach(async (task) => {
          task.status = "not assigned";
          task.assignedMember.member = undefined;
          await task.save();
        });
      }

      // Send notification to the leader only
      createNotification(
        project.leaderID._id,
        `${req.user.email} has left the project ${project.title}`
      );

      res.json({ success: true, message: "User removed from the project." });
    } else {
      console.log("User is not a member of the project.");
      res.status(404).json({
        success: false,
        message: "User is not a member of the project.",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.updateleaderandleave = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newLeaderEmail } = req.body;

    // Find the project by ID
    const project = await Project.findById(projectId).populate("members");

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if the new leader email exists in the project's members array
    const newLeaderIndex = project.members.findIndex(
      (member) => member.email.address === newLeaderEmail
    );

    if (newLeaderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User with provided email not found in project members",
      });
    }

    // Update the leaderID of the project
    project.leaderID = project.members[newLeaderIndex]._id;

    // Remove the new leader from the members array
    const newLeader = project.members.splice(newLeaderIndex, 1)[0];

    await project.save();

    // Send a notification to the new leader
    createNotification(
      newLeader._id,
      `You have been promoted to leader in project ${project.title}`
    );

    // Send a notification to the project members about the leadership change
    project.members.forEach((member) => {
      createNotification(
        member._id,
        `${newLeader.email.address} has been promoted to leader in project ${project.title}`
      );
    });

    res
      .status(200)
      .json({ success: true, message: "Project leader updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.promoteleader = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { newLeaderEmail } = req.body;

    // Find the project by ID
    const project = await Project.findById(projectId).populate("members");
    const leaderid = project.leaderID;

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    // Check if the new leader email exists in the project's members array
    const newLeaderIndex = project.members.findIndex(
      (member) => member.email.address === newLeaderEmail
    );

    if (newLeaderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User with provided email not found in project members",
      });
    }

    // Update the leaderID of the project
    project.leaderID = project.members[newLeaderIndex]._id;

    // Remove the new leader from the members array
    const newLeader = project.members.splice(newLeaderIndex, 1)[0];

    project.members.push(leaderid);

    await project.save();

    // Send a notification to the new leader
    createNotification(
      newLeader._id,
      `You have been promoted to leader in project ${project.title}`
    );

    // Send a notification to the project members about the leadership change
    project.members.forEach((member) => {
      createNotification(
        member._id,
        `${newLeader.email.address} has been promoted to leader in project ${project.title}`
      );
    });

    res
      .status(200)
      .json({ success: true, message: "Project leader updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.projectprogress = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "project not found" });
    }

    const totalTasks = await Task.countDocuments({ projectId });
    const completedTasks = await Task.countDocuments({
      projectId,
      status: "completed",
    });
    const progress = ((completedTasks * 1.0) / totalTasks) * 100;

    res.json({ progress });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getmemberdetails = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const projectExist = await Project.findById(projectId);
    if (!projectExist) {
      return res.status(404).json({ message: "project not found" });
    }

    // Find project by ID and populate the members field with user details
    const project = await Project.findById(projectId).populate(
      "members",
      "name"
    );

    if (!project) {
      return res.status(404).json({ message: "Project has no members" });
    }

    // Count the number of tasks assigned to members of the project
    const tasksCount = await Task.countDocuments({
      assignedMember: { $in: project.members },
    });
    const projectMember = project.members;

    res.json({
      projectMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.membersprogress = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const memberId = req.params.memberId;

    const projectExist = await Project.findById(projectId);
    if (!projectExist) {
      return res.status(404).json({ message: "project not found" });
    }

    const memberExist = await User.findById(memberId);
    if (!memberExist) {
      return res
        .status(404)
        .json({ success: false, message: "member not found." });
    }

    // Check if the member is part of the project
    const project = await Project.findOne({
      _id: projectId,
      members: memberId,
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: "Member not found in the project" });
    }

    // Count the number of tasks for the specific member in the specific project
    const completedTasks = await Task.countDocuments({
      "assignedMember.member": memberId,
      projectId: projectId,
      status: "completed",
    });

    const allTasks = await Task.countDocuments({
      "assignedMember.member": memberId,
      projectId: projectId,
    });
    let progress;
    if (!allTasks) {
      progress = 0;
    } else {
      progress = ((completedTasks * 1.0) / allTasks) * 100;
    }

    res.json({
      progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.allmembersprogress = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const projectExist = await Project.findById(projectId);
    if (!projectExist) {
      return res.status(404).json({ message: "Project not found" });
    }

    const membersProgress = [];

    // Fetch all members of the project
    const project = await Project.findById(projectId).populate(
      "members",
      "name image"
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Iterate over each member and fetch their progress
    for (const member of project.members) {
      const memberId = member._id;
      const memberName = member.name;
      const memberImage = member.image;

      const completedTasks = await Task.countDocuments({
        "assignedMember.member": memberId,
        projectId: projectId,
        status: "completed",
      });

      const allTasks = await Task.countDocuments({
        "assignedMember.member": memberId,
        projectId: projectId,
      });

      let progress;
      if (!allTasks) {
        progress = 0;
      } else {
        progress = ((completedTasks * 1.0) / allTasks) * 100;
      }

      membersProgress.push({
        memberName,
        memberImage,
        progress,
        allTasks,
        completedTasks,
      });
    }

    res.json({ membersProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getProjectLeaderAndCurrentUser = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const leaderId = project.leaderID;

    if (!leaderId) {
      return res.status(404).json({ message: "Project leader not found" });
    }

    // Fetch current user data
    const user = await User.findOne({ "email.address": req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ leaderId, userId: user.id, userEmail: req.user.email, joiningCode: project.joiningCode });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
