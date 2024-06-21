import "./css/MeetingList.css";
import NavBarBig from "./NavBarBig";
import { useContext, useEffect, useState } from "react";
import { FaCalendar, FaPhone } from "react-icons/fa";
import NavBarCurrent from "./NavBarCurrent";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import axios from "axios";
import { SocketContext } from "./SocketConnection";
import Loading from "./Loading";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import moment from "moment-timezone";

interface Meeting {
  _id: string;
  name: string;
  description?: string;
  date: string;
  time: string;
  ampm?: string;
  ended: string;
}

const timeZone = "Etc/GMT";

function MeetingList() {
  const navigate = useNavigate();

  // const meetings = [
  //   { name: "Meeting 1", date: "2024-04-22", time: "10:00 AM" },
  //   { name: "Meeting 2", date: "2024-04-23", time: "2:00 PM" },
  //   // Add more meetings as needed
  // ];

  // State variables for Start popup
  const [showStartPopup, setShowStartPopup] = useState(false);
  const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  // const [keyPoints, setKeyPoints] = useState("");
  const [keyPoints, setKeyPoints] = useState([""]);

  // State variables for Assign popup
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [assignMeetingName, setAssignMeetingName] = useState("");
  // const [assignDescription, setAssignDescription] = useState("");
  // const [assignKeyPoints, setAssignKeyPoints] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // const [ampm, setAmPm] = useState("AM");

  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [previousMeetings, setPreviousMeetings] = useState<Meeting[]>([]);
  const [todayMeetings, setTodaysMeetings] = useState<Meeting[]>([]);


  const token = sessionStorage.getItem("userID");
  const projectId = sessionStorage.getItem("projectID");

  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      getProjectDetails();
    }
  }, [token]);

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

  const handleCreateRoom = (type: string) =>{
    // console.log(projectId, roomName, newMeetType, newMeetDate, newMeetTime);
    type == "instant" ? socket.emit("create-room", {projectId, roomName: name, newMeetType: type, newMeetDate: date, newMeetTime: time, keyPoints}) : 
    socket.emit("create-room", {projectId, roomName: assignMeetingName, newMeetType: type, newMeetDate: date, newMeetTime: time, keyPoints});
    // navigate('/meeting')
    getProjectDetails();
  }

  const getProjectDetails = () => {
    axios
      .get(`${import.meta.env.VITE_MEETING_API}/meetingDetails/${projectId}`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        setLoading(false);
        console.log("meetings", response.data.meeting);
        const fetchedMeetings = response.data.meeting.map((m: any) => ({
          _id: m._id,
          name: m.title,
          date: m.date.split("T")[0], // Assuming date is in ISO format
          ended: m.ended
          // time: "10:00 AM" // Placeholder for time (adjust according to actual data)
        }));
        const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Get today's date without time

const upcoming = fetchedMeetings.filter((m: Meeting) => {
  const meetingDate = new Date(m.date);
  return meetingDate >= today && !m.ended; // Compare the meeting date with today's date and check if it's not ended
});

const previous = fetchedMeetings.filter((m: Meeting) => {
  const meetingDate = new Date(m.date);
  return (meetingDate < today && !m.ended) || m.ended; // Compare the meeting date with today's date and check if it's ended
});

// Sort upcoming meetings in ascending order based on date
upcoming.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Sort previous meetings in descending order based on date
previous.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());


const todaymeetings = fetchedMeetings.filter((m: Meeting) => {
  const meetingDate = new Date(m.date);
  const todayString = today.toLocaleDateString(); // Get the date part only
  const meetingDateString = meetingDate.toLocaleDateString(); // Get the date part only
  return meetingDateString === todayString; // Compare as strings
});

console.log("Upcoming Meetings:", upcoming);
console.log("Previous Meetings:", previous);
console.log("Today's Meetings:", todaymeetings);

// Set state variables directly with the filtered arrays
setUpcomingMeetings(upcoming);
setPreviousMeetings(previous);
setTodaysMeetings(todaymeetings);
      })
      .catch((error) => {
        console.error("Error fetching meetings:", error);
        setLoading(false);
      });
  };

  
  // Function to handle "Start" button click
  const handleStartClick = () => {
    setShowStartPopup(true);
  };

  // Function to handle "Start" button in Start popup
  const handleStartPopupStartClick = () => {
    handleCreateRoom("instant");
    // Handle starting the meeting with the provided details
    console.log("Starting meeting with:", name, keyPoints);
    // Reset popup content and hide popup
    setName("");
    // setDescription("");
    setKeyPoints([""]);
    setShowStartPopup(false);
  };

  // Function to handle "Assign" button click
  const handleAssignClick = () => {
    setShowAssignPopup(true);
  };

  // Function to handle "Assign" button in Assign popup
  const handleAssignPopupAssignClick = () => {
    handleCreateRoom("scheduled");
    // Handle assigning the meeting with the provided details
    console.log(
      "Assigning meeting with:",
      assignMeetingName,
      // assignDescription,
      keyPoints,
      date,
      time,
      // ampm
    );
    // Reset popup content and hide popup
    setAssignMeetingName("");
    // setAssignDescription("");
    setKeyPoints([""]);
    setDate("");
    setTime("");
    // setAmPm("AM");
    setShowAssignPopup(false);
  };
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const leader = projectLeader === currentUser ;

  
  
  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
        axios.get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader-and-user`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `UserLoginToken ${token}`,
            },
          }
        )
        .then((response) => {
          const { leaderId, userId } = response.data;
          setProjectLeader(leaderId);
          setCurrentUser(userId); 
        })
        .catch((error) => {
          console.error(
            "Error fetching project leader and current user:",
            error
          );
        });
    }
  }, [token]);

  const handleClosePopup = () => {
    setShowStartPopup(false);
    setShowAssignPopup(false);
    setKeyPoints([""])
    setName("")
    setDate("")
    setTime("")
  };


  
  
    const [loading, setLoading] = useState(true);
  
  
    // if (loading) {
      // Render nothing during the loading phase or if either projectLeader or currentUser is null
      // return <Loading/>;
    // }


    
  return (
    <div style={{display: 'flex'}}>
      <div >
        <NavBarBig />
        <Header/>
        <div style={{ position: 'absolute', top: '300px' }}>
          <NavBarCurrent icon={<FaPhone />} text="Meetings" click="/meetinglist"></NavBarCurrent>
        </div>
      </div>
      <div className="main">
        {projectLeader && currentUser && projectLeader === currentUser &&
        <div style={{position: 'absolute', top: '50px', left: '20px'}}>
          <button className="MLbutton"

            onClick={handleStartClick}
            >
            Start
          </button>
          <button className="MLbutton"

onClick={handleAssignClick}
>
            {" "}
            Schedule
          </button>
        </div>
        }

        {/* Start Popup */}
        {showStartPopup && (
          <div className="MLpopup">
            <h2> Start Meeting</h2>
            <div className="MLline"></div>
            <div style={{paddingLeft: '50px'}}>
            <p style={{color: 'black', fontSize: '15px'}}>Meeting Name: </p>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {/* <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            /> */}
            <p style={{color: 'black', fontSize: '15px'}}>Key Points: <span style={{color: 'lightgrey'}}>optional</span></p>
            <div style={{ maxHeight: '200px', overflow: 'auto'}}>
            {keyPoints.map((keyPoint, index) => (
              <div key={index} >
                <input
                style={{ height: "4px", width: "280px" ,marginBottom:"10px", padding: '20px'}}
                  type="text"
                  placeholder={`Key Point ${index + 1}`}
                  value={keyPoint}
                  onChange={(e) => handleKeyPointChange(index, e.target.value)}
                  onKeyDown={(event)=>handleAddKeyPoint(event)} // Add a new key point when the user leaves the input field
                />
              </div>
            ))}
            </div>
            <div style={{display:"flex"}}> 
            <button
              className="confirmpopup"
              onClick={handleStartPopupStartClick}
              >
              Start
            </button>
            <button
              className="cancelpopup"
              onClick={handleClosePopup}
              >
              Cancel
            </button>
          </div>
          </div>
          </div>
        )}

        {/* Schedule Popup */}
        {leader && showAssignPopup && (
          <div className="MLpopup">
          <h2> Schedule Meeting</h2>
          <div className="MLline"></div>
          <div style={{paddingLeft: '50px'}}>
          <p style={{color: 'black', fontSize: '15px'}}>Meeting Name: </p>
          <input
            type="text"
            placeholder="Name"
            value={assignMeetingName}
            onChange={(e) => setAssignMeetingName(e.target.value)}
          />
          <div style={{display: 'flex', fontSize: '12px', color: 'black'}}>
                      <div style={{ marginRight: '30px', marginBottom: 0}}>
                    <p style={{margin: " 10px 0px 0px 0px"}}>Meeting Date: </p>
                    <input type='date' style={{padding: '10px', width: '125px'}} onChange={(e) => setDate(e.target.value)} 
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Calculate and set min date inline
                    />
                    </div>
                    <div style={{margin: 0}}>
                    <p style={{margin: " 10px 0px 0px 0px"}}>Meeting Time: </p>
                    <input type='time' style={{ padding: '10px', width: '125px'}} onChange={(e) => setTime(e.target.value)} />
                    </div>
                    </div>
          {/* <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          /> */}
          <p style={{color: 'black', fontSize: '15px'}}>Key Points: <span style={{color: 'lightgrey'}}>optional</span></p>
          <div style={{ maxHeight: '200px', overflow: 'auto'}}>
          {keyPoints.map((keyPoint, index) => (
            <div key={index} >
              <input
              style={{ height: "4px", width: "280px" ,marginBottom:"10px", padding: '20px'}}
                type="text"
                placeholder={`Key Point ${index + 1}`}
                value={keyPoint}
                onChange={(e) => handleKeyPointChange(index, e.target.value)}
                onKeyDown={(event)=>handleAddKeyPoint(event)} // Add a new key point when the user leaves the input field
              />
            </div>
          ))}
          </div>
          <div style={{display:"flex"}}> 
          <button
            className="confirmpopup"
            onClick={handleAssignPopupAssignClick}
            >
            Schedule
          </button>
          <button
            className="cancelpopup"
            onClick={handleClosePopup}
            >
            Cancel
          </button>
        </div>
        </div>
        </div>
        )}

        {loading && <Loading/>}
        {/* upcoming meetings */}
        <div className="MLupcoming" style={{marginTop: '120px'}}>
          <h2>Upcoming Meetings</h2>
          <div style={{width: '75vw', display: 'flex', flexWrap: 'wrap'}}>
               {upcomingMeetings.map((meeting) => (
          <div key={meeting._id} className="MLmeeting-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",

              }}
            >
              <FaCalendar
                style={{ padding: "10px", color: "white", fontSize: "30px", margin: '20px' }}
              ></FaCalendar>
              <div style={{display: 'flex', flexDirection: 'column'}}>
            <h3>{meeting.name}</h3>
            <p style={{paddingTop: 0, marginTop: 0, fontSize: '12px'}}>{moment
                          .tz(meeting.date, timeZone)
                          .format("MMMM D")}</p>
          </div>
          

            
            <br />
            {todayMeetings.includes(meeting) && (
  <div style={{ display: "flex", alignItems: "center" }}>
    <button
      style={{
        borderRadius: "5px",
        border: "none",
        padding: "5px",
        cursor: 'pointer',
        position: 'absolute',
        right: '50px',
        width: '50px',
        backgroundColor: 'lightgrey',
        color: 'black'
      }}
      onClick={() => navigate(`/meeting/${meeting._id}`)}
    >
      Join
    </button>
  </div>
)}

            </div>
            </div>
        ))}
        {!loading && upcomingMeetings.length == 0 && <div style={{color: "#001831", width: "100%", textAlign: "center"}}>You Don't have upcoming Meetings</div>}

        </div>
          </div>
          
<hr style={{width: '90%'}}/>
        
         {/* previous meetings */}
         <div className='MLprevious'>
          <h2 style={{ paddingTop: "30px", marginBottom: "0" }}>
            Previous Meetings
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {previousMeetings.map((meeting) => (
              <div key={meeting._id} className='MLmeeting-card2'>
                <center>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "10px",
                      width: "100%",
                      justifyContent: "center",
                      position: 'relative'
                    }}
                  >
                    <FaCalendar
                      style={{
                        paddingRight: "20px",
                        color: "white",
                        fontSize: "35px",
                        position: 'absolute',
                        left: '20px'
                      }}
                    />
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <h3>{meeting.name}</h3>
                    <span style={{ fontSize: "12px" }}> {moment
                          .tz(meeting.date, timeZone)
                          .format("MMMM D")} </span>
                    <button
                      onClick={() => {
                        navigate(`/meetingsummary/${meeting._id}`);
                      }}
                    >
                      Summary
                    </button>
                    </div>
                  </div>
                </center>
              </div>
            ))}
            {!loading && previousMeetings.length == 0 && <div style={{color: "#001831", width: "94%", textAlign: "center"}}>You Don't have previous Meetings</div>}

          </div>
          {/* </center> */}
        </div>

        {/* meeting 2 */}
        {/*             
            <div className='MLmeeting-card2'>
              <center>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <FaCalendar
                    style={{
                      paddingRight: "10px",
                      color: "white",
                      fontSize: "30px",
                    }}
                  />

                  <h3>Meeting 1</h3>
                </div>
                <span style={{ fontSize: "12px" }}> DD/MM/YYYY </span>
                <div>
                  <button
                    onClick={() => {
                      navigate("/meetingsummary");
                    }}
                  >
                    Summary
                  </button>
                </div>
              </center>
            </div> */}
        {/* meeting 3 */}
        {/* <div className='MLmeeting-card2'>
              <center>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <FaCalendar
                    style={{
                      paddingRight: "10px",
                      color: "white",
                      fontSize: "30px",
                    }}
                  />

                  <h3>Meeting 1</h3>
                </div>
                <span style={{ fontSize: "12px" }}> DD/MM/YYYY </span>
                <div>
                  <button>Summary</button>
                </div>
              </center>
            </div> */}
        {/* meeting 4 */}
        {/* <div className='MLmeeting-card2'>
              <center>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <FaCalendar
                    style={{
                      paddingRight: "10px",
                      color: "white",
                      fontSize: "30px",
                    }}
                  />

                  <h3>Meeting 1</h3>
                </div>
                <span style={{ fontSize: "12px" }}> DD/MM/YYYY </span>
                <div>
                  <button>Summary</button>
                </div>
              </center>
            </div> */}
        {/* meeting 5 */}
        {/* <div className='MLmeeting-card2'>
              <center>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <FaCalendar
                    style={{
                      paddingRight: "10px",
                      color: "white",
                      fontSize: "30px",
                    }}
                  />

                  <h3>Meeting 1</h3>
                </div>
                <span style={{ fontSize: "12px" }}> DD/MM/YYYY </span>
                <div>
                  <button>Summary</button>
                </div>
              </center>
            </div> */}
      </div>
         {showStartPopup && <div className='backdrop'></div>}
         {showAssignPopup && <div className='backdrop'></div>}

    </div>
    // </div>
    // </div>
  );
}

export default MeetingList;
