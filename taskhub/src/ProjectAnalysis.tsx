import axios from 'axios';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PieChart from './PieCart';
import BarChart from './BarChart';

function ProjectAnalysis() {
    const navigate = useNavigate();
  const [analysis, setanalysis] = useState<any>([]);
  const [projectData, setProjectData] = useState<{ [key: string]: number }>({});
  const AdminToken = sessionStorage.getItem("Admin");

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
      .then(async (response) => {
        console.log(response.data.analysis);
        setanalysis(response.data.analysis);
        // const formattedData =
        // {'Completed Projects': analysis.completedProjects ,
        // 'Not Completed Projects': analysis.activeProjects - analysis.completedProjects, };
        setProjectData(response.data.projectProgress)
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
    return ( 
        <div>
                  <Navbar />

    <div style={{marginLeft: "300px", display: "flex", color: "black"}}>
    <div className='users'>
      <div className='content-center'>
        <p>Total Projects</p>
        {analysis.totalProjects}
    </div>
    </div>
    <div className='users'>
      <div className='content-center'>
    <p>Active Projects</p>
        {analysis.activeProjects}
    </div>
    </div>
    <div className='users'>
      <div className='content-center' >
    <p>Deleted Projects</p>
        {analysis.deletedProjects}
    </div>
    </div>
</div>
<div style={{marginLeft: "250px", display:"flex", width: '100%', justifyContent: 'center', alignItems: 'center'}}>
  <div style={{marginRight:"50px"}}>
    {projectData && <PieChart data={projectData} />}
    </div>

    <div>
    {analysis && analysis.projectFieldPercentage && <BarChart data={analysis.projectFieldPercentage} />}
    </div>
        </div>
        </div>
    );
}

export default ProjectAnalysis;