import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment-timezone";
const timeZone = "Etc/GMT";

export default function ChatContainer({ currentChat, currentUser, socket, loading, setLoading }: any) {
  const [messages, setMessages] = useState<any>([]);
  const [arrivalMessage, setArrivalMessage] = useState<any>(null);
  const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image
  const scrollRef = useRef<any>();
  const projectId = sessionStorage.getItem("projectID");
  const [usersData, setUsersData] = useState<any>();
  

  useEffect(() => {
    const fetchData = async () => {
      if (currentChat) {
        const response = await axios.post(`${import.meta.env.VITE_MSG_API}/getmsg`, {
          from: currentUser._id,
          to: currentChat._id,
          projectId: currentChat._id === projectId ? projectId : null,
        }).catch((error) => {
          console.error("Error fetching messages:", error);
        });

        if (response && response.data) {
          setMessages(response.data.projectedMessages || response.data);
          setUsersData(response.data.userData);
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentChat, currentUser._id, projectId]);

  useEffect(() => {
    socket.on("msg-recieve", (data: any) => {
      console.log("Received message:", data.msg);

      setArrivalMessage({
        fromSelf: false,
        message: data.msg,
        sender: data.from,
        to: data.to
      });
    });
}, []);

useEffect(() => {
  if(currentChat && arrivalMessage && (arrivalMessage.sender == currentChat._id) && arrivalMessage.to != "group"){
    setMessages((prev: any) => [...prev, arrivalMessage]);
  } else if(currentChat && arrivalMessage && arrivalMessage.to == "group" && currentChat._id == projectId) {
    setMessages((prev: any) => [...prev, arrivalMessage]);
  }
  // arrivalMessage && setMessages((prev: any) => [...prev, arrivalMessage]);
}, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log(messages);
  }, [messages]);

  // const handleSendMsg = async (msg) => {
  //   socket.socket.socket.socket.emit("send-msg", { to: currentChat._id, from: currentUser._id, msg });
  //   await axios.post(`${import.meta.env.VITE_MSG_API}/addmsg`, { from: currentUser._id, to: currentChat._id, message: msg });
  //   setMessages((prevMessages) => [...prevMessages, { fromSelf: true, message: msg, sender: currentUser._id }]);
  // };
  const handleSendMsg = async (msg: any) => {
    // socket.socket.emit("send-msg", { to: currentChat._id, from: currentUser._id, msg });
    // await axios.post(${import.meta.env.VITE_MSG_API}/addmsg, { from: currentUser._id, to: currentChat._id, message: msg });
    // setMessages((prevMessages: any) => [...prevMessages, { fromSelf: true, message: msg, sender: currentUser._id }]);
    console.log("Message sent:", msg);

    if (currentChat._id === projectId) {
      const userIds = Object.keys(usersData);
      const filteredUserIds = userIds.filter(
        (userId) => userId !== currentUser._id
      );
      console.log(filteredUserIds);
      console.log(currentUser._id);

      socket.emit("send-msg", {
        to: filteredUserIds,
        from: currentUser._id,
        msg,
      });
    } else {
      socket.emit("send-msg", {
        to: currentChat._id,
        from: currentUser._id,
        msg,
      });
    }

    await axios.post(`${import.meta.env.VITE_MSG_API}/addmsg`, { from: currentUser._id, to: currentChat._id, message: msg });

    setMessages((prevMessages: any) => [...prevMessages, { fromSelf: true, message: msg, sender: currentUser._id }]);
  };

  const handleImageClick = (imageUrl: any) => {
    setEnlargedImage(imageUrl); // Toggle the enlarged image state
  };

  return (
    <>
    {!currentChat && <div style={{width: '80%', height: '100%', color: 'grey', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Choose a chat to display</div>}
      {currentChat && (
        <Container>
          {/* HEADER */}
          <div className="chat-header">
            <div className="user-details" style={{paddingTop: '50px'}}>
              {/* chat's User image */}
              <div className="avatar">
                {currentChat.image && currentChat.image.imageURL ? (
                  <img
                    src={`data:image/jpeg;base64,${currentChat.image.imageURL}`}
                    alt="avatar"
                    style={{ borderRadius: '50%', cursor: 'pointer', width: '40px', height: '40px' }}
                    onClick={() => handleImageClick(`data:image/jpeg;base64,${currentChat.image.imageURL}`)}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} className="avatar-placeholder" style={{width: '25px', height: '25px'}} />
                )}
              </div>
              {/* chat's user name */}
              <div className="username">
                <h3>{currentChat.name}</h3>
              </div>
            </div>
          </div>
          {/* END OF HEADER */}

          {/* Enlarged Image */}
          {enlargedImage && (
            <div className="enlarged-image-overlay" onClick={() => setEnlargedImage(null)}>
              <div className="enlarged-image-container">
                <img src={enlargedImage} alt="enlarged-avatar" style={{objectFit: 'contain'}} />
              </div>
            </div>
          )}
          {/* End of Enlarged Image */}


          {/* CHAT AREA */}
          <div className="chat-messages">
          {!loading && messages.map((message: any, index: any) => {
  const previousSender = index > 0 ? messages[index - 1].sender : null;
  const shouldDisplayUserInfo = message.sender !== previousSender && currentChat._id === projectId;
  const adjustedTime = moment.tz(message.time, timeZone).add(3, 'hours').format("h:mm A");

  return (
    <div ref={scrollRef} key={uuidv4()} style={{ marginBottom: '0' }}>
      <div className={`message ${message.fromSelf ? "sended" : "received"}`} style={{ marginBottom: '0' }}>
      {shouldDisplayUserInfo && !message.fromSelf && (

       <div className="sender-details" style={{ marginRight: '10px' }}>
          {message.sender && usersData && usersData[message.sender] && usersData[message.sender].image && usersData[message.sender].image.imageURL ? (
            <img
              src={`data:image/jpeg;base64,${usersData[message.sender].image.imageURL}`}
              alt="avatar"
              style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              onClick={() => handleImageClick(`data:image/jpeg;base64,${usersData[message.sender].image.imageURL}`)}
            />
          ) : (
            <FontAwesomeIcon icon={faUserCircle} className="avatar-placeholder" style={{width: '50px', height: '50px'}}/>
          )}
        </div>
      )}


        <div style={{ display: 'flex', flexDirection: 'column', margin: 0}}>
          {/* name */}
          <div style={{ marginBottom: '0px'}}>
            {shouldDisplayUserInfo && message.sender && usersData && usersData[message.sender] && usersData[message.sender].name && (
              <span className="sender-name" style={{ paddingLeft: '5px', paddingBottom: 0, marginBottom: 0, right: 0}}>
                {usersData[message.sender].name}
              </span>
            )}
          </div>

          {/* message */}
          <div className="content" style={{ width: 'fit-content', height: 'auto', wordWrap: 'break-word', fontSize: '15px', margin: 0, marginLeft: shouldDisplayUserInfo ? 0  : currentChat._id !== projectId ? 0 : '60px'}}>
            {/* text */}
            <p style={{ marginBottom: 0, width: 'fit-content', maxWidth: '500px', minWidth: (shouldDisplayUserInfo && message.fromSelf && currentChat._id == projectId) ? "90px" : 0}}>{message.message}</p>
            {/* time of text */}
            <p style={{ color: 'grey', float: 'right', fontSize: '10px', padding: 0, marginTop: 0 }}>
              {adjustedTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
})}
 {loading && <div className="loading">
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="ring"></div>
            <div className="loaddingtext">Loading</div>
        </div>}

          </div>
          {/* END OF CHAT AREA */}
          <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  width: 75%;
  background-color:white;
  border-radius:40px;
  margin-left: 30px;
  overflow-y: auto;
  scrollbar-width: none; 
   
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    color:black;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: black;

      .avatar {
        img {
          height: 3rem;
        }
      }

      .username {
        h3 {
          color: black;
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    color:black;

    &::-webkit-scrollbar {
      width: 0.2rem;

      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 500px;
        word-wrap: break-word;
        padding: 1rem;
        padding-top:0;
        padding-bottom:0;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: black;
        margin:0;
      }
    }

    .sended {
      justify-content: flex-end;

      .content {
        background-color: #4f04ff21;
      }
    }

    .received {
      justify-content: flex-start;

      .content {
        background-color: rgb(231, 229, 229);
      }
    }
  }

  /* Enlarged Image Overlay */
  .enlarged-image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;

    .enlarged-image-container {
      max-width: 40%;
      max-height: 80%;
      overflow: hidden;

      img {
        max-width: 80%;
        max-height: 80%;
      }
    }
  }
`;
