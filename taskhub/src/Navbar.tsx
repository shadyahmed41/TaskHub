import './css/dashboard.css'
import React, { useState } from 'react'
import logo from './pics/TaskHublogo.png'
import { FaDoorClosed, FaDoorOpen, FaFireExtinguisher, FaHandsHelping, FaHireAHelper, FaHome, FaInfo, FaPhone, FaPhoneAlt, FaQuestion, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { FaQ } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';


function Navbar(){
    const navigate = useNavigate();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);


    return(
        <div className='navbar' style={{fontSize: '15px'}}>
            <img src={logo} style={{margin: "30px", width: "80px", height: "80px"}}/>
            <div className='navcontent'
            onClick={() => {
                navigate("/homepage");
              }} >
                <FaHome className='navicons'/>
                  Home
            </div>
            <div className='navcontent'
            onClick={() => {
                navigate("/profilepage?source=outside");
              }}>
                <FaUser className='navicons'/>Profile
            </div>
            <div className='navcontent'
            onClick={() => {
                navigate("/about");
              }}>
                <FaInfo className='navicons'/>About
                </div>
            <div className='navcontent'
            onClick={() => {
                navigate("/help");
              }}>
                <FaQuestion className='navicons'/>Help</div>

                <div className='navcontent'
            onClick={() => {
                navigate("/contact");
              }}>
                <FaPhoneAlt className='navicons'/>Contact Us</div>

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
      {showLogoutPopup && (
        <div className="popuprequests">
          <center>
            <FaSignOutAlt
              style={{ color: "black", width: "40px", height: "40px" }}
            />
            <h3 style={{ color: "red" }}>Are you sure you want to Sign Out?</h3>
            <button
              onClick={() => {
                setShowLogoutPopup(false);
                navigate("/");
                sessionStorage.removeItem("userID");
                sessionStorage.removeItem("expire");
                sessionStorage.removeItem("Admin");
              }}
            >
              Sign Out
            </button>
            <button onClick={() => setShowLogoutPopup(false)}>Close</button>
          </center>
        </div>
      )}
        </div>
    );
}

export default Navbar