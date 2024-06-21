import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Registration from "./Registration";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Update state based on input name
    switch (name) {
      case "username":
        setUsername(value);
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

    await axios
      .post(`${import.meta.env.VITE_ADMIN_API}/loginadmin`, {
        username,
        password,
      })
      .then((response) => {
        if (response.data.message === "Admin logged successfully") {
          sessionStorage.setItem("Admin", response.data.AdminToken);
          navigate("/admin");
        } else {
          console.log(response.data.analysis);
        }
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };

  return (
    // <div className="registration">
    //   <Registration />
    <div className="signin registration">
    <Registration />
    <div className="container">
      <center>
      <h2>Admin Sign In</h2>
      </center> <br/>
        <form onSubmit={handleSubmit}>
          <div className="SIform-group" style={{width: '80%'}}>
          <label htmlFor="username">Username: </label>
          <input
            id="username"
            name="username"
            value={username}
            required
            className="input"
            placeholder="Enter Username"
            onChange={handleInputChange}
          />
          </div>
          
          <div className="SIform-group" style={{width: '80%'}}>
          <label htmlFor="password">Password: </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="input"
            value={password}
            id="password"
            name="password"
            required
            onChange={handleInputChange}
          />
          <p className="show-password-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEye/> : <FaEyeSlash/>}
          </p>
          </div>
          <center>
          <button type="submit" className="button">
            Sign In
          </button>
          </center>
        </form>
      </div>
    </div>
  );
}
export default AdminLogin;
