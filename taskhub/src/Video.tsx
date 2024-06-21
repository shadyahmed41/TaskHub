import React, { useState, useEffect } from "react";
import { AgoraVideoPlayer } from "agora-rtc-react";
import { Grid } from "@mui/material";
import { jwtDecode } from 'jwt-decode';

function Video(props: any) {
  const { users, usernames, viewMode } = props;
  const [gridSpacing, setGridSpacing] = useState(12);

  const uniqueUsers = Array.from(new Map(users.map((user: any) => [user.uid, user])).values());
  
  useEffect(() => {
    // Calculate the number of columns dynamically based on the number of users
    console.log("unique ", uniqueUsers.length);
    
    if (!viewMode) {
      const columns = Math.max(Math.floor(12 / (uniqueUsers.length)), 4);
      setGridSpacing(columns);
    } else {
      // const columns = Math.max(Math.floor(12 / (uniqueUsers.length)), 4);
      setGridSpacing(12);
    }
  }, [users]);

  return (
    // all videos
    <Grid container style={{ height: viewMode ? "150px" : "650px", width: "100%", borderRadius: "20px"}}>
      {/* <Grid item xs={gridSpacing}>
        <AgoraVideoPlayer
          videoTrack={tracks[1]}
          style={{ height: "100%", width: "100%" }}
        />
      </Grid> */}
      {uniqueUsers.length > 0 &&
        uniqueUsers.map((user: any, index: number) => {
          const decodedToken: any = jwtDecode(user.uid);
          if (user.videoTrack) {
            return (
              // video and name of each
              <Grid item xs={gridSpacing} key={`${user.uid}-${index}`} 
              style={{position: "relative"}}>
                {/* <p>{`${user.uid}-${index}`}</p> */}
                {!viewMode && usernames && usernames[decodedToken.email] &&
                <div style={{width: '200px', height: '50px', zIndex: 2, position: 'absolute'}}>
                  <div style={{backgroundColor: '#1c0747', opacity: '50%', width: '100%', height: '100%', position: 'absolute', top: '10px', left: '10px', borderRadius: '10px'}}></div>
                 <p style={{color: "white", zIndex: 1, marginLeft: '30px', position: 'absolute', top: '5px'}}>{usernames[decodedToken.email]}</p>
                 </div>}
                
                {/* each video */}
                <AgoraVideoPlayer
                  videoTrack={user.videoTrack}
                  style={{ 
                    // position: !viewMode ? "absolute" : "static",
                           height:"100%", minHeight: viewMode ? "150px" : `325px`, width: "100%", maxHeight: viewMode ? "150px" : "325px", objectFit: 'contain', maxWidth: `725px` }}
                  // style={{height: "100%", width: "100%"}}
                />
              </Grid>
            );
          } else {
            return null;
          }
        })}
    </Grid>
  );
}

export default Video;
