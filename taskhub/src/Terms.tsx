import { useNavigate } from 'react-router-dom';
import './css/Registration.css'
import './css/SignUp.css'
import React from 'react';
import Registration from './Registration';


function Terms() {
  const navigate = useNavigate();

    const handleSignInClick = () => {
        window.location.href = '/SignIn'; 
    };
  return(
    <div className='signup registration' >
      <Registration />
      <div className='SUcontainer' style={{maxWidth: "750px", right: "100px"}}>
        <center>
            <h1 className="title">Terms & Conditions</h1>
            </center>
            <p style={{paddingLeft: '50px', paddingTop: '20px', paddingRight: '50px'}}>
                <p>
                1- Acceptance of Terms: By accessing or using the Project Management Website ("the Website"), you agree to abide by these Terms and Conditions. If you do not agree with any part of these terms, you may not use the Website.
                </p>
                2- Description of Services: The Website provides a platform for project management, team communication, and collaboration through a variety of features and a user-friendly interface. These services are provided free of charge.
                <p>
                3- User Data and Privacy: We respect the privacy of our users. While using the Website, users acknowledge that non-personal information may be collected, analyzed, and used for information brokering purposes. This includes but is not limited to data related to project progress, collaboration patterns, and user activity. Personal information such as names will not be included in this analysis.
                </p>
                4- Data Security: We employ industry-standard measures to protect user data from unauthorized access, disclosure, alteration, and destruction. However, users acknowledge that no data transmission over the internet is completely secure, and we cannot guarantee the absolute security of user data.
                <p>
                5- User Responsibilities: Users are responsible for maintaining the confidentiality of their account information, including login credentials. Any activity occurring under a user's account is their responsibility. Users agree to notify us immediately of any unauthorized use of their account or any other security concerns.
                </p>
                6- Termination of Services: We reserve the right to terminate or suspend access to the Website at our discretion, without prior notice, for any reason, including but not limited to a violation of these terms.
                <p>
                7- Changes to Terms: We may update these Terms and Conditions from time to time. Users are encouraged to review the terms regularly. Continued use of the Website after any modifications indicates acceptance of the updated terms.
                </p>
                8- Limitation of Liability: In no event shall the Website or its operators be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of the Website.
                <p>
                9- Governing Law: These Terms and Conditions shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.
                </p>
                <hr/>
                <p>
                By accepting the conditions, users acknowledge that they have read, understood, and agreed to these Terms and Conditions.
                </p>
            </p>
            <button className='TCbutton' style={{backgroundColor: 'grey'}} onClick={() => navigate('/signup')}>Back</button>

            {/* <button className='TCbutton' style={{backgroundColor: 'grey'}}>Cancel</button>
            <button className='TCbutton' onClick={handleSignInClick}>Accept All</button> */}
            
    </div>
    </div>
  );
}

export default Terms
