/* eslint-disable react-hooks/rules-of-hooks */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    projects: Array<{
        projectId: string; projectName: string }>; // Assuming projects only have a projectName for simplicity
    token: string; 
    refresh: any;
     
    
}

const Modal: React.FC<ModalProps> = ({ isOpen, closeModal, projects, token, refresh }: any) => {
    if (!isOpen) return null;

    // const projectId = sessionStorage.getItem("projectID");

    const [newLeader, setNewLeader] = useState<{ [key: string]: string }>({});
    // const [suggestions, setSuggestions] = useState([]);
    const [suggestions, setSuggestions] = useState<{ [key: string]: string[] }>({});

    const searchMembers = (searchQuery: string, projectId: any) => {
        if (searchQuery.trim().length === 0) {
          return Promise.resolve([]);
        }
        console.log("attempt front");
    
        return axios
          .get(
            `${import.meta.env.VITE_PROJECT_API}/project/${projectId}/users/emails`
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

      const handlepromotedChange = (event: any, projectId: any) => {
    const searchQuery = event.currentTarget.value.trim();
    // setNewLeader(searchQuery);
    // setNewLeader(prev => ({ ...prev, [projectId]: searchQuery }))

    if (searchQuery.length === 0) {
      setSuggestions(prev => ({ ...prev, [projectId]: [] }));
      return;
    }

    searchMembers(searchQuery, projectId)
      .then((filteredMembers) => {
        setSuggestions(prev => ({ ...prev, [projectId]: filteredMembers }));
    })
      .catch((error) => {
        console.error("Error filtering members:", error);
        setSuggestions(prev => ({ ...prev, [projectId]: [] }));
    });
  };

    const handleLeaveProjectLeader = async (projectId: string) => {
        const email = newLeader[projectId];
        if (!email || email.trim() === '') {
            toast.error('Please enter a new leader email');
            return;
        }

        // Prepare the data to be sent in the request payload
        const newLeaderData = {
            projectId,
            newLeaderEmail: email, // Send the email to the server
        };

        try {
            // Send the request to the server to update the project leader
            const response = await axios.put(
                `${import.meta.env.VITE_PROJECT_API}/update-project-leader/${projectId}`,
                newLeaderData,
                {
                    headers: {
                        Authorization: `UserLoginToken ${token}`,
                    },
                }
            );
            if (response.data.success) {
                toast.success("Project leader changed successfully.");
                // Reset the new leader input
                setNewLeader(prev => ({ ...prev, [projectId]: '' }));
                // Trigger a refresh in the parent component
                refresh();
            }
        } catch (error) {
            console.error("Error leaving project", error);
            toast.error("Failed to leave project");
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 5,
            height: '100vh'
        }}>
          {/* <ToastContainer /> */}
            <div style={{
                padding: 20,
                background: '#fff',
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.26)',
                width: '40%',
                maxHeight: '500px',
            }}>
                <h2>Confirm Delete Account</h2><hr/>
                <p style={{color: 'black', marginLeft: '20px'}}>assign a leader to the projects that you lead to complete the action</p><br/>
                <ul style={{overflow: 'auto', maxHeight: '200px'}}>
                    {projects.map((project: any) => (
                      <div style={{height: '40px', width: '550px', position: 'relative'}}>
                        {/* list of projects i am leader in */}
                        <li key={project.projectId} style={{ color: 'black' }}>
                            {/* project name */}
                            <span style={{width: 'fit-content'}}>{project.projectName}</span>
                            {/* input member */}
                            <input
                            placeholder="Enter Member's Email"
                                style={{ backgroundColor: 'transparent', color: 'black', marginRight: 0, width: 'fit-content', position: 'absolute', right: '150px' }}
                                value={newLeader[project.projectId]}
                                onChange={(e) => setNewLeader(prev => ({ ...prev, [project.projectId]: e.target.value }))}
                                onKeyUp={(e) => handlepromotedChange(e, project.projectId)}
                            />
                            {/* save button */}
                            <button onClick={() => handleLeaveProjectLeader(project.projectId)}  className='confirmbtn'
                            style={{position: 'absolute', right: '0px'}}>
                              Save</button>
                            {/* suggest dropdown */}
                            {suggestions[project.projectId] && (
                          <div className="suggestions">
                            {suggestions[project.projectId].map((member, index) => (
                              <div
                              className='eachsuggestion'
                                key={index}
                                onClick={() => {setNewLeader(prev => ({ ...prev, [project.projectId]: member })); setSuggestions(prev => ({ ...prev, [project.projectId]: [] }));
                                ;}}
                              >
                                {member}
                              </div>
                            ))}
                          </div>
                        )}
                        </li>
                        </div>
                    ))}
                </ul>
                <button onClick={closeModal} style={{ marginTop: 20, marginLeft: '500px' }} className='cancelbtn'>
                    Cancel
                </button>
            </div>

        </div>
    );
};
export default Modal;