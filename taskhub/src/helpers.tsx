import { Task } from "gantt-task-react";
import axios from "axios";

// export const initTasks = async () => {
//   const token = sessionStorage.getItem("userID");
//   const projectId = sessionStorage.getItem("projectID");
//   //

//   // Fetch tasks data from your API
//   axios
//     .get(`${import.meta.env.VITE_TASK_API}/gantttasks/${projectId}`, {
//       headers: {
//         Authorization: `UserLoginToken ${token}`,
//       },
//     })
//     .then((response) => {
//       console.log(response);
//       const assignedTasks = response.data.tasks
//         .filter((task: any) => task.status !== "not assigned" && task.dueDate)
//         .sort((a: any, b: any) => {
//           const phaseOrder = ["planing", "design", "development", "launch"];
//           return phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase);
//         });
//       console.log(assignedTasks);

//       // Initialize an object to store the earliest and latest dates for each phase
//       const phaseDates: Record<
//         string,
//         { earliest: Date | null; latest: Date | null }
//       > = {};

//       // Iterate over assignedTasks to collect the earliest and latest dates for each phase
//       assignedTasks.forEach((task: any) => {
//         if (!phaseDates[task.phase]) {
//           phaseDates[task.phase] = {
//             earliest: task.date ? new Date(task.date) : null,
//             latest: task.dueDate ? new Date(task.dueDate) : null,
//           };
//         } else {
//           const taskStartDate = task.date ? new Date(task.date) : null;
//           const taskEndDate = task.dueDate ? new Date(task.dueDate) : null;
//           if (
//             taskStartDate &&
//             phaseDates[task.phase]?.earliest &&
//             taskStartDate < phaseDates[task.phase]!.earliest!
//           ) {
//             phaseDates[task.phase]!.earliest = taskStartDate;
//           }
//           if (
//             taskEndDate &&
//             phaseDates[task.phase]?.latest &&
//             taskEndDate > phaseDates[task.phase]!.latest!
//           ) {
//             phaseDates[task.phase]!.latest = taskEndDate;
//           }
//         }
//       });

//       // Log the earliest and latest dates for each phase
//       Object.entries(phaseDates).forEach(([phase, dates]) => {
//         console.log(
//           `Phase: ${phase}, Earliest Date: ${dates.earliest}, Latest Date: ${dates.latest}`
//         );
//       });

//       // Initialize an object to store the progress of each phase
//       const phaseProgress: Record<string, number> = {};

//       // Iterate over the tasks and accumulate the progress for each phase
//       assignedTasks.forEach((task: any) => {
//         if (!phaseProgress[task.phase]) {
//           phaseProgress[task.phase] = 0;
//         }
//         phaseProgress[task.phase] += task.progress;
//       });

//       // Iterate over the phases and calculate the progress for each phase
//       Object.keys(phaseProgress).forEach((phase) => {
//         const totalTasks = assignedTasks.filter(
//           (task: any) => task.phase === phase
//         ).length;
//         const phaseProg = phaseProgress[phase] / totalTasks;
//         phaseProgress[phase] = isNaN(phaseProg) ? 0 : phaseProg;
//       });

//       // Log the progress of each phase
//       console.log(phaseProgress);

//       // Now you can use phaseProgress to render the progress of each phase in your Gantt chart

//       // Initialize an object to store the tasks for each project
//       const projectTasks: Record<string, Task[]> = {};

//       // Iterate over assignedTasks to group tasks by project
//       assignedTasks.forEach((task: any) => {
//         // If the project doesn't exist in the projectTasks object, create it
//         if (!projectTasks[task.phase]) {
//           projectTasks[task.phase] = [];
//         }

//         // Push the task into the corresponding projectTasks array
//         projectTasks[task.phase].push({
//           start: new Date(task.date),
//           end: new Date(task.dueDate),
//           name: task.title,
//           id: task._id,
//           type: "task",
//           progress: parseFloat(task.progress.toFixed(1)),
//           dependencies: task.pretask,
//           project: `${task.phase}`,
//           // Add any additional properties here
//           isDisabled: false,
//           styles: {
//             progressColor: "#ffbb54",
//             progressSelectedColor: "#ff9e0d",
//           },
//         });
//       });
//       // Define the names of the 4 projects
//       const phaseNames = ["planing", "design", "development", "launch"];

