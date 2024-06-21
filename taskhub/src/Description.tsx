import React, { useState, useEffect } from "react";
import "./css/Description.css";
import NavBarBig from "./NavBarBig";
import Purple from "./pics/pp.png";
import { InputText } from "primereact/inputtext";
import { FaEye, FaEyeSlash, FaHome, FaPen } from "react-icons/fa";
import axios from "axios";
import { To, useNavigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import Loading from "./Loading";
import NavBarCurrent from "./NavBarCurrent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Description() {
  const navigate = useNavigate();
  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };

  interface ProjectDetails {
    title: string;
    description: string;
    startDate: Date;
  }

  const [editingDescription, setEditingDescription] = useState(false);
  const [editingPname, setEditingPname] = useState(false);

  const [newDescription, setNewDescription] = useState("");
  const [newPname, setNewPname] = useState("");

  const [description, setDescription] = useState("");
  const [Pname, setPname] = useState("");

  const [content, setContent] = useState("Description.");
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [startDate, setStartDate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [newLeader, setnewLeader] = useState(String);

  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);
  const [isPnameChanged, setIsPnameChanged] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [DeleteDialogVisible, setDeleteDialogVisible] = useState(false);


  const [promoteleadervisible, setpromoteleadervisible] = useState(false);
  const [leaveprojectleaderdia, setleaveprojectleaderdia] = useState(false);
  const [leaveprojectmemberdia, setleaveprojectmemberdia] = useState(false);
  
  const [details, setDetails] = useState<ProjectDetails>();
  // const [showPen, setShowPen] = useState(true); // State variable to control pen visibility

  const [oldpassword, setOldPassword] = useState("");

  const [showPopup, setShowPopup] = useState(true);

  const projectId = sessionStorage.getItem("projectID");

  const token = sessionStorage.getItem("userID");

  const [suggestions, setSuggestions] = useState([]);

  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  // const togglePopup = () => {
  //   setShowPopup(!showPopup);
  // };
  useEffect(() => {
    // Check if token exists in session storage
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      axios
        .get(
          `${
            import.meta.env.VITE_PROJECT_API
          }/project/${projectId}/leader-and-user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `UserLoginToken ${token}`,
            },
          }
        )
        .then((response) => {
          const { leaderId, userId, userEmail } = response.data;
          setProjectLeader(leaderId);
          setCurrentUser(userId);
          getProjectDetails(projectId)
            .then((results) => {
              const project = results;
              // console.log('Project details:', project);
              setStartDate(project.startDate);
              setPname(project.title);
              setNewPname(project.title);
              setDescription(project.description);
              setNewDescription(project.description);
              setDetails(project);
              console.log(Pname); // Set the details state with the retrieved project
              console.log(project);
              setLoading(false); // Set loading to false after fetching data
            })
            .catch((error) => {
              console.error("Error fetching project details:", error);
            });
        })
        .catch((error) => {
          console.error(
            "Error fetching project leader and current user:",
            error
          );
        });
    }
  }, [projectId, token, navigate]);

  function getProjectDetails(projectId: any) {
    return axios
      .get(
        `${import.meta.env.VITE_PROJECT_API}/get-project-details/${projectId}`,
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        const responseData = response.data;
        if (responseData.success) {
          const project = responseData.project;
          // console.log('Project details:', project);

          return project;
        } else {
          console.error("Error:", responseData.message);
          return null;
        }
      })
      .catch((error) => {
        console.error("Error fetching project details:", error);
        return null;
      });
  }

  // function getProjectLeader(projectId: any) {
  //   return axios
  //     .get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader`)
  //     .then((response) => {
  //       return response.data.leaderId;
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching project leader:", error);
  //       return null;
  //     });
  // }

  // function getCurrentUser(token: any) {
  //   return axios
  //     .get(`${import.meta.env.VITE_USER_API}/user/id`, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `UserLoginToken ${token}`,
  //       },
  //     })
  //     .then((response) => {
  //       return response.data.userId;
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching current user:", error);
  //       return null;
  //     });
  // }
  const handleEditClick = (field: string) => {
    switch (field) {
      case "description":
        setEditingDescription(true);
        setShowCancelButton(true);
        setShowSaveButton(true);
        setIsDescriptionChanged(true);
        break;
      case "Pname":
        setEditingPname(true);
        setShowCancelButton(true);
        setShowSaveButton(true);
        setIsPnameChanged(true);
        break;
      default:
        break;
    }
  };

  // const handleEditClick2 = (field: string) => {
  //   switch (field) {
  //     case "Pname":
  //       setEditingPname(true);
  //       setShowCancelButton(true);
  //       setShowSaveButton(true);
  //       setIsPnameChanged(true);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  const handleSaveChanges = async () => {
    setConfirmDialogVisible(true);
    setShowPopup(!showPopup);
  };

  const handleDelete = async () => {
    setDeleteDialogVisible(true);
    setShowPopup(!showPopup);
  };

  const handlepromote = async() =>{
    setpromoteleadervisible(true)
    setShowPopup(!showPopup)
  }

  const handleleaveleader = async() =>{
    setleaveprojectleaderdia(true)
    setShowPopup(!showPopup)
  }

  const handleLeaveProjectLeader = async () => {
    const newleaderdata = {
      projectId: projectId,
      newLeaderEmail: newLeader,
    };
    if (projectLeader) {
      await axios
        .put(
          `${
            import.meta.env.VITE_PROJECT_API
          }/update-project-leader/${projectId}`,
          newleaderdata,
          {
            headers: {
              Authorization: `UserLoginToken ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.data.success) {
            toast.success("project leader changed");

            setleaveprojectleaderdia(false)
            navigate("/homepage");
          }
        })
        .catch((error) => {
          // Handle error scenario
          console.error("Error leaving project", error);
          toast.error("Failed to leave project");
        });
    }
  };

  const handleleaveprojectmember = async () => {
    await axios
      .post(
        `${import.meta.env.VITE_PROJECT_API}/leave-project/${projectId}`,
        {},
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          setleaveprojectmemberdia(false)
          toast.success('you left the project successfully');
          // alert("Bye Bye");
          navigate("/homepage");
        }
      })
      .catch((error) => {
        // Handle error scenario
        console.error("Error leaving project", error);
        toast.error("Failed to leave project");
      });
  };

  const promoteleader = async () => {
    const newleaderdata = {
      projectId: projectId,
      newLeaderEmail: newLeader,
    };
    if (projectLeader) {
      await axios
        .put(
          `${
            import.meta.env.VITE_PROJECT_API
          }/promote-project-leader/${projectId}`,
          newleaderdata,
          {
            headers: {
              Authorization: `UserLoginToken ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.data.success) {
            toast.success("project leader changed");
            setpromoteleadervisible(false)
            window.location.reload();
          }
        })
        .catch((error) => {
          // Handle error scenario
          console.error("Error changing the leader of the project", error);
          toast.error("Failed to leave project");
        });
    }
  };

  const handleConfirmDialog = async () => {
    setPasswordError("")
    if (oldpassword === "") {
      toast.error("Please enter your old password.");
      return;
    }
    // BACKEND
    // Prepare the request payload
    const payload = {
      title: newPname, // Assuming newPname contains the updated title
      description: newDescription,
      password: oldpassword, // Assuming newDescription contains the updated description
    };
    console.log(payload);
    // Make the API call to update project details
    await axios
      .put(
        `${import.meta.env.VITE_PROJECT_API}/edit-project/${projectId}`,
        payload,
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        // Check if the request was successful
        if (response.data.success) {
          // Handle success scenario
          toast.success("Project details updated successfully.");
          // You can also perform any other actions you need after a successful update
          setPname(newPname);
          setDescription(newDescription);
          setEditingPname(false);
          setEditingDescription(false);
          setShowCancelButton(false);
          setShowSaveButton(false);
          setConfirmDialogVisible(false);
          setShowPopup(!showPopup);
          setOldPassword("");
          // } else {
          //   // Handle failure scenario
          //   alert("Failed to update project details: " + response.data.message);
        }
      })
      .catch((error) => {
        // Handle error scenario
        console.error("Error updating project details:", error);
        toast.error("Failed to update project details. Please try again later.");
        // setConfirmDialogVisible(false);
        if (error.response.data.message == "Password Don't Match!") setPasswordError("Invalid Password")
        // setShowPopup(!showPopup);
      });
    // setConfirmDialogVisible(false);
    //     setShowPopup(!showPopup);
    setOldPassword("");
  };

  const handleConfirmDeleteDialog = async () => {
    setPasswordError("")
    if (oldpassword === "") {
      toast.error("Please enter your old password.");
      return;
    }

    // BACKEND

    await axios
      .delete(`${import.meta.env.VITE_PROJECT_API}/delete-project`, {
        headers: {
          Authorization: `UserLoginToken ${token}`, // Assuming token is available in the user object
        },
        data: {
          password: oldpassword,
          projectId,
        },
      })

      .then((response) => {
        const { success, message } = response.data;
        if (success) {
          toast.success("Project deleted successfully.");
          setDeleteDialogVisible(false);
          setShowPopup(!showPopup);
          setOldPassword("");
          navigate("/homepage");
          // return { success: true, message: "Project deleted successfully" };
          // } else {
          //   alert("Failed to delete project.");
          //   throw new Error(message);
        }
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
        // setDeleteDialogVisible(false);
        if (error.response.data.message == "Password Don't Match!") setPasswordError("Invalid Password")
        // setShowPopup(!showPopup);
        // return { success: false, message: "Error deleting project" };
      });
    // setDeleteDialogVisible(false);
    //     setShowPopup(!showPopup);
    setOldPassword("");
  };

  const handleCancelDialog = () => {
    setNewDescription(description);
    setNewPname(Pname);
    setConfirmDialogVisible(false);
    setShowPopup(!showPopup);
    setShowCancelButton(false);
    setShowSaveButton(false);
    setEditingDescription(false);
    setEditingPname(false);
    setPasswordError("");
    setShowPopup(true);
  };
  
  const handleCancelDeleteDialog = () => {
    setPasswordError("")
    // setNewDescription(description);
    setDeleteDialogVisible(false);
    setShowPopup(!showPopup);
    setShowCancelButton(false);
    setShowSaveButton(false);
    setShowPopup(true);

  };

  const handlecancelpromotedia = () =>{
    setpromoteleadervisible(false);
    setShowPopup(!showPopup);
    setShowCancelButton(false);
    setShowSaveButton(false);
    setnewLeader('')
    setSuggestions([])
  }
  const handlecancelleavedia = () =>{
    setleaveprojectleaderdia(false);
    setShowPopup(!showPopup);
    setShowCancelButton(false);
    setShowSaveButton(false);
    setnewLeader('')
    setSuggestions([])
  }

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

  const handleAssignLeaderChange: React.KeyboardEventHandler<
    HTMLInputElement
  > = (event) => {
    const searchQuery = event.currentTarget.value.trim();
    setnewLeader(searchQuery);

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

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  if (loading) {
    // Render nothing during the loading phase or if either projectLeader or currentUser is null
    return <Loading/>;
  }

  // const leader = projectLeader === currentUser;

  return (
    <div>
      <div>
      <NavBarBig/>
       {/* current */}
       <div style={{position: 'absolute',top:'500px', height: '100px'}}>
          <NavBarCurrent icon={<FaHome/>} text="This Project"></NavBarCurrent>
         </div>
        {/* end of current */}
        </div>
        <div className="description main" >
          <ToastContainer />
      {/* header */}
      {editingPname ? (
        <div>
          <img src={Purple} className='App-logo'  />
          <center>
            <InputText
              className='Pnameinput'
              value={newPname}
              onChange={(e) => setNewPname(e.target.value)}
            />
          
          </center>
        </div>
      ) : (
        <div className='text'>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              height: "fit-content",
            }}
          >
            <h2 style={{ color: "white" }}>{Pname}</h2>
            {currentUser === projectLeader && (
              <FaPen
                style={{
                  cursor: "pointer",
                  zIndex: 2,
                  position: "absolute",
                  right: "43%",
                  marginTop: "40px",
                }}
                onClick={() => handleEditClick("Pname")}
              />
            )}
          </div>
          <img src={Purple} className='App-logo' />
        </div>
      )}
      {/* date */}
      <div className='date'>
        <h6>{startDate} </h6>
      </div>

      {/* description */}
      <div style={{ width: "fit-content", height: "fit-content" }}>
        <div className='description-box'>
          <div style={{ marginBottom: "5px" }}>Description</div>

          {editingDescription ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <InputText
                className='descriptioninput'
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="enter your project's description"
              />
              {/* <FaPen
          style={{ marginLeft: "590px", cursor: "pointer" }}
          onClick={() => handleEditClick("description")}
        /> */}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ marginLeft: "20px", color: "grey" }}>
                {description}
              </div>
              {currentUser === projectLeader && (
                <FaPen
                  style={{ marginLeft: "20px", cursor: "pointer" }}
                  onClick={() => handleEditClick("description")}
                />
              )}
            </div>
          )}
        </div>
      </div>


