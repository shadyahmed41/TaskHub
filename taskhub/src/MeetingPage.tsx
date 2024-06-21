import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './css/KPOinCall.css'
// import { SocketContext } from "./context/SocketContext";
// import {
//   config,
//   useClient,
//   useMicrophoneAndCameraTracks,
//   channelName,
// } from "./AgoraApiSetup";
import AgoraRTC, { IAgoraRTCClient, ILocalTrack, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
// import Participants from "./components/Participants";
// import VideoPlayer from "./components/VideoPlayer";
// import Chat from "./components/Chat";
// import Controls from "./components/Controls";
import { Grid } from '@mui/material';
// import { Button } from '@mui/material';
import Video from "./Video";
import Controls from "./Controls";
import { SocketContext } from "./SocketConnection";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Loading from "./Loading";

const appId = import.meta.env.VITE_AGORA_API;
// const token = "7f1fd3d35c4b490a9635eaefd821a487";
const token = null;

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token } as const;


function MeetingPage(props: any) {
  const id = useParams();
  const { setInCall } = props;
  const [users, setUsers] = useState<any>([]);
  // const [start, setStart] = useState(false);
  const [localTracks, setLocalTracks] = useState<(ICameraVideoTrack | IMicrophoneAudioTrack)[]>([]);
  const client: IAgoraRTCClient = AgoraRTC.createClient(config);;
  // const { ready, tracks }: [boolean, [IMicrophoneAudioTrack, ICameraVideoTrack]] = AgoraRTC.createMicrophoneAndCameraTracks();;
  const { socket } = useContext(SocketContext)
  const [canJoin, setCanJoin] = useState(false);

  // const {id} = useParams();
  const [roomName, setroomName] = useState('')
  const [participants, setParticipants] = useState<any>([])
  // // const {socket, setInCall, client, users, setUsers, ready, tracks, setStart, setParticipants, start} = useContext(SocketContext);
  const userId = sessionStorage.getItem("userID");
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [keyPoints, setKeyPoints] = useState<any>([]);
  const [outcome, setOutcome] = useState<any>([]);
  const [selectedKeypoint, setSelectedKeypoint] = useState<any>('');
  const [newKeypoint, setNewKeypoint] = useState('');
  // const [inputs, setInputs] = useState(['']); // Array to store input field values
  const [selectedInput, setSelectedInput] = useState<any>(null); // State to track selected keypoint
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]); // Ref to store references to input elements
  const projectId = sessionStorage.getItem("projectID");
  const [usernames, setusernames] = useState<any>({});
  const [popupparticipants, setpopupparticipants] = useState(false);

  const navigate = useNavigate();
  const userid = sessionStorage.getItem("userID");


  useEffect(() => {
    if (!userid) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
    socket.emit('join-room', { roomId: id });
    socket.emit('whocanjoin', { projectId: projectId, roomId: id });
    socket.on('user-joined', async () => {
      setCanJoin(true);
    })
    socket.emit('get-participants', { roomId: id });
    socket.on("participants-list", async ({ emails, roomName, leaderId, userID }: any) => {
      console.log("pppppppppppppppppppppppppppp", emails);
      setParticipants(emails);
      setroomName(roomName);
      setCurrentUser(userID);
      setProjectLeader(leaderId);
      console.log("leader", leaderId);
      console.log("user", userID);
    });
    socket.on("participants", async ({ roomId }: any) => {
      // console.log("change emitted");
      socket.emit('get-participants', { roomId: roomId });
    });
    socket.emit("get-keypoints", { roomId: id });
    socket.on("keypoints", async ({ keypoints }: any) => {
      console.log("ggggggggggggggggggggg", keypoints);
      setKeyPoints(keypoints);
    });
    socket.on("who-can-join", async ({ memberNames }: any) => {
      const usersWithName = memberNames.reduce((acc: any, user: any) => {
                acc[user.email] = user.name;
                return acc;
              }, {});
              setusernames(usersWithName);    
            });
    }
  }, []);

  // const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
  //   if (event.key === 'Enter') {
  //     event.preventDefault();
  //     const newInputs = [...inputs];
  //     newInputs.splice(index + 1, 0, '');
  //     setInputs(newInputs);
  //   }
  // };

  // // Function to handle input change
  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
  //   const newInputs = [...inputs];
  //   newInputs[index] = event.target.value;
  //   setInputs(newInputs);
  // };

  // // Effect to focus on the last input when inputs change
  // useEffect(() => {
  //   if (inputRefs.current[inputs.length - 1]) {
  //     inputRefs.current[inputs.length - 1]?.focus();
  //   }
  // }, [inputs]);

    const [loading, setLoading] = useState(true);
  



  useEffect(() => {
    if (canJoin) {
      client.on("user-published", async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers: any) => {
            return [...prevUsers, user];
          });
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", (user: any, mediaType: any) => {
        if (mediaType === "audio") {
          if (user.audioTrack) user.audioTrack.stop();
        }
        if (mediaType === "video") {
          setUsers((prevUsers: any) => {
            return prevUsers.filter((User: any) => User.uid !== user.uid);
          });
        }
      });

      client.on("user-left", (user: any) => {
        // socket.emit("user-left-room", {userId: user.uid, roomId: id});
        // console.log(id);
        // socket.emit("user-left-room", { roomId: id });
        setUsers((prevUsers: any) => {
          return prevUsers.filter((User: any) => User.uid !== user.uid);
        });
      });

      const joinAndInitializeTracks = async (name: any) => {
        // try {
        const uid = await client.join(config.appId, name, config.token, userId);
        // } catch (error) {
        //   console.log("error", error);
        // }

        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        const [audioTrack, videoTrack] = tracks as [IMicrophoneAudioTrack, ICameraVideoTrack];
        videoTrack.setEnabled(false);
        audioTrack.setEnabled(false);
        setLocalTracks(tracks);
        setUsers((previousUsers: any) => [...previousUsers, { uid, videoTrack, audioTrack }]);
        

        if (tracks) await client.publish(tracks);
        // setStart(true); 
      };
      joinAndInitializeTracks(id.id);


      // try {
      //   init(id.id);
      // } catch (error) {
      //   console.log(error);
      // }
      return () => {
        localTracks.forEach(track => {
          track.stop();
          track.close();
        });
        // client.off('user-published', handleUserJoined);
        // client.off('user-left', handleUserLeft);
        if (localTracks.length > 0) {
          client.unpublish(localTracks).then(() => client.leave());
        } else {
          client.leave();
        }
      };
    }

  }, [canJoin]);


  let left = 278;
  let lefthr = 427;
  let leftCurve = 3;


  return (
    <div>
      {canJoin && 
      <div>
        <Grid
          container
          direction="column"
          style={{ height: "90vh", width: "98.93vw" }}
        >
          {!viewMode && 
          <button className="btnKP" style={{ zIndex: 1}}
            onClick={() => setViewMode(!viewMode)}>
              <FaArrowLeft style={{fontSize: '20px', zIndex: 1, color: 'white'}} 
                        />
            </button>}
          {!viewMode && (
            // header 
            <Grid item 
              style={{ 
              top: '0',
              left: '0',
              position: 'absolute',
              width: '100vw',
              height: '50px',
              boxShadow: 'inset 0px 20px  40px rgba(0, 0, 0,0.5)', // Add inset shadow effect
              pointerEvents: 'none',
              // zIndex: '-1',
              paddingTop:'10px',
              backgroundColor: "rgb(234,233,233)" 
            }}>
              {/* Display participants here */}
              {roomName && (
                <div style={{display: 'flex', position: 'relative', justifyContent: 'center', alignItems: 'center'}}>
                  <div style={{color:"#1c0747", fontSize:"20px", fontWeight:"bold"}}>
                    {roomName}
                  </div>
                  {/* {(
                    Object.entries(participants) as [
                      string,
                      { address: string }
                    ][]
                  ).map(([userId, participant], index) => (
                    <div key={index}
                    style={{position: 'absolute', right: 0 ,color:"black", fontSize:"16px",fontWeight:"lighter"}}
                    >
                      {participant.address}
                    </div>
                  ))} */}
                </div>
              )}
            </Grid>
          )}



          {/* video */}
          {!viewMode && (
            <Grid item style={{ height: "93vh", width: '100vw', position: "absolute", top: "7%", overflow: "auto" }}>
              <Video
                // tracks={localTracks}
                users={users}
                usernames={usernames}
                viewMode={viewMode}
              />
            </Grid>
          )}



          {/* controls */}
          <Grid item style={{ height: "fit-content", width: '98.93vw' }}>
            {!viewMode && localTracks && (
              <Controls
                tracks={localTracks}
                // setStart={setStart}
                setInCall={setInCall}
                id={id}
                // ready={ready}
                // users={users}
                setUsers={setUsers}
                client={client}
                projectLeader={projectLeader}
                currentUser={currentUser}
                setViewMode={setViewMode}
                viewMode={viewMode}
                popupparticipants={popupparticipants}
                setpopupparticipants={setpopupparticipants}
              />
            )}
          </Grid>
         
        </Grid>
        {viewMode && (
          <div style={{ backgroundColor: 'rgb(231, 229, 229)', width: '100vw', height: '100vh', position: 'fixed', top: 0 }}>
            <div className="KPbox">
              {/* <div className="allkeypoints"> */}
              {keyPoints.map((keyPoint: any, index: number) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div>
                    <div
                      className="eachkeypoint"
                      key={index}
                      style={{
                        color: selectedKeypoint == keyPoint._id ? 'white' : "#1c0747",
                        backgroundColor: selectedKeypoint == keyPoint._id ? "#1c0747" : "white",
                        left: `${index == 0 ? left : left += 200}px`,
                      }}
                      onClick={() => { setSelectedKeypoint(keyPoint._id); left -= 200 }}
                    >
                      <p style={{color: selectedKeypoint == keyPoint._id ? 'white' : "#1c0747"}}>
                        {keyPoint.keypoint}
                      </p>

                    </div>
                    <div 
                    style={{width: '200px', overflow: 'hidden' }}
                  >
                  <div className="currentKP" style={{left: `${index == 0 ? leftCurve : leftCurve += 200}px`, color: selectedKeypoint == keyPoint._id ? "black" : "white",
                                                              backgroundColor: selectedKeypoint == keyPoint._id? "white": 'transparent',}}>
                    <div className="currentcurve" style={{ right: 0, 
                                                          borderBottomLeftRadius: '50%', 
                                                          borderTopLeftRadius: '0%', 
                                                          backgroundColor: selectedKeypoint == keyPoint._id? "rgb(231, 229, 229)": 'transparent',
                                                          zIndex: selectedKeypoint == keyPoint._id? 1: 0  }}>

                    </div>
                    <div className="currentcurve" style={{ left: 0, borderBottomRightRadius: '50%', borderTopRightRadius: '0%', 
                                                          backgroundColor: selectedKeypoint == keyPoint._id? "rgb(231, 229, 229)": 'transparent',
                                                          zIndex: selectedKeypoint == keyPoint._id? 1: 0     }}>

                    </div>
                  </div>
                    </div>
                  </div>
                  <hr className="joiningline" style={{ left: `${index == 0 ? lefthr : lefthr += 200}px` }} />
                </div>
              ))}

{/* add kp */}
              <div className="eachkeypoint" style={{ left: `${left += 200}px` }}>
              {projectLeader === currentUser ? (
                <div style={{display: 'flex', flexDirection: 'column', alignContent: 'center', paddingTop: '20px'}}>
                <input placeholder="+Add Key Point" className="addKP" value={newKeypoint} onChange={(e)=>{setNewKeypoint(e.target.value)}}/>
                <button onClick={() => {socket.emit("update-keypoints", {roomId: id, keypoint: newKeypoint}); setNewKeypoint('')}}
                style={{fontSize: '12px', width: 'fit-content'}}>
                  Add Keypoint
                  </button>
                </div>
              ) :
              (
                <center>
                <p>End of Key Points</p>
                </center>
              )
            }
              </div>


            </div>
            {/* ALL OUTCOME */}
              {/* show outcome for members */}
              <div className="outcomebox">
              <h3>Outcomes:</h3>
              {keyPoints.map((keyPoint: any, index: number) => (
                <div key={index} >
                  {selectedKeypoint === keyPoint._id && (
                    <div style={{ marginTop: "10px", padding: "5px", overflow: 'auto' }}>
                      {keyPoint.outcomes.map((outcome: any, outcomeIndex: number) => (
                        <div key={outcomeIndex} className="eachoutcome">
                          <p>{outcome.outcome}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* input outcome for leader */}
                {projectLeader === currentUser && 
                  <div>
                    <input
                      className="outcomeinput"
                      type="text"
                      value={outcome}
                      onChange={(event) => {setOutcome(event.target.value)}}
                    />
                  </div>
                }
                {projectLeader === currentUser && <button onClick={() => {
                  socket.emit("update-outcomes", { roomId: id, keyPoint: selectedKeypoint, outcomes: outcome });
                  setOutcome('');
                }}
                  style={{ backgroundColor: '#1c0747' }}>Add Outcome</button>}
              </div>


            <div className="maincall" >
              <div className="insidemaincall" style={{overflow: "auto"}}>
              <Video
            users={users}
            usernames={usernames}
            viewMode={viewMode}
          />
              </div>
            </div>
            <button className="btnmaincall"
              onClick={() => setViewMode(!viewMode)}>
              <FaArrowRight style={{ fontSize: '20px', zIndex: 2 }} />
            </button>
            {/* <div style={{position: "absolute", top: "3%", right: "5%", height: "650px", width: "180px"}}> */}
            {/* <Video
            users={users}
            usernames={usernames}
            viewMode={viewMode}
          /> */}
          {/* </div> */}
          </div>
        )}
      </div>}
      {!canJoin && !userId && <div>
        <h1 style={{ color: "black" }}>You are not a member of this project</h1>
      </div>}

      {!canJoin && <Loading/>}


      {popupparticipants && !viewMode &&
        <div style={{position: 'absolute', right: '20px', bottom: '0', width: '300px', height: 'fit-content', borderRadius: '10px', backgroundColor: 'lightgrey', paddingTop: '20px '}}>
        {participants && (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: "column"}}>
                  {/* <div style={{color:"black", fontSize:"20px",fontWeight:"bold"}}>
                    {roomName}
                  </div> */}
                  {(
                    Object.entries(participants) as [
                      string,
                      { address: string }
                    ][]
                  ).map(([userId, participant], index) => (
                    <div key={index}
                    style={{color:"black", fontSize:"16px", fontWeight:"lighter", display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}
                    >
                      {index != 0 &&
                      <hr style={{width: '250px'}}/>
                      }
                      {participant.address}
                    </div>
                  ))}
                </div>
              )}
        </div>}
    </div>
  );
}
export default MeetingPage