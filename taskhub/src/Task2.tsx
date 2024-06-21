import axios from "axios";
import Navbar from "./Navbar";
import "./css/Task2.css";
import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
const timeZone = "Etc/GMT";
import CircularProgress from "./Progress";
import { FaArrowAltCircleRight, FaArrowCircleRight, FaArrowDown, FaCheck, FaCheckCircle, FaEdit, FaFile, FaPen, FaRegTimesCircle, FaTrash, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// import { color } from "chart.js/helpers";
import NavBarBig from "./NavBarBig";
import NavBarCurrent from "./NavBarCurrent";
import Header from "./Header";
import { RiArrowDropDownLine, RiArrowUpSLine } from "react-icons/ri";
import Loading from "./Loading";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Task2() {
  const navigate = useNavigate();

  interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: string;
    phase: string;
    status: string;
    progress?: number; // Add progress field as optional
    subtasks: Subtask[];
    assignedMember?: {
      member: {
        email: {
          address: string;
        };
        _id: string;
      };
      dateofAssigning: Date;
    };
    // sourcetask?: string;
    pretask?: string[];
    date: Date;
  }

  interface Subtask {
    _id: string;
    title: string;
    checked: boolean;
  }

  const [TaskName, setProjectName] = useState("Enter Name");
  const [description, setDescription] = useState("Enter Description");
  const [priority, setPriority] = useState("");
  const [phase, setPhase] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignMember, setAssignMember] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [pretasks, setPretasks] = useState<any>([]);
  const [maxDate, setMaxDate] = useState<any>("");
  const [plusOneDay, setPlusOneDay] = useState<any>("");

  const [editTaskName, seteditProjectName] = useState("");
  const [editdescription, seteditDescription] = useState("");
  const [editpriority, seteditPriority] = useState("");
  const [editphase, seteditPhase] = useState("");
  const [editdueDate, seteditDueDate] = useState("");

  const [editTaskNamebool, seteditProjectNamebool] = useState(false);
  const [editdescriptionbool, seteditDescriptionbool] = useState(false);
  const [editprioritybool, seteditPrioritybool] = useState(false);
  const [editphasebool, seteditPhasebool] = useState(false);
  const [editdueDatebool, seteditDueDatebool] = useState(false);

  const [changeassignmember, setchangeassignmember] = useState("");
  const [changeassigndate, setchangeassigndate] = useState("");

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [notassignedTasks, setnotassignedTasks] = useState<Task[]>([]);

  const [editMode, setEditMode] = useState("");
  const [assignMode, setAssignMode] = useState("");
  const [filterassign, setfilterassign] = useState("");
  const [filtersuggestions, setfilterSuggestions] = useState([]);
  const [allmembers, setallmembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [originalTasks, setoriginalTasks] = useState<Task[]>([]);
  const [sortType, setSortType] = useState('');
  const [showtask, setshowtask] = useState<{ [taskId: string]: string }>({});
  const [showSubmitPopup, setShowSubmitPopup] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null); // New state to track expanded task
  const [step, setStep] = useState(1);
  const [showPopupSubmit, setShowPopupSubmit] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showPopupDelete, setShowPopupDelete] = useState<string | null>(null);



  const projectId = sessionStorage.getItem("projectID");

  const token = sessionStorage.getItem("userID");
  useEffect(() => {
    // Check if token exists in session storage
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      fetchTasks();
      if (allmembers.length === 0) {
        searchMembers(".com")
          .then((filteredMembers) => {
            setallmembers(filteredMembers);
          })
          .catch((error) => {
            console.error("Error filtering members:", error);
            setallmembers([]);
          });
      }
    }
  }, [projectId, token, navigate]);


  useEffect(() => {
    // if maxDate is more than startDate
    if (maxDate && (!startDate || new Date(startDate) < new Date(maxDate))) {
      // setStartDate = maxDate
      setStartDate(new Date(maxDate).toISOString().split("T")[0]);
    }
    // if maxDate is more than dueDate
    if (maxDate && (!dueDate || new Date(dueDate) <= new Date(maxDate))) {
      // setDueDate = maxDate + 1
      const maxDatePlusOneDay = new Date(plusOneDay);
      maxDatePlusOneDay.setDate(maxDatePlusOneDay.getDate() + 1);
      setDueDate(maxDatePlusOneDay.toISOString().split("T")[0]);
    }
  }, [maxDate]);

  const handleTaskNameChange = (event: any) => {
    setProjectName(event.target.value);
  };

  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const clearInput = () => {
    if (TaskName === "Enter Name") setProjectName("");
  };
  const clearInput2 = () => {
    if (description === "Enter Description") setDescription("");
  };



  const handleInputChange = (event: any) => {
    setProjectName(event.target.value);
  };

  // const handleTask1Change = (event: any) => {
  //   setunProjectName(event.target.value);
  // };
  // const handleTask2Change = (event: any) => {
  //   setAProjectName(event.target.value);
  // };

  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value);
  };

  // const handleDescription2Change = (event: any) => {
  //   setDescription2(event.target.value);
  // };

  const handlePriorityChange = (event: any) => {
    setPriority(event.target.value);
  };

  const handleDueDateChange = (event: any) => {
    const newDueDate = event.target.value;

    if (startDate && new Date(newDueDate) <= new Date(startDate)) {
      let startDatePlusOneDay = new Date(startDate);
      const today = new Date();

      // Check if plusoneday is before today
      if (startDatePlusOneDay < today) {
        startDatePlusOneDay = today;
      }
      startDatePlusOneDay.setDate(startDatePlusOneDay.getDate() + 1);
      setDueDate(startDatePlusOneDay.toISOString().split("T")[0]);
    } else {
      const today = new Date();
      const newdate = new Date(newDueDate)
      if (newdate < today) {
        let date = new Date(today)
        date.setDate(date.getDate() + 1)
        setDueDate(date.toISOString().split("T")[0]);
      } else {
        setDueDate(newDueDate);
      }
    }
  };

  const handleStartDateChange = (event: any) => {
    const newStartDate = event.target.value;

    if (dueDate && new Date(newStartDate) >= new Date(dueDate)) {
      const dueDateMinusOneDay = new Date(dueDate);
      dueDateMinusOneDay.setDate(dueDateMinusOneDay.getDate() - 1);
      setStartDate(dueDateMinusOneDay.toISOString().split("T")[0]);
    } else {
      // Compare the new start date with maxDate
      if (maxDate && new Date(newStartDate) < new Date(maxDate)) {
        setStartDate(new Date(maxDate).toISOString().split("T")[0]);
      } else {
        setStartDate(newStartDate);
      }
      console.log(startDate);
    }
  };

  // Function to handle phase selection
  const handlePhaseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPhase(event.target.value);
    console.log(phase);
  };

  const handlePretaskChange = (task: any, dueDate: any) => {
    setPretasks((prevPretasks: any) => {
      let updatedPretasks = [];
      if (prevPretasks.some((pretask: any) => pretask.task === task)) {
        updatedPretasks = prevPretasks.filter(
          (pretask: any) => pretask.task !== task
        );
      } else {
        const newtask = { task, dueDate };
        // if (!maxDate || maxDate < dueDate) {
        //   setMaxDate(dueDate);
        // }
        updatedPretasks = [...prevPretasks, newtask];
        // Sort the updated pretasks array by dueDate
        updatedPretasks.sort(
          (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        );
      }
      if (updatedPretasks.length) {
        setMaxDate(updatedPretasks[0].dueDate);
        
        let plusoneday = new Date(updatedPretasks[0].dueDate);
        plusoneday.setDate(plusoneday.getDate() + 1);
        
        const today = new Date();

        // Check if plusoneday is before today
        if (plusoneday < today) {
          plusoneday = today;
        }

        setPlusOneDay(plusoneday.toISOString().split("T")[0]);
        console.log(updatedPretasks[0].dueDate);
      } else {
        setMaxDate(null);
        setPlusOneDay(null);
      }

      console.log(updatedPretasks);
      return updatedPretasks;
    });
  };

  // Function to handle assigning member input
  const handleAssignMemberChange: React.KeyboardEventHandler<
    HTMLInputElement
  > = (event) => {
    const searchQuery = event.currentTarget.value.trim();
    setAssignMember(searchQuery);

    if (searchQuery.length === 0) {
      setSuggestions([]);
      return;
    }

    searchMembers(searchQuery)
      .then((filteredMembers) => {
        setSuggestions(filteredMembers);
      })
      .catch((error) => {
        console.error("Error filtering members:", error);
        setSuggestions([]);
      });
  };

  const handleEditDueDateChange = (
    event: any,
    taskStartDate: any,
    pretasks: any
  ) => {
    let newEditDueDate = event.target.value;
    let maxEditDate = null;
    console.log("newEditDueDate: ", newEditDueDate);

    if (pretasks) {
      for (const task of myTasks) {
        if (task._id === pretasks[0]) {
          maxEditDate = task.dueDate;
          break;
        }
      }
      console.log("newEditDueDate: ", newEditDueDate);
      if (maxEditDate && new Date(maxEditDate) >= new Date(newEditDueDate)) {
        const maxDatePlusOneDay = new Date(maxEditDate);
        maxDatePlusOneDay.setDate(maxDatePlusOneDay.getDate() + 1);
        newEditDueDate = maxDatePlusOneDay.toISOString().split("T")[0];
      }
    }

    if (taskStartDate && new Date(newEditDueDate) <= new Date(taskStartDate)) {
      const startDatePlusOneDay = new Date(taskStartDate);
      startDatePlusOneDay.setDate(startDatePlusOneDay.getDate() + 1);
      seteditDueDate(startDatePlusOneDay.toISOString().split("T")[0]);
    } else {
      seteditDueDate(newEditDueDate);
    }
  };

  const handleFilteredMemberClick = (member: string) => {
    setAssignMember(member); // Set the value of the clicked member to emailInput
    setSuggestions([]); // Clear the filtered members list
  };

  const searchMembers = (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      return Promise.resolve([]);
    }
    console.log("attempt front");

    return axios
      .get(
        `${import.meta.env.VITE_PROJECT_API}/project/${projectId}/users/emails`
      )
      .then((response) => {
        const members = response.data;

        const filteredMembers = members.filter((member: string | string[]) =>
          member.includes(searchQuery.trim())
        );

        return filteredMembers;
      })
      .catch((error) => {
        console.error("Error searching members:", error);
        return [];
      });
  };

  const createtask = async () => {
    console.log("pretasks", pretasks);
    const pretasks_id = [];
    for (const item in pretasks) {
      pretasks_id.push(pretasks[item].task);
    }
    await axios
      .post(`${import.meta.env.VITE_TASK_API}/tasks`, {
        projectId: projectId,
        title: TaskName,
        description: description,
        assignedMember: assignMember,
        dueDate: dueDate,
        priority: priority,
        phase: phase,
        pretask: pretasks_id,
        date: startDate,
      }, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      }
      )
      .then((response) => {
        if (response.status === 201) {
          toast.success("Task created successfully!");
          togglePopup();
          fetchTasks();
          setProjectName("Enter Name")
          setDescription("Enter Description")
          setAssignMember("")
          setSuggestions([]);
          setDueDate("")
          setPriority("")
          setPhase("")
          setStartDate("")
          setPretasks([])
          setMaxDate(null)
          setPlusOneDay(null)
          setStep(1)
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data.message) toast.error(`Error creating task ${error.response.data.message}`);
        else toast.error(`Error creating task empty fields`);
      });
  };

  const fetchTasks = () => {
    axios
      .post(
        `${import.meta.env.VITE_TASK_API}/viewtasks`,
        { projectId },
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        const tasks: Task[] = response.data.tasks.map((task: Task) => ({
          ...task,
          subtasks: task.subtasks || [],
        }));
        setLoading(false);

        const myTasks: Task[] = tasks.filter((task) => task.status !== "not assigned");
        const notassignedTasks: Task[] = tasks.filter(
          (task) => task.status === "not assigned"
        );

        const promises = tasks.map((task) => {
          return fetchTaskProgress(task._id).then((progress) => {
            task.progress = progress;
          });
        });

        Promise.all(promises).then(() => {
          setMyTasks(myTasks); // Update myTasks state
          setnotassignedTasks(notassignedTasks); // Update notassignedTasks state
          // Apply sorting logic again based on the selected member
          // Apply sorting logic again based on the selected member
          if (selectedMember) {
            const filtered = myTasks.filter(task => task.assignedMember?.member?.email.address === selectedMember);
            setMyTasks(filtered);
            if (sortType) sorting(sortType, filtered, selectedMember);
          } else {
            setMyTasks(myTasks); // If no member selected, show all tasks
            if (sortType) sorting(sortType, myTasks)
          }
        });
        // console.log("tasks ", myTasks);
        // console.log("not assigned ", notassignedTasks);
        setoriginalTasks(myTasks);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  };

  const fetchTaskProgress = (taskId: string): Promise<number> => {
    return axios
      .get(`${import.meta.env.VITE_TASK_API}/taskProgress/${taskId}`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        return response.data.taskProgress;
      })
      .catch((error) => {
        console.error("Error fetching task progress:", error);
        return 0;
      });
  };

  const deletetask = async (taskId: any) => {
    // const confirmDelete = window.confirm("Are you sure you want to delete this task?");

    // if (confirmDelete) {
      await axios
        .delete(`${import.meta.env.VITE_TASK_API}/tasks/${taskId}/delete`, {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
          data: {
            projectId: projectId,
          },
        })
        .then((response) => {
          if (response.data.message === "Task deleted successfully") {
            fetchTasks();
            toast.success("Task deleted successfully!")
          }
        })
        .catch((error) => {
          console.log(error.response.data.message);
        });
    // }
  };

  // const toggleEditMode = (taskId: string) => {
  //   setEditMode(taskId === editMode ? "" : taskId);
  //   if (!editMode) {
  //     seteditProjectName("");
  //     seteditDescription("");
  //     seteditDueDate("");
  //     seteditPhase("");
  //     seteditPriority("");
  //   }
  // };

  // Function to toggle assign mode for a specific task
  const toggleAssignMode = (taskId: string) => {
    setAssignMode(taskId === assignMode ? "" : taskId);
    if (!assignMode) {
      setchangeassignmember("");
      setchangeassigndate("");
      setfilterassign("");
    }
  };

  const editTask = async (taskId: string) => {
    await axios
      .put(
        `${import.meta.env.VITE_TASK_API}/tasks/${taskId}/edit`,
        {
          title: editTaskName,
          description: editdescription,
          dueDate: editdueDate,
          priority: editpriority,
          phase: editphase,
          projectId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.message === "Task updated successfully") {
          toast.success("Task updated successfully!");
          fetchTasks();
          setEditMode("");
        }
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  const assigntask = async (taskId: string, email: any, date: any) => {
    await axios
      .put(`${import.meta.env.VITE_TASK_API}/tasks/${taskId}/assign`, {
        assignedMember: filterassign || email,
        dueDate: changeassigndate || date,
      })
      .then((response) => {
        if (
          response.data.message === "Assigned user updated successfully" ||
          "New task created and assigned successfully"
        ) {
          toast.success("Assignment Updated Successfully!");
          fetchTasks();
          setAssignMode("");
        }
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  // Function to handle assigning member input
  const handleAssignMember: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    const searchQuery = event.currentTarget.value.trim();
    setfilterassign(searchQuery);

    if (searchQuery.length === 0) {
      setfilterSuggestions([]);
      return;
    }

    searchMembers(searchQuery)
      .then((filteredMembers) => {
        setfilterSuggestions(filteredMembers);
      })
      .catch((error) => {
        console.error("Error filtering members:", error);
        setSuggestions([]);
      });
  };

  const handleFilteredMember = (member: string) => {
    setfilterassign(member); // Set the value of the clicked member to emailInput
    setfilterSuggestions([]); // Clear the filtered members list
  };

  const handleUnsubmit = async (taskId: string) => {
    await axios.put(`${import.meta.env.VITE_TASK_API}/tasks/${taskId}/in-progress`)
      .then((response) => {
        if (response.data.success) {
          toast.success('The task is now in progress');
          fetchTasks();
        }
      })
      .catch((error) => {
        console.log(error.response.data.message);
      })
  }

  const handleSelectChange = (e: any) => {
    setSelectedMember(e.target.value);
    console.log(e.target.value);
    if (e.target.value) {
      const filtered = originalTasks.filter(task => task.assignedMember?.member?.email.address === e.target.value);
      console.log(filtered);
      if (sortType) {sorting(sortType, filtered, e.target.value);}
      else {setMyTasks(filtered)};
    } else {
      if (sortType) {sorting(sortType, originalTasks);}
      else {setMyTasks(originalTasks);} // If no member selected, show all tasks
      // setSortType('');
      // handleSortChange("");
    }
  };

  const submitTask = async (taskId: any) => {
    
      await axios
        .put(`${import.meta.env.VITE_TASK_API}/unatasks/${taskId}/submit`)
        .then((response) => {
          if (response.data.success) {
            toast.success('The task is now completed');
            fetchTasks();
            // setSelectedMember("");
            // handleSelectChange(selectedMember);
            // handleSortChange(sortType);
          }
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    
  };





  const handleSortChange = (e: any) => {
    const sortType = e.target.value;
    setSortType(e.target.value);
    sorting(sortType, myTasks)
  };

  const sorting = (sortType: any, tasks: Task[], selectedMemberr: string | null = null) => {    
    let sortedTasks = [...tasks];
    console.log("tasks in sort func before", sortedTasks);
    
    
    switch (sortType) {
      case 'priorityAsc':
        sortedTasks.sort((a, b) => {
          if (a.priority && b.priority) {
            return a.priority.toLowerCase() < b.priority.toLowerCase() ? -1 : 1;
          } else if (a.priority) {
            return -1; // Place tasks with priority before those without
          } else if (b.priority) {
            return 1; // Place tasks without priority after those with
          }
          return 0;
        });
        break;
      case 'priorityDesc':
        sortedTasks.sort((a, b) => {
          if (a.priority && b.priority) {
            return b.priority.toLowerCase() < a.priority.toLowerCase() ? -1 : 1;
          } else if (a.priority) {
            return -1; // Place tasks with priority before those without
          } else if (b.priority) {
            return 1; // Place tasks without priority after those with
          }
          return 0;
        });
        break;
      case 'dueDateAsc':
        sortedTasks.sort((a, b) => {
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          }
          return a.dueDate ? -1 : b.dueDate ? 1 : 0;
        });
        break;
      case 'dueDateDesc':
        sortedTasks.sort((a, b) => {
          if (a.dueDate && b.dueDate) {
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
          }
          return a.dueDate ? -1 : b.dueDate ? 1 : 0;
        });
        break;
      case 'statusAsc':
        sortedTasks.sort((a, b) => {
          return ({ 'in progress': 1, 'completed': 2, 'not submitted': 3 }[a.status] || 0) - ({ 'in progress': 1, 'completed': 2, 'not submitted': 3 }[b.status] || 0);
        });
        break;
      case 'statusDesc':
        const reverseStatusOrder = { 1: 'in progress', 2: 'completed', 3: 'not submitted' };
        sortedTasks.sort((a, b) => {
          return ({ 'in progress': 1, 'completed': 2, 'not submitted': 3 }[b.status] || 0) - ({ 'in progress': 1, 'completed': 2, 'not submitted': 3 }[a.status] || 0);
        });
        break;
      case 'phaseAsc':
        sortedTasks.sort((a, b) => {
          const phaseA: number = a.phase ? {
            'planing': 1,
            'design': 2,
            'development': 3,
            'launch': 4
          }[a.phase] || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          const phaseB: number = b.phase ? {
            'planing': 1,
            'design': 2,
            'development': 3,
            'launch': 4
          }[b.phase] || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          return phaseA - phaseB;
        });
        break;
      case 'phaseDesc':
        sortedTasks.sort((a, b) => {
          const phaseA: number = a.phase ? {
            'planing': 1,
            'design': 2,
            'development': 3,
            'launch': 4
          }[a.phase] || 0 : 0;
          const phaseB: number = b.phase ? {
            'planing': 1,
            'design': 2,
            'development': 3,
            'launch': 4
          }[b.phase] || 0 : 0;
          return phaseB - phaseA;
        });
        break;
        case "":
          // handleSelectChange(selectedMember);
          sortedTasks = originalTasks;
          if (selectedMember) {
            sortedTasks = originalTasks.filter(task => task.assignedMember?.member?.email.address === selectedMember);
          }
          // setSelectedMember('');
          break;
          default:
            break;
          }
          console.log("balah", selectedMemberr);
          
          if (selectedMemberr) {
            sortedTasks = sortedTasks.filter(task => task.assignedMember?.member?.email.address === selectedMemberr);
          }    
          console.log("tasks in sort func after", sortedTasks);
          
    setMyTasks(sortedTasks);
  };

  const toggleSubtasks = (taskId: string) => {
    setExpandedTask((prevExpandedTask) =>
      prevExpandedTask === taskId ? null : taskId
    );
  };



  const [loading, setLoading] = useState(true);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

  const handleDateChange = (e: any) => {
    const selectedDate = e.target.value;
    if (moment(selectedDate).isBefore(tomorrow, "day")) {
      setchangeassigndate(tomorrow);
    } else {
      setchangeassigndate(selectedDate);
    }
  };

  // if (loading) {
  // Render nothing during the loading phase or if either projectLeader or currentUser is null
  // return <Loading/>;
  // }
  const handleCancel = () => {
    setShowPopup(false);
    setProjectName("Enter Name");
    setDescription("Enter Description");
    setAssignMember("");
    setSuggestions([]);
    setDueDate("");
    setPriority("");
    setPhase("");
    setStartDate("");
    setPretasks([]);
    setMaxDate(null);
    setPlusOneDay(null);
    setStep(1);
  };

  return (
    <div className="taskleader" >
      <div  >
        <NavBarBig />
        <div style={{ position: 'absolute', top: '195px' }}>
          <NavBarCurrent icon={<FaFile />} text="Tasks" click="/taskleader"></NavBarCurrent>
        </div>
        <div className="main">
          {loading && <Loading />}
          <ToastContainer />
          <div >
            {/* create new task btn and popup */}
            <div>
              {/* button */}
              <button className="taskbtn" onClick={togglePopup}>
                + New Task
              </button>

              {showPopup && (
                <div className="popuptask">
                  <h2>New Task</h2>
                  <hr />
                {step === 1 && (
                  <div style={{paddingLeft: '130px'}}>
                    <h2 style={{color:"black",fontSize:"15px"}}>Task Name:</h2>
                    <div className="name">
                     
                      <input
                        type="text2"
                        value={TaskName}
                        onChange={handleInputChange}
                        onFocus={clearInput}
                        onBlur={() => {
                          if (!TaskName.trim()) {
                            setProjectName("Enter Name");
                          }
                        }}
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0)",
                          border: "none",

                          color: "grey",
                        }}
                      />
                    </div>
                    <h2 style={{color:"black",fontSize:"15px"}}>Description:</h2>
                    <div className="name">
                     
                      <input
                        type="text2"
                        value={description}
                        onChange={handleDescriptionChange}
                        onFocus={clearInput2}
                        onBlur={() => {
                          if (!description.trim()) {
                            setDescription("Enter Description");
                          }
                        }}
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0)",
                          border: "none",
                          color: "grey",
                        }}
                      />
                    </div>
                      <div style={{ display: 'flex', float: 'right', marginRight: '70px' }}>
                        <button onClick={handleCancel} className="canceltaskpopup">Cancel</button>
                        <button onClick={handleNext} className="confirmtaskpopup">Next</button>
                      </div>
                  </div>
                )}
          
                {step === 2 && (
                  <div style={{color: 'black', marginLeft: '130px'}}>
                    <div className="pri">
                        <p >Priority:</p>
                        <select value={priority} onChange={handlePriorityChange} style={{padding: '10px', fontSize: '12px', borderRadius: '10px', margin: '0', width: '220px'}}>
                          <option value="">Select Priority</option>
                          <option value="high">High</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div className="phase">
                        <p>Phase:</p>
                        <select value={phase} onChange={handlePhaseChange}style={{padding: '10px', fontSize: '12px', borderRadius: '10px', margin: 0, width: '220px'}}>
                          {/* Add options for phase selection */}
                          <option value="">Select Phase</option>
                          <option value="planing">Planning</option>
                          <option value="design">Design</option>
                          <option value="development">Development</option>
                          <option value="launch">Launch</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', float: 'right', marginRight: '70px' }}>
                        <button onClick={handleBack} className="canceltaskpopup">Back</button>
                        <button onClick={handleNext} className="confirmtaskpopup">Next</button>
                      </div>
                  </div>
                )}
          
                {step === 3 && (
                  <div style={{marginLeft: '70px', color: 'black', fontSize: '15px'}}>
                    <div style={{display: 'flex'}}>
                      <div className="due" style={{marginRight: '30px'}}>
                        <p>Start Date:</p>
                        <input
                        style={{width:"150px"}}
                          type="date"
                          value={startDate}
                          min={maxDate}
                          onChange={handleStartDateChange}
                        />
                      </div>
                      <div className="due">
                        <p> End Date:</p>
                        <input
                        style={{width:"150px"}}
                          type="date"
                          value={dueDate}
                          min={plusOneDay}
                          onChange={handleDueDateChange}
                        />
                      </div>
                      </div>

                      <p>PreTasks:</p>
                      <div
                        style={{
                          overflow: "auto",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          height: "200px",
                          width: "330px",
                        }}
                      >
                        
                        {originalTasks.map((task) => (
                          <div style={{display: 'flex', position: 'relative', color: 'grey'}}>
                            <input
                              type="checkbox"
                              style={{position: 'absolute', left: 0, margin: 0}}
                              id={task._id}
                              name={task.title}
                              checked={pretasks.some(
                                (pretask: any) => pretask.task === task._id
                              )}
                              onChange={() =>
                                handlePretaskChange(task._id, task.dueDate)
                              }
                            />
                              <label style={{paddingLeft:'20px'}} htmlFor={task.title}>{task.title}</label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add pre-tasks input here */}
                      <div style={{ display: 'flex', float: 'right', marginRight: '70px' }}>
                        <button onClick={handleBack} className="canceltaskpopup">Back</button>
                        <button onClick={handleNext} className="confirmtaskpopup">Next</button>
                      </div>
                    </div>
                )}
          
                {step === 4 && (
                    <div className="popup-content" style={{ paddingLeft: '50px', color: 'black' }}>
                      <div className="assign" style={{margin: '30px 0'}}>
                        <p style={{ marginLeft: "70px" }}>Assign Member: 
                          <span style={{fontSize: '10px', color: 'grey', marginLeft: '10px'}}>(optional)</span>
                        </p>
                        <input
                          type="text"
                          value={assignMember}
                          placeholder="Enter member's email"
                          onKeyUp={handleAssignMemberChange}
                          onChange={(e) => {
                            setAssignMember(e.target.value);
                          }}
                          style={{ color: 'black', width: '225px' }}
                        />

                        {/* Display suggestions here */}
                        {suggestions.length > 0 && (
                          <div className="suggestions">
                            {suggestions.map((member, index) => (
                              <div
                                key={index}
                                onClick={() => handleFilteredMemberClick(member)}
                                className="eachsuggestion"
                              >
                                {member}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', float: 'right', marginRight: '200px' }}>
                      
                      <button onClick={handleCancel} className="canceltaskpopup" style={{marginRight: '50px'}}>Cancel</button>
                      <button onClick={handleBack} className="canceltaskpopup">Back</button>

                      <button onClick={createtask} className="confirmtaskpopup" >Create</button>
                    </div>
                    </div>
                )}
              </div>
              )}
              {/* end of popup */}
            </div>
            {/* end of create new task */}


            {/* assigned and unassigned tasks */}
            <div className="Title"
              style={{ display: "flex", flexDirection: "column", marginLeft: "0px" }}
            >
              {/* Unaassigned tasks */}
              <div>
                {/* title */}
                <h2 style={{ color: "purple", marginTop: "50px", fontSize: "25px" }}>
                  Unassigned Tasks:
                </h2>

                {notassignedTasks &&
                  notassignedTasks.map((task, index) => (
                    // all unassigned tasks
                    <div style={{ display: 'flex' }}>
                      {/* submit task icon and popup */}
                      <div style={{ marginTop: "10px", marginRight: '15px', marginLeft: '15px' }}>
                        <FaArrowCircleRight
                          onClick={() => {
                            setShowSubmitPopup(true);
                            setShowPopupSubmit(task._id);
                            console.log(showPopup);
                          }}
                          style={{ color: 'lightgrey', cursor: 'pointer', fontSize: "50px", marginTop: '10px' }}
                        />
                        {showSubmitPopup && (
                          <div className="popuprequests">
                            <center>
                              <h3 style={{ color: 'black' }}>Submit this task?</h3>
                              <button
                                onClick={() => {
                                  submitTask(showPopupSubmit)
                                  setShowSubmitPopup(false);
                                }}
                              >
                                Submit
                              </button>
                              <button onClick={() => setShowSubmitPopup(false)}>Close</button>
                            </center>
                          </div>
                        )}
                      </div>
                      {/* end of submit task icon and popup */}

                      {/* task rectangle without submit */}
                      <div
                        key={task._id}
                        style={{
                          marginBottom: "10px",
                          backgroundColor: "pink",
                          width: "70%",
                          height: 'fit-content',
                          left: "320px",
                          background: "rgb(231, 229, 229)",
                          borderRadius: "11px",
                          paddingBottom: "0px",
                          paddingRight: "0px",
                          marginLeft: "20px"
                        }}

                      >

                        {/* Task Name and controls */}
                        <div className="titlee" style={{
                          width: '100%', height: '60px',
                          marginTop: "0px", marginBottom: '0px', borderWidth: "2px", padding: "20px 0px 0 0", backgroundColor: "rgb(231, 229, 229)"
                        }}>
                          <div className="taskeditname" style={{ position: 'relative' }}>
                            <div className="titlewcheck" style={{ display: "flex", height: '70px' }}>
                              {/* if editting title show input and trash */}
                              {editMode === task._id && editTaskNamebool ? (
                                <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                                  <input
                                    type="text"
                                    value={editTaskName || task.title}
                                    onChange={(e) => seteditProjectName(e.target.value)}
                                    style={{ marginLeft: '20px', backgroundColor: 'rgb(231, 229, 229)', fontSize: '20px', fontWeight: 'bold', width: 'fit-content' }}
                                  />

                                  {/* dropdown */}
                                  <div style={{ color: 'black', fontSize: '30px', cursor: 'pointer', position: 'absolute', right: '20px', top: '20px' }}>

                                    {/* dropdown arrow */}
                                    <div style={{ color: 'black', fontSize: '30px', cursor: 'pointer' }}>
                                      {!showtask[task._id] ?
                                        <RiArrowDropDownLine
                                          onClick={() => {
                                            toggleSubtasks(task._id);
                                            setshowtask(prevState => ({ ...prevState, [task._id]: task._id }));
                                            // setShowtaskdetails(true);
                                          }}
                                        />
                                        :
                                        <RiArrowUpSLine
                                          onClick={() => {
                                            toggleSubtasks(task._id);
                                            setshowtask(prevState => ({ ...prevState, [task._id]: '' }))
                                            // setShowtaskdetails(false);
                                          }}
                                          className=""
                                          style={{ fontSize: '20px' }}
                                        />
                                      }
                                    </div>
                                  </div>
                                  {/* end of dropdown arrow  */}
                                </div>
                              ) : (
                                // if not editting show title, edit, trash
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', float: 'left' }}>
                                  {task.title &&
                                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '750px' }}>
                                      <h2 style={{ color: "rgb(14,13,56)", marginTop: "10px", margin: "5px 0", paddingLeft: '20px', fontSize: '20px' }}>{task.title}</h2>
                                      <FaPen onClick={() => {
                                        setEditMode(task._id)
                                        seteditProjectNamebool(true)
                                      }}
                                        style={{ color: "rgb(14,13,56)", float: "left", cursor: "pointer", marginLeft: '15px' }} />

                                    </div>}

                                  <div style={{ display: 'flex', marginTop: '20px' }}>
                                    <FaTrash
                                      onClick={() => {
                                        setShowPopupDelete(task._id)
                                        // deletetask(task._id);
                                        setShowDeletePopup(true);
                                      }}
                                      style={{ cursor: "pointer", float: "right", color: "black", marginTop: '10px' }}
                                    />
                                    {/* dropdown arrow */}
                                    <div style={{ color: 'black', fontSize: '30px', cursor: 'pointer', marginLeft: '10px' }}>
                                      {!showtask[task._id] ?
                                        <RiArrowDropDownLine
                                          onClick={() => {
                                            toggleSubtasks(task._id);
                                            setshowtask(prevState => ({ ...prevState, [task._id]: task._id }));
                                            // setShowtaskdetails(true);
                                          }}
                                          className=""
                                        />
                                        :
                                        <RiArrowUpSLine
                                          onClick={() => {
                                            toggleSubtasks(task._id);
                                            setshowtask(prevState => ({ ...prevState, [task._id]: '' }))
                                            // setShowtaskdetails(false);
                                          }}
                                          className=""
                                          style={{ fontSize: '20px' }}
                                        />
                                      }
                                    </div>
                                  </div>
                                  {/* end of dropdown arrow  */}
                                </div>
                              )}
                            </div>


                          </div>

                        </div>
                        {/* end of task name and controls */}


                        {/* Task Details dropdown */}
                        {showtask[task._id] &&
                          // Dropdown fields
                          <div>

                            {/* description */}
                            <div className="edit-section" style={{ marginTop: '20px' }}>
                              {editMode === task._id && editdescriptionbool ? (
                                <div style={{ display: 'flex' }}>
                                  {task.description &&
                                    <p style={{ color: "black" }}>Description:</p>
                                  }
                                  <input
                                    type="text"
                                    placeholder={task.description}
                                    onChange={(e) => seteditDescription(e.target.value)}
                                    style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '200px', fontSize: '10px', padding: '0px 10px', margin: '0 0 0 10px ' }}
                                  />
                                </div>

                              ) : (
                                <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
                                  <p style={{ color: "black" }}>Description:  {task.description}</p>
                                  <FaPen onClick={() => {
                                    setEditMode(task._id)
                                    seteditDescriptionbool(true)
                                  }}
                                    style={{ color: 'black', cursor: 'pointer', fontSize: "14px" }}
                                  />

                                </div>
                              )}
                            </div>

                            {task.priority && <hr style={{ width: '90%' }} />}


                            {/* Priority */}
                            <div className="edit-section">
                              {editMode === task._id && editprioritybool
                                ? task.priority && (
                                  <div style={{ display: 'flex' }}>
                                    <p>Priority: </p>
                                    <select
                                      value={editpriority || task.priority}
                                      onChange={(e) => seteditPriority(e.target.value)}
                                      style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '200px', fontSize: '10px', padding: '0px 10px', margin: '0 0 0 10px ' }}
                                    >
                                      <option value="">Select Priority</option>
                                      <option value="high">High</option>
                                      <option value="low">Low</option>
                                    </select>
                                  </div>
                                )
                                :
                                <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
                                  {task.priority && <p style={{ color: "black" }}>Priority: {task.priority}</p>}
                                  <FaPen onClick={() => {
                                    setEditMode(task._id)
                                    seteditPrioritybool(true)

                                  }}
                                    style={{ color: 'black', cursor: 'pointer' }}
                                  />
                                </div>}
                            </div>

                            {task.phase && <hr style={{ width: '90%' }} />}


                            {/* Phase */}
                            <div className="edit-section">
                              {editMode === task._id && editphasebool
                                ? task.phase && (
                                  <div style={{ display: 'flex' }}>
                                    <p>Phase: </p>
                                    <select
                                      value={editphase || task.phase}
                                      onChange={(e) => seteditPhase(e.target.value)}
                                      style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '200px', fontSize: '10px', padding: '0px 10px', margin: '0 0 0 10px ' }}
                                    >
                                      <option value="">Select Phase</option>
                                      <option value="planing">Planning</option>
                                      <option value="design">Design</option>
                                      <option value="development">Development</option>
                                      <option value="launch">Launch</option>
                                    </select>
                                  </div>

                                )
                                :
                                <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
                                  {task.phase && <p style={{ color: "black" }}>Phase: {task.phase}</p>}
                                  <FaPen onClick={() => {
                                    setEditMode(task._id)
                                    seteditPhasebool(true)

                                  }}
                                    style={{ color: 'black', cursor: 'pointer', fontSize: "14px" }}
                                  /></div>}
                            </div>

                            {task.status && <hr style={{ width: '90%' }} />}


                            {/* Status */}
                            <div className="edit-section" style={{ display: 'flex', paddingBottom: 0 }}>
                              {task.status &&
                                <p style={{ color: "black", paddingLeft: "15px", margin: "5px", fontSize: "12px" }}>
                                  Status: {task.status}
                                </p>}


                              <FaUserPlus
                                onClick={() => toggleAssignMode(task._id)}
                                style={{ cursor: "pointer", color: "black", marginTop: '10px', position: 'absolute', right: '0px' }}
                              />

                              {/* assign member */}
                              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                {assignMode === task._id && (
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input
                                      style={{ width: '200px', marginLeft: '20px', backgroundColor: 'rgb(231, 229, 229)', border: '1px solid grey', padding: '5px 10px', marginBottom: 0, fontSize: '12px' }}
                                      type="text"
                                      value={
                                        filterassign ||
                                        task.assignedMember?.member.email.address
                                      }
                                      onKeyUp={handleAssignMember}
                                      onChange={(e) => {
                                        setfilterassign(e.target.value);
                                        // setchangeassignmember(e.target.value)
                                      }}
                                      placeholder="Enter assigned member email"
                                    />
                                    {filtersuggestions.length > 0 && (
                                      <div className="suggestionstask2">
                                        {filtersuggestions.map((member, index) => (
                                          <div
                                          className="eachsuggestiontask2"
                                            key={index}
                                            onClick={() => handleFilteredMember(member)}
                                          >
                                            {member} <hr />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {filterassign && (
                                      <input
                                        type="date"
                                        value={moment(changeassigndate).format(
                                          "YYYY-MM-DD"
                                        )}
                                        min={moment(task.date).add(1, 'days').isAfter(moment().add(1, 'days')) 
                                        ? moment(task.date).add(1, 'days').format('YYYY-MM-DD') 
                                        : moment().add(1, 'days').format('YYYY-MM-DD')}                                        onChange={handleDateChange}
                                        style={{ backgroundColor: 'transparent', width: '200px', color: 'black', marginLeft: '20px', border: '1px solid grey', padding: '7px 10px', fontSize: '12px' }}
                                      />
                                    )}
                                  </div>
                                )}

                                {/* assign member buttons */}
                                {assignMode === task._id && (
                                  <button
                                    onClick={() => {
                                      assigntask(
                                        task._id,
                                        task.assignedMember?.member.email.address,
                                        task.assignedMember?.dateofAssigning
                                      );
                                      setchangeassignmember("");
                                      setchangeassigndate("");
                                      setfilterassign("");
                                    }}
                                    style={{ marginLeft: '20px', backgroundColor: 'grey', padding: ' 5px 10px', width: 'fit-content', height: '40px' }}
                                  >
                                    assign
                                  </button>
                                )}
                              </div>
                              {/* end of assign member */}

                            </div>

                          </div>
                          //end of dropdown fields 
                        }

                        {/* save and cancel button when editting */}
                        {editMode === task._id && (
                          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                            <button style={{ backgroundColor: "purple", marginLeft: "20px" }}
                              onClick={() => {
                                editTask(task._id);
                                seteditProjectName("");
                                seteditDescription("");
                                seteditDueDate("");
                                seteditPhase("");
                                seteditPriority("");
                                seteditDescriptionbool(false);
                                seteditDueDatebool(false);
                                seteditPrioritybool(false);
                                seteditPhasebool(false);
                                seteditProjectNamebool(false);
                                setEditMode("");
                              }}
                            >
                              Save
                            </button>

                            <button style={{ backgroundColor: "grey", marginLeft: "10px" }}
                              onClick={() => {
                                setEditMode("");
                              }}>
                              cancel
                            </button>
                          </div>
                        )}
                        {/* end of save and cancel buttons when editting */}





                      </div>
                      {/* end of task rectangle without submit */}


                    </div>
                    // end of all unassigned

                  ))}
              </div>
              {/* end of unassigned tasks */}



              <hr style={{ width: '70vw' }} />



              {/* Assigned Tasks */}
              <div style={{ position: 'relative' }}>
                {/* header */}
                <div style={{ display: 'flex' }}>
                  {/* title */}
                  <h2 style={{ color: "purple", marginTop: "30px", fontSize: "25px" }}>Assigned Tasks:</h2>
                  {/* sort */}
                  <div style={{ position: 'absolute', right: '50px', top: '20px' }}>
                    <select value={selectedMember} onChange={handleSelectChange}
                      style={{ padding: '8px', backgroundColor: 'rgb(231, 229, 229)', borderRadius: '10px' }}>
                      <option value="">Select Member</option>
                      {/* Populate options with member email addresses */}
                      {allmembers.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>

                    <select value={sortType} onChange={handleSortChange}
                      style={{ padding: '8px', backgroundColor: 'rgb(231, 229, 229)', borderRadius: '10px' }}>
                      <option value="">Sort By</option>
                      <optgroup label="Priority">
                        <option value="priorityAsc">Priority (Ascending)</option>
                        <option value="priorityDesc">Priority (Descending)</option>
                      </optgroup>
                      <optgroup label="Due Date">
                        <option value="dueDateAsc">Due Date (Ascending)</option>
                        <option value="dueDateDesc">Due Date (Descending)</option>
                      </optgroup>
                      <optgroup label="Status">
                        <option value="statusAsc">Status (Ascending)</option>
                        <option value="statusDesc">Status (Descending)</option>
                      </optgroup>
                      <optgroup label="Phase">
                        <option value="phaseAsc">Phase (Ascending)</option>
                        <option value="phaseDesc">Phase (Descending)</option>
                      </optgroup>
                    </select>
                  </div>


                </div>
                {/* end of header */}


                {myTasks &&
                  myTasks.map((task, index) => (
                    <div style={{ display: 'flex' }}>
                      {/* left progress circle */}
                      <div style={{ marginTop: "20px", marginRight: '15px', marginLeft: '15px' }}>
                        {task.progress !== undefined && (
                          <CircularProgress
                            radius={23}
                            strokeWidth={4}
                            percentage={
                              task.progress
                                ? parseFloat(task.progress.toFixed(1))
                                : 0
                            }
                            status={task.status}
                          />

                        )}
                      </div>


                      {/* rectangle task without left circle */}
                      <div
                        key={task._id}
                        style={{
                          marginBottom: "20px",
                          backgroundColor: "rgb(231, 229, 229)",
                          width: "70%",
                          height: 'fit-content',
                          left: "320px",
                          background: "rgb(231, 229, 229)",
                          borderRadius: "11px",
                          paddingBottom: "0px",
                          paddingRight: '0px',
                          borderColor:
                            task.status === "in progress"
                              ? "rgb(231, 140, 57)" // Orange
                              : task.status === "completed"
                                ? "rgb(0, 128, 0)" // Green
                                : task.status === "not submitted"
                                  ? "rgb(255, 0, 0)" // Red
                                  : "rgb(0, 0, 0)", // Black
                          borderStyle: "solid",
                          borderWidth: "0px",
                          marginLeft: "20px"
                        }}
                      >
                        {/* task name and icons */}
                        <div className="titlee" style={{
                          border: `1px solid ${task.status === "in progress"
                            ? "orange"
                            : task.status === "completed"
                              ? "green"
                              : task.status === "not submitted"
                                ? "red"
                                : "transparent"
                            }`,
                          marginTop: "0px", width: "100%", height: '60px', borderWidth: "2px", marginBottom: "0px", padding: "20px 0px 0 0", background: "rgb(231,229,229)"
                        }}>
                          <div className="taskeditname" style={{ position: 'relative' }}>
                            <div className="titlewcheck" style={{ display: "flex", height: '70px' }}>
                              {/* if editting */}
                              {editMode === task._id && editTaskNamebool ? (
                                <div style={{ display: 'flex', position: 'relative', width: '100%' }}>
                                  <input
                                    type="text"
                                    value={editTaskName || task.title}
                                    onChange={(e) => seteditProjectName(e.target.value)}
                                    style={{ backgroundColor: 'rgb(231, 229, 229)', width: 'fit-content', marginLeft: '20px', fontSize: '20px', fontWeight: 'bold' }}
                                  />
                                  {/* dropdown arrow */}
                                  <div style={{ color: 'black', fontSize: '30px', cursor: 'pointer', position: 'absolute', right: '20px', top: '20px' }}>
                                    {!showtask[task._id] ?
                                      <RiArrowDropDownLine
                                        onClick={() => {
                                          toggleSubtasks(task._id);
                                          setshowtask(prevState => ({ ...prevState, [task._id]: task._id }));
                                          // setShowtaskdetails(true);
                                        }}
                                      />
                                      :
                                      <RiArrowUpSLine
                                        onClick={() => {
                                          toggleSubtasks(task._id);
                                          setshowtask(prevState => ({ ...prevState, [task._id]: '' }))
                                          // setShowtaskdetails(false);
                                        }}
                                        className=""
                                        style={{ fontSize: '20px' }}
                                      />
                                    }
                                  </div>
                                  {/* end of dropdown arrow  */}
                                </div>

                              ) : (
                                // TITLE AND STATUS
                                <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between', float: "left" }}>
                                  {task.title && (
                                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '750px' }}>
                                      {/* TITLE */}
                                      <h2 style={{ color: "rgb(14,13,56)", marginTop: "10px", margin: "5px 0", paddingLeft: '20px', fontSize: " 20px" }}>{task.title}</h2>

                                      <FaPen onClick={() => {
                                        setEditMode(task._id)
                                        seteditProjectNamebool(true)
                                      }}
                                        style={{ color: "rgb(14,13,56)", float: "left", cursor: "pointer", marginLeft: '15px' }}
                                      />

                                      {/* STATUS */}
                                      <div style={{ position: 'absolute', right: '30px', marginTop: '10px' }}>
                                        {task.status === 'in progress' && (
                                          <p style={{ color: 'orange' }}>In Progress</p>
                                        )}
                                        {task.status === 'completed' && (
                                          <p style={{ color: 'green' }}>Completed</p>
                                        )}
                                        {task.status === 'not submitted' && (
                                          <p style={{ color: 'red' }}>Not submitted</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {(task.status === "in progress") ? (
                                    <div style={{ display: 'flex', marginTop: '20px' }}>


                                      <FaTrash
                                        onClick={() => {
                                          setShowPopupDelete(task._id)
                                          // deletetask(task._id);
                                          setShowDeletePopup(true);
                                        }}
                                        style={{ cursor: "pointer", float: "right", color: "black", marginTop: '10px' }}
                                      />

                                      {/* dropdown arrow */}
                                      <div style={{ color: 'black', fontSize: '30px', cursor: 'pointer', marginLeft: '10px' }}>
                                        {!showtask[task._id] ?
                                          <RiArrowDropDownLine
                                            onClick={() => {
                                              toggleSubtasks(task._id);
                                              setshowtask(prevState => ({ ...prevState, [task._id]: task._id }));
                                              // setShowtaskdetails(true);
                                            }}
                                          />
                                          :
                                          <RiArrowUpSLine
                                            onClick={() => {
                                              toggleSubtasks(task._id);
                                              setshowtask(prevState => ({ ...prevState, [task._id]: '' }))
                                              // setShowtaskdetails(false);
                                            }}
                                            className=""
                                            style={{ fontSize: '20px' }}
                                          />
                                        }
                                      </div>
                                      {/* end of dropdown arrow  */}
                                    </div>

                                  ) : (<div style={{ color: 'black', fontSize: '30px', cursor: 'pointer', marginTop: '10px' }}>
                                    <FaTrash
                                      onClick={() => {
                                        setShowPopupDelete(task._id)
                                        // deletetask(task._id);
                                        setShowDeletePopup(true);
                                      }}
                                      style={{ cursor: "pointer", color: "black", float: 'left', marginTop: '10px', marginRight: '15px', width: '15px', height: '15px' }}
                                    />
                                    {!showtask[task._id] ?

                                      <RiArrowDropDownLine
                                        onClick={() => {
                                          toggleSubtasks(task._id);
                                          setshowtask(prevState => ({ ...prevState, [task._id]: task._id }));
                                          // setShowtaskdetails(true);
                                        }}
                                      />
                                      :
                                      <RiArrowUpSLine
                                        onClick={() => {
                                          toggleSubtasks(task._id);
                                          setshowtask(prevState => ({ ...prevState, [task._id]: '' }))
                                          // setShowtaskdetails(false);
                                        }}
                                        className=""
                                        style={{ fontSize: '20px' }}
                                      />
                                    }

                                  </div>)}
                                </div>
                              )}

                            </div>

                          </div>
                        </div>
                        {/* end of task name and icons */}

                        {/* description */}
                        {showtask[task._id] && <div>
                          <div className="edit-section" style={{ marginTop: '20px' }}>
                            {editMode === task._id && editdescriptionbool ? (
                              <div style={{ display: 'flex' }}>
                                <p>Description: </p>
                                <input
                                  type="text"
                                  placeholder={task.description}
                                  onChange={(e) => seteditDescription(e.target.value)}
                                  style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '180px', margin: '0 0 0 10px', fontSize: '10px', padding: '0 10px' }}
                                />
                              </div>
                            ) : <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
                              {task.description && (
                                <p>Description: {task.description}</p>
                              )}
                              {(task.status === "in progress") ? (
                                <FaPen onClick={() => {
                                  setEditMode(task._id)
                                  seteditDescriptionbool(true)
                                }}
                                  style={{ color: "black", fontSize: "14px" }}
                                />
                              ) : null}
                            </div>
                            }
                          </div>

                          {task.dueDate && assignMode !== task._id&& <hr style={{ width: '90%' }} />}

                          {/* due date */}
                          {task.dueDate && <div className="edit-section" style={{fontSize: '12px'}}>
                            {!assignMode &&
                              (editMode === task._id && editdueDatebool
                                ? task.dueDate && (
                                  <div style={{ display: 'flex' }}>
                                    <p>Due Date: </p>
                                    <input
                                      type="date"
                                      value={editdueDate}
                                      onChange={(event) =>
                                        handleEditDueDateChange(
                                          event,
                                          task.date,
                                          task.pretask
                                        )}
                                      style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '200px', fontSize: '10px', padding: '5px 10px', margin: '0 0 0 10px ', color: 'black' }}
                                    />
                                  </div>
                                )
                                : <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
                                  {task.dueDate && (
                                    <p style={{ color: "black", paddingLeft: "15px", margin: "5px", fontSize: "12px" }}>
                                      Due Date:{" "}
                                      {moment
                                        .tz(task.dueDate, timeZone)
                                        .format("MMMM D, YYYY h:mm A")}
                                    </p>
                                  )}
                                  {(task.status === "in progress") ? (
                                    <FaPen onClick={() => {
                                      setEditMode(task._id)
                                      seteditDueDatebool(true)
                                    }}
                                      style={{ color: "black", fontSize: "14px" }}
                                    />
                                  ) : null}
                                </div>)}
                          </div>}


                          {task.priority && <hr style={{ width: '90%' }} />}

                          {/* priority */}
                          <div className="edit-section">
                            {editMode === task._id && editprioritybool
                              ? task.priority && (
                                <div style={{ display: 'flex' }}>
                                  <p>Priority: </p>
                                  <select
                                    value={editpriority || task.priority}
                                    onChange={(e) => seteditPriority(e.target.value)}
                                    style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '200px', fontSize: '10px', padding: '0px 10px', margin: '0 0 0 10px ' }}
                                  >
                                    <option value="">Select Priority</option>
                                    <option value="high">High</option>
                                    <option value="low">Low</option>
                                  </select>
                                </div>
                              )
                              : task.priority &&
                              <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>
                                {task.priority && <p>Priority: {task.priority}</p>}
                                {(task.status === "in progress") ? (
                                  <FaPen onClick={() => {
                                    setEditMode(task._id)
                                    seteditPrioritybool(true)
                                  }}
                                    style={{ color: 'black' }} />
                                ) : null}</div>}
                          </div>

                          {task.phase && <hr style={{ width: '90%' }} />}

                          {/* Phase */}
                          <div className="edit-section">
                            {editMode === task._id && editphasebool
                              ? task.phase && (
                                <div style={{ display: 'flex' }}>
                                  <p>Phase: </p>
                                  <select
                                    value={editphase || task.phase}
                                    onChange={(e) => seteditPhase(e.target.value)}
                                    style={{ backgroundColor: 'rgb(231, 229, 229)', border: '1px solid lightgrey', width: '200px', fontSize: '10px', padding: '0px 10px', margin: '0 0 0 10px ' }}
                                  >
                                    <option value="">Select Phase</option>
                                    <option value="planing">Planning</option>
                                    <option value="design">Design</option>
                                    <option value="development">Development</option>
                                    <option value="launch">Launch</option>
                                  </select>
                                </div>
                              )
                              :
                              <div style={{ display: "flex", alignItems: 'center', justifyContent: 'space-between' }}>{task.phase &&
                                <p>Phase: {task.phase}</p>}
                                {(task.status === "in progress") ? (
                                  <FaPen onClick={() => {
                                    setEditMode(task._id)
                                    seteditPhasebool(true)
                                  }}
                                    style={{ color: "black", fontSize: "14px" }}
                                  />
                                ) : null}</div>}
                          </div>

                          {/* <div className="edit-section">
                              {task.status && <p style={{ color: "black", paddingLeft: "15px", margin: "5px", fontSize: "14px" }}>Status: {task.status}</p>}
                            </div> */}

                          {task.assignedMember && task.assignedMember.member && <hr style={{ width: '90%' }} />}

                          <div className="edit-section">
                            {assignMode === task._id ? (
                              <div style={{ display: 'flex' }}>

                                <p style={{ color: "black", margin: "5px", fontSize: "12px" }}>
                                  Assigned to:{" "}
                                  {task.assignedMember?.member.email.address}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: '0' }}>
                                  <input
                                    type="text"
                                    value={
                                      filterassign ||
                                      task.assignedMember?.member.email.address
                                    }
                                    onKeyUp={handleAssignMember}
                                    onChange={(e) => {
                                      setfilterassign(e.target.value);
                                      // setchangeassignmember(e.target.value)
                                    }}
                                    style={{ width: '200px', backgroundColor: 'rgb(231, 229, 229)', border: '1px solid grey', padding: '5px 10px', marginBottom: '10px', fontSize: '12px' }}
                                    placeholder="Enter assigned member email"
                                    />
                                  {filtersuggestions.length > 0 && (
                                    <div className="suggestionstask2">
                                      {filtersuggestions.map((member, index) => (
                                        <div
                                        className="eachsuggestiontask2"
                                        key={index}
                                        onClick={() => handleFilteredMember(member)}
                                        >

                                          {member} <hr />
                                        </div>

))}
                                    </div>

)}
                                  <input
                                    type="date"
                                    value={moment(
                                      changeassigndate || task.dueDate
                                    ).format("YYYY-MM-DD")}
                                    min={moment(task.date).add(1, 'days').isAfter(moment().add(1, 'days')) 
                                    ? moment(task.date).add(1, 'days').format('YYYY-MM-DD') 
                                    : moment().add(1, 'days').format('YYYY-MM-DD')}                                    onChange={handleDateChange}
                                    style={{ backgroundColor: 'transparent',fontSize: "12px", width: '200px', color: 'black', border: '1px solid grey', padding: '7px 10px' }}
                                    />

                                </div>
                                <div style={{ position: 'absolute', right: '0px', marginTop: '10px' }}>
                                    {task.status !== "completed" ? (
                                          <FaUserPlus
                                            onClick={() => toggleAssignMode(task._id)}
                                            style={{ cursor: "pointer", float: "right", color: "black", marginBottom: '10px' }}
                                          />
                                        ) : null}
                                </div>
                              </div>
                            ) : (
                              task.assignedMember && task.assignedMember.member && (
                                <div style={{ display: 'flex' }}>
                                  <p style={{ color: "black", paddingLeft: "15px", margin: "5px", fontSize: "12px" }}>
                                    Assigned to:{" "}
                                    {task.assignedMember.member.email.address}
                                  </p>
                                  <div style={{ position: 'absolute', right: '0px', marginTop: '10px' }}>

                                    {task.status !== "completed" ? (
                                      <FaUserPlus
                                        onClick={() => toggleAssignMode(task._id)}
                                        style={{ cursor: "pointer", float: "right", color: "black", marginBottom: '10px' }}
                                      />
                                    ) : null}
                                    {task.status === "completed" ? (
                                      <FaRegTimesCircle
                                        onClick={() => handleUnsubmit(task._id)}
                                        style={{ cursor: "pointer", float: "right", marginRight: "20px", color: "black" }}
                                      />
                                    ) : null}
                                  </div>
                                </div>
                              )
                            )}
{assignMode === task._id && (
                          <button
                            onClick={() => {
                              assigntask(
                                task._id,
                                task.assignedMember?.member.email.address,
                                task.dueDate
                              );
                              setchangeassignmember("");
                              setchangeassigndate("");
                              setfilterassign("");
                            }}
                            style={{ backgroundColor: 'grey', marginLeft: '370px', marginBottom: '10px' }}
                          >
                            assign
                          </button>
                        )}
                          </div>
                        </div>
                        }

                        {editMode === task._id && (
                          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                            <button style={{ color: "white", backgroundColor: 'purple', marginLeft: '20px' }}
                              onClick={() => {
                                editTask(task._id);
                                seteditProjectName("");
                                seteditDescription("");
                                seteditDueDate("");
                                seteditPhase("");
                                seteditPriority("");
                                seteditDescriptionbool(false);
                                seteditDueDatebool(false);
                                seteditPrioritybool(false);
                                seteditPhasebool(false);
                                seteditProjectNamebool(false);
                                setEditMode("");
                              }}
                            >

                              Save
                            </button>
                            <button style={{ color: "white", backgroundColor: 'grey', marginLeft: '20px' }}
                              onClick={() => {
                                setEditMode("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  ))}
              </div>
              {/* end of assigned tasks */}
            </div>
            {/* end of assigned and unassigned tasks */}

          </div>
        </div>
      </div>
      {showDeletePopup && (
                          <div className="popuprequests">
                            <center>
                              <h3 style={{ color: 'black' }}>Are you sure you want to delete this task?</h3>
                              <button
                              style={{backgroundColor: "red"}}
                                onClick={() => {
                                  deletetask(showPopupDelete);
                                  setShowDeletePopup(false);
                                }}
                              >
                                Delete
                              </button>
                              <button onClick={() => setShowDeletePopup(false)}>Close</button>
                            </center>
                          </div>
                        )}
      
      {showPopup && <div className='backdrop'></div>}

    </div>
  );
}

export default Task2;
