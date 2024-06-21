import React, { useEffect, useState, useRef, useContext } from "react";
import "./css/Calender.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Contacts from "./Contacts";
import ChatContainer from "./ChatContainer";
import styled from "styled-components";
import { io } from "socket.io-client";
import NavBarBig from "./NavBarBig";
import { SocketContext } from "./SocketConnection";
import { FaMessage } from "react-icons/fa6";
import NavBarCurrent from "./NavBarCurrent";
import Loading from "./Loading";

const ChatPage = () => {
  // const socket = useRef();
  // const socket = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const [contacts, setcontacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState<any>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderdata, setleaderdata] = useState<any>([]);
  const [groupdata, setgroupdata] = useState<any>(undefined);
  const [loading, setLoading] = useState(false);
  
  const token = sessionStorage.getItem("userID");
  const projectId = sessionStorage.getItem("projectID");

  const { socket } = useContext(SocketContext)

  // const HOST = "http://localhost:5173";
  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      getallusers();
      // fetchProjectsForLeader();
      // fetchProjectsForMember();
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      // socket.current = io("http://localhost:3000");
      
      socket.emit("add-user", currentUser._id);
      socket.on("connect_error", (error: any) => {
        console.error("Socket connection error:", error);
      });
      console.log("Socket connected:", socket.connected);
    }
  }, [currentUser]);

  // useEffect(() => {
  //   if (currentUser) {
  //     socket.current = io(HOST);
  //     socket.current.on("connect", () => {
  //       console.log("Connected to server");
  //     });
  //     socket.current.on("disconnect", () => {
  //       console.log("Disconnected from server");
  //     });
  //     socket.current.emit("add-user", currentUser._id);
  //   }
  // }, [currentUser]);

  const getallusers = () => {
    axios
      .post(
        `${import.meta.env.VITE_USER_API}/getAllUsers`,
        { projectId },
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        setCurrentUser(response.data.currentUser);
        setgroupdata(response.data.groupData);
        console.log(response.data.groupData);

        setleaderdata(response.data.leaderData);
        setcontacts(response.data.members);
      setIsLoaded(true);

      })
      .catch((error) => {
        console.error("Error getting users", error);
        return null;
      });
  };

  const handleChatChange = (chat: any) => {
    setCurrentChat(chat);
  };

  // Log the state variables after setting them
  // useEffect(() => {
  //   console.log("currentUser:", currentUser);
  //   console.log("contacts:", contacts);
  // }, [currentUser, contacts]);




  
  return (
    <div className="dashboard" style={{ display: "flex" }}>
    <div>
      <NavBarBig />
      {/* current */}
      <div style={{position: 'absolute',top:'250px'}}>
          <NavBarCurrent icon={<FaMessage/>} text="Chats" click="/chat"></NavBarCurrent>
         </div>
      {/* end of current */}
    </div>
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div className="main" style={{ width: '85.7vw'}} >
      <Container>
        <div className="container">
          <Contacts
            contacts={contacts}
            leaderData={leaderdata}
            groupData={groupdata}
            changeChat={handleChatChange}
            currentUser={currentUser}
            setLoading={setLoading}
          />
          {!isLoaded && currentChat === undefined ? (
            <Loading/>
          ) : (
            // <div style={{zIndex: 1, marginLeft: '650px', width: '1100px', height: '700px'}}>
            <ChatContainer
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
            loading={loading}
            setLoading={setLoading}
            />
            // </div>
          )}
          </div>
          </Container>
    </div>
    </div>
    </div>
  );
};

const Container = styled.div`
  height: 100vh;
  width: fit-content;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  overflow: hidden;
  position: fixed;
  align-items: center;
  background-color: rgb(231, 229, 229);
  .container {
    margin: 0;
    height: 95vh;
    width: 100vw ;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

const spinKeyframes = `
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Append keyframes to head
const styleElement = document.createElement('style');
styleElement.innerHTML = spinKeyframes;
document.head.appendChild(styleElement);
export default ChatPage;
