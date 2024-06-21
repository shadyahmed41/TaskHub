import { FaCalendar, FaHome } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const NavBarCurrent = ({icon, text, click}: any) => {
const navigate = useNavigate();

return(  
  <div style={{position: 'relative', 
              width: '220px', 
              height:' 155px', 
              marginLeft: '30px', 
              backgroundColor: 'transparent',
              color: "#001831", 
              }}>
          {/* top */}
          <div style={{width: '50px',
                       height: '50px',
                       position: 'absolute',
                       top: 0, right: 0,
                       backgroundColor: 'rgb(231, 229, 229)',
                      // backgroundColor: 'pink',
                       borderBottomRightRadius: '20px',
                      zIndex: 3,
                       }}></div>
          {/* main */}
          <div style={{width: '100%',
                      height: '25px', 
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      position: 'absolute',
                      zIndex: 3,
                      color: "#001831", 
                      display: 'flex',
                      fontSize: '13px',
                      paddingTop: '15px',
                      marginTop: '50px',
                      cursor: 'pointer',
                      alignItems: 'center',
                      }}
                      onClick={() => {
                        navigate(click);
                      }}>
                        <div className="navicons" style={{fontSize: '18px', paddingLeft: '20px'}}>
                          {icon}</div>
                        <span style={{paddingBottom: '18px', color: "#001831", fontWeight: "bold"}}>{text}</span>
            {/* <FaMessage className="navicons" />
            Chats */}
          </div>
          {/* bottom */}
          <div style={{width: '50px',
                       height: '50px',
                       backgroundColor: 'rgb(231, 229, 229)',
                      // backgroundColor: 'blue',
                       borderTopRightRadius: '20px',
                       position: 'absolute',
                       right: 0, bottom: 0,
                       zIndex: 3
                       }}></div>

            
          {/* background */}
          <div style={{backgroundColor: 'white', 
                       width: '10%',
                       height: '90%',
                       right: 0,
                       position: 'absolute',
                       zIndex: 2
                      }}></div>
            </div>    
    
      );
    }
    export default NavBarCurrent