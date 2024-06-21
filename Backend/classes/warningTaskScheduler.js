const schedule = require("node-schedule");
const Task = require("../models/taskmodel");
const Project = require("../models/projectmodel");
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

        
        const selectedDate = moment.utc(today).startOf('day'); 

        const endOfSelectedDate = selectedDate.clone().endOf('day');

        const tomorrow = selectedDate.clone().add(1, 'day');


        const tasks = await Task.find({
            dueDate: {
                $gte: tomorrow.startOf('day').toDate(),
                $lte: tomorrow.endOf('day').toDate()
            },
            status: "in progress"
        });

        console.log(tasks);
        var projects = [];
        for (const task of tasks) {
            const project = await Project.findOne({ _id: task.projectId });
            projects.push(project.title);
        }
        


        var i = 0;
        tasks.forEach((task) => {
            createNotification(task.assignedMember.member, `Task: Task "${task.title}" in (${projects[i]}) project is due today!`);
            i++;
        });
        console.log("task due today!");
    } catch (error) {
        console.error("Error sending task:", error);
    }
});

module.exports = schedule;
