const schedule = require("node-schedule");
const Meeting = require("../models/meetingmodel");
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


        const meetings = await Meeting.find({
            startDate: {
                $gte: tomorrow.startOf('day').toDate(),
                $lte: tomorrow.endOf('day').toDate()
            },
        });

        console.log(meetings);
        var projects = [];
        var ms = []
        for (const meeting of meetings) {
            const project = await Project.findOne({ _id: meeting.projectId });
            projects.push(project);
            ms.push(meeting.title);
        }
        var i = 0;
        for(const project of projects){
            createNotification(project.leaderID, `Meeting: Leader meeting "${ms[i]}" in (${project.title}) will start today!`);
            for(const member of project.members){
                createNotification(member, `Meeting: "${ms[i]}" in (${project.title}) will start today!`);
            }
            i++;
        } 


    
        console.log("meeting is today!");
    } catch (error) {
        console.error("Error sending task:", error);
    }
});

module.exports = schedule;
