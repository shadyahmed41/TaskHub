import React, { useState, useEffect } from "react";
import "./css/MeetingSummary.css";
import NavBarBig from "./NavBarBig";
import axios from "axios";
import { To, useNavigate, useParams } from "react-router-dom";
import { FaPhone, FaTrash, FaUserCircle, FaEdit, FaSave, FaTimes, FaPen, FaReply } from "react-icons/fa";
import NavBarCurrent from "./NavBarCurrent";
import Header from "./Header";
import moment from "moment-timezone";

function MeetingSummary() {
  const timeZone = "Etc/GMT";
  const navigate = useNavigate();
  const [showParticipants, setShowParticipants] = useState<any>(false);
  const [participants, setParticipants] = useState<any>([]);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editKId, setEditKId] = useState("");
  const [keyPoints, setKeyPoints] = useState<any>([]);
  const [originalKeyPoints, setOriginalKeyPoints] = useState<any>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [newOutcome, setNewOutcome] = useState<{ [keypointId: string]: string }>({});
  const token = sessionStorage.getItem("userID");
  const { id } = useParams();

  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
        getmeeingSumarry();
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

  const getmeeingSumarry = () => {
    axios
      .get(`${import.meta.env.VITE_MEETING_API}/meetingSummary/${id}`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        console.log("meetings", response.data.meetingsummary);
        setMeetingName(response.data.meetingsummary.title);
        setMeetingDate(response.data.meetingsummary.date);
        setKeyPoints(response.data.meetingsummary.keypoints); // Assuming keypoints is an array
        setParticipants(response.data.meetingsummary.participants); // Assuming participants is an array
        setOriginalKeyPoints(response.data.meetingsummary.keypoints); // Assuming keypoints is an array
      })
      .catch((error) => {
        console.error("Error fetching meetings:", error);
      });
  };

  const updatemeeting = () => {
    axios
      .put(`${import.meta.env.VITE_MEETING_API}/updatemeeting/${id}`, { keypoints: keyPoints }, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        console.log("ok", response.data.message);
        setEditing(!editing);
      })
      .catch((error) => {
        console.error("Error updateing:", error);
      });
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
};

const handleKeyPointChange = (index: any, value: any) => {
  const updatedKeyPoints = [...keyPoints];
  updatedKeyPoints[index] = { ...updatedKeyPoints[index], keypoint: value };
  setKeyPoints(updatedKeyPoints);
};

