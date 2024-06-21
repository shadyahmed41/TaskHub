import React, { useState, useEffect } from "react";
import "./css/members.css";
import './css/dashboard.css'
import NavBarBig from "./NavBarBig";
import axios from "axios";
import { To, useNavigate } from "react-router-dom";
import { FaTrash, FaUserCircle } from "react-icons/fa";
import NavBarCurrent from "./NavBarCurrent";
import { FaUserGroup } from "react-icons/fa6";
import Loading from "./Loading";

function Members() {
  const navigate = useNavigate();
  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };

  interface ProjectDetails {
    joiningCode: string;
  }

  interface Member {
    image: {
      imageURL: string;
    };
    name: string;
    email: {
      address: string;
    };
    phone: {
      number: string;
    };
    _id: string;
  }

  const [showAddMembersPopup, setShowAddMembersPopup] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [emailInput, setEmailInput] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [details, setDetails] = useState("");
  
  const [showRequestsPopup, setShowRequestsPopup] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);

  const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image

  const projectId = sessionStorage.getItem("projectID");

  const token = sessionStorage.getItem("userID");
  useEffect(() => {
    // Check if token exists in session storage
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      // Fetch members data from the backend when the component mounts
      fetchMembers();

      axios.get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader-and-user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        const { leaderId, userId, userEmail, joiningCode } = response.data;
        setProjectLeader(leaderId);
        setCurrentUser(userId);
        setDetails(joiningCode);
        setLoading(false); // Set loading to false after fetching data
      })
      .catch((error) => {
        console.error("Error fetching project leader and current user:", error);
      });
      // if (projectLeader === currentUser && projectLeader != null) {
      //   // Fetch project details only if the current user is the leader
      //   getProjectDetails(projectId)
      //     .then((details) => {
      //       setDetails(details);
      //     })
      //     .catch((error) => {
      //       console.error("Error fetching project details:", error);
      //     });
      // }
    }
  }, [projectId, token, navigate]);

  function getProjectDetails(projectId: any) {
    return axios
      .get(
        `${import.meta.env.VITE_PROJECT_API}/get-project-details/${projectId}`,
        {
          headers: {
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        const responseData = response.data;
        if (responseData.success) {
          const project = responseData.project;
          // console.log('Project details:', project);
          setDetails(project); // Set the details state with the retrieved project
          return project;
        } else {
          console.error("Error:", responseData.message);
          return null;
        }
      })
      .catch((error) => {
        console.error("Error fetching project details:", error);
        return null;
      });
  }

  function getProjectLeader(projectId: any) {
    return axios
      .get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader`)
      .then((response) => {
        return response.data.leaderId;
      })
      .catch((error) => {
        console.error("Error fetching project leader:", error);
        return null;
      });
  }

  function getCurrentUser(token: any) {
    return axios
      .get(`${import.meta.env.VITE_USER_API}/user/id`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        return response.data.userId;
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
        return null;
      });
  }

  const fetchMembers = () => {
    axios
      .get(`${import.meta.env.VITE_PROJECT_API}/project-members/${projectId}`)
      .then((response) => {
        setMembers(response.data.members);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
      });
  };

  const handleCopyClick = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {})
      .catch((error) =>
        console.error("Unable to copy text to clipboard:", error)
      );
  };

  const handleInputChange: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    const searchQuery = event.currentTarget.value.trim();
    setEmailInput(searchQuery);

    if (searchQuery.length === 0) {
      setFilteredMembers([]);
      return;
    }

    searchMembers(searchQuery)
      .then((filteredMembers) => {
        setFilteredMembers(filteredMembers);
      })
      .catch((error) => {
        console.error("Error filtering members:", error);
        setFilteredMembers([]);
      });
  };

  const handleFilteredMemberClick = (member: string) => {
    setEmailInput(member); // Set the value of the clicked member to emailInput
    setFilteredMembers([]); // Clear the filtered members list
  };

  const searchMembers = (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      return Promise.resolve([]);
    }

    return axios
      .get(
        `${
          import.meta.env.VITE_PROJECT_API
        }/project/${projectId}/addusers/emails`
      )
      .then((response) => {
        const members = response.data;

        const filteredMembers = members.filter((member: string | string[]) =>
          member.includes(searchQuery.trim())
        );

        return filteredMembers;
      })
      .catch((error) => {
        console.error("Error searching members:", error);
        return [];
      });
  };

  function addUserToProject() {
    // Send a POST request to add the user to the project
    axios
      .post(
        `${import.meta.env.VITE_PROJECT_API}/joinProjectByEmail`,
        {
          projectId,
          email: emailInput,
        },     

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // alert(response.data.message);
        fetchMembers();
        // You can modify this to display a success message in a different way
      })
      .catch((error) => {
        console.error("Error adding user to project:", error);
        // Handle errors, e.g., display an error message
      });
  }

  function deleteMember(memberId: string) {
    axios
      .delete(
        `${
          import.meta.env.VITE_PROJECT_API
        }/delete-member/${projectId}/${memberId}`,
        {}
      )
      .then((response) => {
        if (response.data.success) {
          fetchMembers();
        }
      })
      .catch((error) => {
        console.error("an error occured while deleting", error);
      });
  };

   // Function to fetch join requests
   const fetchJoinRequests = () => {
    axios
      .get(`${import.meta.env.VITE_PROJECT_API}/requestedMembers/${projectId}`)
      .then((response) => {
        setJoinRequests(response.data.data.requestedMembers);
        console.log(response);
      })
      .catch((error) => {
        console.error("Error fetching join requests:", error);
      });
  };

  // Function to handle accepting a join request
  const acceptJoinRequest = (userId: any) => {
    axios
      .post(`${import.meta.env.VITE_PROJECT_API}/acceptJoiningRequest`, {
        projectId,
        userId,
      })
      .then((response) => {
        console.log("Join request accepted:", response.data);
        // console.log(userId)
        // Refetch join requests after accepting
        fetchJoinRequests();
      })
      .catch((error) => {
        console.error("Error accepting join request:", error);
      });
  };

  // Function to handle rejecting a join request
  const rejectJoinRequest = (userId: any) => {
    axios
      .post(`${import.meta.env.VITE_PROJECT_API}/rejectJoiningRequest`, {
        projectId,
        userId,
      })
      .then((response) => {
        console.log("Join request rejected:", response.data);
        // Refetch join requests after rejecting
        fetchJoinRequests();
      })
      .catch((error) => {
        console.error("Error rejecting join request:", error);
      });
  };

  // if (loading || projectLeader === null || currentUser === null) {
  //   return <Loading/>;
  // }


  const handleImageClick = (imageUrl: any) => {
    setEnlargedImage(imageUrl); // Toggle the enlarged image state
  };

  return (
    <div className="membersmain">
      <NavBarBig />
      <div style={{position: 'absolute',top:'450px'}}>
          <NavBarCurrent icon={<FaUserGroup/>} text="Members" click="/members"></NavBarCurrent>
         </div>

      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className="main">
          <center>
            <h2 style={{marginTop: '50px'}}>Project's Members</h2>
            </center>
          <hr/>

          {/* BUTTONS HEADER */}
            {projectLeader && currentUser === projectLeader && (
          <div style={{margin: '20px 40px'}}>
            {/* join request button */}
            <button
            className="membersbtn"
              onClick={() => {
                setShowRequestsPopup(true);
                fetchJoinRequests(); // Fetch join requests when the button is clicked
              }}
            >
              Requests
            </button>
          {/* add member button */}
              <button
              className="membersbtn"
              style={{ position: 'absolute', right: '60px' }}
              onClick={() => setShowAddMembersPopup(true)}
              >
                + Add Members
              </button>
            </div>
            )}
            {/* join requests popup */}
            {showRequestsPopup && (
              <div className='popuprequests'>
                <center>
                  <h3 style={{ color: "#7d21b3" }}>Join Requests</h3>
                  <hr/>

                  {joinRequests.length > 0 ? (
                    <ul>
                      {joinRequests.map((request: any) => (
                        <li key={request.id}>
                          <span style={{ color: "black" }}>
                            {request.name} wants to join
                          </span>{" "}
                          <br />
                          <button onClick={() => acceptJoinRequest(request.id)}>
                            Accept
                          </button>
                          <button onClick={() => rejectJoinRequest(request.id)}>
                            Reject
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "lightgray" }}>No requests</p>
                  )}
                  <button onClick={() => setShowRequestsPopup(false)} className="closebutton">
                    Cancel
                  </button>
                </center>
              </div>
            )}
          {/* Add Members Popup */}
      {showAddMembersPopup && (
        <div className="popup" style={{}}>
        <center>
        <h3>Add Members</h3>
        </center>
        <center>
          {/* <h3>Add Members</h3> */}
          <hr />

          <div className="addmembers">
            <div className="AMways">
              Member's Email
              <br />
              <br />
              <input
                style={{ height: "4px", width: "150px" ,border:" 1px solid black",marginBottom:"10px"}}
                className="inputways"
                placeholder="user@example.com"
                value={emailInput}
                onKeyUp={handleInputChange}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                }}
              />
              {filteredMembers.length > 0 && (
                <div className="suggestionsforaddingmember" >
                  {filteredMembers.map((member, index) => (
                    <div
                      key={index}
                      className="eachsuggestionforaddingmember"
                      onClick={() => handleFilteredMemberClick(member)}
                    >
                      {member}
                    </div>
                  ))}
                </div>
              )}
              <button className="buttonways" onClick={addUserToProject}>
                add
              </button>
            </div>
            <hr />
            <div className="AMways">
              Project Code
              <br />
              <br />
              <div className="inputways" style={{ height: "35px", width: "150px" ,border:" 1px solid black",marginBottom:"10px"}}>{details}</div>{" "}
              {/* Check if details.project is defined */}
              <button
                className="buttonways"
                onClick={() => handleCopyClick(details)}
              >
                copy
              </button>
            </div>
            <hr />
            <div className="AMways">
              Project Link
              <br />
              <br />
              <div className="inputways" style={{ height: "35px", width: "150px" ,border:" 1px solid black",marginBottom:"10px",whiteSpace: "nowrap", 
  overflow: "hidden", 
  textOverflow: "ellipsis"}}>{`${import.meta.env.VITE_CLIENT_HOST}/joinrequest/${details}`}</div>
              <button
                className="buttonways"
                onClick={() =>
                  handleCopyClick(
                    `${import.meta.env.VITE_CLIENT_HOST}/joinrequest/${details}`
                  )
                }
              >
                copy
              </button>
            </div>
          </div>

          <button
            className="closebutton"
            
            onClick={() => {
              setShowAddMembersPopup(false);
              setEmailInput("");
              setFilteredMembers([]);
            }}
          >
            Cancel
          </button>
        </center>
      </div>
      )}
          <div style={{color: 'black', display: 'flex', marginLeft: '160px', marginBottom: '0'}}>  
                  <p style={{ marginLeft: "0px", fontSize: '15px' }}>Name</p>
                  <p style={{ marginLeft: "260px" }}>Email</p>
                  <p style={{marginLeft: '500px'}}>Phone Number</p>
              </div>
            {!loading &&
          <div className="members" >
            {members.map((member, index) => (
              <div className="Onemember" key={index}>
                <div style={{ display: "flex" }}>
                  {member.image && member.image.imageURL ? (
                    <img
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                      
                      src={`data:image/jpeg;base64,${member.image.imageURL}`}
                      alt="User"
                      className="avatar-image"
                      onClick={() => handleImageClick(`data:image/jpeg;base64,${member.image.imageURL}`)}

                    />
                  ) : (
                    <FaUserCircle
                      style={{
                        width: "40px",
                        height: "40px",
                        color: "grey",
                      }}
                    />
                  )}
                   {/* Enlarged Image */}
          {enlargedImage && (
            <div className="Menlarged-image-overlay" onClick={() => setEnlargedImage(null)}>
              <div className="enlarged-background">
              </div>
              <div className="enlarged-image-container">
                <img className="enlarged-img" src={enlargedImage} alt="enlarged-avatar" style={{objectFit: 'contain'}} />
              </div>
            </div>
          )}
          {/* End of Enlarged Image */}


                </div>
                <div style={{ width: "300px", justifyContent: "center" }}>
                  <p style={{ marginLeft: "50px", fontSize: '15px' }}>{member.name}</p>
                </div>
                <p style={{ marginLeft: "50px" }}>{member.email.address}</p>
                <div style={{ marginLeft: "auto", display: "flex" }}>
                  <p>{member.phone.number}</p>
                  {currentUser && projectLeader && currentUser === projectLeader && (
                    <FaTrash
                    className="trash"
                    onClick={() => deleteMember(member._id)}
                    />
                  )}{" "}
                </div>
              </div>
            ))}
          </div>
          }
          {loading && <Loading />}
        </div>
      </div>
      {showAddMembersPopup && <div className='backdrop'></div>}
         {showRequestsPopup && <div className='backdrop'></div>}
    </div>
  );
}

export default Members;
