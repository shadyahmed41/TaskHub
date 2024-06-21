import NavBarBig from "./NavBarBig";
import React, { useState, useEffect } from "react";
import CircularProgress from "./Progress";
import axios from "axios";
import { FaCircle, FaTimes, FaCheck, FaArrowAltCircleRight, FaHandshake, FaArrowCircleRight, FaPlus, FaTrash, FaFile } from "react-icons/fa";
import { RiArrowDropDownLine, RiArrowUpCircleLine, RiArrowUpLine, RiArrowUpSLine } from "react-icons/ri"; // Import down arrow icon
import { useNavigate } from "react-router-dom";
import MemberHp from "./MemberHP";
import "./css/taskmember.css"
import { FaHand } from "react-icons/fa6";
import { TaskFields } from "@syncfusion/ej2-react-gantt";
import NavBarCurrent from "./NavBarCurrent";
import Header from "./Header";
import Loading from "./Loading";
import moment from "moment-timezone";

function TaskMember() {
  const navigate = useNavigate();
  const timeZone = "Etc/GMT";

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [pastTasks, setPastTasks] = useState<Task[]>([]);
  const [subtaskTitle, setSubtaskTitle] =useState<{ [key: string]: string }>({});

  const [isAddingSubtask, setIsAddingSubtask] = useState<{ [key: string]: boolean }>({});
  //   const [currentTaskId, setCurrentTaskId] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState<{ [key: string]: string }>({});
  //   const [expandedTask, setExpandedTask] = useState(null);
  // const [expandedTask, setExpandedTask] = useState<string | null>(null); // New state to track expanded task
  const [PastsortType, setPastsortType] = useState('');
  const [MysortType, setMysortType] = useState('');
  const [originalPastTasks, setoriginalPastTasks] = useState<Task[]>([]);
  const [originalMyTasks, setoriginalMyTasks] = useState<Task[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupSubmit, setShowPopupSubmit] = useState<string | null>(null);
  // const [showtaskdetails, setShowtaskdetails] = useState(false);
  // const [showpasttaskdetails, setShowpasttaskdetails] = useState(false);
  // const [showdetails, setShowdetails] = useState<{
  //   [taskId: string]: boolean;
  // }>({});
  const [showtask, setshowtask] =  useState<{ [taskId: string]: string }>({});
  const [change, setChange] = useState(false);



  const token = sessionStorage.getItem("userID");
  const projectId = sessionStorage.getItem("projectID");

  interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: string;
    phase: string;
    status: string;
    subtasks: Subtask[];
    progress?: number;
    assignedMember?: {
      member: {
        email: {
          address: string;
        };
        _id: string;
      };
      dateofAssigning: Date;
    };
  }

  interface Subtask {
    _id: string;
    title: string;
    checked: boolean;
  }

  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      fetchTasks();
    }
  }, []);

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
          subtasks: task.subtasks || [] // Ensure subtasks array exists
        }));
        setLoading(false);
        const myTasks: Task[] = [];
        const pastTasks: Task[] = [];

        const promises = tasks.map((task) => {
          return fetchTaskProgress(task._id).then((progress) => {
            task.progress = progress; // Assign progress to task object
            if (
              task.status === "not submitted" ||
              task.status === "completed"
            ) {
              pastTasks.push(task);
            } else {
              myTasks.push(task);
            }
          });
        });

        Promise.all(promises).then(() => {
          setMyTasks(myTasks);
          setPastTasks(pastTasks);
          if (MysortType) mysorting(MysortType, myTasks)
          if (PastsortType) pastsorting(PastsortType, pastTasks)
        });
        setoriginalPastTasks(pastTasks);
        setoriginalMyTasks(myTasks);

      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  };

  const fetchTaskProgress = (taskId: string) => {
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

  const submitTask = (taskId: any) => {
      axios
        .put(
          `${import.meta.env.VITE_TASK_API}/tasks/${taskId}/edit`,
          { status: "completed", projectId },

          {
            headers: {
              Authorization: `UserLoginToken ${token}`,
            },
          }
        )
        .then((response) => {
          console.log("Task submitted successfully:", response.data);
          // console.log(taskId)
          // Refresh tasks after submitting
          fetchTasks();
          setChange(!change);
        })
        .catch((error) => {
          console.log(taskId);
          console.error("Error submitting task:", error);
        });
  };

  const submitSubtask = (taskId: string, subtaskId: string) => {
    axios
      .put(
        `${import.meta.env.VITE_TASK_API}/tasks/${taskId}/subtasks/${subtaskId}`,
        { checked: true }
      )
      .then((response) => {
        console.log("Subtask submitted successfully:", response.data);
        // Update the task in the state to reflect the change
        const updatedTasks = myTasks.map((task) => {
          if (task._id === taskId) {
            const updatedSubtasks = task.subtasks.map((subtask) => {
              if (subtask._id === subtaskId) {
                return { ...subtask, checked: true };
              }
              return subtask;
            });
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
        setMyTasks(updatedTasks);
        setChange(!change);
        fetchTasks();
      })
      .catch((error) => {
        console.error("Error submitting subtask:", error);
      });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    axios
      .delete(`${import.meta.env.VITE_TASK_API}/tasks/subtasks/${taskId}/${subtaskId}`,
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }

      )

      .then((response) => {
        console.log("Subtask deleted successfully:", response.data);
        // Update state after deletion
        const updatedTasks = myTasks.map((task) => {
          if (task._id === taskId) {
            const updatedSubtasks = task.subtasks.filter((subtask) => subtask._id !== subtaskId);
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
        setMyTasks(updatedTasks);
        fetchTasks();
        setChange(!change);
      })
      .catch((error) => {
        console.error("Error deleting subtask:", error);
      });
  };


  const createSubtask = (taskId: string) => {
    axios
      .post(
        `${import.meta.env.VITE_TASK_API}/tasks/subtask/${taskId}`,
        { title: subtaskTitle[taskId] },
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Subtask created successfully:", response.data);
        fetchTasks();
        // setSubtaskTitle(prev => ({ ...prev, [taskId]: '' })); // Clear the input field after submission
        // setIsAddingSubtask(prev => ({ ...prev, [taskId]: false })); // Close the input field
        // setCurrentTaskId(prev => ({ ...prev, [taskId]: '' })); // Reset the current task ID / de 34an myft74 el field le kol el tasks
        setChange(!change);
      })
      .catch((error) => {
        console.error("Error creating subtask:", error);
      });
  };

  // const toggleSubtasks = (taskId: string) => {
  //   setExpandedTask((prevExpandedTask) =>
  //     prevExpandedTask === taskId ? null : taskId
  //   );
  // };

  const handlePastSortChange = (e: any) => {
    const sortType = e.target.value;
    setPastsortType(e.target.value);
    pastsorting(sortType, pastTasks);
  }
  const pastsorting = (sortType: any, tasks: Task[]) => {
    let sortedTasks = [...tasks];

    switch (sortType) {
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
      case "":
        // handleSelectChange(selectedMember);
        sortedTasks = originalPastTasks;
        break;
      default:
        break;
    }
    setPastTasks(sortedTasks);
  };
  const handleMySortChange = (e: any) => {
    const sortType = e.target.value;
    setMysortType(e.target.value);
    mysorting(sortType, myTasks);
  };
  const mysorting = (sortType: any, tasks: Task[]) => {
    let sortedTasks = [...tasks];

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
      case 'recieveAsc':
        sortedTasks.sort((a, b) => {
          if (a.assignedMember?.dateofAssigning && b.assignedMember?.dateofAssigning) {
            return new Date(a.assignedMember?.dateofAssigning).getTime() - new Date(b.assignedMember?.dateofAssigning).getTime();
          }
          return a.assignedMember?.dateofAssigning ? -1 : b.assignedMember?.dateofAssigning ? 1 : 0;
        });
        break;
      case 'recieveDesc':
        sortedTasks.sort((a, b) => {
          if (a.assignedMember?.dateofAssigning && b.assignedMember?.dateofAssigning) {
            return new Date(b.assignedMember?.dateofAssigning).getTime() - new Date(a.assignedMember?.dateofAssigning).getTime();
          }
          return a.assignedMember?.dateofAssigning ? -1 : b.assignedMember?.dateofAssigning ? 1 : 0;
        });
        break;
      case "":
        // handleSelectChange(selectedMember);
        sortedTasks = originalMyTasks;
        break;
      default:
        break;
    }

    setMyTasks(sortedTasks);
  };

  useEffect(() => {
    console.log(myTasks,pastTasks);
  },[myTasks, pastTasks])


 
  
    const [loading, setLoading] = useState(true);
  
  
    // if (loading) {
    //   return <Loading/>;
    // }
  
  return (
    <div className="taskmember">
      
      <NavBarBig />
      {/* current */}
      <div style={{position: 'absolute',top:'195px'}}>
          <NavBarCurrent icon={<FaFile/>} text="Tasks" click="/taskmembers"></NavBarCurrent>
         </div>
        {/* end of current */}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className='main'>
          {loading && <Loading/>}
          <MemberHp change={change}/>

          {/* MY TASKS */}

          {/* HEADER */}
          <div style={{ display: 'flex', marginBottom: 0, paddingBottom: 0}}>
            <h2 style={{color: 'purple'}}>My Tasks</h2>
            <select value={MysortType} onChange={handleMySortChange}
              style={{ position: 'absolute', right: '50px', marginTop: '25px', padding: '8px', backgroundColor: 'rgb(231, 229, 229)', color: 'black', borderRadius: '10px', fontSize: '10px', width: '150px' }}>
              <option value="">Sort By</option>
              <optgroup label="Priority">
                <option value="priorityAsc">Priority (Ascending)</option>
                <option value="priorityDesc">Priority (Descending)</option>
              </optgroup>
              <optgroup label="Due Date">
                <option value="dueDateAsc">Due Date (Ascending)</option>
                <option value="dueDateDesc">Due Date (Descending)</option>
              </optgroup>
              <optgroup label="Phase">
                <option value="phaseAsc">Phase (Ascending)</option>
                <option value="phaseDesc">Phase (Descending)</option>
              </optgroup>
              <optgroup label="Recieve">
                <option value="recieveAsc">Recieve (Ascending)</option>
                <option value="recieveDesc">Recieve (Descending)</option>
              </optgroup>
            </select>
          </div>

          {/* TASKS */}
          <div className='alltasks' style={{ marginTop: '0', paddingTop: '0'}}>
            {myTasks.map((task, index) => (
              <div>
                {/* main task */}
                <div style={{marginTop: '30px', marginBottom:'50px'}}>
                  {/* task title */}
                  <div style={{ display: 'flex', alignItems: 'center', height: '50px', margin: '0', paddingBottom: 0 }}>
                    <div
                      onClick={() => {
                        setShowPopup(true);
                        setShowPopupSubmit(task._id);
                        console.log(showPopup);
                      }}
                      title="submit task"
                    >
                      <FaArrowCircleRight className="submittask" />
                    </div>


                    <div className='OneTask' key={index} style={{border: '2px solid grey', zIndex: '1'}}>
                      <p>{task.title}</p>

                      <div>
                        {!showtask[task._id] ?
                      <RiArrowDropDownLine
                        onClick={() => {
                          // toggleSubtasks(task._id);
                          setshowtask(prevState => ({...prevState, [task._id]: task._id}));
                          // setShowtaskdetails(true);
                        }}
                        className="arrowdown"
                        /> 
                        :
                        <RiArrowUpSLine
                        onClick={() => {
                          // toggleSubtasks(task._id);
                          setshowtask(prevState => ({...prevState, [task._id]: ''}))
                        // setShowtaskdetails(false);
                      }}
                      className="arrowdown"
                      style={{fontSize: '20px'}}
                      />
                    }
                      </div>



                    </div>
                  </div>

                  {/* task details */}
                  {showtask[task._id] && (
                    
                    <div className="taskdetails" style={{zIndex: '0'}}>
                      <div style={{ display: 'flex', margin: '0' }}>
                        <p style={{ width: '100px' }}>Description:</p>
                        <p>{task.description}</p>
                      </div>

                      <hr />

                      <div style={{ display: 'flex', margin: '0' }}>
                        <p style={{ width: '100px' }}>Priority:</p>
                        <p>{task.priority}</p>
                      </div>

                      <hr />

                      <div style={{ display: 'flex', margin: '0' }}>
                        <p style={{ width: '100px' }}>Phase:</p>
                        <p>{task.phase}</p>
                      </div>

                      <hr />

                      <div style={{ display: 'flex', margin: '0' }}>
                        <p style={{ width: '100px' }}>dueDate:</p>
                        {/* <p>{task.dueDate.split('T')[0]}</p> */}
                        <p>
                          {moment
                          .tz(task.dueDate, timeZone)
                          .format("h:mm A, MMMM D YYYY ")}
                          </p>
                      </div>

                      <hr />
                      {/* {expandedTask === task._id && ( */}
                        <div style={{display: 'flex', marginBottom: 0}}>
                          <div style={{display: 'flex', marginBottom: 0}}>
                            <div style={{display: 'flex', margin: '0'}}>
                          <p>Subtasks:</p>
                          {!isAddingSubtask[task._id] ? (<FaPlus
                          className="addsubtask"
                            onClick={() => {
                              setIsAddingSubtask(prev => ({ ...prev, [task._id]: true }));
                              setCurrentTaskId(prev => ({ ...prev, [task._id]: task._id }));
                            }}
                          />) : 
                          <FaTimes className="addsubtask"
                          onClick={() => {
                            setIsAddingSubtask(prev => ({ ...prev, [task._id]: false })); // Close the input field
                            setCurrentTaskId(prev => ({ ...prev, [task._id]: '' })); // Reset the current task ID / de 34an myft74 el field le kol el tasks
                          }}
                          />}
                          </div>
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                          {task.subtasks.map((subtask, subIndex) => (
                            
                            <div key={subIndex} style={{display: 'flex', marginLeft: '20px', marginBottom: '0'}}>
                              <FaCircle
                                color={subtask.checked ? "green" : "grey"}
                                onClick={() => submitSubtask(task._id, subtask._id)}
                                style={{margin: '15px 15px 0 0', cursor: 'pointer', fontSize: '20px'}}
                              />
                              <p>{subtask.title}</p>
                              <br />
                              <FaTrash onClick={() => deleteSubtask(task._id, subtask._id)} 
                              style={{color: 'grey', margin: '15px 0 0 15px', cursor: 'pointer'}}/>
                              <br />
                            </div>
                          ))}
                          </div>

                          {isAddingSubtask[task._id] &&
                            currentTaskId[task._id] === task._id && (
                              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: '20px'}}>
                                <input
                                  type='text'
                                  value={subtaskTitle[task._id] || ''}
                                  onChange={(e) => setSubtaskTitle({
                                    ...subtaskTitle,
                                    [task._id]: e.target.value
                                  })}
                                  style={{backgroundColor: 'transparent', minWidth: '200px', width: 'fit-content', color: 'black'}}
                                />
                                <button onClick={() => {createSubtask(task._id); setSubtaskTitle(prev => ({ ...prev, [task._id]: '' }));}}
                                style={{fontSize: '12px', backgroundColor: 'lightgrey', color: 'black', marginTop: '10px', width: 'fit-content'}}
                                >
                                  Create Subtask
                                </button>
                              </div>
                            )}
                            </div>
                        </div>
                      {/* )} */}
                    </div>
                  )}
                </div>

                {/* SUBMIT TASK */}

                {showPopup && (
                  <div className="popuprequests">
                    <center>
                      <h3 style={{ color: 'black' }}>Submit this task?</h3>
                      <button
                        onClick={() => {
                          submitTask(showPopupSubmit)
                          setShowPopup(false);
                        }}
                      >
                        Submit
                      </button>
                      <button onClick={() => setShowPopup(false)}>Close</button>
                    </center>
                  </div>
                )}



              </div>
            ))}
          </div>


          <hr />

          {/* PAST TASKS */}

          {/* HEADER */}
          <div style={{ display: 'flex' }}>
            <h2 style={{color: 'purple'}}>Past Tasks</h2>
            <div style={{ position: 'absolute', right: '50px ', marginTop: '25px' }}>
              <select value={PastsortType} onChange={handlePastSortChange} style={{padding: '8px', backgroundColor: 'rgb(231,229,229)', color: 'black', borderRadius: '10px', fontSize: '10px', width: '150px'}}>
                <option value="">Sort By</option>
                <optgroup label="Status">
                  <option value="statusAsc">Status (Ascending)</option>
                  <option value="statusDesc">Status (Descending)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* TASKS */}
          <div className="alltasks" style={{ marginTop: '0', paddingTop: '0'}}>
            {pastTasks.map((task, index) => (
              <div style={{marginBottom :'30px'}}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0px' }}>
                {/* check or x */}
                  <div
                    style={{
                      backgroundColor: task.status === "not submitted" ? "red" : "green",
                      borderRadius: "50%",
                      width: "50px",
                      height: "45px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: "20px",
                    }}
                  >
                    {task.status === "not submitted" ? (
                      <FaTimes style={{ color: "white" }} />
                    ) : (
                      <FaCheck style={{ color: "white" }} />
                    )}
                  </div>
                  {/* task content */}
                  <div className='OneTask' key={index} style={{marginBottom: 0, border: '2px solid grey'}}>
                    <p>{task.title}</p>
                    <RiArrowDropDownLine // Down arrow icon
                      onClick={() => {
                        // toggleSubtasks(task._id);
                        if (showtask[task._id]) {
                          setshowtask(prevState => ({...prevState, [task._id]: ''}));
                        } else {
                          setshowtask(prevState => ({...prevState, [task._id]: task._id}));
                        }
                        // setShowpasttaskdetails(true);
                      }}
                      className="arrowdown"
                    />
                    {/* Render subtasks if the task is expanded */}

                  </div>
                </div>

                {showtask[task._id] &&  (
                  <div className="taskdetails" style={{marginTop: 0, marginBottom: 0}}>
                    <div style={{ display: 'flex', margin: 0 }}>
                      <p style={{ width: '100px' }}>Description:</p>
                      <p>{task.description}</p>
                    </div>

                    <hr />

                    <div style={{ display: 'flex', margin: 0 }}>
                      <p style={{ width: '100px' }}>Priority:</p>
                      <p>{task.priority}</p>
                    </div>

                    <hr />

                    <div style={{ display: 'flex', margin: 0 }}>
                      <p style={{ width: '100px' }}>Phase:</p>
                      <p>{task.phase}</p>
                    </div>

                    <hr/>


                    {/* {expandedTask === task._id && (
                      <div style={{display: 'flex'}}>
                        <p>Subtasks:</p>
                        {task.subtasks.map((subtask, subIndex) => (
                          <div key={subIndex} style={{ display: 'flex'}}>
                            <FaCircle
                              color={subtask.checked ? "green" : "grey"}
                              onClick={() => submitSubtask(task._id, subtask._id)}
                            />
                           
                            <p>{subtask.title}</p>
                          </div>
                        ))}
                      </div>
                    )} */}
                    <div>
                          <div style={{display: 'flex', marginBottom: 0}}>
                          <p>Subtasks:</p>
                          
                          <div style={{display: 'flex', flexDirection: 'column', marginBottom: 0}}>
                          {task.subtasks.map((subtask, subIndex) => (
                            <div key={subIndex} style={{display: 'flex', marginLeft: '20px', marginBottom: 0 }}>
                              <FaCircle
                                color={subtask.checked ? "green" : "grey"}
                                // onClick={() => submitSubtask(task._id, subtask._id)}
                                style={{margin: '15px 15px 0 0', cursor: 'pointer', fontSize: '20px'}}
                              />
                              <p>{subtask.title}</p>
                              <br />
                              
                              <br />
                            </div>
                          ))}
                            </div>
                          </div>
                        </div>
                  </div>
                )}

              </div>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}
export default TaskMember;
