import React, { useState, useEffect } from "react";
import "./css/gantt.css";
import axios from "axios";
import Loading from "./Loading";
import {
  Gantt,
  Task,
  EventOption,
  StylingOption,
  ViewMode,
  DisplayOption,
} from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { getStartEndDateForProject } from "./helpers";
import { ViewSwitcher } from "./ViewSwitcher";
import NavBarBig from "./NavBarBig";
import NavBarCurrent from "./NavBarCurrent";
import { FaChartBar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function MyGanttChart() {
  const [view, setView] = useState<ViewMode>(ViewMode.Day);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isChecked, setIsChecked] = useState(true);
  const [criticalPathChecked, setCriticalPathChecked] = useState(false);

  const token = sessionStorage.getItem("userID");
  const projectId = sessionStorage.getItem("projectID");
  const [loading, setLoading] = useState(true);
  const [criticalPath, setCriticalPath] = useState<string[]>([]);
  const navigate = useNavigate();


  // const token = sessionStorage.getItem("userID");
  // const projectId = sessionStorage.getItem("projectID");
  let columnWidth = 60;
  if (view === ViewMode.Month) {
    columnWidth = 300;
  } else if (view === ViewMode.Week) {
    columnWidth = 250;
  }

  useEffect(() => {
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"); //
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
    fetchTasks();
    }
  }, []);

  // used to get the critical path tasks
  useEffect(() => {
    if(tasks){
      handleCriticalPath()
    }
  }, [tasks]);

  const fetchTasks = () => {
    // Fetch tasks data from your API
    axios
      .get(`${import.meta.env.VITE_TASK_API}/gantttasks/${projectId}`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then( (response) => {
        console.log(response);
        const assignedTasks = response.data.tasks
          .filter((task: any) => task.status !== "not assigned" && task.dueDate)
          .sort((a: any, b: any) => {
            const phaseOrder = ["planing", "design", "development", "launch"];
            return phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase);
          });
        console.log(assignedTasks);


        // Initialize an object to store the earliest and latest dates for each phase
        const phaseDates: Record<
          string,
          { earliest: Date | null; latest: Date | null }
        > = {};

        // Iterate over assignedTasks to collect the earliest and latest dates for each phase
        assignedTasks.forEach((task: any) => {
          if (!phaseDates[task.phase]) {
            phaseDates[task.phase] = {
              earliest: task.date ? new Date(task.date) : null,
              latest: task.dueDate ? new Date(task.dueDate) : null,
            };
          } else {
            const taskStartDate = task.date ? new Date(task.date) : null;
            const taskEndDate = task.dueDate ? new Date(task.dueDate) : null;
            if (
              taskStartDate &&
              phaseDates[task.phase]?.earliest &&
              taskStartDate < phaseDates[task.phase]!.earliest!
            ) {
              phaseDates[task.phase]!.earliest = taskStartDate;
            }
            if (
              taskEndDate &&
              phaseDates[task.phase]?.latest &&
              taskEndDate > phaseDates[task.phase]!.latest!
            ) {
              phaseDates[task.phase]!.latest = taskEndDate;
            }
          }
        });

        // Log the earliest and latest dates for each phase
        Object.entries(phaseDates).forEach(([phase, dates]) => {
          console.log(
            `Phase: ${phase}, Earliest Date: ${dates.earliest}, Latest Date: ${dates.latest}`
          );
        });

        // Initialize an object to store the progress of each phase
        const phaseProgress: Record<string, number> = {};

        // Iterate over the tasks and accumulate the progress for each phase
        assignedTasks.forEach((task: any) => {
          if (!phaseProgress[task.phase]) {
            phaseProgress[task.phase] = 0;
          }
          phaseProgress[task.phase] += task.progress;
        });

        // Iterate over the phases and calculate the progress for each phase
        Object.keys(phaseProgress).forEach((phase) => {
          const totalTasks = assignedTasks.filter(
            (task: any) => task.phase === phase
          ).length;
          const phaseProg = phaseProgress[phase] / totalTasks;
          phaseProgress[phase] = isNaN(phaseProg) ? 0 : phaseProg;
        });

        // Log the progress of each phase
        console.log(phaseProgress);

        // Now you can use phaseProgress to render the progress of each phase in your Gantt chart

        // Initialize an object to store the tasks for each project
        const projectTasks: Record<string, Task[]> = {};

        // Iterate over assignedTasks to group tasks by project
        assignedTasks.forEach((task: any) => {
          // If the project doesn't exist in the projectTasks object, create it
          if (!projectTasks[task.phase]) {
            projectTasks[task.phase] = [];
          }

          // Push the task into the corresponding projectTasks array
          projectTasks[task.phase].push({
            start: new Date(task.date),
            end: new Date(task.dueDate),
            name: task.title,
            id: task._id,
            type: "task",
            progress: parseFloat(task.progress.toFixed(1)),
            dependencies: task.pretask,
            project: `${task.phase}`,
            // Add any additional properties here
            isDisabled: false,
            styles: {
              progressColor: "#D59AD4",//purple color
              progressSelectedColor: "#c4c1c1", //grey for unprogressed
            },
          }); 
        });
        // Define the names of the 4 projects
        const phaseNames = ["planing", "design", "development", "launch"];

        // Create an array to store projects and tasks
        const finalParsedTasks: Task[] = [];
        console.log(projectTasks);
        // Iterate over phaseNames to create projects and append their tasks
        phaseNames.forEach((phase) => {
          const earliestDate = phaseDates[phase]?.earliest ?? new Date();
          const latestDate = phaseDates[phase]?.latest ?? new Date();
          // Create project object
          const project: Task = {
            id: phase,
            type: "project",
            name: phase,
            start: earliestDate, // Set start date of project as earliest date or current date if null
            end: latestDate, // Set end date of project as latest date or current date if null
            progress: phaseProgress[phase] ? parseFloat(phaseProgress[phase].toFixed(1)) : 0, // Set progress of project as 0
            hideChildren: false,
            isDisabled: false,
            styles: {
              progressColor: "#F3BAE4",
              progressSelectedColor: "#F3BAE4",
            },
          };

          // Append project to finalParsedTasks
          finalParsedTasks.push(project);

          // Append tasks for the phase to finalParsedTasks
          if (projectTasks[phase]) {
            finalParsedTasks.push(...projectTasks[phase]);
          }
        });

        //   const finalParsedTasks = [...projects, ...parsedTasks];
        // Set the parsed tasks into state
        console.log(finalParsedTasks);
        setTasks(finalParsedTasks);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  };

  const handleTaskChange = (task: Task) => {
    console.log("On date change Id:" + task.id);
    let newTasks = tasks.map((t) => (t.id === task.id ? task : t));
    if (task.project) {
      console.log("in task condition:" + task.id);

      const [start, end] = getStartEndDateForProject(newTasks, task.project);
      console.log(newTasks);

      const project =
        newTasks[newTasks.findIndex((t) => t.id === task.project)];
      console.log("project", project);

      if (
        project.start.getTime() !== start.getTime() ||
        project.end.getTime() !== end.getTime()
      ) {
        const changedProject = { ...project, start, end };
        console.log("changedProject", changedProject);

        newTasks = newTasks.map((t) =>
          t.id === task.project ? changedProject : t
        );
      }
    }
    setTasks(newTasks);
  };

  const handleTaskDelete = (task: Task) => {
    const conf = window.confirm("Are you sure about " + task.name + " ?");
    if (conf) {
      setTasks(tasks.filter((t) => t.id !== task.id));
    }
    return conf;
  };

  const handleProgressChange = async (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On progress change Id:" + task.id);
  };

  const handleDblClick = (task: Task) => {
    toast.success("On Double Click event Id:" + task.id);
  };

  const handleSelect = (task: Task, isSelected: boolean) => {
    console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (task: Task) => {
    setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    console.log("On expander click Id:" + task.id);
  };

  //Get the pretasks of the lastTask
  const CalculateCriticalPath = (task: Task) => {
    // add the task.id to the criticalPath
    setCriticalPath((prevTasks) => [...prevTasks, task.id]);
    if (task?.dependencies) {
      let lastPreTask = null;
      // get the last end date task of the pretasks
      for (const dependency of task.dependencies) {
        const dependencyTask = tasks?.find((t) => t.id === dependency);
        //Check if it has higher end date
        if (
          dependencyTask &&
          (!lastPreTask ||
            new Date(dependencyTask.end) > new Date(lastPreTask.end))
        ) {
          lastPreTask = dependencyTask;
        }
      }
      //Call the function again to get the last pretask of this task 
      if (lastPreTask) CalculateCriticalPath(lastPreTask);
    }
  };

  //Get the tasks of the critical path
  const handleCriticalPath = () => {
    //empty the criticalPath array  
    setCriticalPath([]);
    let lastTask: Task | null = null;
    //Get the last task in the project
    for (const task of tasks) {
      if ((!lastTask || task.end > lastTask.end) && task.type === "task") {
        lastTask = task;
      }
    }
    //Then get its pretasks
    if (lastTask) 
      CalculateCriticalPath(lastTask);

    // console.log("lastTask:" + lastTask?.end);
  };

  //Change the colors of the tasks
  const criticalPathStyling =  (isCritical: boolean) => {
    //check the criticalPath is on or off
    if (isCritical) {
      console.log("ccccccccccccccc");
      for (const task of tasks) {
        //Check if the task is in the criticalPath
        if (criticalPath.includes(task.id)) {
          task.styles = {
            backgroundColor: "#ff0000",
            progressColor: "#ff0000", // Red color for progress
            progressSelectedColor: "#ff0000", // Red color for selected progress
          };
        } else {
          // Task is not in critical path, update its styles
          task.styles = {
            progressColor: "#8A46BB", // purple color for progress
            progressSelectedColor: "#150909", // Grey color for selected progress
          };
        }
      }
    } else {
      for (const task of tasks) {
        task.styles = {
          progressColor: "#F3BAE4",
          progressSelectedColor: "#F3BAE4",
        };
      }
    }
  };


  return (
      
    <div className="dashboard" style={{display: 'flex'}}>

      <div>
        {/* <Navbar /> */}
        <NavBarBig />

        {/* current */}
        {/* <div style={{ position: 'fixed', zIndex: 1}}> */}
         <div style={{position: 'absolute', top:'350px', height: '100px', overflow: 'hidden'}}>
          <NavBarCurrent icon={<FaChartBar/>} text="GANTT chart" click="/GanttChart"></NavBarCurrent>
         </div>
        {/* </div> */}
        {/* end of current */}
    
      </div>
      <ToastContainer />

      <div style={{ display: "flex", flexDirection: "row", color: 'black' }} className="main">
        <div >
          <div style={{position: 'absolute', top: '30px', left: "60px"}}>
          <h2 style={{ fontSize: '30px', color: 'purple'}}>GANTT Chart</h2>
          <hr style={{width: '75vw'}}/>
          </div>
          <br/><br/>
          {!loading && (
            <div>
            <ViewSwitcher
          onViewModeChange={(viewMode: ViewMode) => setView(viewMode)}
          onViewListChange={setIsChecked}
          isChecked={isChecked}
        />
        <div style={{display: 'flex', position: "absolute", top: '240px', marginLeft: '20px'}}>
          Show Critical Path in Graph
            <label className="Switch_Toggle">
              <input
                type="checkbox"
                checked={criticalPathChecked}
                onClick={() => {
                  setCriticalPathChecked(!criticalPathChecked);
                  criticalPathStyling(!criticalPathChecked);
                }}
              />
              <span className="Slider" />
            </label>
        </div>
        {/* <h3>Gantt With Unlimited Height</h3> */}
        <div style={{ width: "75vw", position: 'absolute', top: '300px' }}>
          <Gantt
            tasks={tasks}
            viewMode={view}
            onDateChange={handleTaskChange}
            onDelete={handleTaskDelete}
            onProgressChange={handleProgressChange}
            onDoubleClick={handleDblClick}
            onSelect={handleSelect}
            onExpanderClick={handleExpanderClick}
            listCellWidth={isChecked ? "155px" : ""}
            columnWidth={columnWidth}
            headerHeight={67}
            rowHeight={55}
          />
        </div>
        {/* <h3>Gantt Summary</h3>
        <div style={{ width: "79vw" }}>
          <Gantt
            tasks={tasks}
            viewMode={view}
            onDateChange={handleTaskChange}
            onDelete={handleTaskDelete}
            onProgressChange={handleProgressChange}
            onDoubleClick={handleDblClick}
            onSelect={handleSelect}
            onExpanderClick={handleExpanderClick}
            listCellWidth={isChecked ? "155px" : ""}
            ganttHeight={300}
            columnWidth={columnWidth}
          />
        </div> */}
      </div>
    )}
              {loading && <Loading />}

      </div>
      </div>
      </div>
  );

}
export default MyGanttChart;
