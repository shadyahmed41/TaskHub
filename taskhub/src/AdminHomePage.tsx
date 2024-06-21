import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBarBig from "./NavBarBig";
import Navbar from "./Navbar";
import { FaAirbnb, FaChartBar } from "react-icons/fa";
import "./css/AdminHomePage.css";



function AdminHome() {
  const navigate = useNavigate();
  const [analysis, setanalysis] = useState<any>([]);
  // Get current date
  const currentDate = new Date();
  const AdminToken = sessionStorage.getItem("Admin");

  // Format date as Apr, 23
  const options = { month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
  const formattedDate = currentDate.toLocaleDateString('en-US', options);
  useEffect(() => {
    if (!AdminToken) {
      navigate("/adminlogin");
    } else {
      getAnalysis();
    }
  }, []);
  const getAnalysis = async () => {
    await axios
      .get(`${import.meta.env.VITE_ADMIN_API}/analysis`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `AdminToken ${AdminToken}`,
        },
      })
      .then((response) => {
        console.log(response.data.analysis);
        setanalysis(response.data.analysis);
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
  return (
    <div>
      <Navbar />
      <center><h1 style={{color: "purple"}}>Admin Page</h1></center>
      <br />
      <br />
      <br />

      <div className="analysis2">
        <div>Name</div>
        <div style={{marginLeft: "21%"}}>Last Update</div>
        <div style={{marginLeft: "20%"}}>Active</div>
        <div style={{marginLeft: "26%"}}>Deleted</div>
      
      </div>

      <div className="analysis"
      onClick={() => {
        navigate("/useranalysis");
      }}>

        <FaChartBar style={{marginRight: "30px"}}
        />
        <div style={{marginRight:"28px"}}>User Analysis</div>
        <div style={{marginLeft: "18%"}}>{formattedDate}</div>
        <div style={{marginLeft: "22%", 
                    backgroundColor: "green", 
                    borderRadius: "20px",
                    width: "fit-content",
                    minWidth: "20px",
                    paddingRight: "20px",
                    paddingLeft: "20px",
                    height: "fit-content"
                    }}>{analysis.activeUsers}</div>
        <div style={{marginLeft: "25%",
                    backgroundColor: "red", 
                    borderRadius: "20px",
                    width: "fit-content",
                    minWidth: "20px",
                    paddingRight: "20px",
                    paddingLeft: "20px",
                    height: "fit-content"
        }}>{analysis.deletedUsers}</div>
        
    
      </div>
    <div className="analysis"
    onClick={() => {
      navigate("/projectanalysis");
    }}>
    <FaChartBar style={{marginRight: "30px"}}/>

        <div>Projects Analysis</div>
        <div style={{marginLeft: "18%"}}>{formattedDate}</div>
        <div style={{marginLeft: "22%",
                      backgroundColor: "green", 
                      borderRadius: "20px",
                      width: "fit-content",
                      minWidth: "20px",
                      paddingRight: "20px",
                      paddingLeft: "20px",
                      height: "fit-content"
        }}>{analysis.activeProjects}</div>
        <div style={{marginLeft: "25%",
          backgroundColor: "red", 
          borderRadius: "20px",
          width: "fit-content",
          minWidth: "20px",
          paddingRight: "20px",
          paddingLeft: "20px",
          height: "fit-content"
        }}>{analysis.deletedProjects}</div>
        
      </div>
    </div>
  );
}

export default AdminHome;
