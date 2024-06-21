import { useState } from "react";
import NavBarCurrent from "./NavBarCurrent";
import Navbar from "./Navbar";
import "./css/contactus.css";
import Purple from "./pics/pp.png"
import { FaArrowDown, FaCheck, FaCheckCircle, FaEdit, FaEnvelope, FaUser,FaSort,FaList,FaArrowAltCircleLeft,FaFacebookMessenger, FaHome, FaQuestion, FaPhoneAlt, FaAddressBook, FaVoicemail, FaMapMarkerAlt } from "react-icons/fa";

function ContactUs() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Contact Form Submission',
        message: ''
      });

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      };
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, message, subject } = formData;
        // Construct the email body
        const body = `Message: ${message}`;
        // Open the user's email client with pre-filled data
        const mailtoLink = `mailto:taskhubprojectmanagment@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&cc=${encodeURIComponent(email)}`;
        window.open(mailtoLink);
        // Optionally, you can also send the form data to your server for processing
    };

  return (
    <div style={{ width: '100%', height: '672px'}}>
        <Navbar />
        {/* current */}
        <div style={{position: 'absolute', top:'300px'}}>
            <NavBarCurrent icon={<FaPhoneAlt />} text="Contact Us"></NavBarCurrent>
        </div>
        <div className="contact-background">
            <img className="Contact-Image" src={Purple}/>
            <h2 className="get-in-touch">GET IN TOUCH</h2>
            <div className="contact-icons">
                {/* <div className="contact-icon">
                    <FaMapMarkerAlt className="contact-fa-icon"/>
                    <p className="contact-name">1234 Syria Street, Alexandria, Egypt</p>
                </div> */}
                <div className="contact-icon">
                    <FaPhoneAlt className="contact-fa-icon"/>
                    <p className="contact-name">+201094048131</p>
                </div>
                <div className="contact-icon">
                    <FaEnvelope  className="contact-fa-icon"/>
                    <p className="contact-name">taskhubprojectmanagment@gmail.com</p>
                </div>
            </div>
        </div>
        <div className="contact-form">
            <div className="contact-form-left">
                <h2 style={{color: "#001831"}}>Contact Us</h2>
                <div className="greeting-quote">
                    <p>"Welcome to TaskHub Support!<br/> Your message is important to us. <br />
                        We'll get back to you as soon as possible. 
                        Your satisfaction is our priority."</p>
                </div>
            </div>
            <div className="contact-form-right">
                <form>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <div className="left-children">
                                <label htmlFor="name">Name:</label>
                                <input className="form-child" type="text" id="name" name="name" value={formData.name} placeholder="enter name here" onChange={handleChange} />
                            </div>
                            <div className="left-children" style={{position: "relative"}}>
                                <label htmlFor="email">Email:</label>
                                {/* <FaEnvelope  style={{position: "absolute", top: 3, left: 50}} className="contact-fa-icon"/> */}
                                <input className="form-child" type="email" id="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="left-children">
                                <label htmlFor="subject">Subject:</label>
                                <input className="form-child" type="text" id="subject" name="subject" placeholder="subject of message" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="left-children" style={{marginRight: "0px", marginLeft: "25px"}}>
                            <label htmlFor="message">Message:</label>
                            <textarea className="form-child" style={{height: "180px", width: "250px", wordWrap: 'break-word', flexWrap: 'wrap'}} id="message" name="message" placeholder="how can we help you?" value={formData.message} onChange={handleChange} />
                        </div>
                    </div>
                </form>
                <button style={{backgroundColor: "#001831", color: "white"}} type="button" onClick={handleSubmit}>Send Email</button>
            </div>
        </div>
    </div>
  );
}
export default ContactUs;
