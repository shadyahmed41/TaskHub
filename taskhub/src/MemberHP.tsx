import React, { useContext, useEffect, useState } from "react";
import "./css/dashboard.css";
import { FaFile, FaPhone, FaUserCircle } from "react-icons/fa";
import CircularProgress from "./Progress";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { SocketContext } from "./context/SocketContext";

interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  phase: string;
  status: string;
  progress?: number; // Add progress field as optional
  subtasks: any[]; // Assuming subtasks can be any type
}

function MemberHp(props: any) {
  const navigate = useNavigate();

  const { change } = props;

  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [pastTasks, setPastTasks] = useState<Task[]>([]);
  const token = sessionStorage.getItem("userID") || "";
  const projectId = sessionStorage.getItem("projectID") || "";
  const [joinRoomId, setJoinRoomId] = useState('');
  // const {socket, setMyMeets, newMeetType, setNewMeetType} = useContext(SocketContext);

  useEffect(() => {
    fetchTasks();
  }, [change]);
// const handleJoinRoom = async () =>{
//     await socket.emit('join-room', {roomId: joinRoomId});
//     await navigate(`/meet/${joinRoomId}`)
//     // setRoomName('');
//   }
  const fetchTasks = () => {
    axios
      .post(
        `${import.meta.env.VITE_TASK_API}/viewtasks`,
        { projectId },
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        const tasks: Task[] = response.data.tasks.map((task: Task) => ({
          ...task,
          subtasks: task.subtasks || [],
        }));
        const myTasks: Task[] = [];
        const pastTasks: Task[] = [];

        const promises = tasks.map((task) => {
          return fetchTaskProgress(task._id).then((progress) => {
            task.progress = progress;
            if (task.status === "not submitted" || task.status === "completed") {
              pastTasks.push(task);
            } else {
              myTasks.push(task);
            }
          });
        });

        Promise.all(promises).then(() => {
          setMyTasks(myTasks);
          setPastTasks(pastTasks);
        });
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  };

  const fetchTaskProgress = (taskId: string): Promise<number> => {
    return axios
      .get(`${import.meta.env.VITE_TASK_API}/taskProgress/${taskId}`, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        return response.data.taskProgress;
      })
      .catch((error) => {
        console.error("Error fetching task progress:", error);
        return 0;
      });
  };

  return (
    <div>
    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '50px', width: '70vw' }}>
      {([...myTasks, ...pastTasks] as Task[]).map((task: Task, index: number): React.ReactNode | null => (
        task.status !== "not submitted" && task.dueDate && new Date() < new Date(task.dueDate) && (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginRight: '50px'
            }}
          >
            {/* TASK CIRCLE */}
            <div style={{ marginBottom: '0px'}}>
              <CircularProgress
                radius={40}
                strokeWidth={10}
                percentage={task.progress ? parseFloat(task.progress.toFixed(1)) : 0}                
                status={task.status}
              />
            </div>
            {/* END OF TASK CIRCLE */}
            {/* TASK NAME */}
            <p style={{ color: "black", marginTop: '0px', wordWrap: 'break-word' }}>{task.title}</p>
          </div>
        )
      ))}
    </div>
  </div>
  
  
  );
}

export default MemberHp;
