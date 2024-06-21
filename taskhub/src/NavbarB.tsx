import './css/homepage.css';
import React from 'react';
import logo from './pics/TaskHublogo.png';
import {
  FaHome,
  FaTachometerAlt,
  FaTasks,
  FaCalendarAlt,
  FaUsers,
  FaComments,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

function NavbarB() {
  return (
    <div className='navbar'>
      <img src={logo} style={{ margin: '50px' }} alt="TaskHub Logo" />
      
      <div className='navcontent'>
        <FaHome style={{ marginRight: '25px', paddingTop: '5px' }} />
        Home
      </div>
      
      <div className='navcontent'>
        <FaTachometerAlt style={{ marginRight: '25px', paddingTop: '5px' }} />
        Dashboard
      </div>
      
      <div className='navcontent'>
        <FaTasks style={{ marginRight: '25px', paddingTop: '5px' }} />
        Tasks
      </div>
      
      <div className='navcontent'>
        <FaCalendarAlt style={{ marginRight: '25px', paddingTop: '5px' }} />
        Meetings
      </div>
      
      <div className='navcontent'>
        <FaUsers style={{ marginRight: '25px', paddingTop: '5px' }} />
        Members
      </div>
      
      <div className='navcontent'>
        <FaComments style={{ marginRight: '25px', paddingTop: '5px' }} />
        Chats
      </div>
      
      <div className='navcontent'>
        <FaChartBar style={{ marginRight: '15px', paddingTop: '5px' }} />
        Gantt Chart
      </div>
      
      <div className='navcontent'>
        <FaCalendarAlt style={{ marginRight: '25px', paddingTop: '5px' }} />
        Calendar
      </div>
      
      <div className='navcontent'>
        <FaUser style={{ marginRight: '25px', paddingTop: '5px' }} />
        Profile
      </div>
      
      <div className='navcontent'>
        <FaCog style={{ marginRight: '25px', paddingTop: '5px' }} />
        My Profile
      </div>
      
      <div className='navcontent'>
        <FaSignOutAlt style={{ marginRight: '25px', paddingTop: '5px' }} />
        Logout
      </div>

    </div>
  );
}

export default NavbarB;
