import { createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
export const SocketContext = createContext<any>(null!);
export const SocketContextProvider = ({children}: any) => {

const token = sessionStorage.getItem("userID");
const navigate = useNavigate();

    const socket = io(`${import.meta.env.VITE_API_HOST}`, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
        console.log("succesfully connected with socket.io server");
        console.log(socket.id);        
      });

      useEffect(()=>{
        socket.on('room-created', ({roomId, type}) =>{
          if (type == "instant") {
            navigate(`/meeting/${roomId}`);
          }
        });
    
      }, [socket]);
      return(

  <SocketContext.Provider  value={{socket}} >{children}</SocketContext.Provider>
)

}