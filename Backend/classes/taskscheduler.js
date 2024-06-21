const schedule = require('node-schedule');
const Task = require("../models/taskmodel"); // Assuming you have a Post model defined
const Project = require("../models/projectmodel"); // Assuming you have a Post model defined
const moment = require('moment-timezone');
const { createNotification } = require("../socket/notificationHandler");

// Define a schedule rule to run every day at a specific time (e.g., midnight)
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 0;

// Create a scheduled job
schedule.scheduleJob(rule, async () => {
    try {
        // Get current date
        const currentDate = new Date();
        const selectedDate = moment.utc(currentDate).startOf('day'); // Start of the selected day
        const endOfSelectedDate = selectedDate.clone().endOf('day');

        // Query tasks with overdue due dates and statuses not "completed"
        const tasksToUpdate = await Task.find({
            dueDate: { $lte: endOfSelectedDate.toDate() }, // Due date has passed or is today
            status: "in progress" // Status is not "completed" or "not submitted"
        });
        console.log("Tasks to update:", tasksToUpdate);
        
        // Update task status to "not submitted"
        await Promise.all(tasksToUpdate.map(async (task) => {
            task.status = "not submitted";
            await task.save();
            const project = await Project.findById(task.projectId);
            console.log(project);
            createNotification(project.leaderID, `Task: ${task.title} updated to status: ${task.status}`)
            createNotification(task.assignedMember.member, `Task: ${task.title} updated to status: ${task.status}`)
            console.log(`Task ${task._id} updated to status: ${task.status}`);
        }));

        console.log("Task statuses updated successfully");
    } catch (error) {
        console.error("Error updating task statuses:", error);
    }
});

module.exports = schedule;
