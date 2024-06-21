const schedule = require("node-schedule");
const Event = require("../models/eventmodel");
const { createNotification } = require("../socket/notificationHandler");
const moment = require('moment-timezone');

// Define a schedule rule to run every day at a specific time (e.g., midnight)
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 0;

// Create a scheduled job
schedule.scheduleJob(rule, async () => {
  try {
    
    const today = new Date();

    // Convert the provided date to a Moment object
    const selectedDate = moment.utc(today).startOf('day'); // Start of the selected day

    // End of the selected day
    const endOfSelectedDate = selectedDate.clone().endOf('day');

    // Find events that occurred between yesterday and tomorrow
    const events = await Event.find({
      date: { 
        $gte: selectedDate.toDate(), // Greater than or equal to start of selected day
        $lte: endOfSelectedDate.toDate() // Less than or equal to end of selected day
      }
    });

    console.log(events);
    events.forEach((event) => {
      createNotification(event.userId, `Calendar: Event ${event.title} is today!`);
    });
    console.log("Event is due today!");
  } catch (error) {
    console.error("Error sending event:", error);
  }
});

module.exports = schedule;