const handleOutcomeChange = (kIndex: any, oIndex: any, value: any) => {
  const updatedKeyPoints = [...keyPoints];
  updatedKeyPoints[kIndex] = {
    ...updatedKeyPoints[kIndex],
    outcomes: updatedKeyPoints[kIndex].outcomes.map((outcome: any, idx: any) =>
      idx === oIndex ? { ...outcome, outcome: value } : outcome
    )
  };
  setKeyPoints(updatedKeyPoints);
};

  const handleAddKeypoint = async (keypoint: string) => {
    const newKeypointt = {
      keypoint: keypoint,
      outcomes: []
    };
    await axios.post(`${import.meta.env.VITE_MEETING_API}/addkeypoint/${id}`,{keypoint: newKeypointt},{
      headers: {
        Authorization: `UserLoginToken ${token}`,
      },
    })
    .then((response) => {
      // setKeyPoints([...keyPoints, newKeypointt]);
      getmeeingSumarry();
    })
    .catch((err) => {
      console.log(err);
    });
  }

  const handleAddOutcome = async (keypointid: any) => {
    await axios.post(`${import.meta.env.VITE_MEETING_API}/addoutcome/${id}/${keypointid}`,{outcome: newOutcome[keypointid]},{
      headers: {
        Authorization: `UserLoginToken ${token}`,
      },
    })
    .then((response) => {
      // setKeyPoints([...keyPoints, newKeypointt]);
      setNewOutcome(prev => ({...prev, [keypointid]: ''}))
      console.log(response.data.message);
      getmeeingSumarry();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const handletedeletekeypoint = async (keypointid: any) => {
    await axios.delete(`${import.meta.env.VITE_MEETING_API}/deletekeypoint/${id}/${keypointid}`,
      {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        getmeeingSumarry();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handletedeletetoutcome = async (keypointid: any, outcomeid: any) => {
    await axios.delete(`${import.meta.env.VITE_MEETING_API}/deleteoutcome/${id}/${keypointid}/${outcomeid}`,
      {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        getmeeingSumarry();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const downloadMeetingPDF = async () => {
    try {
      // Make a GET request to the backend endpoint that generates the PDF
      const response = await axios.get(`${import.meta.env.VITE_MEETING_API}/getinoice/${id}`, {
        responseType: 'blob', // Set the response type to 'blob' to receive binary data
      });
      
      // Convert the response to a blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and set its attributes
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting_summary.pdf`; // Specify the filename for the downloaded file
      
      // Append the anchor element to the document body and trigger a click event to initiate download
      document.body.appendChild(a);
      a.click();
  
      // Remove the anchor element from the document body
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Handle error
    }
  };


  const projectId = sessionStorage.getItem("projectID");
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const leader = projectLeader === currentUser ;
  const [loading, setLoading] = useState(false);


return (
  <div style={{ display: "flex" }}>
    <div>
      <NavBarBig />

      <div style={{ position: "absolute", top: "300px" }}>
        <NavBarCurrent icon={<FaPhone />} text="Meetings" click="/meetinglist"></NavBarCurrent>
      </div>
    </div>
    <div className="MSmain">
      <h2>Meeting Summary</h2>
      <hr style={{ width: "90%" }} />
      <div className="MSmain2">
        <h3 className="MSmain2text" style={{ fontSize: "25px", height: '40px' }}>
          {meetingName}
        </h3>

        <h5
          className="MSmain2text"
          style={{
            color: "grey",
            position: "absolute",
            right: "50px",
            top: "0px",
          }}
        >
          {moment.tz(meetingDate, timeZone).format("h:mm A, MMMM D")}
        </h5>

        {/* Participant button */}
        <button className="participantButton" onClick={toggleParticipants} >
          Show Participants ({participants.length})
        </button>
        {/* Dropdown for participants */}
        {showParticipants && (
          <div className="dropdown-menu">
            <ul>
              {participants.map((participant: any, index: any) => (
                <li
                  key={index}
                  style={{
                    color: "black",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {participant.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={() => downloadMeetingPDF()}
        className="participantButton"
          style={{position: 'absolute', right: '110px', top: '50px', color: 'darkblue'}}>
          {/* {loading ? 'Downloading...' : 'Download PDF'} */}
          <FaSave style={{marginRight: '10px', color: 'darkblue'}}/>
          Download PDF
        </button>

        {/* KEYPOINTS AND OUTCOMES */}
        <div className="KPO">
          
          {/* titles */}
          <div className="KPOrow" style={{ marginBottom: "0px" }}>
            <div className="KPOtitle">Key Points</div>
            <div className="KPOtitle">Outcomes</div>
          </div>
          {keyPoints.map((kp: any, kIndex: any) => (
            <div key={kIndex} className="KPOrow">
              {projectLeader && currentUser && projectLeader === currentUser &&
                          <FaPen
                            onClick={() => {
                              setEditing(!editing);
                              setEditKId(kp._id);
                            }}
                            style={{ margin: '25px 20px 0 0', cursor: 'pointer', color: "#1c0747"}}
                          />
              }
              
              <div className="KPOcontent" style={{ width: "35%" }}>
                {!editing || editKId !== kp._id ? (
                  <div style={{ display: "flex", position: 'relative', marginTop: '12px', height: '20px' }}>
                    
                    <div>{kp.keypoint}</div>
                    {projectLeader && currentUser && projectLeader === currentUser && 
                    <div style={{position: 'absolute', right: '20px'}}>
                      
                    <FaTrash 
                    onClick={() => handletedeletekeypoint(kp._id)}
                    style={{cursor: 'pointer'}}
                    />
                    </div>
                    }
                  </div>
                ) : (
                  editKId == kp._id && (
                    <input
                      type="text"
                      style={{maxWidth: "300px"}}
                      value={kp.keypoint}
                      onChange={(e) =>
                        handleKeyPointChange(kIndex, e.target.value)
                      }
                    />
                  )
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "50%",
                }}
              >
                {kp.outcomes.map((outcome: any, oIndex: any) => (
                  <div
                    key={oIndex}
                    className="KPOcontent"
                    style={{ width: "100%" }}
                  >
                    
                    {!editing || editKId !== kp._id ? (
                      <div style={{display: "flex", position: 'relative', marginTop: '12px', height: '20px'}}>
                      <div>{outcome.outcome}</div>
                      {projectLeader && currentUser && projectLeader === currentUser &&
                      <FaTrash 
                    onClick={() => handletedeletetoutcome(kp._id, outcome._id)}
                    style={{position: 'absolute', right: '20px', cursor: 'pointer'}}
                    />}
                      </div>
                    ) : (
                      editKId == kp._id && (
                        <input
                          type="text"
                          value={outcome.outcome}
                          onChange={(e) =>
                            handleOutcomeChange(kIndex, oIndex, e.target.value)
                          }
                        />
                      )
                    )}
                  </div>
                ))}
                
                {projectLeader && currentUser && projectLeader === currentUser &&
                <div style={{ display: "flex", width: '34vw' }}>
            <input
              type="text"
              placeholder="write a new outcome"
              value={newOutcome[kp._id] || ""}
              onChange={(e) => setNewOutcome(prev => ({...prev, [kp._id]: e.target.value}))}
              style={{ backgroundColor: "white", color: "grey", borderRadius: '10px', marginRight: '10px' }}
            />
            <FaReply
              onClick={() => {handleAddOutcome(kp._id); setNewOutcome(prev => ({...prev, [kp._id]: ""}))}}
              style={{ color: "black", fontSize: '20px', marginTop: '5px' }}
            />
          </div>
          }
          {projectLeader && currentUser && projectLeader === currentUser && editing && editKId == kp._id && (
            <div>
              <button
                className="save-button"
                onClick={() => updatemeeting()}
                style={{ backgroundColor: "#7d21b3" }}
              >
                save
                {/* <FaSave /> */}
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setEditing(!editing);
                  setKeyPoints(originalKeyPoints);
                }}
                style={{ backgroundColor: "red", margin: "20px" }}
              >
                cancel
                {/* <FaTimes /> */}
              </button>
            </div>
          )}
              </div>
            
            </div>
            
          ))}
          

          {projectLeader && currentUser && projectLeader === currentUser &&
          <div style={{ display: "flex" }}>
            <input
              type="text"
              placeholder="write a new key point"
              value={newKeyPoint || ""}
              onChange={(e) => setNewKeyPoint(e.target.value)}
              style={{ backgroundColor: "white", color: "grey", width: '22vw', borderRadius: '10px', marginRight: '10px', marginLeft: '35px' }}
            />
            <FaReply
              onClick={() => {handleAddKeypoint(newKeyPoint); setNewKeyPoint("")}}
              style={{ color: "black", fontSize: '20px', marginTop: '5px' }}
            />
          </div>
          }
        </div>
        {/* end of KPO */}
      </div>
    </div>
  </div>
);
}

export default MeetingSummary;