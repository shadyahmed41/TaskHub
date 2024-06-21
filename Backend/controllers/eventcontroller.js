const Event = require("../models/eventmodel");
const User = require("../models/usermodel");
const Project = require("../models/projectmodel");
require("../classes/eventscheduler");
const { createNotification } = require("../socket/notificationHandler");
const moment = require('moment-timezone');

exports.addevent = async (req, res) => {
  try {
    const { date, time, title, description, projectId } = req.body;
    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    if (!user || !project)
      return res.status(201).json({ message: "User or Project not found!" });
    else {
      const dateTime = new Date(date); // Create a new Date object using the date string
      const [hours, minutes] = time.split(':');
      dateTime.setUTCHours(parseInt(hours), parseInt(minutes)); // Set the time within the Date object
      const event = new Event({
        date: dateTime,
        title,
        description,
        userId: user._id,
        projectId: projectId,
      });
      await event.save();
      res.status(201).send("Event added successfully");
    }
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).send("Failed to add event");
  }
};

exports.viewevent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    if (!user || !project)
      return res
        .status(201)
        .json({ message: "No Events Found For This User!" });
    else {
      const events = await Event.find({
        projectId: projectId,
        userId: user._id,
      });
      res.json(events);
    }
  } catch (error) {
    console.error("Error viewing event:", error);
    res.status(500).send("Failed to view event");
  }
};

exports.deleteevent = async (req, res) => {
  try {
    const { eventId, projectId } = req.params;
    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    if (!user || !project)
      return res
        .status(201)
        .json({ message: "You Are Not Authorized To Perform this Action!" });
    else {
      await Event.findByIdAndDelete(eventId);
      res.status(200).send("Event deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send("Failed to delete event");
  }
};

exports.geteventbyday = async (req, res) => {
  try {
    // Extract projectId, userId, and date from request parameters
    const { projectId, date } = req.params;
    console.log(projectId, date);

    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    
    if (!user || !project) {
      return res.status(401).json({ message: "You are not authorized to perform this action!" });
    } else {
      // Convert the provided date to a Moment object
      const selectedDate = moment.utc(date).startOf('day'); // Start of the selected day

      // End of the selected day
      const endOfSelectedDate = selectedDate.clone().endOf('day');

      // Query the database to find events within the date range
      const events = await Event.find({
        projectId: projectId,
        userId: user._id,
        date: { 
          $gte: selectedDate.toDate(), // Greater than or equal to start of selected day
          $lte: endOfSelectedDate.toDate() // Less than or equal to end of selected day
        }
      });

      // Send the response with the found events
      console.log(events);
      res.status(200).json(events);
    }
  } catch (error) {
    // If an error occurs, send an error response
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};