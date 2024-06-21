// import Pink3 from "./pics/pink2.png";
import blue from "./pics/blue.jpg";
import yellow from "./pics/yellow.jpg";
import CircularProgress from "./Progress";
import "./css/homepage.css";
import Navbar from "./Navbar";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import NavBarCurrent from "./NavBarCurrent";
import { FaHome } from "react-icons/fa";
import { MdHeight } from "react-icons/md";

interface Project {
  _id: string;
}

interface LeaderProject extends Project {
  title: string;
  progress: number | null;
  status: string;
}

interface MemberProject extends Project {
  title: string;
  progress: number | null;
  status: string;
}

const fieldEnum = [
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

function HomePage() {
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("Project Name");
  const [description, setDescription] = useState("");
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [leaderProjects, setLeaderProjects] = useState<LeaderProject[]>([]);
  const [memberProjects, setMemberProjects] = useState<MemberProject[]>([]);
  const token = sessionStorage.getItem("userID");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [selectedField, setSelectedField] = useState("Others");

  // Handler to update the state on change
  const handleChange = (event: any) => {
    setSelectedField(event.target.value);
  };

  function getCurrentUser(token: string) {
    return axios
      .get(`${import.meta.env.VITE_USER_API}/user/id`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        return response.data.userId;
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
        return null;
      });
  }

  const joinProjectByCode = () => {
    const joiningCode = projectName; // Assuming projectName contains the joining code
    axios
      .post(`${import.meta.env.VITE_PROJECT_API}/joinProjectByCode`, {
        joiningCode,
        // userId: currentUser,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        console.log("Join project response:", response.data);
        toast.success("Project joined successfully!");
        setShowJoinPopup(false); // Close the popup after joining project
        fetchProjectsForMember(); // Fetch projects again to update UI
      })
      .catch((error) => {
        console.error("Error joining project:", error);
        toast.error(`Error joining project ${error.response.data.message}`);

      });
  };

  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      fetchProjectsForLeader();
      fetchProjectsForMember();
    }
  }, [token]);

  const fetchProjectsForMember = () => {
    axios
      .get(`${import.meta.env.VITE_PROJECT_API}/projects/member`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        console.log("Projects for member:", response.data.data.projects);
        setMemberProjects(response.data.data.projects);
        // Fetch progress for each member project
        response.data.data.projects.forEach((project: { _id: string }) => {
          fetchProjectProgress(project._id).then((progress) => {
            setMemberProjects((prevProjects) =>
              prevProjects.map((prevProject) =>
                prevProject._id === project._id
                  ? { ...prevProject, progress }
                  : prevProject
              )
            );
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching projects for member:", error);
      });
  };

  const toggleJoinPopup = () => {
    setShowJoinPopup(!showJoinPopup);
  };

  const clearInput = () => {
    if (projectName === "Project Name") setProjectName("");
  };

  const toggleCreatePopup = () => {
    setShowCreatePopup(!showCreatePopup);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(event.target.value);
  };

  const handleInputChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const createProject = () => {
    axios
      .post(
        `${import.meta.env.VITE_PROJECT_API}/createprojects`,
        { title: projectName, description: description, field: selectedField },
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Project created successfully:", response.data);
        toast.success("Project created successfully!");
        setShowCreatePopup(false); // Close the popup after project creation
        // Handle success response here
        fetchProjectsForLeader();
      })
      .catch((error) => {
        console.error("Error creating project:", error);
        toast.error("Error creating project");
        // Handle error response here
      });
  };

  const fetchProjectsForLeader = () => {
    axios
      .get(`${import.meta.env.VITE_PROJECT_API}/projects`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        console.log("Projects for leader:", response.data.data);
        setLeaderProjects(response.data.data.projects);
        // Fetch progress for each leader project
        response.data.data.projects.forEach((project: { _id: string }) => {
          fetchProjectProgress(project._id).then((progress) => {
            setLeaderProjects((prevProjects) =>
              prevProjects.map((prevProject) =>
                prevProject._id === project._id
                  ? { ...prevProject, progress }
                  : prevProject
              )
            );
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching projects for leader:", error);
      });
  };

  const fetchProjectProgress = (projectId: string) => {
    return axios
      .get(`${import.meta.env.VITE_PROJECT_API}/projectprogress/${projectId}`)
      .then((response) => response.data.progress)
      .catch((error) => {
        console.error("Error fetching project progress:", error);
        return null;
      });
  };
  const colors = [ 'rgb(90, 13, 157)', 'purple', 'rgb(232, 191, 232)']; // Shades of purple


  return (
    <div className="homepage" style={{ width: "100vw", height: "fit-content" }}>
      <Navbar />
       {/* current */}
       <div style={{position: 'absolute',top:'100px'}}>
          <NavBarCurrent icon={<FaHome />} text="Home"></NavBarCurrent>
         </div>
        {/* end of current */}

      <div className='main'>
        <ToastContainer />
        <div style={{ display: "flex", justifyContent: "center" }}></div>
        <div style={{ marginRight: "30px" }}>

          {/* join project button */}
          <button className='pjbutton' onClick={toggleJoinPopup}>
            {" "}
            + Join Project
          </button>

          {/* join project Popup */}
          {showJoinPopup && (
            <div className='popup2'>   
            <center>             
              <h3>Join Project</h3>
              </center>
              <hr/><br/>
              <div className='namee'>
                <h2>Project Code:</h2>
                <input
                  type='text'
                  style={{color: 'black'}}
                  name='projectcode'
                  // placeholder={projectName}
                  placeholder="code"
                  onChange={handleInputChange}
                  onFocus={clearInput}
                  onBlur={() => {
                    if (!projectName.trim()) {
                      setProjectName("Project Name");
                    }
                  }}
                />
              </div>
            <center>
              <div>
              <button className="joinbtn" onClick={joinProjectByCode}>Join</button>
                <button className="cancelbtn" onClick={() => {setShowJoinPopup(false);}}>Cancel</button>
                
              </div>
            </center>
            </div>
          )}

          {/* Create project button */}
          <div>
            <button className='pjbutton' onClick={toggleCreatePopup}>
              {" "}
              + Create Project
            </button>
          </div>

          {/* Create Project Popup */}
          {showCreatePopup && (
            <div>
            <div className='popup'>
              <center><h3>Create Project</h3></center>
              <hr /><br/>
              <div className='namee'>
                <h2>Project Name:</h2>
                <input
                  type='text'
                  style={{color: 'black'}}
                  name='projectName'
                  placeholder='Project Name'
                  onChange={handleInputChange}
                  onFocus={clearInput}
                  onBlur={() => {
                    if (!projectName.trim()) {
                      setProjectName("");
                    }

                  }}
                />
              </div>
              <div className='namee'>
                <h2>Description:</h2>
                <input
                  type='text'
                  name='description'
                  placeholder='Description'
                  onChange={handleInputChange2}
                  onFocus={clearInput}
                  onBlur={() => {
                    if (!description.trim()) {
                      setDescription("Description");
                    }
                  }}
                />
              </div>
              <div className='namee'>
                <h2>Field:</h2>
                <select style={{backgroundColor:"white",color:"black", padding: '10px', border: "none", paddingBottom: "3px"}} value={selectedField} onChange={handleChange}>
                {fieldEnum.map((field, index) => (
                  <option key={index} value={field}>
                    {field}
                  </option>
                ))}
                </select>
              </div>
              <div style={{ display: 'flex', marginLeft: '30%'}}>
                <button onClick={createProject} className="joinbtn">Create</button>
              <button
                className="cancelbtn"
                onClick={() => {
                  setShowCreatePopup(false);
                }}
              >
                Cancel
              </button>
            </div>
            </div>
            </div>
          )}
        </div>
        <div style={{ width: "100%", height: "fit-content" }}>
          {/* Leader projects */}
          <div
            className='card-container'
           
          >
            {leaderProjects.map((project, index) => (
              <div
                onClick={() => {
                  navigate("/dashboard")
                  sessionStorage.setItem("projectID", project._id);
                }}
                className='card'
                key={index}
              >
                <div
                style={{ height: '65%' ,backgroundColor: colors[index % colors.length], width: '100%', justifyContent: 'center', alignItems:   'center'}}
                >
                  {/* <center> */}
                  <div className='progress1'>
                    <center>
                    <CircularProgress
                    radius={40}
                    strokeWidth={7}
                    percentage={
                      project.progress !== null && project.progress !== undefined
                        ? parseFloat(project.progress.toFixed(1)) : 0
                    }
                    status={project.status}                                       // Adjust the color based on progress status if needed
                  />
                  </center>
                  </div>
                  {/* </center> */}
                </div>
                <div className='card-content'>
                  <div>
                  <center>
                    <h3>{project.title}</h3>
                    <p>Leader</p>
                    </center>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>

          {/* Member projects */}
          <div className='card-container2'>
            {memberProjects.map((project, index) => (
              <div className='card2' key={index}
                onClick={() => {
                  navigate("/dashboard")
                  sessionStorage.setItem("projectID", project._id);
                }}
                style={{cursor:'pointer'}}>
                <div className="img" style={{backgroundColor:  colors[index % colors.length]}}>
                <div className='progress'> 
                  <CircularProgress
                    radius={25}
                    strokeWidth={7}
                    percentage={
                      project.progress !== null && project.progress !== undefined
                        ? parseFloat(project.progress.toFixed(1)) : 0
                    }
                    status={project.status}
                  />
                  </div>
                </div>
                  <center>
                <div className='card-content2'>
                  <div className='project-info'>
                    <h3>{project.title}</h3>
                    <p>Member</p>
                  </div>
                  
                </div>
                  </center>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showCreatePopup && <div className='backdrop'></div>}
      {showJoinPopup && <div className='backdrop'></div>}
    </div>
  );
}

export default HomePage;
