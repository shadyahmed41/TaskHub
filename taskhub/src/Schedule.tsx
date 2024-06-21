import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./css/Schedule.css";
import axios from "axios";
import moment from "moment-timezone";
import { FaTrash } from "react-icons/fa";
import { Navigate, To, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const timeZone = "Etc/GMT"; // Define the Greenwich Mean Time (GMT) timezone

interface CustomEvent {
  _id: string;
  title: string;
  date: string;
  time: string;
  projectId: string;
}

interface ScheduleProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAssign: (scheduleData: CustomEvent) => void;
  eventsUpdated: boolean;
  setIsScheduleModalOpen: (state: boolean) => any;
}



Modal.setAppElement("#root"); // Set the root element for accessibility

const ScheduleModal: React.FC<ScheduleProps> = ({
  isOpen,
  onRequestClose,
  onAssign,
  setIsScheduleModalOpen,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [assignedSchedules, setAssignedSchedules] = useState<CustomEvent[]>([]);
  
  const navigate = useNavigate();
  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };

  const token = sessionStorage.getItem("userID");

  useEffect(() => {
    // Fetch user profile data when the component mounts
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
    viewEvents(); // Fetch events when the component mounts
    }
  }, [token, navigate]);

  const handleAssign = () => {
    axios
      .post(
        `${import.meta.env.VITE_EVENT_API}/addevent`,
        {
          date,
          title,
          projectId: sessionStorage.getItem("projectID"),
          time,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then(() => {
        onAssign({ _id: "", title, date, time, projectId: "" });        
        viewEvents();
        onRequestClose();
        toast.success("Event added successfully");
      })
      .catch((error) => {
        console.error("Error adding event:", error);
        toast.error("Failed to add event. Please try again later.");
      });
  };

  const viewEvents = () => {
    axios
      .get(
        `${import.meta.env.VITE_EVENT_API}/viewevent/${sessionStorage.getItem(
          "projectID"
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Response from viewevent sche:", response.data); // Log response data
        setAssignedSchedules(response.data); // Set assignedSchedules state here
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        // alert("Failed to fetch events. Please try again later.");
      });
  };

  const deleteEvent = (eventId: string, projectId: string) => {
    axios
      .delete(
        `${import.meta.env.VITE_EVENT_API}/deleteevent/${eventId}/${projectId}`,
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then(() => {
        viewEvents();
        toast.success("Event deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event. Please try again later.");
      });
  };

  return (
    <div >
      <div>
        {/* <ToastContainer /> */}
      
          {isOpen && (
            <div className="Schedulepopup">
              <center>
              <h2 style={{marginRight:"280px"}}>Schedule</h2>
              <div className="Scline"></div>
            </center>
            
            <div style={{paddingLeft: '50px', paddingRight: '50px'}}>
              <p style={{color:"black"}}>Title:</p>
              <input
              style={{width: '280px'}}
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            <div style={{display: 'flex'}}>
            <div>
              <p style={{color:"black"}} >Date:</p>
              <input
              style={{width: '120px', marginRight:'20px'}}
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <p style={{color:"black"}}>Time:</p>
              <input
                style={{width: '120px'}}
                type='time'
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            </div>
            <center>
              <button className='schedulebtn' onClick={handleAssign}>
                Assign
              </button>
              <button className="closebutton popupbutton" type="button" onClick={() => {setIsScheduleModalOpen(false)}}
              >Cancel</button>
            </center>
            </div>
            </div>
            )}
      </div>

    </div>
  );
};

export default ScheduleModal;
