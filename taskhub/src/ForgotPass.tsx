import React, { useState } from 'react';
import './css/pass.css';
import './fonts/Megrim.ttf';
import Registration from './Registration';
import { To, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPass() {

  const navigate = useNavigate();

    const [emailError, setEmailError] = useState('');
    // const handleNavigation = (route: To) => {
    //   navigate(route);
    // };
    const setsession = (route: To) => {
      sessionStorage.setItem('otpredirection', 'forgotpassword');
      navigate(route);
    }

    const [email, setEmail] = useState("");
  
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      // Update state based on input name
      switch (name) {
        case "email":
          setEmail(value);
          break;
        default:
          break;
      }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
  
      await axios.post(`${import.meta.env.VITE_USER_API}/reset-password`,
          {
            email
          },
        )
        .then((response) => {
          console.log("Success:", response.data);
            // Redirect to verify.html
            if(response.data.message === 'verify-otp'){
                // alert(data.token)
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('can_reset_otp', JSON.stringify(true));
                setsession('/Verify')}
                else if (response.data.message == 'Email not found') {
                  setEmailError('User not Found')
                }
        })
        .catch((error) => {
          console.error("Error:", error);
          console.log(error.response.data.message);
        });
    };

  return(
    
    <div className='pass registration'>
      <Registration/>
      <div className="passcontainer">
        <center>
            <h2 className="title">Forgot Password?</h2>
            <p style={{color: 'grey', fontSize: '14px'}}>Please enter your email address to receive the OTP</p>
        </center>
        <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className='inputbox'>
                <div className={`FPform-group ${emailError && 'error'}`}
                style={{borderColor: emailError ? "red" : "black"}}>
                    <label htmlFor="email">Email:</label>
                    <input value={email} type="email" id="email" name="email" placeholder='example@gmail.com' className='input' onChange={handleInputChange} style={{width: '70%'}}/>
                    {emailError && <div className="error-message">{emailError}</div>}
                </div>
            </div>  
            {/* Button */}
          <center><button type="submit" className="buttonp"
          >Send OTP</button></center><p></p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPass
