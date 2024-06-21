import { useNavigate } from "react-router-dom";
import NavBarCurrent from "./NavBarCurrent";
import Navbar from "./Navbar";
import "./css/Help.css";
import { FaArrowDown, FaCheck, FaCheckCircle, FaEdit, FaEnvelope, FaUser,FaSort,FaList,FaArrowAltCircleLeft,FaFacebookMessenger, FaHome, FaQuestion } from "react-icons/fa";


function Help() {
  const navigate = useNavigate();
  return (
    <div style={{ width: '100%', height: '672px'}}>
        <Navbar />
        {/* current */}
       <div style={{position: 'absolute',top:'250px'}}>
          <NavBarCurrent icon={<FaQuestion />} text="Help"></NavBarCurrent>
         </div>
        {/* end of current */}
<div style={{position: 'fixed', width: '100%'}}>
      <div className="helpheader">
        <div className="helptop-center">
          <center>
          <div className="helptext" style={{ color: "rgb(138,70,187)", marginTop: "80px" }}>
            <h2>Ask us anything</h2>
            <p>Have any questions? We are here to help you</p>
            
          </div>
          </center>
        </div>
      </div>

      <div className="helpcontainerhelp">
        <div className="helpboxhelp">
        {/* <FaEnvelope style={{backgroundColor:"white"}}/> */}
          <h4>   <FaEnvelope  style={{paddingRight:"5px",color:"rgb(138,70,187)"}}/> How do I change my email</h4>
          <p>
            You can log in to your account and change it from your Profile Edit
            Profile. Then go to the general tab to change your email.
          </p>
        </div>
        
        <div className="helpboxhelp">
        {/* <FaUser/> */}
        <h4> <FaUser style={{paddingRight:"5px",color:"rgb(138,70,187)"}}/>  How can I be a project leader</h4>
          <p>
          By creating a project from the home page, you are automatically assigned as a leader and can enjoy the full leader experience with many different features than the member experience.
          </p>
        </div>
        <div className="helpboxhelp">
        <h4 > <FaSort style={{paddingRight:"5px",color:"rgb(138,70,187)"}}/> How do I arrange my key points with the system</h4>
          <p>
          Only if you are a leader, you can write down your key points when instantly starting a meeting or when arranging a meeting for further notice.
          </p>
        </div>
        <div className="helpboxhelp">
        <h4 > <FaList style={{paddingRight:"5px",color:"rgb(138,70,187)"}}/>Where can I find the meeting’s summary?</h4>
          <p>
          Please tap on “meetings” section under nav bar then choose the desired meeting and click on “summary” button.
          </p>
        </div>
        <div className="helpboxhelp">
        <h4 >  <FaArrowAltCircleLeft   style={{paddingRight:"5px",color:"rgb(138,70,187)",fontWeight:"lighter"}}/>  How do I see my progress in each task?</h4>
          <p>
          Individual task progress is measured upon the optional subtasks that the member can create under each task. By checking on every finished subtask, the task completion progress is automatically increased and displayed.
          </p>
        </div>
        <div className="helpboxhelp">
        <h4 >   <FaFacebookMessenger style={{paddingRight:"5px",color:"rgb(138,70,187)"}} /> How do I communicate with other team members?</h4>
          <p>
          You can communicate through different ways like posts, comments, group chats, individual chats, and meetings. Also you can view the team members details like name, email ,and number to communicate your own way.
Remember, Communication is Key! 
          </p>
        </div>
      </div>



      <div className="helpcontainermore"style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'  }}>
      <div style={{ flex: '1' }}>
      <h4 style={{padding:"15px 10px 0px 20px",margin:"0px",color:"rgb(83,104,106)",fontSize:"15px"}}>Still have questions?</h4>
      <p style={{padding:"0px 0px 0px 20px",margin:"10px",color:"rgb(83,104,106)",fontSize:"12px"}}>
          Can't find the answers you're looking for? please chat with our friendly team
          </p>
          </div>
          <div>
              <button className="helpgetin"
              onClick={() => navigate('/contact')}
              >     Get in touch     </button>
              </div>
      </div>
      
    </div>
    </div>
  );
}
export default Help;
