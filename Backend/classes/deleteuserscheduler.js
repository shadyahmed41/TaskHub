const schedule = require('node-schedule');
const User = require('../models/usermodel');
const moment = require('moment-timezone');

// Define a schedule rule to run every day at a specific time (e.g., midnight)
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 0;

// Create a scheduled job
schedule.scheduleJob(rule, async () => {
    try {
        const users = User.find({ 'email.isVerified': false })
        users.array.forEach(async (user) => {
            await User.findByIdAndDelete(user._id);
        });
    } catch (error) {
        console.error("Error deleting not verified users:", error);
    }
});

module.exports = schedule;
