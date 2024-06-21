import React, { useContext, useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import moment from "moment-timezone";
import { SocketContext } from "./SocketConnection";

const timeZone = "Etc/GMT";

const Notification = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Set the initial notification count
  const [notifications, setNotifications] = useState<any>();
  const [unReadNotifications, setUnReadNotifications] = useState<any>();
  const { socket } = useContext(SocketContext);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setNotificationCount(0); // Reset notification count when dropdown is opened
    socket.emit("view-notifications");
  };

  useEffect(() => {
    socket.on("notification", async (data: any) => {
      console.log("gggggggggggggggggggg", data);
      socket.emit("get-notification");
    });
    socket.emit("get-notification");
    socket.on("notificationlist", async (data: any) => {
      console.log(data.notifications);
      console.log(data.unreadnotifications);
      setNotifications(data.notifications);
      setUnReadNotifications(data.unreadnotifications);
      setNotificationCount(data.unreadnotifications.legnth);
    });
  }, []);

  useEffect(() => {
    // console.log(notifications.length);
    unReadNotifications && setNotificationCount(unReadNotifications.length);
  }, [notifications]);

  // const viewNotifications = () => {

  // }

  return (
    <div
      style={{
        position: "absolute",
        color: "black",
        right: 0,
        top: 0,
        margin: "40px",
      }}
    >
      <button
        style={{
          padding: "10px",
          backgroundColor: "lightgrey",
          borderRadius: "50%",
          cursor: "pointer",
          width: "50px",
          height: "50px",
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'

        }}
        onClick={toggleDropdown}
      >
        <FaBell style={{ width: "20px", height: "20px", color: 'white' }} />{" "}
        {notificationCount > 0 && (
          <span
            style={{
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 8px",
              marginLeft: "20px",
            }}
          >
            {notificationCount}
          </span>
        )}
      </button>
      {showDropdown && notifications && (
        <div
        id="dropdown"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            width: "400px",
            height: '80vh',
            overflow: 'auto',
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            zIndex: 999,
            
          }}
        >
          {/* Display notifications here
          <div
            style={{ padding: "10px", cursor: "pointer" }}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.backgroundColor = "lightgrey";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.backgroundColor = "#fff"; // Reset background color on mouse leave
            }}
          >
            Notification 1
          </div>
          <div
            style={{ padding: "10px", cursor: "pointer" }}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.backgroundColor = "lightgrey";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.backgroundColor = "#fff"; // Reset background color on mouse leave
            }}
          >
            Notification 2
          </div>
          <div
            style={{ padding: "10px", cursor: "pointer" }}
            onMouseEnter={(e) => {
              (e.target as HTMLDivElement).style.backgroundColor = "lightgrey";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLDivElement).style.backgroundColor = "#fff"; // Reset background color on mouse leave
            }}
          >
            Notification 3
          </div> */}
          {/* Display notifications here */}
          {notifications.map((notification: any, index: any) => (
            <div style={{backgroundColor: !notification.view ? "#4f04ff21" : "#fff"}}>
            <div
              key={index}
              style={{ padding: "10px", cursor: "pointer", marginTop: '10px', marginBottom: '10px',
              wordWrap:'break-word'
            }}
              onMouseEnter={(e) => {
                (e.target as HTMLDivElement).style.backgroundColor =
                  "lightgrey";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLDivElement).style.backgroundColor = "#fff"; // Reset background color on mouse leave
              }}
              onClick={() => {
                socket.emit("read-notification", {
                  notificationID: notification._id,
                });
              }}
            >
              {notification.message}
              <p style={{color: 'lightgrey', fontSize: '10px', float: 'right', marginBottom: '10px'}}>
                {moment.tz(notification.timestamp, timeZone).format("h:mm A ")}
                <br />
                {moment.tz(notification.timestamp, timeZone).format("DD/MM/YYYY ")}

              </p>
              </div>
              <hr style={{color: 'grey', width: '90%'}}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
