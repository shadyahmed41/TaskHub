import { FaUserCircle } from "react-icons/fa";
import Notification from "./Notification";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { set } from "lodash";
import axios from "axios";

function Header(){
const navigate = useNavigate();
const token = sessionStorage.getItem("userID");
const [userimg, setuserimg] = useState();
const [firstLetter, setFirstLetter] = useState('');
const [secondLetter, setSecondLetter] = useState('');
// const capitalizedLetters = `${firstLetter?.toUpperCase()} ${secondLetter?.toUpperCase()}`;


useState(() => {
   axios
     .get(`${import.meta.env.VITE_USER_API}/getimage`, {
       headers: {
         "Content-Type": "application/json",
         Authorization: `UserLoginToken ${token}`,
       },
     })
     .then((response) => {
       console.log("gggggggggggggggggggggggggggg", response.data);
       setuserimg(response.data.image);
       setFirstLetter(response.data.firstLetter);
       setSecondLetter(response.data.secondLetter);
     })
     .catch((error) => {
       console.log(error);
     });
})

    return(
        <div style={{width:'100vw', top:0, right:0, position: 'absolute', zIndex: '2'}}>
            {/* notification */}
            <div style={{position: 'absolute', 
                         right: 0, 
                         top: 0,
                         width: '40px', 
                         height: '40px', 
                         marginRight: '70px'
                         }}>
              <Notification/>
            </div>
            {/* end of notification */}
            
            {/* profile */}
            <div style={{position: 'absolute', 
                        right: 0, 
                        top: 0,
                        width: '80px',
                        height: '40px',
                        
                        }}
                        onClick={() => {navigate("/profilepage");}}
                        >
                {!userimg && (firstLetter || secondLetter) && 
                <div 
                  style={{ position: "absolute",
                          width: '50px', height: '50px',
                          backgroundColor: 'lightgrey',
                          right: 0,
                          top: 0,
                          margin: "40px",
                          cursor: 'pointer',
                          borderRadius: '50%',
                          justifyContent: 'center',
                          alignItems: 'center',
                          display: 'flex',
                          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
                          color: "white", fontSize: '20px'

                  }}
                  >
                  <span>{`${firstLetter.toUpperCase()} ${secondLetter.toUpperCase()}`}</span>
                  </div>
                }
                {userimg &&<img
                            style={{position: "absolute",
                            width: '50px', height: '50px',
                            backgroundColor: 'white',
                            right: 0,
                            top: 0,
                            margin: "40px",
                            cursor: 'pointer',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
                            }}

                            src={`data:image/jpeg;base64,${userimg}`}
                            alt="User"
                            className="avatar-image"
                            />             
            }
            </div>
            {/* end of profile */}
        </div>
    );
}
export default Header