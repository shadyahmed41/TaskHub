import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './css/About.css';
import { FaArrowLeft, FaArrowRight, FaInfo } from 'react-icons/fa'; // Assuming you're using Font Awesome icons
import NavBarCurrent from './NavBarCurrent';
import Navbar from './Navbar';
import main from './pics/main.jpg';
import backend1 from './pics/backend1.jpeg';
import backend2 from './pics/backend2.jpeg';
import backend3 from './pics/backend3.jpeg';
import frontend1 from './pics/frontend1.jpg';
import frontend2 from './pics/frontend2.jpg';
import frontend3 from './pics/frontend6.jpeg';
import min from "./pics/plain-text.png";
import com from "./pics/communication.png";
import rank from "./pics/ranking.png"
import free from "./pics/free.png"


const About = () => {
//     const CustomPrevArrow = (props: any) => {
//       const { className, style, onClick } = props;
//       return (
//         <div className={className} style={{ ...style, left: '10px', color: 'black', fontSize: '30px' }} onClick={onClick}>
//           <FaArrowLeft />
//         </div>
//       );
//     };
  
    const CustomNextArrow = (props: any) => {
      const { className, style, onClick } = props;
      return (
        <div className={className} style={{ ...style, right: '10px', color: 'black', fontSize: '30px'}} onClick={onClick}>
          <FaArrowRight />
        </div>
      );
    };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    // prevArrow: <CustomPrevArrow />,
    // nextArrow: <CustomNextArrow />,
  };

  const settings2 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <CustomNextArrow />,

  }

  
  return (
<div className='about dashboard' style={{display: "flex"}}>
        <div>
        <Navbar />
        {/* current */}
       <div style={{position: 'absolute',top:'200px'}}>
          <NavBarCurrent icon={<FaInfo />} text="About"></NavBarCurrent>
         </div>
         </div>
        {/* end of current */}

        {/* ABOUT */}
        <div  className='main'>      
        
        {/* header */}
        <div className='headerstory'>
            <img src={main} className='img' style={{width: '82.9vw', height: '450px', opacity: '40%', objectFit: 'cover'}}/>
            <h1>Our Story</h1>
        </div>

        {/* first slider */}
        <div style={{marginLeft: '50px', width: '1100px'}}>
        <Slider {...settings} >

        <div className="slide">
          <h2>Welcome to TaskHub</h2>
          <p>your one stop solution for efficient project management and seamless collaboration</p>
        </div>

        <div className="slide">
          <h2>Our Beggining</h2>
          <p>TaskHub was born out of our passion to solve the challenges faced by students and startups in the project management platforms.</p>
        </div>

        <div className="slide">
          <h2>Our goal</h2>
          <p>We started as a graduatioin project to create a platform that fits everyone from junior student till international companies</p>
        </div>

      </Slider>
      </div>


      <div
        className="landingcontainerall"
        style={{ position: "absolute", marginTop: "330px", width: '1150px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5e5ff' }}
      >
        <h2 style={{  fontSize: '25px', marginRight: '70px' }}>Our Story</h2>
        <p style={{width:'55%', color: 'grey', marginLeft: '50px'}}>Our journey with TaskHub began when we chose to develop it as our graduation project, despite facing competition from established giants in project management. <p style={{color: 'grey'}}>Our goal was clear: to create a platform that caters to all users, unlike the complex designs of our competitors that often exclude students and casual users. We aimed to strike a balance by offering a simple yet comprehensive design, integrating essential functionalities alongside innovative ideas.</p> Our primary mission is to make TaskHub accessible to everyone, ensuring comfort and organization for all users, including professionals in companies.</p>
    </div>

      <div
        className="landingcontainerall"
        style={{ position: "absolute", marginTop: "1800px", width: '1150px' }}
      >
        <h2 style={{ textAlign: "center", fontSize: '25px' }}>Why are we different?</h2>

        <div
          className="landingbox-container"
          style={{ position: "absolute", marginTop: "30px" }}
        >
          <div className="landingbox one" style={{width: '240px'}}>
            <img
            className='img'
              src={min}
              style={{
                maxWidth: "30px",
                maxHeight: "30px",
                paddingTop: "20px",
                paddingLeft: "100px",
              }}
            />
            <h4 style={{ color: "black", textAlign: 'center' }}>
              Made simple!
            </h4>
            <p
              style={{
                color: "black",
                fontSize: '15px',
                paddingTop: "0px",
                marginTop: "0px",
                paddingLeft:"20px",
              }}
            >
              {" "}
              The most minimalist user interface to keep everything organized
              and simple
            </p>
          </div>
          <div className="landingbox two" style={{width: '240px'}}>
            <img
            className='img'
              src={com}
              style={{
                maxWidth: "30px",
                maxHeight: "30px",
                paddingTop: "20px",
                paddingLeft: "100px",
              }}
            />
            <h4 style={{ color: "black", textAlign: 'center' }}>
              Communication is Key!
            </h4>
            <p style={{ color: "black", padding: "8px", marginTop: "0px" ,paddingLeft:"20px", fontSize: '15px'}}>
              communicate with your team through chats, meetings, and posts.
            </p>
          </div>
          <div className="landingbox three" style={{width: '240px'}}>
            <img
            className='img'
              src={rank}
              style={{
                maxWidth: "30px",
                maxHeight: "30px",
                paddingTop: "20px",
                paddingLeft: "100px",
              }}
            />
            <h4 style={{ color: "black", textAlign: 'center' }}>
              It can be competitive!
            </h4>
            <p style={{ color: "black", padding: "8px", marginTop: "0px" ,paddingLeft:"20px", fontSize: '15px'}}>
              Knowing how much work your team have accomplished could motivate you!
            </p>
          </div>
          <div className="landingbox four" style={{width: '240px'}}>
            <img
            className='img'
              src={free}
              style={{
                maxWidth: "30px",
                maxHeight: "30px",
                paddingTop: "20px",
                paddingLeft: "100px",
              }}
            />
            <h4 style={{ color: "black", textAlign: 'center' }}>
              Completely free!
            </h4>
            <p style={{ color: "black", padding: "8px", marginTop: "0px",paddingLeft:"20px", fontSize: '15px' }}>
              No need to worry about expensive plans and limited access.
            </p>
          </div>
        </div>
      </div>

        {/* frontend */}
        <div style={{display: 'flex', width: '1100', height: '500px', marginTop: '550px'}}>
            <div style={{width: '50%', marginLeft: '50px', marginTop: '10px'}}>
                <h2 style={{ fontSize: '35px'}}>The Frontend Team</h2>
                <p style={{color:'black'}}>Our frontend team at TaskHub embodies creativity and design expertise, infusing our platform with unique touches that breathe life into TaskHub. </p>
                <p>Their innovative approach and attention to detail have been pivotal in shaping TaskHub into a dynamic and user-friendly platform, captivating users and setting new standards in the industry.</p>
            </div>
      {/* 2nd slider frontend */}
      <div style={{position: 'absolute', width: '40%', right: '50px'}}>
        <Slider {...settings} >
        
        <div className="slide">
            <img src={frontend2} className='img'/>
        </div>

        <div className="slide">
          <img src={frontend1} className='img'/>
        </div>

        <div className="slide">
          <img src={frontend3} className='img'/>
        </div>

      </Slider>
      </div>
      </div>
      {/* end of frontend */}

       {/* backend */}
       <div style={{display: 'flex', width: '1100', height: '600px'}}>
            
      {/* 3rd slider backend */}
      <div style={{ width: '40%', marginLeft: '50px'}}>
        <Slider {...settings} >
        
        <div className="slide">
            <img src={backend3} className='img'/>
        </div>

        <div className="slide">
          <img src={backend2} className='img'/>
        </div>

        <div className="slide">
            <img src={backend1} className='img'/>
        </div>

      </Slider>
      </div>

      <div style={{width: '35%', position: 'absolute', right: '50px', marginTop: '10px'}}>
                <h2 style={{fontSize: '35px'}}>The Backend Team</h2>
                <p style={{color: 'black'}}>Our backend team at TaskHub is the backbone of our platform, leveraging their expertise in database management and server-side technologies to bring functionality to life. </p>
                <p>They are the driving force behind our vision. Overcoming numerous challenges, they continually embrace risks turning TaskHub from an idea into a fully functional reality </p>
            </div>

      </div>
      {/* end of backend */}

        
        
       {/* bts */}
       {/* <div style={{ width: '1100px', height: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '400px', marginLeft: '100px'}}>
            <h2 style={{color: 'black'}}>Behind The Scenes</h2>
            <div style={{ width: '100%', objectFit: 'cover'}}>
              <Slider {...settings2} >
              
              <div className="slide">
                  <img src={BTS1} className='img'/>
              </div>
      
              <div className="slide">
                <img src={BTS2} className='img'/>
              </div>
      
              <div className="slide">
                  <img src={BTS3} className='img'/>
              </div>
            
              <div className="slide">
                  <img src={BTS4} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS5} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS6} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS7} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS8} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS9} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS10} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS11} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS12} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS13} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS14} className='img'/>
              </div>

              <div className="slide">
                  <img src={BTS15} className='img'/>
              </div>


            </Slider>
            </div>
      
            </div> */}
            {/* end of bts */}


            <div style={{height: '400px'}}></div>



    </div>
    </div>
  );
};

export default About;
