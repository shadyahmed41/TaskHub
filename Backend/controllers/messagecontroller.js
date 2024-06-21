const Messages = require("../models/messagemodel");
const User = require("../models/usermodel");
const Project = require("../models/projectmodel");
const { createNotification } = require("../socket/notificationHandler");

exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, projectId } = req.body;

    if (projectId) {
      const project = await Project.findById(projectId);

      const members = project.members;
      // Step 6: Retrieve the necessary information for each member
      const usersPromises = members.map(async (member) => {
        const user = await User.findById(member._id).select([
          "name",
          "image",
          "_id",
        ]);
        return user;
      });
      // Fetch leader's data separately and push it to usersPromises
      const leaderData = await User.findById(project.leaderID).select([
        "name",
        "image",
        "_id",
      ]);

      const users = await Promise.all(usersPromises);

      // Construct the response data
      const userData = {};
      users.forEach((user) => {
        userData[user._id] = {
          name: user.name,
          image: user.image
            ? { imageURL: user.image.imageURL, imageName: user.image.imageName }
            : null,
        };
      });

      if (leaderData) {
        userData[leaderData._id] = {
          name: leaderData.name,
          image: leaderData.image ? { imageURL: leaderData.image.imageURL, imageName: leaderData.image.imageName } : null,
          _id: leaderData._id
        };
      }
      const messages = await Messages.find({
        users: to,
      }).sort({ updatedAt: 1 });

      const projectedMessages = messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.message.text,
          sender: msg.sender,
          time: msg.createdAt,
        };
      });

      res.json({ 
        projectedMessages: projectedMessages,
        userData: userData,
       });
    } 
    else 
    {
      const messages = await Messages.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 });

      const projectedMessages = messages.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.message.text,
          time: msg.createdAt,
        };
      });
      res.json(projectedMessages);
    }
  } catch (ex) {
    next(ex);
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    let notifymsg
    const user = await User.findById(from);
    if (user) {
      notifymsg = `${user.name}: ${message}`
    }
    console.log(data);
    let newmessage = notifymsg ? notifymsg : message
    createNotification(to, newmessage); // Corrected usage
    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
