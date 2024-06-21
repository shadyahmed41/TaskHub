import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import Axios library
import './css/SignUp.css';
import './css/Registration.css';
import './fonts/Megrim.ttf';
import Registration from './Registration';
import { To, useNavigate } from "react-router-dom";
import { FaEye, FaEyeDropper, FaEyeSlash, FaRegEye } from 'react-icons/fa';
import { FaEyeLowVision } from 'react-icons/fa6';
import Loading from './Loading';


function SignUpFinal() {

    const navigate = useNavigate();

    // const handleNavigation = (route: To) => {
    //   navigate(route);
    // };
    // password
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(false); // State for terms and conditions

    //phone number
    //country code
    const [countryCode, setCountryCode] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');    
    const [emailDuplicateError, setEmailDuplicateError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [passwordErrorMinLength, setPasswordErrorMinLength] = useState(true);
    const [passwordErrorSpecialChar, setPasswordErrorSpecialChar] = useState(true);
    const [passwordErrorNumber, setPasswordErrorNumber] = useState(true);
    const [passwordErrorLowercase, setPasswordErrorLowercase] = useState(true);
    const [passwordErrorUppercase, setPasswordErrorUppercase] = useState(true);
    const [passwordfocus, setpasswordfocus] = useState(false);
    const [confirmpasswordfocus, setconfirmpasswordfocus] = useState(false);

    const [loading, setLoading] = useState(false);
    const [nonavbar, setnonavbar] = useState("no");
// Load form data from sessionStorage on component mount
useEffect(() => {
    const savedFormData = sessionStorage.getItem('formData');
    if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        setName(formData.name || '');
        setEmail(formData.email || '');
        setPassword(formData.password || '');
        setConfirmPassword(formData.confirmPassword || '');
        setPhone(formData.phone || '');
        setDay(formData.day || '');
        setMonth(formData.month || '');
        setYear(formData.year || '');
        setCountryCode(formData.countryCode || '');
        setIsTermsAccepted(formData.isTermsAccepted || false);
    }
}, []);

// Function to save form data to sessionStorage
const saveFormData = () => {
    const formData = {
        name,
        email,
        password,
        confirmPassword,
        phone,
        day,
        month,
        year,
        countryCode,
        isTermsAccepted,
    };
    sessionStorage.setItem('formData', JSON.stringify(formData));
};
    const validateName = (value: string) => {
        const nameRegex = /^[a-zA-Z ]+$/;
        if (!nameRegex.test(value)) {
            setNameError('Name can only contain alphabets and spaces');
        } else {
            setNameError('');
        }
    };

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Email format is wrong');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = (value: string) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-+=])[0-9a-zA-Z!@#$%^&*()-+=]{8,}$/;
        if (!passwordRegex.test(value)) {
            setPasswordError('Password must be at least 8 characters');
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
        // validatePassword(password);

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

    const handleCountryCodeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCountryCode(event.target.value);
    };

    //phone no dashes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        // Update state based on input name
        switch (name) {
            case 'name':
                setName(value);
                break;
            case 'email':
                setEmail(value);
                validateEmail(value);
                break;
            case 'password':
                setPassword(value);
                validatePasswordChange(value)
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
                validateConfirmPassword(value);
                break;
            case 'phone':
                setPhone(value);
                break;
            default:
                break;
        }
    };

    //Birth Date
    const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDay(event.target.value);
    };

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setMonth(event.target.value);
    };

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setYear(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        // Make Axios POST request to API
        setEmailDuplicateError("");
        await validateName(name);
        await validateEmail(email);
        await validatePassword(password);
        await validateConfirmPassword(confirmPassword);
        if (nameError || emailError || passwordError || confirmPasswordError) {
            setLoading(false)
            return;
        }
        axios.post(`${import.meta.env.VITE_USER_API}/register`, {
            name,
            email,
            password,
            confirmpassword: confirmPassword,
            phone: `0${phone}`,
            day,
            month,
            year,
        })
        .then((response) => {
            setLoading(false)
            console.log('Server Response:', response.data);
            if (response.data.message === 'User registered successfully') {
                console.log('Registration successful');
                // Redirect to OTP page
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('otpredirection', 'signup');
                sessionStorage.removeItem('formData')
                navigate('/verify');
            } 
        })
        .catch((error) => {
            setLoading(false)
            console.error('Error:', error);
            console.log('Registration failed:', error.response.data.message);
            if (error.response.data.message == "user already taken") {
                setEmailDuplicateError(error.response.data.message);
            }
            // Handle network or other errors.
        });
    
     
    };
    const handleTermsChange = (event: any) => {
        setIsTermsAccepted(event.target.checked);
    };
    

    return (
        <div className='signup registration'>
            <Registration/>
            {!loading && <div className="SUcontainer">
                <center><h1 className="title">Sign Up</h1></center>
                <form onSubmit={handleSubmit}>
                    <div className='inputbox'>
                        {/* Name */}
                        <div className={`form-group ${nameError && 'error'}`}>
                            <label htmlFor="name">Full Name:</label>
                            <input type="text" id="name" name="name" value={name} onChange={handleInputChange} placeholder='Enter name here' className='input' required />
                            {nameError && <div className="error-message">{nameError}</div>}
                        </div>
                        {/* Email */}
                        <div className={`form-group ${email.length != 0 && (emailError || emailDuplicateError) && 'error'}`}>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={email} onChange={handleInputChange} placeholder='example@gmail.com' className='input' required />
                            {email.length != 0 && emailError && <div className="error-message">{emailError}</div>}
                            {emailDuplicateError && <div className="error-message">{emailDuplicateError}</div>}
                        </div>
                    </div>
                    <div className='inputbox'>
                        {/* Phone Number */}
                        <div className="form-group" >
                            <label htmlFor="phoneNumber">Phone Number:</label>
                            <div style={{ display: 'flex', paddingBottom: '0px', marginBottom: 0 }}>
                                <select
                                    className='inputcode'
                                    style={{width: '70px', height: '25px'}}
                                    id="countryCode"
                                    name="countryCode"
                                    value={countryCode}
                                    onChange={handleCountryCodeChange}
                                    required
                                >
                                    <option value="">Select Country Code</option>
                                    <option value="+20">(+20) Egypt </option>
                                    <option value="+966">(+966) KSA </option>
                                    <option value="+971">(+971) UAE </option>
                                    <option value="+970">(+970) Palestine </option>
                                    <option value="+965">(+965) Kuwait </option>
                                    <option value="+961">(+961) Lebanon </option>
                                    <option value="+962">(+962) Jordan </option>
                                    <option value="+968">(+968) Oman </option>
                                    <option value="+974">(+974) Qatar </option>
                                    <option value="+1">(+1)  USA </option>
                                    <option value="+44">(+44) UK </option>
                                    <option value="+91">(+91) India </option>
                                    <option value="+61">(+61) Australia </option>
                                    <option value="+86">(+86) China </option>
                                    <option value="+33">(+33) France </option>
                                    <option value="+49">(+49) Germany </option>                                
                                </select>
                                <input
                                    className='inputphno'
                                    type="text"
                                    id="phoneNumber"
                                    name="phone"
                                    value={phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    maxLength={10} // Set maximum length (including dashes)
                                    minLength={10} // Set minimum length (including dashes)
                                    required
                                />
                            </div>
                        </div>
                        {/* Password */}
                        <div className={`form-group ${passwordfocus && password.length != 0 && (passwordErrorMinLength || passwordErrorSpecialChar || passwordErrorNumber || passwordErrorUppercase) && 'error'}`} >
                            <label htmlFor="password">Password:</label>
                            <div style={{ display: 'flex', marginBottom: '0' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={handleInputChange}
                                    placeholder="Enter password"
                                    className="input"
                                    style={{width: '50%'}}
                                    required
                                    onFocus={() => {setpasswordfocus(true);}}
                                    onBlur={() => {setpasswordfocus(false);}}
                                    // onKeyUp={(e)=> {validatePassword(e.target.value)}}
                                />
                                <p className="show-password-icon" onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEye/> : <FaEyeSlash/>}
                                </p>
                            </div>
                                {/* {passwordError && <div className="error-message">{passwordError}</div>} */}
                                
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
                    </div>
                    <div className='inputbox'>
                        {/* BirthDate */}
                <div className="form-group">
            <label htmlFor="birthdate">Birthdate:</label>
            <div className="birthdate-input" style={{marginBottom: 0}}>
                <select
                    id="day"
                    name="day"
                    value={day}
                    onChange={handleDayChange}
                    className='inputcode'
                >
                    <option>Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
                <select
                    id="month"
                    name="month"
                    value={month}
                    onChange={handleMonthChange}
                    className='inputcode'
                >
                    <option value="">Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
                <select
                    id="year"
                    name="year"
                    value={year}
                    onChange={handleYearChange}
                    className='inputcode'
                >
                    <option value="">Year</option>
                    {Array.from({ length: 120 }, (_, i) => (
                        <option key={2024 - i} value={2024 - i}>{2024 - i}</option>
                    ))}
                </select>
            </div>
                        </div>
                        {/* Confirm Password */}
                        <div className={`form-group ${confirmPasswordError && confirmPassword.length != 0 && 'error'}`} >
                            <label htmlFor="confirmPassword">Rewrite Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Rewrite password"
                                className="input"
                                required
                                onFocus={() => {setconfirmpasswordfocus(true);}}
                                onBlur={() => {setconfirmpasswordfocus(false);}}
                                style={{width: '70%'}}
                            />
                            <p className="show-password-icon" onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEye/> : <FaEyeSlash/>}
                            </p>
                            {/* {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>} */}
                            {confirmpasswordfocus && confirmPassword.length != 0  && <div style={{fontSize: 10, color: confirmPasswordError ? "red" : "green"}}>{confirmPasswordError}</div>}
                        </div>
                    </div>
                    <div style={{marginLeft: "20px"}}>
                        <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            checked={isTermsAccepted}
                            onChange={handleTermsChange}
                            required
                        />
                        <label htmlFor="terms">I accept the <a href="/terms" onClick={saveFormData}>terms and conditions</a></label>
                    </div>
                    {/* Button */}
                    <center><button type="submit" className="button">Sign Up</button></center><p></p>
                    <center><span>Already have an account?</span><a onClick={() => navigate('/signin')}> Sign In</a></center>
                </form>
            </div>}
            {loading && <div><Loading nonavbar={nonavbar}/></div>}
        </div>
    );
}

export default SignUpFinal;