{/* buttons */}
<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 0, right: '45%'}}>

{/* leave project button  */}
      {currentUser === projectLeader && (
        <button
        className='desbutton2'
        style={{ paddingTop: "0" }}
          onClick={handleleaveleader}
        >
        <p style={{color: "white"}}>Leave Project</p>
        </button>
      )}

      {currentUser !== projectLeader && (
        <button
          className='desbutton2'
          style={{ paddingTop: "0" }}
          onClick={() => {
            setleaveprojectmemberdia(true)
            setShowPopup(!showPopup)
          }}
        >
        <p style={{color: "white"}}>Leave Project</p>
        </button>
      )}

      {/* promote button */}
      {currentUser === projectLeader && (
        <button
          className='desbutton2'
          onClick={handlepromote}
        >
        Promote New Leader
        </button>
      )}


      {/* delete project */}
      {currentUser === projectLeader && (
        <button
          className='desbutton2'
          style={{backgroundColor: 'red',color:"white"}}
          onClick={handleDelete}
        >
          Delete Project
        </button>
      )}
</div>
      {/* end of bUTTONS */}

      {/* show save and cancel buttons */}
      <div style={{marginLeft:"450px",marginTop:"180px"}}>
      {showSaveButton && (
          <button
            type='button'
            className='desbutton3'
            onClick={handleSaveChanges}
            style={{ color: 'white', border: 'none'}}
          >
            Save Changes
          </button>
        )}
        {showCancelButton && (
          <button
            type='button'
            className='desbutton3'
            onClick={handleCancelDialog}
            style={{ color: 'white', border: 'none'}}

          >
            Cancel
          </button>
        )}
        
      </div>

      {/* Confirm Dialog */}

     
      <Dialog
      
      style={{zIndex:"1000"}}
        className='alert'
        showHeader={false}
        // style={{ zIndex: "1"}}
        visible={confirmDialogVisible}
        onHide={handleCancelDialog}
        footer={
          <div>
            
            <center>
              {showPopup && <div></div>}
              <button
                className='p-button p-button-secondary'
                onClick={handleCancelDialog}
              >
                Cancel
              </button>
              <button
                className='p-button p-button-primary'
                onClick={handleConfirmDialog}
              >
                Save
              </button>
            </center>
          </div>
        }
      >
          {/* <div className="dialog-overlay" style={{ position: "fixed", zIndex: "999", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)" }}></div> */}

        <center style={{ zIndex: "1000", fontWeight: "bold", color: 'black' }}>
          Please confirm your password to save changes
          <div className={`inputdialog ${passwordError && 'error'}`} style={{position: "relative"}}>
            <h4>Password</h4>
            <input
              className='inputd'
              type={showPassword ? "text" : "password"}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {passwordError && <div className="error-message">{passwordError}</div>}
            <p
              className="show-password-icon-description"
              style={{top: "45%", right: "10px"}}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye/> : <FaEyeSlash/>}
            </p>
          </div>
        </center>
      </Dialog>
      

      {/* delete dialog */}
      <Dialog
      style={{zIndex:"1000"}}
        className='alert'
        showHeader={false}
        // style={{ zIndex: "1000"}}
        visible={DeleteDialogVisible}
        onHide={handleCancelDeleteDialog}
        footer={
          <div>
            <center>
              {showPopup && (
                <div>
                  {/* <div className='overlay'></div> */}
                </div>
              )}
{/* <div>
                  <div className='overlay'></div>
                </div> */}
                <button
                style={{backgroundColor:"red",marginBottom:"0px", marginRight: '20px'}}
                className='cancelbtn'
                onClick={handleConfirmDeleteDialog}
              >
                Delete
              </button>
              <button
              style={{marginBottom:"0px"}}
                className='cancelbtn'
                onClick={handleCancelDeleteDialog}
              >
                Cancel
              </button>
              
            </center>
          </div>
        }
      >
       
       <h3 style={{color: 'purple'}}>Delete Project</h3><hr/>
        <h2 style={{color:"black",fontSize:"15px"}}>Please confirm your password to delete the project </h2>
        <h2 style={{color:"red", fontSize:"13px"}}>PS: this project will be permenantly deleted if you completed this action</h2>          
        
          <div className={`inputdialog ${passwordError && 'error'}`} style={{position: "relative"}}>
            <h4 style={{color:"black", fontSize: '13px', marginBottom: '5px'}}>Password:</h4>
            <input
            style={{ height: "35px", width: "400px" ,border:" 1px solid black",marginBottom:"10px"}}
              className='inputd'
              type={showPassword ? "text" : "password"}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {passwordError && <div className="error-message">{passwordError}</div>}
            <p
              className="show-password-icon-description"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye/> : <FaEyeSlash/>}
            </p>
          </div>
       
      </Dialog>

      {/* {DeleteDialogVisible && (
  <div className='overlay'></div>
)} */}
{/* promote new leader */}
      <Dialog
        className='alert'
        showHeader={false}
        // style={{ zIndex: "1"}}
        visible={promoteleadervisible}
        onHide={handlecancelpromotedia}
        footer={
          <div style={{margin: 0}}>
            <center>
              {showPopup && (
                <div>
                  {/* <div className='overlay'></div> */}
                </div>
              )}
               <button
               style={{marginRight: '20px' }}
                className='confirmbtn'
                onClick={promoteleader}
              >
                promote
              </button>
              <button
                className='cancelbtn'
                onClick={handlecancelpromotedia}
              >
                Cancel
              </button>
              
            </center>
          </div>
        }
      >
        <h3 style={{color: 'purple'}}>Promote new Leader</h3><hr/>
        <center><h2 style={{color:"black",fontSize:"15px"}}>please enter new leader's email</h2></center>
        <center style={{ zIndex: "1", fontWeight: "bold", color: "red" }}>
         <h2 style={{color:"red", fontSize:"13px"}}> PS: you will not be the leader of this project anymore</h2>
        </center>
        <center>
          <div className='inputdialog'>
            <input
            style={{ height: "35px", width: "400px" ,border:" 1px solid black",marginBottom:"10px"}}
              className='inputd'
              value={newLeader}
              onKeyUp={handleAssignLeaderChange}
              onChange={(e) => setnewLeader(e.target.value)}
              placeholder="Enter new leader's email"  
            />
            {suggestions.length > 0 && (
                          <div className="suggestionsdescription">
                            {suggestions.map((member, index) => (
                              <div
                                key={index}
                                onClick={() => {setnewLeader(member); setSuggestions([]);}}
                              >
                                {member}
                              </div>
                            ))}
                          </div>
                        )}
          </div>
        </center>
      </Dialog>

      {/* leave project for leader  */}

      <Dialog
        className='alert'
        showHeader={false}
        style={{ zIndex: "1000"}}
        visible={leaveprojectleaderdia}
        onHide={handlecancelleavedia}
        footer={
          <div className="despopup" style={{margin: 0}}>
            <center>
              {showPopup && (
                <div>
                  {/* <div className='overlay'></div> */}
                </div>
              )}

              <button
              style={{backgroundColor:"red", marginRight: '20px'}}
                className='cancelbtn'
                onClick={handleLeaveProjectLeader}
              >
                leave
              </button>
              <button
                className='cancelbtn'
                onClick={handlecancelleavedia}
              >
                Cancel
              </button>
             
            </center>
          </div>
        }
      >
        <h3 style={{color: 'purple'}}>Leave Project</h3><hr/>
        <p style={{ zIndex: "1", fontWeight: "bold", color: "black" }}>
          assign a new leader before leaving
        </p>
        <br/>
        <center>
          <div className='inputdialog'>
            <input
            style={{ height: "35px", width: "400px" ,border:" 1px solid black",marginBottom:"10px"}}
              className='inputd'
              value={newLeader}
              onKeyUp={handleAssignLeaderChange}
              onChange={(e) => setnewLeader(e.target.value)}
              placeholder="Enter new leader email"  
            />
             {suggestions.length > 0 && (
                          <div className="suggestionsdescription">
                            {suggestions.map((member, index) => (
                              <div
                                key={index}
                                onClick={() => {setnewLeader(member); setSuggestions([]);}}
                              >
                                {member}
                              </div>
                            ))}
                          </div>
                        )}
          </div>
        </center>
      </Dialog>
      <Dialog
        className='alert'
        showHeader={false}
        style={{ zIndex: "1000"}}
        visible={leaveprojectmemberdia}
        onHide={() => {
          setleaveprojectmemberdia(false);
setShowPopup(!showPopup);
setShowCancelButton(false);
setShowSaveButton(false);
        }}
        footer={
          <div className="despopup" style={{margin: 0}}>
            <center>
              {showPopup && (
                <div>
                  {/* <div className='overlay'></div> */}
                </div>
              )}

              <button
              style={{backgroundColor:"red", marginRight: '20px'}}
                className='cancelbtn'
              onClick={handleleaveprojectmember}
                >
                leave
              </button>
              <button
                className='cancelbtn'
                onClick={() => {
                  setleaveprojectmemberdia(false);
    setShowPopup(!showPopup);
    setShowCancelButton(false);
    setShowSaveButton(false);
                }}
              >
                Cancel
              </button>
             
            </center>
          </div>
        }
      >
        <h3 style={{color: 'purple'}}>Leave Project</h3><hr/>
      </Dialog>
      {!showPopup && <div className='backdrop' style={{zIndex:"800"}}></div>}
    </div>

    </div>
  );
}

export default Description;
