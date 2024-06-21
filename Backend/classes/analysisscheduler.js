const schedule = require("node-schedule");
const Analysis = require("../models/analysismodel"); // Assuming you have a Post model defined
const User = require("../models/usermodel"); // Assuming you have a Post model defined
const Project = require("../models/projectmodel"); // Assuming you have a Post model defined
const Task = require("../models/taskmodel");
const moment = require("moment-timezone");

// Define a schedule rule to run every day at a specific time (e.g., midnight)
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 0;

// Define the enum for project fields
const projectFieldsEnum = [
  "Marketing Campaigns",
  "Product Development",
  "Sales Initiatives",
  "Healthcare IT Implementation",
  "Engineering Projects",
  "Clinical Trials Management",
  "Data Science and Analytics",
  "Software Engineering Projects",
  "Event Planning",
  "Cybersecurity Initiatives",
  "Others",
];

// Create a scheduled job
schedule.scheduleJob(rule, async () => {
  try {
    const activeusers = await User.countDocuments();
    const activeprojects = await Project.countDocuments();
    const analysis = await Analysis.findOne();
    analysis.activeUsers = activeusers;
    analysis.activeProjects = activeprojects;
    analysis.totalUsers = analysis.activeUsers + analysis.deletedUsers;
    analysis.totalProjects = analysis.activeProjects + analysis.deletedProjects;
    const projects = await Project.find({}).select("+_id");
    let completedProjectsCount = 0;

    for (const project of projects) {
      const totalTasks = await Task.countDocuments({ projectId: project._id });
      const completedTasks = await Task.countDocuments({
        projectId: project._id,
        status: "completed",
      });

      // Calculate progress percentage
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Check if progress is 100%
      if (progress === 100) {
        completedProjectsCount++;
      }
    }
    analysis.completedProjects = completedProjectsCount;
    // Reset all fields of ageRangeDistribution to 0
    for (const [range, _] of analysis.ageRangeDistribution.entries()) {
      analysis.ageRangeDistribution.set(range, 0);
    }
    const bdateusers = await User.find({}).select("+_id bdate");
    for (const user of bdateusers) {
      const age = calculateAge(user.bdate);
      updateAgeRangeDistribution(age, analysis.ageRangeDistribution);
    }
    // Count users interested in each project field
    const userFieldCounts = {};
    const userprojects = await Project.find({}).populate("members");
    userprojects.forEach((project) => {
      const field = project.field;
      if (!userFieldCounts[field]) {
        userFieldCounts[field] = 0;
      }
      userFieldCounts[field] += project.members.length;
    });
    for (const field in userFieldCounts) {
      const count = userFieldCounts[field];
      analysis.userFieldPercentage.set(field, count);
    }
    // Aggregate projects based on their field and count occurrences
    const projectCounts = await Project.aggregate([
      {
        $group: {
          _id: "$field",
          count: { $sum: 1 },
        },
      },
    ]);
    // Initialize projectFieldPercentage object with 0 counts for all fields
    const projectFieldPercentage = {};
    projectFieldsEnum.forEach((field) => {
      projectFieldPercentage[field] = 0;
    });
    projectCounts.forEach(({ _id, count }) => {
      if (_id && projectFieldPercentage.hasOwnProperty(_id)) {
        projectFieldPercentage[_id] = count;
      }
    });
    analysis.projectFieldPercentage = projectFieldPercentage;
    analysis.save();
    console.log(activeusers, activeprojects, analysis);
  } catch (error) {
    console.error("Error updating analysis:", error);
  }
});

function calculateAge(birthdate) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Function to update age range distribution map
function updateAgeRangeDistribution(age, ageRangeDistribution) {
  if (age >= 18 && age <= 24) {
    ageRangeDistribution.set("18-24", ageRangeDistribution.get("18-24") + 1);
  } else if (age >= 25 && age <= 30) {
    ageRangeDistribution.set("25-30", ageRangeDistribution.get("25-30") + 1);
  } else if (age >= 31 && age <= 35) {
    ageRangeDistribution.set("31-35", ageRangeDistribution.get("31-35") + 1);
  } else if (age >= 36 && age <= 40) {
    ageRangeDistribution.set("36-40", ageRangeDistribution.get("36-40") + 1);
  } else if (age >= 41 && age <= 45) {
    ageRangeDistribution.set("41-45", ageRangeDistribution.get("41-45") + 1);
  } else if (age >= 46 && age <= 50) {
    ageRangeDistribution.set("46-50", ageRangeDistribution.get("46-50") + 1);
  } else if (age >= 51 && age <= 55) {
    ageRangeDistribution.set("51-55", ageRangeDistribution.get("51-55") + 1);
  } else if (age >= 56 && age <= 60) {
    ageRangeDistribution.set("56-60", ageRangeDistribution.get("56-60") + 1);
  } else if (age >= 61) {
    ageRangeDistribution.set("60+", ageRangeDistribution.get("60+") + 1);
  }
}

module.exports = schedule;
