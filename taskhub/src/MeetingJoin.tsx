import React, { useState, useEffect, useRef } from "react";
import MeetingPage from "./MeetingPage";
import { Button } from "@mui/material";

function MeetingJoin() {
    const [inCall, setInCall] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(null);
    const [cameraOn, setCameraOn] = useState(true); // State to track camera status
    const [microphoneOn, setMicrophoneOn] = useState(true); // State to track microphone status
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        let isMounted = true;

        // Access camera stream
        if (cameraOn) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    if (isMounted) {
                        setCameraStream(stream);
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error accessing camera:", error);
                });
        } else {
            // Turn off camera
            if (cameraStream) {
                cameraStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setCameraStream(null);
            }
        }

        // Access microphone stream
        if (microphoneOn) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    if (isMounted) {
                        setMicrophoneStream(stream);
                        if (audioRef.current) {
                            audioRef.current.srcObject = stream;
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error accessing microphone:", error);
                });
        } else {
            // Turn off microphone
            if (microphoneStream) {
                microphoneStream.getTracks().forEach((track) => {
                    track.stop();
                });
                setMicrophoneStream(null);
            }
        }

        // Cleanup function to stop streams when component unmounts
        return () => {
            isMounted = false;
            if (cameraStream) {
                cameraStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
            if (microphoneStream) {
                microphoneStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [cameraOn, microphoneOn]); // Run effect when cameraOn or microphoneOn state changes

    const toggleCamera = () => {
        setCameraOn((prevCameraOn) => !prevCameraOn);
    };

    const toggleMicrophone = () => {
        setMicrophoneOn((prevMicrophoneOn) => !prevMicrophoneOn);
    };

    return (
        <div style={{ width: '100vw', height: "100vh" }}>
            {inCall ? (
                <div>
                    <MeetingPage setInCall={setInCall} />
                </div>
            ) : (
                <div>
                    {/* <h1>Camera View:</h1> */}
                    <video ref={videoRef} autoPlay />
                    {/* <h1>Microphone View:</h1> */}
                    <audio ref={audioRef} autoPlay />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setInCall(true)}
                    >
                        Join Call
                    </Button>
                    <Button
                        variant="contained"
                        color={cameraOn ? "primary" : "secondary"}
                        onClick={toggleCamera}
                    >
                        {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
                    </Button>
                    <Button
                        variant="contained"
                        color={microphoneOn ? "primary" : "secondary"}
                        onClick={toggleMicrophone}
                    >
                        {microphoneOn ? "Turn Microphone Off" : "Turn Microphone On"}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default MeetingJoin;
