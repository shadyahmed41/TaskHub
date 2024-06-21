import React, { useState } from "react";
import "./css/SignIn.css";
import "./css/Registration.css";
import "./fonts/Megrim.ttf";
import { To, useNavigate } from "react-router-dom";
import axios from "axios";
import Registration from "./Registration";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loading from './Loading';
import { load } from "@syncfusion/ej2-react-gantt";

function SignInFinal() {
  const navigate = useNavigate();
  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setloading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Update state based on input name
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setloading(true);
    setEmailError('');
    setPasswordError('')

    await axios.post(`${import.meta.env.VITE_USER_API}/login`,
        {
          email,
          password,
        },
      )
      .then((response) => {
        setloading(false);
        console.log("Success:", response.data);
        if (response.data.message === "login successful") {
          sessionStorage.setItem("userID", response.data.UserToken);
          // Redirect to the desired page
          navigate('/homepage');
          sessionStorage.setItem("expire", response.data.tokenExpiration);
        }
      })
      .catch((error) => {
        setloading(false);
        console.error("Error:", error);
        console.log(error.response.data.message);
        if(error.response.data.message == "User not Found") {
          setEmailError(error.response.data.message);
        }
        else if (error.response.data.message == "Invalid email or password") {
          setPasswordError("Incorrect password");
        }
      });
  };

  return (
    <div className="signin registration" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}} >
      <Registration />
      {!loading &&
      <div className="container">
        <center>
          <h1 className="title">Sign In</h1>
        </center>
        <form onSubmit={handleSubmit}>
          <div className={`SIform-group ${emailError && 'error'}`}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              required
              placeholder="example@gmail.com"
              className="input"
              onChange={handleInputChange}
            />
             {emailError && <div className="error-message">{emailError}</div>}
          </div>
          <div className={`SIform-group ${passwordError && 'error'}`}>
            <label htmlFor="password">Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="input"
              value={password}
              name="password"
              id="password"
              required
              onChange={handleInputChange}
              style={{width: '70%'}}
            />
            <p
              className="show-password-icon"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye/> : <FaEyeSlash/>}
            </p>
            {passwordError && <div className="error-message">{passwordError}</div>}
          </div>
          <center>
            <button type="submit" className="button">
              Sign In
            </button>
          </center>
        </form>
        <p></p>
        <center>
          <a onClick={() => navigate('/forgotpass')}>Forgot Password?</a>
          <br></br>
          <span>Don't have an account?</span>
          <a onClick={() => navigate("/signup")}> Sign Up</a>
        </center>
      </div>
      }
                {loading && <div><Loading nonavbar={"no"}/></div>}        
    </div>
  );
}

export default SignInFinal;
