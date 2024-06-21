import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { Fa42Group, FaGroupArrowsRotate, FaUserGroup } from "react-icons/fa6";


interface Contact {
  _id: string;
  name: string;
  image: image;
}

interface image {
  imageURL: string;
}

interface Props {
  contacts: Contact[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentUser: any;
  changeChat: (contact: Contact) => void;
  leaderData: Contact;
  groupData: Contact;
  setLoading: (bool: boolean) => void;
}

const Contacts: React.FC<Props> = ({
  contacts,
  changeChat,
  currentUser,
  leaderData,
  groupData,
  setLoading
}) => {
  const [currentUserName, setCurrentUserName] = useState<string | undefined>(
    undefined
  );
  const [currentUserImage, setCurrentUserImage] = useState<string | undefined>(
    undefined
  );
  const [currentSelected, setCurrentSelected] = useState<number | undefined>(
    undefined
  );
  const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image

  //   const projectId = sessionStorage.getItem("projectID");

  useEffect(() => {
    if (contacts.length > 0) {
      setCurrentUserName(currentUser.name);
      (currentUser && currentUser.image) && setCurrentUserImage(currentUser.image.imageURL);
    }
  }, [contacts]);

  const changeCurrentChat = (index: number, contact: Contact, event: React.MouseEvent) => {
    if (event.target instanceof HTMLImageElement) {
      return; // Do nothing if the click is on an img element
    }

    if (index != currentSelected) setLoading(true);
    if (contact._id === leaderData._id) {
      setCurrentSelected(0);
      changeChat(contact);
    } else if(contact._id === groupData._id){
      setCurrentSelected(1);
      changeChat(contact);
    }else
    {
      setCurrentSelected(index);
      changeChat(contact);
    }
  };

  
  const handleImageClick = (imageUrl: any) => {
    setEnlargedImage(imageUrl); // Toggle the enlarged image state
  };


  return (
    <>
    
      {/* {currentUserImage && currentUserImage && ( */}
        <Container>
          {/* MY NAME
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/jpeg;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div> */}


{/* MY CHATS */}
          <div className="brand" 
          style={{width: '100%', backgroundColor: 'white', height: 'fit-content'}}
          >
            <h2 style={{color: 'black', paddingBottom: '20px'}}>Messages</h2>
          </div>



          <div className="contacts" style={{width: '350px', height: '100vh', paddingTop: '10px'}}>

          {/* GROUP */}
          {groupData && groupData._id && (
                <div
                key={groupData._id}
                className={`contact ${currentSelected === 1 ? "selected" : ""}`}
                onClick={(e) => changeCurrentChat(1, groupData, e)}
              >
                <div className="avatar">
                  {groupData.image && groupData.image.imageURL ? (
                    <img
                      src={`data:image/jpeg;base64,${groupData.image.imageURL}`}
                      alt="avatar"
                      style={{borderRadius: '50%'}}
                      onClick={() => handleImageClick(`data:image/jpeg;base64,${groupData.image.imageURL}`)}

                    />
                  ) : (
                    <FaUserGroup
                      className="avatar-placeholder"
                      style={{width: '30px', height: '30px'}}
                    />
                  )}
                </div>
                <div className="username">
                  <h3 >{groupData.name}</h3>
                  <span style={{color: 'black', fontWeight: 'lighter'}}>group</span>
                </div>
              </div>
              )
            }
            {/* END OF GROUP */}

            {/* LEADER */}
            <hr style={{width: '90%', backgroundColor: 'grey'}}/>
            {currentUser && leaderData && leaderData._id !== currentUser._id && (
              <div
                key={leaderData._id}
                className={`contact ${currentSelected === 0 ? "selected" : ""}`}
                onClick={(e) => changeCurrentChat(0, leaderData, e)}
              >
                <div className="avatar">
                  {leaderData.image && leaderData.image.imageURL ? (
                    <img
                      src={`data:image/jpeg;base64,${leaderData.image.imageURL}`}
                      alt="avatar"
                      style={{borderRadius: '50%'}}
                      onClick={() => handleImageClick(`data:image/jpeg;base64,${leaderData.image.imageURL}`)}

                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="avatar-placeholder"
                      style={{width: '40px', height: '40px'}}
                    />
                  )}
                </div>
                <div className="username" >
                  <h3 style={{fontSize: '15px'}}>{leaderData.name}</h3>
                  <span style={{color: 'black'}}>leader</span>
                </div>
              </div>
            )}
            {/* END OF LEADER */}

            {/* MEMBERS */}
            {contacts
              .filter((contact) => contact._id !== currentUser._id)
              .map((contact, index) => {
                return (
                  <div
                    key={contact._id}
                    className={`contact ${
                      index + 2 === currentSelected ? "selected" : ""
                    }`}
                    onClick={(e) => changeCurrentChat(index + 2, contact, e)}
                  >
                    <div className="avatar">
                      {contact.image && contact.image.imageURL ? (
                        <img
                          src={`data:image/jpeg;base64,${contact.image.imageURL}`}
                          alt="avatar"
                          style={{borderRadius: '50%'}}
                          onClick={() => handleImageClick(`data:image/jpeg;base64,${contact.image.imageURL}`)}

                        /> 
                      ) : (
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="avatar-placeholder"
                          style={{width: '40px', height: '40px'}}
                        />
                      )}
                    </div>
                    <div className="username">
                      <h3>{contact.name}</h3>
                      <p></p>
                    </div>
                  </div>
                );
              })}
              {/* END OF MEMBERS */}


          {/* Enlarged Image */}
          {enlargedImage && (
            <div className="enlarged-image-overlay" onClick={() => setEnlargedImage(null)}>
              <div className="enlarged-image-container" >
                <img src={enlargedImage} alt="enlarged-avatar" style={{objectFit: 'contain'}} />
              </div>
            </div>
          )}
          {/* End of Enlarged Image */}

          </div>
          
        </Container>
      
    </>
  );
};

const Container = styled.div`

  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: white;
  color: black;
  border-radius: 40px;
  overflow-y: auto;
  scrollbar-width: none;
  margin-left:30px;
  width: 91%;
  
  .brand {
    
    padding-top: 20px;
    height: fit-content;
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      margin: 0;
      background-color: #ffffff34;
      min-height: 3rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          height:40px;
          width: 40px;
          object-fit: cover;
        }
      }
      .username {
        h3 {
          color: BLACK;
          font-size: 15px;
          margin-bottom: 0;
        }
        span{
          font-size: 13px
        }
      }
    }
    .selected {
      background-color: rgb(231, 229, 229);
      width: 100%;
      padding-left: 30px;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height:40px;
        width: 40px;
        object-fit: cover;
      }
    }
    
    .username {
      h2 {
        color: white;
        font-size: 20px;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
  
  /* Enlarged Image Overlay */
  .enlarged-image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;

    .enlarged-image-container {
      max-width: 40%;
      max-height: 80%;
      overflow: hidden;

      img {
        max-width: 80%;
        max-height: 80%;
      }
    }
  }
`;
export default Contacts;

//refrence:

// import React, { useState, useEffect } from "react";
// import styled from "styled-components";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

// // import Logo from "../assets/logo.svg";

// interface Contact {
//   _id: string;
//   name: string;
//   image: image;

// }

// interface image{
//     imageURL: string;
// }

// interface Props {
//     contacts: Contact[];
//      // eslint-disable-next-line @typescript-eslint/no-explicit-any
//      currentUser: any;
//   changeChat: (contact: Contact) => void;
//   leaderData: Contact;
// }

// // interface LocalStorageData {
// //   username: string;
// //   avatarImage: string;
// // }

// const Contacts: React.FC<Props> = ({ contacts, changeChat, currentUser, leaderData  }) => {
//   const [currentUserName, setCurrentUserName] = useState<string | undefined>(
//     undefined
//   );
//   const [currentUserImage, setCurrentUserImage] = useState<string | undefined>(
//     undefined
//   );
//   const [currentSelected, setCurrentSelected] = useState<number | undefined>(
//     undefined
//   );
//   const projectId = sessionStorage.getItem("projectID");

//   useEffect(() => {
//     if (contacts.length > 0) {
//       setCurrentUserName(currentUser.name);
//       setCurrentUserImage(currentUser.image.imageURL);
//     //   console.log("Current user name:", contacts[0].name);
//     //   console.log("Current user image:", contacts[0].image.imageURL);
//     //   console.log("Current user image232:", currentUserImage);

//     }
//   }, [contacts]);

// //   const changeCurrentChat = (index: number, contact: Contact) => {
// //     setCurrentSelected(index);
// //     changeChat(contact);
// //   };
// const changeCurrentChat = (index: number, contact: Contact) => {
//     if (contact._id === leaderData._id) {
//       setCurrentSelected(0);
//       changeChat(contact);
//     } else {
//       setCurrentSelected(index);
//       changeChat(contact);
//     }
//   };

//   return (
//     <>
//       {currentUserImage && currentUserImage && (
//         <Container>
//           <div className="brand">
//             {/* <img src={Logo} alt="logo" /> */}
//             <h3>TASKHUB</h3>
//           </div>
//           <div className="contacts">
//           {leaderData && (
//               <div
//                 key={leaderData._id}
//                 className={`contact ${
//                   currentSelected === 0 ? "selected" : ""
//                 }`}
//                 onClick={() => changeCurrentChat(0, leaderData)}
//               >
//                 <div className="avatar">
//                   {leaderData.image && leaderData.image.imageURL ? (
//                     <img
//                       src={`data:image/jpeg;base64,${leaderData.image.imageURL}`}
//                       alt="avatar"
//                     />
//                   ) : (
//                     <FontAwesomeIcon
//                       icon={faUserCircle}
//                       className="avatar-placeholder"
//                     />
//                   )}
//                 </div>
//                 <div className="username">
//                   <h3>{leaderData.name}</h3><span>leader</span>
//                 </div>
//               </div>

//             )}

//             {contacts.filter(contact => contact._id !== currentUser._id )
//             .map((contact, index) => {
//                 // console.log(`Image source for ${contact.name}: data:image/jpeg;base64,${contact.image.imageURL}`);
//               return (
//                 <div
//                   key={contact._id}
//                   className={`contact ${
//                     index + 1 === currentSelected ? "selected" : ""
//                   }`}
//                   onClick={() => changeCurrentChat(index, contact)}
//                 >
//                   <div className="avatar">
//                   {contact.image && contact.image.imageURL ? (
//             <img src={`data:image/jpeg;base64,${contact.image.imageURL}`} alt="avatar" />
//           ) : (
//             <FontAwesomeIcon icon={faUserCircle} className="avatar-placeholder" />
//           )}
//         </div>
//                   <div className="username">
//                     <h3>{contact.name}</h3>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//           <div className="current-user">
//             <div className="avatar">
//               <img src={`data:image/jpeg;base64,${currentUserImage}`} alt="avatar" />

//             </div>
//             <div className="username">
//               <h2>{currentUserName}</h2>
//             </div>
//           </div>
//         </Container>
//       )}
//     </>
//   );
// };

// const Container = styled.div`
// display: grid;
// grid-template-rows: 10% 75% 15%;
// overflow: hidden;
// background-color: #080420;
// .brand {
//   display: flex;
//   align-items: center;
//   gap: 1rem;
//   justify-content: center;
//   img {
//     height: 2rem;
//   }
//   h3 {
//     color: white;
//     text-transform: uppercase;
//   }
// }
// .contacts {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   overflow: auto;
//   gap: 0.8rem;
//   &::-webkit-scrollbar {
//     width: 0.2rem;
//     &-thumb {
//       background-color: #ffffff39;
//       width: 0.1rem;
//       border-radius: 1rem;
//     }
//   }
//   .contact {
//     background-color: #ffffff34;
//     min-height: 5rem;
//     cursor: pointer;
//     width: 90%;
//     border-radius: 0.2rem;
//     padding: 0.4rem;
//     display: flex;
//     gap: 1rem;
//     align-items: center;
//     transition: 0.5s ease-in-out;
//     .avatar {
//       img {
//         height: 3rem;
//       }
//     }
//     .username {
//       h3 {
//         color: white;
//       }
//     }
//   }
//   .selected {
//     background-color: #9a86f3;
//   }
// }

// .current-user {
//   background-color: #0d0d30;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   gap: 2rem;
//   .avatar {
//     img {
//       height: 4rem;
//       max-inline-size: 100%;
//     }
//   }
//   .username {
//     h2 {
//       color: white;
//     }
//   }
//   @media screen and (min-width: 720px) and (max-width: 1080px) {
//     gap: 0.5rem;
//     .username {
//       h2 {
//         font-size: 1rem;
//       }
//     }
//   }
// }
// `;

// export default Contacts;
