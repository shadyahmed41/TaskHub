import axios from 'axios';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PieChart from './PieCart';
import BarChart from './BarChart';

function UserAnalysis() {
    const navigate = useNavigate();
  const [analysis, setanalysis] = useState<any>([]);

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
  <div style={{marginLeft: "300px", display: "flex", color: "black"}}>
    <div className='users'>
        <div className="content-center">
            <p>Total Users</p>
            {analysis.totalUsers}
        </div>
    </div>
    <div className='users'>
        <div className="content-center">
            <p>Active Users</p>
            {analysis.activeUsers}
        </div>
    </div>
    <div className='users'>
        <div className="content-center">
            <p>Deleted Users</p>
            {analysis.deletedUsers}
        </div>
    </div>
</div>
<div style={{marginLeft: "250px", width: '80%', justifyContent: 'center', alignItems: 'center'}}>
    <div style={{width:"50%", display:'inline-block'}}>
        {analysis && analysis.ageRangeDistribution && <PieChart data={analysis.ageRangeDistribution} />}
    </div>
    <div style= {{width:"50%", display:"inline-block"}}>
        {analysis && analysis.userFieldPercentage && <BarChart data={analysis.userFieldPercentage} />}
    </div>
</div>

        </div>
    );
}

export default UserAnalysis;