//       // Create an array to store projects and tasks
//       const finalParsedTasks: Task[] = [];
//       console.log(projectTasks);
//       // Iterate over phaseNames to create projects and append their tasks
//       phaseNames.forEach((phase) => {
//         const earliestDate = phaseDates[phase]?.earliest ?? new Date();
//         const latestDate = phaseDates[phase]?.latest ?? new Date();
//         // Create project object
//         const project: Task = {
//           id: `Project_${phase}`,
//           type: "project",
//           name: phase,
//           start: earliestDate, // Set start date of project as earliest date or current date if null
//           end: latestDate, // Set end date of project as latest date or current date if null
//           progress: parseFloat(phaseProgress[phase].toFixed(1)), // Set progress of project as 0
//           hideChildren: false,
//           isDisabled: false,
//           styles: {
//             progressColor: "#000000",
//             progressSelectedColor: "#000000",
//           },
//         };

//         // Append project to finalParsedTasks
//         finalParsedTasks.push(project);

//         // Append tasks for the phase to finalParsedTasks
//         if (projectTasks[phase]) {
//           finalParsedTasks.push(...projectTasks[phase]);
//         }
//       });

//       //   const finalParsedTasks = [...projects, ...parsedTasks];
//       // Set the parsed tasks into state
//       console.log(finalParsedTasks);
//       // setTasks(finalParsedTasks);
//       return finalParsedTasks;
//     })
//     .catch((error) => {
//       console.error("Error fetching tasks:", error);
//     });

//   //   const currentDate = new Date();
//   //   const tasks: Task[] = [
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
//   //       name: "Some Project",
//   //       id: "ProjectSample",
//   //       progress: 25,
//   //       type: "project",

//   //       hideChildren: false
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
//   //       end: new Date(
//   //         currentDate.getFullYear(),
//   //         currentDate.getMonth(),
//   //         2,
//   //         12,
//   //         28
//   //       ),
//   //       name: "Idea",
//   //       id: "Task 0",
//   //       progress: 45,
//   //       type: "task",
//   //       project: "ProjectSample"
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
//   //       name: "Research",
//   //       id: "Task 1",
//   //       progress: 25,
//   //       dependencies: ["Task 0"],
//   //       type: "task",
//   //       project: "ProjectSample"
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
//   //       name: "Discussion with team",
//   //       id: "Task 2",
//   //       progress: 10,
//   //       dependencies: ["Task 1"],
//   //       type: "task",
//   //       project: "ProjectSample"
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
//   //       name: "Developing",
//   //       id: "Task 3",
//   //       progress: 2,
//   //       dependencies: ["Task 2"],
//   //       type: "task",
//   //       project: "ProjectSample"
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
//   //       name: "Review",
//   //       id: "Task 4",
//   //       type: "task",
//   //       progress: 70,
//   //       dependencies: ["Task 2"],
//   //       project: "ProjectSample"
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
//   //       name: "Release",
//   //       id: "Task 6",
//   //       progress: currentDate.getMonth(),
//   //       type: "milestone",
//   //       dependencies: ["Task 4"],
//   //       project: "ProjectSample"
//   //     },
//   //     {
//   //       start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
//   //       end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
//   //       name: "Party Time",
//   //       id: "Task 9",
//   //       progress: 0,
//   //       isDisabled: true,
//   //       type: "task"
//   //     }
//   //   ];
// };

export const getStartEndDateForProject = (tasks: Task[], projectId: string) => {
  const projectTasks = tasks.filter((t) => t.project === projectId);
  let start = projectTasks[0].start;
  let end = projectTasks[0].end;

  for (let i = 0; i < projectTasks.length; i++) {
    const task = projectTasks[i];
    if (start.getTime() > task.start.getTime()) {
      start = task.start;
    }
    if (end.getTime() < task.end.getTime()) {
      end = task.end;
    }
  }
  return [start, end];
};
