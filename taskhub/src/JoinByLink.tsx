import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import NavBarBig from './NavBarBig';
import Navbar from './Navbar';
import Header from './Header';

Modal.setAppElement('#root'); // Set the root element for accessibility

function JoinPage({ isOpen, onRequestClose }: any) {
  const { code } = useParams(); // Extract joining code from URL params
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const token = sessionStorage.getItem("userID");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } 
  }, []);
  
  const handleJoinClick = () => {
    setIsLoading(true);
    const token = sessionStorage.getItem('userID'); // Get the user ID from session storage
    axios.post(`${import.meta.env.VITE_PROJECT_API}/joinProjectByLink`, { joiningCode: code, token }, {
      headers: {
        Authorization: `UserLoginToken ${token}`,
      },
    })
      .then((response) => {
        setResponseMessage(response.data.message);
      })
      .catch((error) => {
        console.error('Error joining:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setResponseMessage(error.response.data.message);
        } else {
          setResponseMessage('Failed to join. Please try again.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div>
      <Navbar />
      <Header />
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Join Project"
      style={{
        content: {
          width: '390px',
          height: 'fit-content',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: "1px solid #ccc",
          borderRadius: "30px",
          padding: "20px",
          zIndex: 1, 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
      >
      <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "#001831"}}>
        <h1>Join Page</h1>
        <p>Joining Code: {code}</p>
        {responseMessage && (
          <p style={{ color: responseMessage.includes('successfully') ? 'green' : 'red' }}>
            {responseMessage}
          </p>
        )}
        <button onClick={handleJoinClick} disabled={isLoading} style={{backgroundColor: "#001831"}}>
          {isLoading ? 'Joining...' : 'Join'}
        </button>
      </div>
    </Modal>
            </div>
  );
}

export default JoinPage;
