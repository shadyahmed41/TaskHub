import "./css/dashboard.css";
import React, { useEffect, useState } from "react";
import logo from "./pics/TaskHublogo.png";
import {
  FaCalendar,
  FaChartBar,
  FaDoorClosed,
  FaDoorOpen,
  FaFile,
  FaFireExtinguisher,
  FaHandsHelping,
  FaHireAHelper,
  FaHome,
  FaInfo,
  FaPhone,
  FaQuestion,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { FaMessage, FaQ, FaUserGroup } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

function NavBarBig() {
  const navigate = useNavigate();
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [details, setDetails] = useState("");
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const projectId = sessionStorage.getItem("projectID");

  const token = sessionStorage.getItem("userID");

  useEffect(() => {
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
  }, [])

  return (
    <div>
    <Header/>


    <div className="navbar">
      <img
        src={logo}
        style={{ margin: "30px", width: "80px", height: "80px" }}
      />

      <div
        className="navcontent"
        onClick={() => {
          navigate("/homepage");
        }}
      >
        <FaHome className="navicons" />
        Home
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        <FaHome className="navicons" />
        Dashboard
      </div>

      <div
        className="navcontent"
        onClick={() => {
          if (projectLeader && currentUser) {
            projectLeader && currentUser && projectLeader === currentUser ? navigate("/taskleader") : navigate("/taskmembers");
          }
        }}
        
        >
        <FaFile className="navicons" />
        Tasks
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/chat");
        }}
      >
        <FaMessage className="navicons" />
        Chats
      </div>

      <div className="navcontent"
      onClick={() => {
        navigate("/meetinglist");
      }}>
        <FaPhone className="navicons" />
        Meetings
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/gantt");
        }}
      >
        <FaChartBar className="navicons" />
        GANTT Chart
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/calender");
        }}
      >
        <FaCalendar className="navicons" />
        Calendar
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/members");
        }}
      >
        <FaUserGroup className="navicons" />
        Members
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/description");
        }}
      >
        <FaHome className="navicons" />
         This Project
      </div>

      <div
        className="navcontent"
        onClick={() => {
          navigate("/profilepage");
        }}
      >
        <FaUser className="navicons" />
        Profile
      </div>

      <div
        className="navcontent"
        onClick={() => {
          setShowLogoutPopup(true);
          console.log(showLogoutPopup);
        }}
      >
        <FaSignOutAlt className="navicons" />
        Sign out
      </div>
    </div>
      {showLogoutPopup && (
        <div className="popuprequests" >
          <center>
            <FaSignOutAlt
              style={{ color: "black", width: "40px", height: "40px" }}
            />
            <h4 style={{ color: "black" }}>Are you sure you want to Sign Out?</h4><br/>
            <button
             className="signoutbtn"
              onClick={() => {
                setShowLogoutPopup(false);
                navigate("/");
                sessionStorage.removeItem("userID");
                sessionStorage.removeItem("expire");
              }}
            >
              Sign Out
            </button>
            <button onClick={() => setShowLogoutPopup(false)} className="buttoncancel">Close</button>
          </center>
        </div>
      )}
    {showLogoutPopup && <div className='backdrop' ></div>}

    </div>
  );
}

export default NavBarBig;
