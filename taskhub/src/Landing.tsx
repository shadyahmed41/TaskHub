import "./css/Landing.css";
import { To, useNavigate } from "react-router-dom";
import { FaUserPlus, FaUser } from "react-icons/fa";
import taskhub from "./pics/Task Hub.png";
import React, { useState } from "react";
import min from "./pics/plain-text.png";
import com from "./pics/communication.png";
import mini from "./pics/more.png";
import mini2 from "./pics/minimum.png";
import dash from "./pics/dashboard.jpg";
import home from "./pics/homepage.jpg";
import chat from "./pics/chat.jpg";
import meetinglist from "./pics/KPO.jpg";
import tasks from "./pics/taskleader.jpg";
import gantt from "./pics/gant.jpg"
import rank from "./pics/ranking.png"
import free from "./pics/free.png"
import calendar from "./pics/calendar.jpg"
import meetingkpo from "./pics/KPOinCall.jpg"
import unlimited from "./pics/infinity.png"

function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="boxcontainsdes" style={{ top: "0%"}}>
        <div className="top-centerlanding ">
          <button
            className="signinbtn"
            onClick={() => navigate("/signup")}
          >
             Sign Up
          </button>
          <button
            className="signinbtn"
            
            onClick={() => navigate("/signin")}
          >
             Sign In
          </button>
          
        
          
        </div>

        <div className="textss" style={{ paddingLeft: "50px" }}>
          <h1
            style={{
              color: "rgb(14,13,56)",
              fontSize: "45px",
              margin: "0px",
              fontWeight: "normal",
            }}
          >
            {" "}
            Manage Your project{" "}
          </h1>
          {/* <span className="highlight" style={{color:"purple",fontSize:"45px",margin:"0px",fontWeight:"bolder"}}> Project with</span> */}
          <h1 style={{ margin: "0px" }}>
            <span
              style={{
                color: "rgb(14,13,56)",
                fontSize: "45px",
                margin: "0px",
                fontWeight: "normal",
                marginRight: "10px",
                marginTop: "0px",
              }}
            >
              {" "}
              with
            </span>
            <span
              style={{ color: "purple", margin: "0px", fontStyle: "typewr" }}
            >
              TaskHub
            </span>
          </h1>
          <p style={{ paddingBottom: "0px", color: "rgb(14,13,56)" }}>
            your one-stop solution for efficient project management{" "}
          </p>
          <p style={{ paddingBottom: "0px", color: "rgb(14,13,56)" }}>
            and seamless team collaboration.
          </p>

          <button
            style={{
              borderRadius: "20px",
              fontSize: "15px",
              marginLeft: '80px',
              marginTop: '30px',
              backgroundColor: "rgb(14,13,56)",
              width: "200px",
              height: "50px",
            }}
            onClick={() => navigate("/signup")}          >
            Try it now
          </button>
        </div>
      </div>

      <div style={{height: '4000px'}}></div>

      <div
        className="landingcontainerall"
        style={{ position: "absolute", marginTop: "70px" }}
      >
        <h2 style={{ textAlign: "center" }}>Why are we different?</h2>

        <div
          className="landingbox-container"
          style={{ position: "absolute", marginTop: "30px" }}
        >
          <div className="landingbox one">
            <img
              src={min}
              style={{
                maxWidth: "40px",
                maxHeight: "40px",
                paddingTop: "20px",
                paddingLeft: "130px",
              }}
            />
            <h3 style={{ color: "black", paddingLeft: "90px" }}>
              Made simple!
            </h3>
            <p
              style={{
                color: "black",
               
                paddingTop: "0px",
                marginTop: "0px",
                paddingLeft:"20px",
              }}
            >
              {" "}
              The most minimalist user interface to keep everything organized
              and simple
            </p>
          </div>
          <div className="landingbox two">
            <img
              src={com}
              style={{
                maxWidth: "40px",
                maxHeight: "40px",
                paddingTop: "20px",
                paddingLeft: "130px",
              }}
            />
            <h3 style={{ color: "black", paddingLeft: "55px" }}>
              communication is key!
            </h3>
            <p style={{ color: "black", padding: "8px", marginTop: "0px" ,paddingLeft:"20px"}}>
              communicate with your team through chats, meetings, and posts.
            </p>
          </div>
          <div className="landingbox three">
            <img
              src={rank}
              style={{
                maxWidth: "40px",
                maxHeight: "40px",
                paddingTop: "20px",
                paddingLeft: "130px",
              }}
            />
            <h3 style={{ color: "black", paddingLeft: "55px" }}>
              It can be competitive!
            </h3>
            <p style={{ color: "black", padding: "8px", marginTop: "0px" ,paddingLeft:"20px"}}>
              Knowing how much work your team have accomplished could motivate you! .
            </p>
          </div>
          <div className="landingbox four">
            <img
              src={free}
              style={{
                maxWidth: "40px",
                maxHeight: "40px",
                paddingTop: "20px",
                paddingLeft: "130px",
              }}
            />
            <h3 style={{ color: "black", paddingLeft: "75px" }}>
              Completely free!
            </h3>
            <p style={{ color: "black", padding: "8px", marginTop: "0px",paddingLeft:"20px" }}>
              No need to worry about expensive plans and limited access.
            </p>
          </div>
        </div>
      </div>

      <div className="landingthirdpart" style={{ display: "flex", marginTop: "30px" }}>
        <div className="leftside" style={{ paddingLeft: "100px" }}>
          <h3
            style={{
              color: "black",
              fontFamily: "sans-serif",
              fontWeight: "lighter",
              marginLeft: "40px",
              fontSize: "36px",
            }}
          >
            Benefits of working with TaskHub
          </h3>

          <ul className="landinglist-container">
            <li
              className="landinglist-item"
              style={{ paddingBottom: "20px", display: "flex" }}
            >
              <img
                src={mini}
                style={{
                  maxWidth: "30px",
                  maxHeight: "30px",
                  marginRight: "15px",
                  marginTop: "8px",
                }}
              />
              <div className="landinglist-content">
                <h2 style={{ color: "black", margin: 0 }}>
                  Fast & Minimal Design
                </h2>
                <p style={{ color: "black" }}>
                  {" "}
                  Easy to understand user interface that will look familiar to
                  all users
                </p>
              </div>
            </li>
            <li
              className="landinglist-item"
              style={{ paddingBottom: "20px", display: "flex" }}
            >
              <img
                src={mini2}
                style={{
                  maxWidth: "30px",
                  maxHeight: "30px",
                  marginRight: "15px",
                  marginTop: "8px",
                }}
              />
              <div className="landinglist-content">
                <h2 style={{ color: "black", margin: 0 }}>
                  Never forget your work
                </h2>
                <p style={{ color: "black" ,paddingRight:"40px"}}>
                  {" "}
                  Calendars and Gantt charts are here to remind you instead of
                  having<br/> to  carry around your notes!
                </p>
                
                 
      
                
              </div>
            </li>
            <li
              className="landinglist-item"
              style={{ paddingBottom: "20px", display: "flex" }}
            >
              <img
                src={unlimited}
                style={{
                  maxWidth: "30px",
                  maxHeight: "30px",
                  marginRight: "15px",
                  marginTop: "8px",
                }}
              />
              <div className="list-content">
                <h2 style={{ color: "black", margin: 0 }}>
                  Unlimited projects
                </h2>
                <p style={{ color: "black" }}>
                {" "}
                 create as many as projects as you want as aleader and join projects <br/> as a member
                 
                 </p>
              </div>
            </li>
            .{" "}
          </ul>
        </div>
        {/* right side of the summary */}
        <div className="rightside">

        <div className="picture-container" style={{ position: 'absolute', width: '50%', height: '60vh',top:"46%" }}>
      <img src={meetingkpo} style={{ position: 'absolute', top: "-150px", left: "200px", zIndex: 1, width: '70%', height: '70%' ,borderRadius:"20px",boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'}} />
      <img src={calendar} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, width: '70%', height: '70%'  ,borderRadius:"20px",boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'}} />
    </div>
        </div>
      </div>

      {/* pink box */}
      <div
        className="landingfunctions"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <h1 style={{ color: "rgb(14,13,56)", textAlign: "center" }}>
          {" "}
          Features
        </h1>
        {/* dunctions itself */}
        <div className="fun1">
          <div className="funexplain" style={{ display: "flex" }}>
            <div className="leftex" style={{ width: "40%" }}>
              <h3
                style={{
                  color: "rgb(14,13,56)",
                  fontFamily: "sans-serif",
                  fontSize: "36px",
                  marginLeft: "50px",
                  marginBottom: "0px",
                }}
              >
                Dashboard
              </h3>
              <li
                className="list-item"
                style={{ paddingBottom: "20px", display: "flex" }}
              >
                <div className="list-content">
                  <h2 style={{ color: "white", margin: 0 }}> </h2>
                  <p
                    style={{
                      color: "grey",
                      fontSize: "20px",
                      marginLeft: "50px",
                    }}
                  >
                    {" "}
                    simple dashboard that display all your projects and specify
                    which project you're the leader of or a member in it
                  </p>
                </div>
              </li>
            </div>

            <div className="rightex">
              <img
                src={dash}
                className="picss"
                style={{
                  maxWidth: "450px",
                  maxHeight: "450px",
                  marginTop: "10px",
                  marginBottom:"10px",
                  marginLeft: "250px",
                 
                }}
              />
            </div>
          </div>
        </div>

        <div className="fun1">
          <div className="funexplain2" style={{ display: "flex" }}>
            <div className="leftex">
              <img
                src={home}
                className="picss"
                style={{
                  maxWidth: "450px",
                  maxHeight: "450px",
                  marginTop: "20px",
                  marginLeft: "20px",
                }}
              />
            </div>
            <div className="rightex">
              <h3
                style={{
                  color: "rgb(14,13,56)",
                  fontFamily: "sans-serif",
                  fontSize: "36px",
                  marginBottom: "0px",
                  marginLeft: "100px",
                }}
              >
                HomePage
              </h3>
              <li
                className="list-item"
                style={{ paddingBottom: "20px", display: "flex" }}
              >
                <div className="list-content">
                  <h2 style={{ color: "white", margin: 0 }}> </h2>
                  <p
                    style={{
                      color: "grey",
                      fontSize: "20px",
                      marginLeft: "100px",
                    }}
                  >
                    {" "}
                    simple homepage that display all your projects and specify
                    which project you're the leader of or a member in it
                  </p>
                </div>
              </li>
            </div>
          </div>
        </div>

        <div className="fun1">
          <div className="funexplain2" style={{ display: "flex" }}>
            <div className="leftex" style={{ width: "40%" }}>
              <h3
                style={{
                  color: "rgb(14,13,56)",
                  fontFamily: "sans-serif",
                  fontSize: "36px",
                  marginBottom: "0px",
                  marginLeft: "50px",
                }}
              >
                Tasks
              </h3>
              <li
                className="list-item"
                style={{ paddingBottom: "20px", display: "flex" }}
              >
                <div className="list-content">
                  <h2 style={{ color: "white", margin: 0 }}> </h2>
                  <p
                    style={{
                      color: "grey",
                      fontSize: "20px",
                      marginLeft: "50px",
                    }}
                  >
                    {" "}
                    A place where you can see all your tasks sorted by their progress and due dates
                  </p>
                </div>
              </li>
            </div>
            <div className="rightex">
              <img
                src={tasks}
                className="picss"
                style={{
                  maxWidth: "450px",
                  maxHeight: "450px",
                  marginTop: "20px",
                  marginLeft: "250px",
                  marginBottom: "15px",
                }}
              />
            </div>
          </div>
        </div>
        <div className="fun1">
          <div className="funexplain2" style={{ display: "flex" }}>
            <div className="leftex">
              <img
                src={gantt}
                className="picss"
                style={{
                  maxWidth: "450px",
                  maxHeight: "450px",
                  marginTop: "20px",
                  marginLeft: "20px",
                }}
              />
            </div>
            <div className="rightex">
              <h3
                style={{
                  color: "rgb(14,13,56)",
                  fontFamily: "sans-serif",
                  fontSize: "36px",
                  marginBottom: "0px",
                  marginLeft: "100px",
                }}
              >
               Gantt Charts
              </h3>
              <li
                className="list-item"
                style={{ paddingBottom: "20px", display: "flex" }}
              >
                <div className="list-content">
                  <h2 style={{ color: "white", margin: 0 }}> </h2>
                  <p
                    style={{
                      color: "grey",
                      fontSize: "20px",
                      marginLeft: "100px",
                    }}
                  >
                    {" "}
                    Gantt charts offering clear visualization of project timelines and task dependencies, aiding in efficient 
                    planning and resource allocation, enhancing communication and collaboration by providing a shared, easy-to-understand
                     project overview.






                  </p>
                </div>
              </li>
            </div>
          </div>
        </div>

        <div className="fun1">
          <div className="funexplain2" style={{ display: "flex" }}>
            <div className="leftex" style={{ width: "40%" }}>
              <h3
                style={{
                  color: "rgb(14,13,56)",
                  fontFamily: "sans-serif",
                  fontSize: "36px",
                  marginBottom: "0px",
                  marginLeft: "50px",
                }}
              >
                Chat
              </h3>
              <li
                className="list-item"
                style={{ paddingBottom: "20px", display: "flex" }}
              >
                <div className="list-content">
                  <h2 style={{ color: "white", margin: 0 }}> </h2>
                  <p
                    style={{
                      color: "grey",
                      fontSize: "20px",
                      marginLeft: "50px",
                    }}
                  >
                     {" "}
                    A place where you can communicate with your team freely
                  </p>
                </div>
              </li>
            </div>
            <div className="rightex">
              <img
                src={chat}
                className="picss"
                style={{
                  maxWidth: "450px",
                  maxHeight: "450px",
                  marginTop: "20px",
                  marginLeft: "250px",
                  marginBottom: "15px",
                }}
              />
            </div>
          </div>
        </div>
        <div className="fun1">
          <div className="funexplain2" style={{ display: "flex" }}>
            <div className="leftex">
              <img
                src={meetinglist}
                className="picss"
                style={{
                  maxWidth: "450px",
                  maxHeight: "450px",
                  marginTop: "20px",
                  marginLeft: "20px",
                }}
              />
             
            </div>
            <div className="rightex">
              <h3
                style={{
                  color: "rgb(14,13,56)",
                  fontFamily: "sans-serif",
                  fontSize: "36px",
                  marginBottom: "0px",
                  marginLeft: "100px",
                }}
              >
              Meetings
              </h3>
              <li
                className="list-item"
                style={{ paddingBottom: "20px", display: "flex" }}
              >
                <div className="list-content">
                  <h2 style={{ color: "white", margin: 0 }}> </h2>
                  <p
                    style={{
                      color: "grey",
                      fontSize: "20px",
                      marginLeft: "100px",
                    }}
                  >
                    {" "}
                    Enough with seeking another app to do your online meetings, have your meeting with its key points and outcomes displayed even after the meeting
                  </p>
                </div>
              </li>
            </div>
          </div>
        </div>






      </div>
      <div style={{width: '95vw', alignContent: 'center', justifyContent: 'center', display: 'flex'}}>
      <button
            className="signinbtn"
            onClick={() => navigate("/adminlogin")}
          >
            Sign In as Admin
          </button>
          </div>
    </div>
  );
}

export default Landing;
