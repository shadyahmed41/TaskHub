import React, { useEffect, useRef, useState } from "react";
import axios from "axios"; // Import Axios library
import "./css/pass.css";
import "./fonts/Megrim.ttf";
import { To, useNavigate } from "react-router-dom";
import Registration from "./Registration";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VerifyFinal() {
  const navigate = useNavigate();

  const [wrongOtp, setWrongOtp] = useState('');

  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };

  /////// Verification code ///////
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // go to prev when delete
  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const nextIndex = index + 1;
    const prevIndex = index - 1;

    if (
      e.currentTarget.value === "" &&
      e.currentTarget.selectionStart === 0 &&
      e.currentTarget.selectionEnd === 0 &&
      prevIndex >= 0
    ) {
      const prevInputRef = inputRefs[prevIndex]
        .current as HTMLInputElement | null;
      if (prevInputRef) {
        prevInputRef.focus();
      }
      return;
    }

    //go to next when write
    if (nextIndex < inputRefs.length && inputRefs[nextIndex]) {
      const nextInputRef = inputRefs[nextIndex]
        .current as HTMLInputElement | null;
      if (nextInputRef && typeof nextInputRef.focus === "function") {
        nextInputRef.focus();
      }
    }
  };

  //right and left arrow
  const handleArrow = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const nextIndex = index + 1;
    const prevIndex = index - 1;

    if (e.key === "ArrowLeft" && prevIndex >= 0) {
      const prevInputRef = inputRefs[prevIndex]
        .current as HTMLInputElement | null;
      if (prevInputRef) {
        prevInputRef.focus();
      }
    } else if (e.key === "ArrowRight" && nextIndex < inputRefs.length) {
      const nextInputRef = inputRefs[nextIndex]
        .current as HTMLInputElement | null;
      if (nextInputRef) {
        nextInputRef.focus();
      }
    }
  };

  /////// Timer ///////
  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(interval);
            setIsRunning(false);
            return 60; // Reset timer to 60 seconds
          }
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setTimer(0);
    }

    return () => clearInterval(interval as NodeJS.Timeout);
  }, [isRunning]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  // const handleButtonClick = () => {
  //     setIsRunning(true);
  //     setTimer(0);
  // };

  const handleResendButtonClick = () => {
    setIsRunning(true);
    setTimer(60);
    // Call your resend API here
    if (sessionStorage.getItem("otpredirection") == "phone") {
      return axios
        .get(`${import.meta.env.VITE_USER_API}/resendPhone`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        })
        .then((response) => {
          console.log("Resend Success:", response.data);
          sessionStorage.setItem("token", response.data.token);
          return response.data; // Return the response data if needed
        })
        .catch((error) => {
          console.error("Error:", error);
          throw error; // Throw the error to handle it outside if needed
        });
    } else {
      axios
        .get(`${import.meta.env.VITE_USER_API}/resend`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        })
        .then((response) => {
          if (response.data.message == "OTP resent successfully") {
            sessionStorage.setItem("token", response.data.token);
            console.log("Resend Success:", response.data.message);
          }
          // Handle the response if needed
        })
        .catch((error) => {
          console.error("Error:", error);
          console.log("Error in sending OTP", error.response.data.message);
          // Handle errors if needed
        });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sessionStorage.getItem("otpredirection") == "signup") {
      // Call your verify API here
      const enteredOTP = inputRefs
        .map((ref) => {
          const value = ref.current?.value || "";
          return value;
        })
        .join("");
      // Make sure to add validation for the enteredOTP before sending it to the API
      if (enteredOTP.length !== inputRefs.length) {
        toast.error("Please enter the complete OTP.");
        return;
      }
      axios
        .post(
          `${import.meta.env.VITE_USER_API}/verify`,
          {
            otp: enteredOTP,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          console.log("Verify Success:", response.data.message);
          // Check the response and handle accordingly
          if (response.data.message === "Email verification successful") {
            // Redirect to a success page or perform other actions
            sessionStorage.removeItem("token");
            toast.success("Email verification successful");
            navigate("/signin");
            sessionStorage.removeItem("otpredirection")
          } else if (
            response.data.message ===
            "Maximum OTP attempts reached. Account not verified."
          ) {
            // Redirect to a success page or perform other actions
            sessionStorage.removeItem("token");
            toast.error("You need to register again");
            navigate("/signup");
            sessionStorage.removeItem("otpredirection")
          } else {
            // Handle verification failure (display an error message, etc.)
            toast.error(`Invalid OTP. Please try again.`);
            setWrongOtp('Invalid OTP')
            sessionStorage.setItem("token", response.data.token);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          console.log(
            "Error verifying OTP. Please try again:",
            error.response.data.message
          );
          // Handle errors if needed
          // alert('Error verifying OTP. Please try again.');
        });
    } else if (sessionStorage.getItem("otpredirection") == "forgotpassword") {
      const flag = sessionStorage.getItem("can_reset_otp");
      if (flag === "false" || flag === null) {
        navigate("/signin");
      }
      // navigate('/resetpass');
      const enteredOTP = inputRefs
        .map((ref) => {
          const value = ref.current?.value || "";
          return value;
        })
        .join("");
      // Make sure to add validation for the enteredOTP before sending it to the API
      if (enteredOTP.length !== inputRefs.length) {
        toast.error("Please enter the complete OTP.");
        return;
      }
      axios
        .post(
          `${import.meta.env.VITE_USER_API}/verify-otp`,
          {
            otp: enteredOTP,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          console.log("Verify Success:", response.data.message);

          if (response.data.message === "valid OTP") {
            sessionStorage.setItem("can_reset_password", JSON.stringify(true));

            // window.location.href = 'new-password.html';
            navigate("/resetpass");
            sessionStorage.removeItem("otpredirection")
            // sessionStorage.removeItem("token");
          } else if (response.data.message === "Redirect to login page") {
            toast.error(
              "You entered the wrong OTP three times. Redirecting to login page."
            );
            navigate("/signin"); // Replace 'login.html' with your actual login page
            sessionStorage.removeItem("otpredirection")
            sessionStorage.removeItem("token");
          } else {
            console.log(response.data.message);
            sessionStorage.setItem("token", response.data.token);
            setWrongOtp('Invalid OTP')
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          console.log(
            "Error verifying OTP. Please try again:",
            error.response.data.message
          );
          // Handle errors if needed
          // alert('Error verifying OTP. Please try again.');
        });
    } else if (sessionStorage.getItem("otpredirection") == "phone") {
      const enteredOTP = inputRefs
        .map((ref) => {
          const value = ref.current?.value || "";
          return value;
        })
        .join("");
      // Make sure to add validation for the enteredOTP before sending it to the API
      if (enteredOTP.length !== inputRefs.length) {
        toast.error("Please enter the complete OTP.");
        return;
      }
      return axios
        .post(
          `${import.meta.env.VITE_USER_API}/verifyPhone`,
          {
            otp: enteredOTP,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          console.log("Verify Phone Success:", response.data);
          if (response.data.message === "Phone verification successful") {
            toast.success("Phone number verification successful");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("otpredirection")
            navigate("/profilepage");
          } else if (
            response.data.message ===
            "Maximum OTP attempts reached. Account not verified."
          ) {
            toast.error(response.data.message);
            navigate("/profilepage");
            sessionStorage.removeItem("otpredirection")
            sessionStorage.removeItem("token");
          } else {
            toast.error("Invalid OTP. Please try again.");
            sessionStorage.setItem("token", response.data.token);
            setWrongOtp('Invalid OTP')
          }
          return response.data; // Return the response data if needed
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Error verifying OTP. Please try again.");
          throw error; // Throw the error to handle it outside if needed
        });
    }
  };

  return (
    <div className="registration pass">
      <Registration />
      <div
        className="passcontainer"
        style={{top: '20%' }}
      >
        <ToastContainer />
        <center>
          <h1 className="title">OTP Verification</h1>
          <p style={{ color: "grey" }}>
            Please write the OTP sent to your email address.
          </p>
        </center>
        <form onSubmit={handleSubmit}>
          {/* OTP */}
          <div className={`inputbox ${wrongOtp && 'error'}`}
            style={{justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}
          >
            <div style={{display: 'flex'}}>
            {inputRefs.map((inputRef, index) => (
              <input
              // style={{ border: wrongOtp ? "red solid 2px" : "transparent solid 2px" }}          
                key={index}
                type="text"
                maxLength={1}
                ref={inputRef}
                onInput={(e) => handleInput(index, e)}
                onKeyDown={(e) => handleArrow(index, e)}
                id={`otp-${index}`}
                className="otp"
              />
            ))}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', paddingBottom: 0, marginBottom: 0}}>
            {wrongOtp && <div className="error-message" style={{paddingBottom: 0, marginBottom: 0}}>{wrongOtp}</div>}
            </div>
          </div>
          <p></p>
          {/* Button */}
          <center>
            <button type="submit" className="button">
              Verify
            </button>
          </center>
        </form>
        <center>
          <p style={{ color: "grey" }}>
            didn't receive an OTP? resend in
            <span style={{ color: "#001831" }}>
              {` ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}
            </span>
          </p>
        </center>
        <center>
          {isRunning ? (
            <div
              className="button"
              style={{ backgroundColor: "grey", cursor: "default", paddingTop: '7px', paddingBottom:'7px', color:'white' }}
            >
              Resend OTP
            </div>
          ) : (
            <button className="button" onClick={handleResendButtonClick}>
              Resend OTP
            </button>
          )}
        </center>
      </div>
    </div>
  );
}

export default VerifyFinal;
