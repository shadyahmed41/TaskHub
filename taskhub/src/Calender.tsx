import React, { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import "./css/Calender.css";
import Schedule from "./Schedule";
import Modal from "react-modal";
import axios from "axios";
import moment from "moment-timezone";
import { FaArrowLeft, FaArrowRight, FaCalendar, FaTrash } from "react-icons/fa";
import { To, useNavigate } from "react-router-dom";
import NavBarBig from "./NavBarBig";
import { useIsFocusVisible } from "@mui/material";
import NavBarCurrent from "./NavBarCurrent";
import Loading from "./Loading";
// import NavBarCurrent from "./NavBarCurrent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const timeZone = "Etc/GMT";

interface ScheduleData {
  _id: string;
  title: string;
  date: string;
  time: string;
  projectId: string;
}

interface Task {
  text: string;
  notes: string;
}

Modal.setAppElement("#root"); // Set the root element for accessibility

function Calender() {
  const navigate = useNavigate();

  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [assignedSchedules, setAssignedSchedules] = useState<ScheduleData[]>([]);
  const [assignedSchedulesforday, setAssignedSchedulesforday] = useState<ScheduleData[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [event, setevent] = useState(false); 


  const [eventsUpdated, setEventsUpdated] = useState(false);

  const token = sessionStorage.getItem("userID");

  useEffect(() => {
    // Fetch user profile data when the component mounts
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      viewEvents();
    }
  }, [token, navigate]);

  const generateCalendarDates = () => {
    const startOfMonthDate = startOfMonth(currentMonth);
    const endOfMonthDate = endOfMonth(currentMonth);
    const daysOfMonth = eachDayOfInterval({
      start: startOfMonthDate,
      end: endOfMonthDate,
    });

    const datesWithEvents = new Set(assignedSchedules.map(schedule => format(new Date(new Date(schedule.date).getTime() - 3 * 60 * 60 * 1000), 'yyyy-MM-dd')));

    return daysOfMonth.map((date) => ({
      date,
      isCurrentMonth: isSameMonth(date, currentMonth),
      isToday: isToday(date),
      hasEvents: datesWithEvents.has(format(date, 'yyyy-MM-dd')), // Check if the date has events
    }));
  };




  const nextMonth = () => {
    setCurrentMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1)
    );
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setIsEventsModalOpen(true);
    fetchEventsForDay(date);
    console.log("Selected Day:", date);
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
        setevent(true);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        // alert("Failed to fetch events. Please try again later.");
      });
  };

  const fetchEventsForDay = (date: Date) => {
    const projectId = sessionStorage.getItem("projectID");
    const formattedDate = format(date, "yyyy-MM-dd");

    axios
      .get(
        `${import.meta.env.VITE_EVENT_API
        }/geteventbyday/${projectId}/${formattedDate}`,
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        const utcSchedules = response.data.map((schedule: ScheduleData) => ({
          ...schedule,
          // date: moment.utc(schedule.date).toDate(),
          date: schedule.date,
        }));

        setAssignedSchedulesforday(response.data);
        console.log(response.data);
        console.log("DS", utcSchedules);

      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        // alert("Failed to fetch events. Please try again later.");
      });
  };

  const deleteEvent = (eventId: string, projectId: string) => {
    const token = sessionStorage.getItem("userID");
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
        toast.success("Event deleted successfully");
        fetchEventsForDay(selectedDay!);
        viewEvents();
        setEventsUpdated(true); // Trigger re-render by setting eventsUpdated to true
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        // alert("Failed to delete event. Please try again later.");
      });
  };
  const handleScheduleModalClose = () => {
    setIsScheduleModalOpen(false);
  };

  const handleEventsModalClose = () => {
    setIsEventsModalOpen(false);
  };

  const handleAssign = (scheduleData: ScheduleData) => {
    setAssignedSchedules([...assignedSchedules, scheduleData]);
    setIsScheduleModalOpen(false);
  };

  // const handleDeleteEvent = (index: number) => {
  //   const updatedSchedules = [...assignedSchedules];
  //   updatedSchedules.splice(index, 1);
  //   setAssignedSchedules(updatedSchedules);
  // };

  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, { text: newTask, notes: "" }]);
      setNewTask("");
    }
  };



  const calendarDates = generateCalendarDates();
  const [loading, setLoading] = useState(true);


  return (
    <div>
      <div>
        <NavBarBig />
        {/* current */}
        <div style={{ position: 'absolute', top: '400px' }}>
          <NavBarCurrent icon={<FaCalendar />} text="Calendar" click="/calendar"></NavBarCurrent>
        </div>
        {/* end of current */}
      </div>

      <div className="calender-main" style={{ width: '85vw', height: '100%', position: 'fixed', overflow: 'hidden' }}>
      <ToastContainer style={{zIndex: 5}}/>
        {/* LEFT */}
        <div className="calender-left" style={{ color: 'black', height: '100vh' }}>
          <center>
            <h2 style={{ color: "rgb(38, 38, 101)", fontSize: "35px" }}>
              {format(new Date(), "d MMMM , yyyy")}
            </h2>
          </center>
          <center>
            <div style={{ display: "flex", position: "relative", paddingLeft: "50px" }}>
              <h2 style={{ color: 'rgb(38, 38, 101)', fontSize: '30px' }}>Events</h2>
              <button
                className="addeventbtn"
                onClick={() => {
                  addTask();
                  setIsScheduleModalOpen(true);
                }}
                style={{ width: '120px', margin: '25px' }}
              >
                + <span style={{ marginLeft: "5px", fontSize: '15px' }}>Add Event</span>
              </button>
            </div>
            <div className="schedulelist" style={{ border: 'none', marginTop: 0, height: '64vh', overflow: 'auto' }}>
              
                
              <div style={{ marginTop: '0', position: 'relative' }}>
                {loading && <div style={{position: 'absolute', top: '150px', left: '250px'}}><Loading nonavbar={"no"}/></div>}
                {!event && !loading ? (
                  <p style={{ color: 'grey' }}>No events yet</p>
                ) : (
                  // div of events
                  <div style={{ backgroundColor: 'transparent', width: '350px', minHeight: '30px', overflow: 'auto' }}>
                    {assignedSchedules.map((schedule, index) => (
                      // each event
                      <div style={{ display: 'flex', textAlign: 'left', backgroundColor: 'rgb(231, 229, 229)', minHeight: '50px', height: 'fit-content', padding: '0px 20px', borderRadius: '20px', marginTop: '0', position: 'relative', wordWrap: 'break-word', maxWidth: '300px', overflow: 'hidden' }} key={index}>
                        <div>
                          {/* event name */}
                          <p style={{ fontSize: '15px', color: 'black', wordWrap: 'break-word' }}>
                            {schedule.title}
                          </p>

                          {/*event date  */}
                          <p style={{ fontSize: '10px', color: 'grey' }}>
                            {moment.tz(schedule.date, timeZone).format("MMMM D, YYYY h:mm A")}
                          </p>
                        </div>
                        {/* delete */}
                        <div style={{ position: 'absolute', right: '20px', top: '40px' }}>
                          <FaTrash style={{ color: "rgb(38, 38, 101)", cursor: 'pointer', marginLeft: '10px' }}
                            onClick={() => deleteEvent(schedule._id, schedule.projectId)} />
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </center>

        </div>
        {/* RIGHT */}
        {/* CALENDAR */}
        <div className="calendar-container" style={{margin: '0'}}>
          <h1 style={{ color: "white" }}>Calendar</h1>
          <div>
            <button className="calendarbtn" onClick={prevMonth}>
              <FaArrowLeft /> Previous Month
            </button>
            <span className="calender-SpanStyle">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button onClick={nextMonth} className="calendarbtn">
              Next Month <FaArrowRight />
            </button>
          </div>
          <div className="calendar" style={{height: '70vh'}}>
            {calendarDates.map(({ date, isCurrentMonth, isToday, hasEvents }) => (
              <div
              key={date.toString()}
              className={`calender-day ${isCurrentMonth ? "current-month" : "other-month"
            } ${isToday ? "calender-today" : ""} ${hasEvents ? "has-events" : "" // Apply yellow color if hasEvents is true
          }`}
          onClick={() => {handleDayClick(date); console.log("events for: ", date);
                }}
              >
                {format(date, "d")}
              </div>
            ))}
          </div>
        </div>
        </div>

        {isEventsModalOpen &&
        <div className="schedulepopupday">
          <h3 style={{ color: 'purple' }}>Events on this day</h3><hr/><br/>
<center>
          {assignedSchedulesforday.length === 0 ? (
            <p style={{ color: 'grey', fontSize: '15px' }}>No events on this day</p>
          ) : (
            <ul>
              {assignedSchedulesforday
                // .filter(
                //   (schedule) =>
                //     format(new Date(schedule.date), "MMMM d, yyyy") ===
                //     format(selectedDay!,"MMMM d, yyyy")
                // )
                .map((schedule, index) => (
                  <li style={{ color: "black", fontSize: '15px', marginRight: '20px' }} key={index}>
                    {`${schedule.title} - ${moment
                      .tz(schedule.date, timeZone)
                      .format("MMMM D, YYYY h:mm A")}`}
                  </li>
                ))}
            </ul>
          )
          }
          <br/>
          <button className="closebutton" type="button" onClick={() => {setIsEventsModalOpen(false)}}
              >Cancel</button>
              </center>
        </div>
}
        <Schedule
                isOpen={isScheduleModalOpen}
                onRequestClose={handleScheduleModalClose}
                onAssign={handleAssign}
                setIsScheduleModalOpen={setIsScheduleModalOpen}
                eventsUpdated={eventsUpdated}                
                />
                { isScheduleModalOpen && <div className='backdrop' style={{zIndex: 3}}></div>}
                { isEventsModalOpen && <div className='backdrop' style={{zIndex: 3}}></div>}

    </div>

  );
}

export default Calender;