const Task = require("../models/taskmodel"); // Assuming you have a Post model defined
const User = require("../models/usermodel"); // Assuming you have a User model defined
const Project = require("../models/projectmodel"); // Assuming you have a Project model defined
require("../classes/taskscheduler");
require('../classes/warningTaskScheduler');
const { createNotification } = require("../socket/notificationHandler");

exports.createtask = async (req, res) => {
  try {
    const { projectId, title, description, dueDate, assignedMember, priority, phase, date, pretask, } = req.body;
    console.log( projectId, title, description, dueDate, assignedMember, priority, phase, date, pretask);
    const creator = await User.findOne({ "email.address": req.user.email });
    if (!creator) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }
    if (creator._id.toString() == project.leaderID.toString()) {
      // Find the project by ID

      // Create a new task instance
      const taskData = {
        projectId,
        title,
        description,
        dueDate: new Date(),
        date: new Date(date),

      };
      if (priority) {
        taskData.priority = priority;
      }
      if (phase) {
        taskData.phase = phase;
      }
      // Check if assignedMember email is provided
      if (assignedMember) {
        // Find the user by email
        const user = await User.findOne({ "email.address": assignedMember });
        if (!user) {
          return res.status(400).json({ message: "User not found" });
        }

        const userid = user._id.toString();
        const projectid = project.leaderID.toString();
        if (projectid === userid) {
          res.status(400).json({ message: "leader cannot take task" });
          return;
        }
        if (!project.members.includes(user._id)) {
          return res
            .status(400)
            .json({ message: "User is not a member of the project" });
        }

        // Add assignedMember to task data
        taskData.assignedMember = {
          member: user._id,
        };
        taskData.status = "in progress";
        taskData.dueDate = dueDate;
        createNotification(
          user._id,
          `Task: "${title}" is assigned to you due ${dueDate}`
        );
      }

      if (pretask) {
        taskData.pretask = pretask;
      }
      // Create a new task
      const task = new Task(taskData);
      
      // Save the task to the database
      await task.save();
      
      if (pretask) {
        for (const item of pretask) {
          await Task.findOneAndUpdate(
            { _id: item },
            {
              $push: {
                upcomingtask: task._id,
              },
            },
            { new: true }
          );
        }
      }

      res.status(201).json({ message: "Task created successfully", task });
    } else {
      res.status(404).json({ message: "You Are Not The Leader" })
      }
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.assigntask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { assignedMember, dueDate } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    } else if (task.status === "completed") {
      return res.status(404).json({ message: "Task is done" });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    // Find the user by ID
    const user = await User.findOne({ "email.address": assignedMember });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const userid = user._id.toString();
    const projectid = project.leaderID.toString();
    // console.log(userid,projectid);
    if (projectid === userid) {
      res.status(400).json({ message: "leader cannot take task" });
      return;
    }
    if (!project.members.includes(user._id)) {
      return res
        .status(400)
        .json({ message: "User is not a member of the project" });
    }
    // Check the task status
    if (task.status === "in progress" || task.status === "not assigned") {
      // Update the assigned member for the task
      task.assignedMember.member = user._id;
      const currentDate = new Date(); // Get the current date as a Date object
      const newDueDate = new Date(currentDate); // Create a new Date object from the current date
      newDueDate.setDate(newDueDate.getDate() + 7); // Add 7 days to the current date
      task.dueDate = dueDate || newDueDate;
      // Save the updated task
      createNotification(
        user._id,
        `Task: "${task.title}" is assigned to you due ${task.dueDate}`
      );
      await task.save();
      res
        .status(200)
        .json({ message: "Assigned user updated successfully", task });
    } else if (task.status === "not submitted") {
      const currentDate = new Date(); // Get the current date as a Date object
      const newDueDate = new Date(currentDate); // Create a new Date object from the current date
      newDueDate.setDate(newDueDate.getDate() + 7); // Add 7 days to the current date

      // Create a new task instance with the same data but different due date and reference to source task
      const newTask = new Task({
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: "in progress", // Assuming the new task should be in progress
        priority: task.priority,
        dueDate: newDueDate, // Set the new due date here
        assignedMember: {
          member: user._id,
        },
        sourcetask: taskId, // Reference to the source task
      });
      createNotification(
        user._id,
        `Task: "${task.title}" is assigned to you due ${dueDate}`
      );
      // Save the new task
      await newTask.save();
      res.status(200).json({
        message: "New task created and assigned successfully",
        task: newTask,
      });
    } else {
      res.status(400).json({ message: "Task status cannot be modified" });
    }
  } catch (error) {
    console.error("Error updating assigned user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.viewtasks = async (req, res) => {
  try {
    const { projectId } = req.body;
    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    const userid = user._id.toString();
    const projectid = project.leaderID.toString();
    if (projectid === userid) {
      const tasks = await Task.find({ projectId: projectId }).populate(
        "assignedMember.member",
        "email.address"
      );
      res.status(200).json({ tasks });
    } else {
      const tasks = await Task.find({
        "assignedMember.member": user._id,
        projectId: projectId,
      }).populate("assignedMember.member", "email.address");
      res.status(200).json({ tasks });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function updateUpcomingTasks(task, dueDate) {

  if (!task.upcomingtask) {

    return;
  } else {

    for (const itemID of task.upcomingtask) {
      // get the upcoming task
      const comingTask = await Task.findById(itemID);
      if (comingTask) {
        // if its due date is after the starting date of the upcoming task
        if (new Date(dueDate) >= new Date(comingTask.date)) {
          //Difference in days:
          const difference = Math.ceil(
            (new Date(dueDate) - new Date(comingTask.date)) /
              (1000 * 60 * 60 * 24)
          );
          // increase the start by the difference
          comingTask.date = new Date(
            comingTask.date.getTime() + difference * 24 * 60 * 60 * 1000
          );
          // increase the end by the difference
          comingTask.dueDate = new Date(
            comingTask.dueDate.getTime() + difference * 24 * 60 * 60 * 1000
          );
          // Save the updated comingTask
          await comingTask.save();
          updateUpcomingTasks(comingTask, comingTask.dueDate);
        }
      }
    }
  }
}

exports.edittask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, dueDate, priority, phase, status } = req.body;
    console.log(title, description, dueDate, priority, phase);
    const { projectId } = req.body;
    console.log(projectId);
    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    console.log(user, project);
    const userid = user._id.toString();
    const projectid = project.leaderID.toString();
    const task = await Task.findById(taskId);
    let assignmemberid;
    if (task.assignedMember.member !== undefined) {
      assignmemberid = task.assignedMember.member.toString();
    }
    // Check if the user is a leader
    if (projectid === userid) {
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.dueDate !== dueDate) {
        console.log("zzzzzzzzzzzzzzzzzz");

        updateUpcomingTasks(task, dueDate);
      }
      await Task.findOneAndUpdate(
        { _id: taskId },
        {
          $set: {
            title: title || task.title,
            description: description || task.description,
            dueDate: dueDate || task.dueDate,
            priority: task.priority && priority ? priority : task.priority,
            phase: task.phase && phase ? phase : task.phase,
          },
        },
        { new: true }
      );

      res.status(200).json({ message: "Task updated successfully", task });
    } else if (assignmemberid === userid) {
      // console.log(assignmemberid,userid);
      console.log(status, task.status === "in progress");
      if (status && task.status === "in progress") {
        task.status = status;
        if (status === "completed") {
          task.subtasks.forEach((subtask) => {
            subtask.checked = true;
          });
        }
        await task.save();
        res.status(200).json({ message: "Task updated successfully", task });
      }
    }

    // Find the task by ID
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deletetask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { projectId } = req.body;
    console.log("delete");

    // Find the user by email
    const user = await User.findOne({ "email.address": req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the user is the project leader
    const userId = user._id.toString();
    const projectLeaderId = project.leaderID.toString();
    if (userId !== projectLeaderId) {
      return res.status(403).json({
        message: "Unauthorized: Only the project leader can delete tasks",
      });
    }

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    } else {
      if (task.upcomingtask) {
        for (const itemID of task.upcomingtask) {
          const comingTask = await Task.findById(itemID);
          if (comingTask) {
            await Task.updateOne(
              { _id: itemID },
              { $pull: { pretask: taskId } }
            );
          }
        }

        if (task.pretask) {
          for (const itemID of task.pretask) {
            const PreTask = await Task.findById(itemID);
            if (PreTask) {
              await Task.updateOne(
                { _id: itemID },
                { $pull: { upcomingtask: taskId } }
              );
            }
          }
        }
      }
      // Delete the task
      await Task.deleteOne({ _id: taskId });
    }
    // Return success response
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.taskdetails = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching task details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.taskprogress = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const Taskcompleted = await Task.countDocuments({
      _id: taskId,
      status: "completed",
    });
    let taskProgress = 0;
    if (Taskcompleted) {
      taskProgress = 100;
    } else {
      const checkedCount = task.subtasks.reduce(
        (count, subtask) => count + (subtask.checked ? 1 : 0),
        0
      );
      const numOfSubTask = task.subtasks.length;
      taskProgress = ((checkedCount * 1.0) / numOfSubTask) * 100;
      if (!numOfSubTask) {
        taskProgress = 0;
      }
    }
    res.json({ taskProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createsubtask = async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;
  const memberId = await User.findOne({ "email.address": req.user.email });
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "task not found." });
    }
    if (memberId._id.toString() !== task.assignedMember.member.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "it is not your task" });
    }
    task.subtasks.push({ title });
    await task.save();

    res.json({
      success: true,
      message: "subtask added successfully.",
      title: title,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.submitsubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    // Find the task by its ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Find the subtask within the task's subtasks array by its ID
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Update the checked property to true
    subtask.checked = true;

    // Check if all subtasks are checked
    const allSubtasksChecked = task.subtasks.every((sub) => sub.checked);
    if (allSubtasksChecked) {
      // If all subtasks are checked, update task status to "completed"
      task.status = "completed";
    }

    // Save the changes to the task
    await task.save();

    // Send a success response
    res.status(200).json({ message: "Subtask updated successfully", subtask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getallsubtasks = async (req, res) => {
  const { taskId } = req.params;
  // console.log(taskId);
  try {
    // Find the task by ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });
    }

    // Return the subtasks for the task
    res.json({ success: true, data: { subtasks: task.subtasks } });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.deletesubtask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const subtaskId = req.params.subtaskId;
    const task = await Task.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "task not found." });
    }
    const member = await User.findOne({ "email.address": req.user.email });
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "member not found." });
    }
    if (member._id.toString() !== task.assignedMember.member.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "it is not your task" });
    }

    // const numOfSubtasks = task.subtasks.length;

    const subtask = task.subtasks.find(
      (sub) => sub._id.toString() === subtaskId.toString()
    );
    console.log(subtask);
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    const subtaskTitle = subtask.title;
    console.log(subtaskTitle);
    // if(task.subtasks.length === numOfSubtasks){
    //   return res.status(404).json({ error: 'subtask not found' });
    // }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $pull: { subtasks: { _id: subtaskId } } },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.status(200).json({
      status: "success",
      message: `${subtaskTitle} deleted`,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.unsubmitTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find the task by ID
    const task = await Task.findById(taskId);

    // Check if the task exists
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    // Check if the task has assigned members
    if (task.assignedMember && task.assignedMember.member) {
      // Update task status to "in progress" if it has assigned members
      await Task.updateOne(
        { _id: taskId, status: "completed" },
        { $set: { status: "in progress" } }
      );
      res.json({
        success: true,
        message: 'Task status updated to "in progress"',
      });
    } else {
      // Update task status to "not assigned" if it doesn't have assigned members
      await Task.updateOne(
        { _id: taskId, status: "completed" },
        { $set: { status: "not assigned" } }
      );
      res.json({
        success: true,
        message: 'Task status updated to "not assigned"',
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Update task status to "completed"
    const result = await Task.updateOne(
      { _id: taskId, status: "not assigned" },
      { $set: { status: "completed" } }
    );

    // Check if the task was found and updated
    if (result.nModified === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Task not found or already completed",
        });
    }

    res.json({ success: true, message: 'Task status updated to "completed"' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.gantttasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const user = await User.findOne({ "email.address": req.user.email });
    const project = await Project.findById(projectId);
    const userId = user._id.toString();
    const projectLeaderId = project.leaderID.toString();

    let tasks;
    if (projectLeaderId === userId || project.members.includes(userId)) {
      // User is the project leader or a member, fetch all tasks in the project
      tasks = await Task.find({ projectId: projectId })
        .select("id title date dueDate phase status subtasks pretask")
        .lean();
    } else {
      // User is not authorized to view tasks in the project
      return res.status(403).json({ message: "Forbidden" });
    }

    // Calculate progress for each task
    tasks.forEach((task) => {
      if (!task) {
        task.progress = 0;
        return;
      }

      const { status, subtasks } = task;

      if (status === "completed") {
        task.progress = 100;
        return;
      }

      if (!subtasks || subtasks.length === 0) {
        task.progress = 0;
        return;
      }

      const checkedCount = subtasks.reduce(
        (count, subtask) => count + (subtask.checked ? 1 : 0),
        0
      );
      const numOfSubTask = subtasks.length;

      task.progress = (checkedCount / numOfSubTask) * 100;
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
