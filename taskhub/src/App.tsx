import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ForgotPass from "./ForgotPass";
import ResetPass from "./ResetPass";
import Terms from "./Terms";
import Navbar from "./Navbar";
import Registration from "./Registration";
import Dashboard from "./Dashboard";
import Landing from "./Landing";
import SignUpFinal from "./SignUpFinal";
import VerifyFinal from "./VerifyFinal";
import SignInFinal from "./SignInFinal";
import ProfilePage from "./ProfilePage";
import Description from "./Description";
import Members from "./Members";
import Calender from "./Calender";
import TaskMember from "./TaskMember";
import Task2 from "./Task2";
import HomePage from "./HomePage";
import JoinPage from "./JoinByLink";
import MeetingList from "./MeetingList";
import MeetingSummary from "./MeetingSummary";
import Chat from "./Chat"
import AdminLogin from "./Adminlogin";
import AdminHome from "./AdminHomePage";
import UserAnalysis from "./UserAnalysis";
import ProjectAnalysis from "./ProjectAnalysis";
import Notification from "./Notification";
import NavBarCurrent from "./NavBarCurrent";
import GanttChart from "./GanttChartFinal";
import Header from "./Header";
import MeetingPage from "./MeetingPage";
import Help from "./Help";
// import KPOinCall from "./KPOinCall";
import ContactUs from "./ContactUs";
import About from "./About";

import './css/App.css';

function App() {
  useEffect(() => {
    // Check if token exists in session storage
    const token = sessionStorage.getItem("userID");
    const tokenExpire = sessionStorage.getItem("expire");
    
    if (token && tokenExpire !== null) {
        const currentTime = new Date().getTime(); // Current time in milliseconds
        const tokenExpiration = new Date(tokenExpire).getTime(); // Convert to milliseconds

      if (currentTime > tokenExpiration) {
        // Token has expired, remove it from session storage
        sessionStorage.removeItem("userID");
        sessionStorage.removeItem("expire");
        console.log("Token expired");
        // Redirect to the login page
      } else {
        console.log("Token still valid");
        // Token is still valid, proceed with your application logic
      }
    }
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/joinrequest/")) {
      setIsModalOpen(true);
    }
  }, [location]);

  const closeModal = () => {
    setIsModalOpen(false);
    navigate(-1); // Go back to the previous page
  };

  return (
    <div>
      {/* <Router> */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUpFinal />} />
          <Route path="/signin" element={<SignInFinal />} />
          <Route path="/forgotpass" element={<ForgotPass />} />
          <Route path="/resetpass" element={<ResetPass />} />
          <Route path="/verify" element={<VerifyFinal />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profilepage" element={<ProfilePage />} />
          <Route path="/description" element={<Description />} />
          <Route path="/members" element={<Members />} />
          <Route path="/calender" element={<Calender />} />
          <Route path="/taskmembers" element={<TaskMember />} />
          <Route path="/taskleader" element={<Task2 />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/joinrequest/:code" element={<JoinPage isOpen={isModalOpen} onRequestClose={closeModal} />}  />
          <Route path="/meetinglist" element={<MeetingList />} />
          <Route path="/chat" element={<Chat />}/>
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/useranalysis" element={<UserAnalysis />} />
          <Route path="/projectanalysis" element={<ProjectAnalysis />} />
          <Route path="/meetingsummary/:id" element={<MeetingSummary/>} />
          <Route path="/notification" element={<Notification/>} />
          <Route path="/gantt" element={<GanttChart/>} />
          <Route path="/header" element={<Header/>} />
          <Route path="/current" element={<NavBarCurrent/>} />
          <Route path="/meeting/:id" element={<MeetingPage />} />
          <Route path="/help" element={<Help />} />
          {/* <Route path="/KPOinCall" element={<KPOinCall />} /> */}
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About/>}/>
        </Routes>
      {/* </Router> */}

      {/* <Landing/> */}

      {/* <Registration/> */}
      {/* <SignUp/> */}
      {/* <SignIn/> */}
      {/* <ForgotPass/> */}
      {/* <ResetPass/> */}
      {/* <Verify/> */}
      {/* <Terms/> */}

      {/* <Navbar/> */}
      {/* <HomePage/> */}
    </div>
  );
}
export default App;
