import React, { useContext, useEffect, useRef, useState } from "react";
import "./css/dashboard.css";
import { FaFile, FaPaperclip, FaPhone, FaUserCircle } from "react-icons/fa";
import { FaPhotoFilm } from "react-icons/fa6";
import style from "./../node_modules/dom-helpers/esm/css";
import { MdHeight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SocketContext } from "./SocketConnection";
// import { toast } from "react-toastify";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { SocketContext } from "./context/SocketContext";
// import * as roomHandler from './realtimeCommunication/roomHandler';
// import Meeting from "./room/Meetings";
// import { connect } from "react-redux";
// import { initState } from './store/reducers/roomreducer'; // Assuming RootState contains the type definition of your Redux store state
// import { getActions } from "../store/actions/auctions";

function LeaderHp({setChange, change, fetchAndDisplayPosts}: any) {
  const navigate = useNavigate();
  interface ProjectDetails {
    joiningCode: string;
  }

  const [emailInput, setEmailInput] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [details, setDetails] = useState("");
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const projectId = sessionStorage.getItem("projectID");

  const token = sessionStorage.getItem("userID");
  const [showAddMembersPopup, setShowAddMembersPopup] = useState(false);
  const [showNewPostPopup, setShowNewPostPopup] = useState(false);
  const [showStartMeetingPopup, setShowStartMeetingPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [fileData, setFileData] = useState<File | null>(null); // State to store file data
  const [nameoffile, setnameoffile] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ensure correct type for fileInputRef

  const [roomName, setRoomName] = useState('');
  const [newMeetDate, setNewMeetDate] = useState('none');
  const [newMeetTime, setNewMeetTime] = useState('none');
  const [newMeetType, setNewMeetType] = useState('none');
  const [keyPoints, setKeyPoints] = useState([""]);

  // const {socket, setMyMeets, newMeetType, setNewMeetType} = useContext(SocketContext);

  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinRoomError, setJoinRoomError] = useState('');
  const { socket } = useContext(SocketContext);


  const handleCreateRoom = () =>{
    // console.log(projectId, roomName, newMeetType, newMeetDate, newMeetTime);
    socket.emit("create-room", {projectId, roomName, newMeetType, newMeetDate, newMeetTime, keyPoints});
    // navigate('/meeting')
  }

  // const handleJoinRoom = async () =>{
  //   await socket.emit('user-code-join', {roomId: joinRoomId});
  //   setRoomName('');
  // }

  useEffect(() => {
    // Check if token exists in session storage
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      axios
      .get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader-and-user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        const { leaderId, userId, userEmail, joiningCode } = response.data;
        setProjectLeader(leaderId);
        setCurrentUser(userId);
        setDetails(joiningCode);
        setLoading(false); // Set loading to false after fetching data
      })
      .catch((error) => {
        console.error("Error fetching project leader and current user:", error);
      });
      // if (projectLeader === currentUser && projectLeader != null) {
      //   // Fetch project details only if the current user is the leader
      //   getProjectDetails(projectId)
      //     .then((details) => {
      //       setDetails(details);
      //     })
      //     .catch((error) => {
      //       console.error("Error fetching project details:", error);
      //     });
      // }
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
          // setDetails(project); // Set the details state with the retrieved project
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
  function getProjectLeader(projectId: any) {
    return axios
      .get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader`)
      .then((response) => {
        return response.data.leaderId;
      })
      .catch((error) => {
        console.error("Error fetching project leader:", error);
        return null;
      });
  }

  function getCurrentUser(token: any) {
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

  const handleCopyClick = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {})
      .catch((error) =>
        console.error("Unable to copy text to clipboard:", error)
      );
  };

  const handleInputChange: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    const searchQuery = event.currentTarget.value.trim();
    setEmailInput(searchQuery);

    if (searchQuery.length === 0) {
      setFilteredMembers([]);
      return;
    }

    searchMembers(searchQuery)
      .then((filteredMembers) => {
        setFilteredMembers(filteredMembers);
      })
      .catch((error) => {
        console.error("Error filtering members:", error);
        setFilteredMembers([]);
      });
  };

  const handleFilteredMemberClick = (member: string) => {
    setEmailInput(member); // Set the value of the clicked member to emailInput
    setFilteredMembers([]); // Clear the filtered members list
  };

  const searchMembers = (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      return Promise.resolve([]);
    }

    return axios
      .get(
        `${
          import.meta.env.VITE_PROJECT_API
        }/project/${projectId}/addusers/emails`
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

  function addUserToProject() {
    // Send a POST request to add the user to the project
    axios
      .post(
        `${import.meta.env.VITE_PROJECT_API}/joinProjectByEmail`,
        {
          projectId,
          email: emailInput,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // alert(response.data.message);
        // You can modify this to display a success message in a different way
      })
      .catch((error) => {
        console.error("Error adding user to project:", error);
        // Handle errors, e.g., display an error message
      });
  }

  function readAndProcessFile() {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      console.error("Please select a file to upload.");
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      console.log(file.name, file.type);
      setFileData(file);
      setnameoffile(file.name);
    };
    reader.readAsArrayBuffer(file);
  }

  function createPost() {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("type", type);
    formData.append("projectId", projectId || ""); // Ensure projectId is not null

    const fileInput = fileInputRef.current;
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      formData.append("file", new Blob([file], { type: file.type }), file.name);
      // readAndProcessFile(); // Call readAndProcessFile here
    } else if (type === "image" || type === "file") {
      console.error("Please select a file to upload.");
      return;
    }

    axios
      .post(`${import.meta.env.VITE_POST_API}/create-post`, formData, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        // Handle success
        setType("");
        setMessage("");
        setnameoffile("");
        console.log(response.data);
        setChange(!change);
      })
      .catch((error) => {
        console.error("Error:", error.message);
        toast.error(error.message);
      });
  }

  const handleAddKeyPoint = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
    const lastKeyPoint = keyPoints[keyPoints.length - 1];
    if (lastKeyPoint !== "") {
      setKeyPoints([...keyPoints, ""]); // Add a new empty key point
    }
  }
  };

  const handleKeyPointChange = (index: number, value: string) => {
      const newKeyPoints = [...keyPoints];
    newKeyPoints[index] = value;
    setKeyPoints(newKeyPoints);
  };

  const cancelmeetingpopup = () => {
    setShowStartMeetingPopup(false)
    setRoomName("")
    setNewMeetType("")
    setNewMeetDate("")
    setNewMeetTime("")
    setKeyPoints([""])
  }

  if (loading || projectLeader === null || currentUser === null) {
    // Render nothing during the loading phase or if either projectLeader or currentUser is null
    return null;
  }


  return (
    <div className="LHP">
      <ToastContainer />
      {/* Overlay div */}
      {/* {(showAddMembersPopup || showNewPostPopup || showStartMeetingPopup) && (
        <div className="overlay" />
      )} */}

      {/* Buttons */}
      <div style={{ display: "flex" }}>
        {/* Add Members Button */}
        <button
          className="buttonlhp addm"
          style={{marginRight: '200px'}}
          onClick={() => setShowAddMembersPopup(true)}
        >
          + Add Members
        </button>

        {/* New Post Button */}
        <button className="buttonlhp" onClick={() => setShowNewPostPopup(true)}>
          <FaFile /> New Post
        </button>

        {/* Start Meeting Button */}
        <button
          className="buttonlhp"
          onClick={() => {
            setShowStartMeetingPopup(true)

            // roomHandler.createNewRoom()
            // navigate('/meeting');
          }
          }
        >
          <FaPhone /> Start Meeting
        </button>


      </div>

      
      {/* Add Members Popup */}
      {showAddMembersPopup && (
        <div className="popup" style={{}}>
          <center>
          <h3>Add Members</h3>
          </center>
          <center>
            {/* <h3>Add Members</h3> */}
            <hr />

            <div className="addmembers">
              <div className="AMways">
                Member's Email
                <br />
                <br />
                <input
                  style={{ height: "4px", width: "150px" ,border:" 1px solid black",marginBottom:"10px"}}
                  className="inputways"
                  placeholder="user@example.com"
                  value={emailInput}
                  onKeyUp={handleInputChange}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                  }}
                />
                {filteredMembers.length > 0 && (
                    <div className="suggestionsforaddingmember">
                          {filteredMembers.map((member, index) => (
                      <div
                        key={index}
                        onClick={() => handleFilteredMemberClick(member)}
                        className="eachsuggestionforaddingmember"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                )}
                <button className="buttonways" onClick={addUserToProject}>
                  add
                </button>
              </div>
              <hr />
              <div className="AMways">
                Project Code
                <br />
                <br />
                <div className="inputways" style={{ height: "35px", width: "150px" ,border:" 1px solid black",marginBottom:"10px"}}>{details}</div>{" "}
                {/* Check if details.project is defined */}
                <button
                  className="buttonways"
                  onClick={() => handleCopyClick(details)}
                >
                  copy
                </button>
              </div>
              <hr />
              <div className="AMways">
                Project Link
                <br />
                <br />
                <div className="inputways" style={{ height: "35px", width: "150px" ,border:" 1px solid black",marginBottom:"10px",whiteSpace: "nowrap", 
  overflow: "hidden", 
  textOverflow: "ellipsis"}}>{`${import.meta.env.VITE_CLIENT_HOST}/joinrequest/${details}`}</div>
                <button
                  className="buttonways"
                  onClick={() =>
                    handleCopyClick(
                      `${import.meta.env.VITE_CLIENT_HOST}/joinrequest/${details}`
                    )
                  }
                >
                  copy
                </button>
              </div>
            </div>

            <button
              className="closebutton"
              
              onClick={() => {
                setShowAddMembersPopup(false);
                setEmailInput("");
                setFilteredMembers([]);
              }}
            >
              Cancel
            </button>
          </center>
        </div>
      )}

      {/* New Post Popup */}
      {showNewPostPopup && (
        <div className="popup" style={{width:"500px"}}>
          <h3>Create New Post</h3>
          
            {/* <h3>Create New Post</h3> */}
            
            <hr />
            <br />

            <div className="input-with-select" style={{width: '470px'}} >
              
              <input style={{border:" 1px solid black",borderRadius:"7px",padding:"20px",width:"400px",marginLeft:"30px"}}
                className="input-text"
                placeholder="Keep the team updated!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <select 
                style={{ position: 'absolute', right: '20px'}}
                className="add"
                value={type}
                onChange={async (e) => {
                  await setType(e.target.value);
                  if (e.target.value === "image" || e.target.value === "file") {
                    fileInputRef.current?.click();
                  }
                  setnameoffile("");
                }}
                >
                <option value="">+</option>
                <option value="image" style={{fontSize:"15px"}}> &#128247; Photo</option>
                <option value="file"  style={{fontSize:"15px"}}> &#128221; Document</option>
              </select>
             
            </div>
            <br />
            <div>
              {/* Add file input field */}
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept={
                  type === "image" ? "image/*" : type === "file" ? ".pdf" : ""
                }
                className="hidden-file-input"
                onChange={readAndProcessFile}
                style={{ display: "none" }} // Hide the input initially
              />
              <div style={{ margin: "20px" }}>
                {nameoffile && type === "image" ? (
                  <FaPhotoFilm style={{ marginRight: "10px" }} />
                ) : nameoffile && type === "file" ? (
                  <FaFile style={{ marginRight: "10px" }} />
                ) : null}

                {nameoffile}
              </div>
            </div>
            <center>
            <button className="okbutton popupbutton" onClick={createPost}>
              Post
            </button>
            <button
              className="closebutton popupbutton"
              onClick={() => setShowNewPostPopup(false)}
            >
              Close
            </button>
           
          </center>
        </div>
      )}

      {/* Start Meeting Popup */}
      {showStartMeetingPopup && (
        <div className="popup" style={{width:"450px"}}>
          
          {/* Popup content */}
          <h3>Start Meeting </h3>
          <hr />
            <br />
          <div  id="staticBackdrop" style={{paddingLeft: '50px'}}>
              <div  style={{width: "30vw"}}>
                <div >
                  {/* <div >
                    <h5  id="staticBackdropLabel">Create New Meet</h5>
                    <button type="button" ></button>
                  </div> */}
                  <div >
                    
                    {/* <input type='text' class="form-control" placeholder='Name your meet' value={roomName} onChange={(e)=> setRoomName(e.target.value)}  /> */}
                    <div >
                      <label >Meeting name:</label><br />
                      <input style={{ height: "4px", width: "310px" ,border:" 1px solid black", marginBottom:"10px", marginTop: "5px"}} type="text"  id="floatingInput" placeholder='Name your meet' value={roomName} onChange={(e)=> setRoomName(e.target.value)} />
                    </div>
                    <p> Meeting Type:</p>
                    <select style={{backgroundColor:"white",color:"black",marginBottom:"20px", padding: '10px', borderRadius: '10px'}} value={newMeetType} onChange={(e) => setNewMeetType(e.target.value)}>
                      <option value="choose">Choose meeting type</option>
                      <option value="instant">Instant Meeting</option>
                      <option value="scheduled">Schedule Meeting</option>
                    </select>

                    {newMeetType === 'scheduled' ?
                    <div style={{display: 'flex', fontSize: '12px'}}>
                    <div style={{ marginRight: '30px'}}>
                    <p style={{margin: " 10px 0px 0px 0px"}}>Meeting Date: </p>
                    <input type='date' style={{padding: '0 10px', border:" 1px solid black"}} onChange={(e) => setNewMeetDate(e.target.value)} />
                    </div>
                    <div>
                    <p style={{margin: " 10px 0px 0px 0px"}}>Meeting Time: </p>
                    <input type='time' style={{ padding: '0 10px', border:" 1px solid black"}} onChange={(e) => setNewMeetTime(e.target.value)} />
                    </div>
                    </div>
                    :
                    ''
                    }
                    {/* Render input fields for key points */}
                <p >KeyPoints: <span style={{color: 'lightgrey'}}>optional</span></p>
                <div style={{overflow: 'auto', maxHeight: '200px', width: 'fit-content'}}>
            {keyPoints.map((keyPoint, index) => (
              <div key={index}>
                <input
                style={{ height: "4px", width: "300px" ,border:" 1px solid black",marginBottom:"10px"}}
                  type="text"
                  placeholder={`Key Point ${index + 1}`}
                  value={keyPoint}
                  onChange={(e) => handleKeyPointChange(index, e.target.value)}
                  onKeyDown={(event)=>handleAddKeyPoint(event)} // Add a new key point when the user leaves the input field
                />
              </div>
            ))}
            </div>

                  </div>
                  
                  <div style={{marginLeft:"50px"}}>
                    
                  <button className="okbutton popupbutton" type="button"  onClick={handleCreateRoom} >Create </button>
                    <button className="closebutton popupbutton" type="button" onClick={cancelmeetingpopup} >Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          {/* <br /> */}
          {/* Close button */}
          {/* <button onClick={() => setShowStartMeetingPopup(false)}>Close</button> */}
         
        </div>
      )}


         {showNewPostPopup && <div className='backdrop'></div>}
         {showAddMembersPopup && <div className='backdrop'></div>}
         {showStartMeetingPopup && <div className='backdrop'></div>}

    </div>
  );
}

// const mapStoreStateToProps = ({ Meeting }: any) => {
//   return {
//     ...Meeting,
//   };
// };

// export default connect(mapStoreStateToProps, null)(LeaderHp);
export default LeaderHp;
