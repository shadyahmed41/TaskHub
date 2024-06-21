import React, { useState } from 'react';
import './css/pass.css';
import './fonts/Megrim.ttf';
import Registration from './Registration';
import { To, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ResetPass() {
    const [password, setpassword] = useState("");
    const [password2, setpassword2] = useState("");
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordErrorMinLength, setPasswordErrorMinLength] = useState(true);
    const [passwordErrorSpecialChar, setPasswordErrorSpecialChar] = useState(true);
    const [passwordErrorNumber, setPasswordErrorNumber] = useState(true);
    const [passwordErrorLowercase, setPasswordErrorLowercase] = useState(true);
    const [passwordErrorUppercase, setPasswordErrorUppercase] = useState(true);
    const [passwordfocus, setpasswordfocus] = useState(false);
    const [confirmpasswordfocus, setconfirmpasswordfocus] = useState(false);

    const validatePassword = (value: string) => {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-+=])[0-9a-zA-Z!@#$%^&*()-+=]{8,}$/;
      if (!passwordRegex.test(value)) {
          setPasswordError('Password must be at least 8 characters long');
      } else {
          setPasswordError('');
      }
  };

  const validatePasswordChange = (value: string) => {
    const minLengthRegex = /.{8,}/; // At least 8 characters
    const specialCharRegex = /[!@#$%^&*()-+=]/; // At least one special character
    const numberRegex = /\d/; // At least one number
    const lowercaseRegex = /[a-z]/; // At least one lowercase letter
    const uppercaseRegex = /[A-Z]/; // At least one uppercase letter

    if (!minLengthRegex.test(value)) {
        setPasswordErrorMinLength(true);
    } else {
        setPasswordErrorMinLength(false);
    }
    if (!specialCharRegex.test(value)) {
        setPasswordErrorSpecialChar(true);
    } else {
        setPasswordErrorSpecialChar(false);
    }
    if (!numberRegex.test(value)) {
        setPasswordErrorNumber(true);
    } else {
        setPasswordErrorNumber(false);
    }
    if (!lowercaseRegex.test(value)) {
        setPasswordErrorLowercase(true);
    } else {
        setPasswordErrorLowercase(false);
    }
    if (!uppercaseRegex.test(value)) {
        setPasswordErrorUppercase(true);
    } else {
        setPasswordErrorUppercase(false);
    }
};

  const validateConfirmPassword = (value: string) => {
      if (value !== password) {
          setConfirmPasswordError('Passwords do not match');
      } else {
          setConfirmPasswordError('');
      }
  };
  
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      // Update state based on input name
      switch (name) {
        case "password":
          setpassword(value);
          validatePasswordChange(value);
          break;
          case "password2":
          setpassword2(value);
          validateConfirmPassword(value);
          break;
        default:
          break;
      }
    };
    const navigate = useNavigate();

    // const handleNavigation = (route: To) => {
    //   navigate(route);
    // };
    // password
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await validatePassword(password);
        await validateConfirmPassword(password2);

        if (passwordError || confirmPasswordError) {
          return;
        }

        if (password === password2){
    
        await axios.post(`${import.meta.env.VITE_USER_API}/update-password`,
            {
                newPassword: password,
            },
            {headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
            },}
          )
          .then((response) => {
            console.log("Success:", response.data);
            // Redirect to verify.html
            if(response.data.message === 'Password updated'){
                toast.success('Password updated successfully!');
                sessionStorage.setItem('can_reset_password',JSON.stringify(false));
                sessionStorage.setItem('can_reset_otp',JSON.stringify(false));
                sessionStorage.removeItem('token');
                navigate('/signin')
            } else {
                toast.error(response.data.message);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            console.log(error.response.data.message);
          });
        } else {
            toast.error('Passwords do not match. Please try again.');
        }
      };

  return(
    <div className='pass registration'>
        <Registration/>
      <div className="passcontainer" style={{top: '22%'}}>
        <ToastContainer />
        <center>
            <h1 className="title">Reset Password</h1>
        </center>
        <form onSubmit={handleSubmit}>
             {/* Password */}
             <div className={`FPform-group ${passwordError && 'error'}`}
             style={{borderColor: passwordError ? "red" : "black"}}>
                    <label htmlFor="password">Password:</label>
                    <div style={{display: 'flex', paddingBottom: 0, marginBottom: '0'}}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="input"
                        style={{width: '150px'}}
                        value={password}
                        name='password'
                        onChange={handleInputChange}
                        onFocus={() => {setpasswordfocus(true);}}
                        onBlur={() => {setpasswordfocus(false);}}
                    />
                    <p className="show-password-icon" onClick={togglePasswordVisibility}>
                        {showPassword ? <FaEye/> : <FaEyeSlash/>}
                    </p>
                    </div>
                    {passwordError && <div className="error-message">{passwordError}</div>}
                    {passwordfocus && password.length != 0 && <div style={{fontSize: 10, display: 'flex', marginTop: '10px', paddingBottom: 0, marginBottom: 0}}>
                                <div style={{marginRight: '20px', marginBottom: 0, paddingBottom: 0}}>
                                <div style={{ color: passwordErrorMinLength ? "red" : "green", marginBottom: '3px'}}>At Least 8 Characters</div>
                                <div style={{ color: passwordErrorSpecialChar ? "red" : "green"}}>A Special Character</div>
                                </div>
                                <div style={{marginBottom: 0, paddingBottom: 0}}>
                                <div style={{ color: passwordErrorNumber ? "red" : "green", marginBottom: '3px'}}>A Number</div>
                                <div style={{ color: passwordErrorUppercase ? "red" : "green"}}>1 Uppercase Letter</div>
                                </div>
                                </div>}
            </div>
            {/* Reset Password */}
            <div className={`FPform-group ${confirmPasswordError && password2.length != 0 && 'error'}`}
            style={{borderColor: confirmPasswordError && password2.length != 0 ? "red" : "black"}}>
                    <label htmlFor="password">Rewrite Password:</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="input"
                        value={password2}
                        name='password2'
                        onChange={handleInputChange}
                        onFocus={() => {setconfirmpasswordfocus(true);}}
                        onBlur={() => {setconfirmpasswordfocus(false);}}
                    />
                    <p className="show-password-icon" onClick={togglePasswordVisibility}>
                        {showPassword ?<FaEye/> : <FaEyeSlash/>}
                    </p>
                    {/* {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>} */}
                    {confirmpasswordfocus && password2.length != 0  && <div style={{fontSize: 10, color: confirmPasswordError ? "red" : "green"}}>{confirmPasswordError}</div>}
            </div>
            <center><button type="submit" className="buttonp"
            >Change Password</button></center><p></p>
        </form>
            {/* Button */}

      </div>
    </div>
  );
}

export default ResetPass
