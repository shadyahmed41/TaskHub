import React, { useContext, useState } from "react";
// import { useClient } from "./AgoraApiSetup"
import { Grid, Button } from "@mui/material"
import { FaArrowLeft, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { FaX } from "react-icons/fa6";
import { SocketContext } from "./SocketConnection";
import { useNavigate } from "react-router-dom";
import { ViewMode } from "gantt-task-react";
import { CgMore } from "react-icons/cg";
import { MdCallEnd, MdExitToApp } from "react-icons/md";
import './css/KPOinCall.css'

// import AgoraRTC, { IAgoraRTCClient, ILocalTrack, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

function Controls(props: any){
    const navigate = useNavigate();
    // const client: IAgoraRTCClient = useClient();
    const { tracks, setInCall, id, client, setUsers, projectLeader, currentUser, setViewMode, viewMode, popupparticipants, setpopupparticipants } = props;
    const [trackState, setTrackState] = useState({ video: false, audio: false });
    const { socket } = useContext(SocketContext);


  useState(() => {
    socket.on("end-call", async () => {
      leaveChannel();
      setUsers();
      navigate(`/meetingsummary/${id.id}`);      
      window.location.reload();
    });

    // Clean up the event listener when the component unmounts
  return () => {
    socket.off("end-call");
  };
  });
    
    // console.log(tracks);
    
    // const mute = async (type: String) => {
    //     if (type == "audio") {
    //       await tracks[0].setEnabled(!trackState.audio)
    //       setTrackState((ps) => {
    //         return { ...ps, audio: !ps.audio };
    //       });
    //     } else if (type == "video") {
    //       await tracks[1].setEnabled(!trackState.video);
    //       setTrackState((ps) => {
    //         return { ...ps, video: !ps.video };
    //       });
    //     }
    //   };

    // const toggleMic = async () => {
    //   if (trackState.audio) {
    //     await tracks[0].setEnabled(false);
    //     console.log("Audio Muted.");
    //   } else {
    //     await tracks[0].setEnabled(true);
    //     console.log("Audio Unmuted.");
    //   }
    //   setTrackState((prevState) => ({ ...prevState, audio: !prevState.audio }));
    // };
  
    // const toggleVideo = async () => {
    //   if (trackState.video) {
    //     await tracks[1].setEnabled(false);
    //     console.log("Video Muted.");
    //   } else {
    //     await tracks[1].setEnabled(true);
    //     console.log("Video Unmuted.");
    //   }
    //   setTrackState((prevState) => ({ ...prevState, video: !prevState.video }));
    // };

    async function toggleAudio() {
    if (tracks[0]) {
      const audioEnabled = !trackState.audio;
      await tracks[0].setEnabled(audioEnabled);
      console.log(`Audio ${audioEnabled ? "Unmuted" : "Muted"}`);
      setTrackState((prevState) => ({ ...prevState, audio: audioEnabled }));
    }
  }
  
    // const toggleVideo = async () => {
    //   const videoEnabled = !trackState.video;
    //   await tracks[1].setEnabled(videoEnabled);
    //   console.log(`Video ${videoEnabled ? "Unmuted" : "Muted"}`);
    //   setTrackState((prevState) => ({ ...prevState, video: videoEnabled }));
    // };
    const toggleVideo = async () => {
      if (tracks[1]) {
      const videoEnabled = !trackState.video;
      await tracks[1].setEnabled(videoEnabled);
      console.log(`Video ${videoEnabled ? "Unmuted" : "Muted"}`);
      setTrackState((prevState) => ({ ...prevState, video: videoEnabled }));
    }
  };


      const leaveChannel = async () => {
        await client.leave();
        client.removeAllListeners();
        tracks[0].stop();
        tracks[1].stop();
        tracks[0].close();
        tracks[1].close();
        // setStart(false);
        console.log(id);
        socket.emit("user-left-room", { roomId: id });
        navigate(`/meetingsummary/${id.id}`);
        // await socket.emit('get-participants', {roomId: id});
        // window.location.reload();
      };

      const buttonStyle = {
        borderRadius: '50%', // Make the button circular
        width: '50px', // Set the width of the button
        height: '60px', // Set the height of the button
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        color: 'white',
        transition: 'background-color 0.3s ease', // Add transition for smooth color change
        '&:hover': {
          backgroundColor: 'darkred',
          
        },
      };

      const endbuttonStyle = {
        borderRadius: '50%', // Make the button circular
        width: '50px', // Set the width of the button
        height: '60px', // Set the height of the button
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red',
        color: 'white',
        transition: 'background-color 0.3s ease', // Add transition for smooth color change
        '&:hover': {
          backgroundColor: 'darkred',
          
        },
      };
      const showparticipants = {
        borderRadius: '20px', // Make the button circular
        width: '200px', // Set the width of the button
        height: '50px', // Set the height of the button
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        color: 'black',
        transition: 'background-color 0.3s ease', // Add transition for smooth color change
        
      };
      


    return(
        <Grid style={{alignItems:"center", width: '98.93vw', position:"absolute", bottom: 0, margin: 0, display: 'flex', justifyContent: 'center'}}
            container spacing={2} alignItems="center" >
              {/* grid 1 */}
      <Grid item style={{padding:"20px"}}>
        <Button
          className= "videobtn"style={buttonStyle}
          variant="contained"
          color={trackState.audio ? "primary" : "secondary"}
          onClick={toggleAudio}
        >
          {trackState.audio ? <FaMicrophone style={{color: '#1c0747', fontSize: '20px'}}/> : <FaMicrophoneSlash style={{color: '#1c0747', fontSize: '20px'}} />}
        </Button>
        {/* <p style={{paddingLeft:"20px"}}>Mic</p> */}
      </Grid>
      {/* grid 2 */}
      <Grid item style={{padding:"20px"}}>
        <Button
          className= "videobtn"style={buttonStyle}
          variant="contained"
          color={trackState.video ? "primary" : "secondary"}
          onClick={toggleVideo}
        >
          {trackState.video ? <FaVideo style={{color:"#1c0747", fontSize: '20px'}}/> : <FaVideoSlash style={{color:"#1c0747", fontSize: '20px'}}/>}
        </Button>
        {/* <p style={{paddingLeft:"10px"}}>Camera</p> */}
      </Grid>
      {/* grid 3 */}
      

      {/* <div>
        <hr style={{ width: '0%',height:"90px", margin: '20px auto' ,top:"30px"}} />
      </div> */}

      {/* grid 4 */}
      <Grid item style={{padding:"20px",paddingLeft:"40px", color: 'black'}}>
        <Button  className = "leavebtn"
        style={endbuttonStyle}
          variant="contained"
        //   color="default"
          onClick={() => leaveChannel()}
        >
          <MdExitToApp  style={{color:"white", fontSize: '20px'}}/>
          {/* <FaX /> */}
        </Button>
        {/* <p style={{paddingLeft:"10px"}}>Leave</p> */}
      </Grid>


      {projectLeader && currentUser && projectLeader == currentUser && <Grid style={{padding:"20px",paddingLeft:"10px"}} item>
        <Button
        className= "endvideobtn" style={endbuttonStyle}
          variant="contained"
        //   color="default"
          onClick={() => {
              // navigate('/dashboard')
              socket.emit("end-call", {roomId: id})
            }}
        >
          <MdCallEnd  style={{color:"white", fontSize: '20px'}}/>
          {/* <FaX /> */}
        </Button>
        {/* <p style={{paddingLeft:"20px", color: 'black'}}>End</p> */}
      </Grid>}
      {/* <Grid item>
        <Button
          variant="contained"
          onClick={() => setViewMode(!viewMode)}
        >
          keypoints
        </Button>
      </Grid> */}

      {/* participants popup */}
      <Grid item style={{padding:"20px",paddingLeft:"40px", color: '#1c0747'}}>
        <Button
        style={showparticipants}
          variant="contained"
        //   color="default"
          onClick={() => setpopupparticipants(!popupparticipants)}
        >
        <p style={{color: '#1c0747'}}>Show Participants</p>
        </Button>
      </Grid>

    </Grid>
    );
}
export default Controls