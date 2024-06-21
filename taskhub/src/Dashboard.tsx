import React, { useEffect, useRef, useState } from "react";
import "./css/dashboard.css";
import NavBarBig from "./NavBarBig";
import Navbar from "./Navbar";
import {
  FaArrowAltCircleDown,
  FaArrowCircleRight,
  FaCheck,
  FaComment,
  FaFlag,
  FaForward,
  FaHeart,
  FaHome,
  FaReply,
  FaThumbsUp,
  FaTrash,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
// import FavoriteIcon from '@material-ui/icons/Favorite';
import LeaderHp from "./LeaderHP";
import MemberHp from "./MemberHP";
import { To, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment-timezone";
import { LuFlagTriangleRight } from "react-icons/lu";
import { GoTriangleRight } from "react-icons/go";
import Notification from "./Notification";
import NavBarCurrent from "./NavBarCurrent";
import Header from "./Header";
import Loading from "./Loading";

function Dashboard() {
  const navigate = useNavigate();
  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };
  const timeZone = "Etc/GMT";

  // Define the interface for post data
  interface Post {
    _id: string;
    projectId: string;
    message: string;
    date: Date;
    likes: string[]; // Assuming likes are stored as user IDs
    liked: boolean;
    comments: Comment[];
    file?: {
      fileURL: string;
      fileName: string;
    };
    image?: {
      imageURL: string;
      imageName: string;
    };
    leaderId: string;
    leaderName: string;
    leaderImage: {
      imageURL: string;
      imageName: string;
    };
  }

  // Define the interface for a comment
  interface Comment {
    _id: string;
    user: {
      _id: string;
      name: string;
      image: {
        imageURL: string;
        imageName: string;
      };
    }; // Assuming user is stored as user ID
    message: string;
    date: Date;
    likes: string[]; // Assuming likes are stored as user IDs
    replies: Reply[];
  }

  // Define the interface for a reply
  interface Reply {
    _id: string;
    user: {
      _id: string;
      name: string;
      image: {
        imageURL: string;
        imageName: string;
      };
    }; // Assuming user is stored as user ID
    message: string;
    date: Date;
    likes: string[]; // Assuming likes are stored as user IDs
  }
  // interface User {
  //   name: string;
  //   email: {
  //     address: string;
  //     isVerified: boolean;
  //   };
  //   password: string;
  //   phone: {
  //     number: string;
  //     isVerified: boolean;
  //   };
  //   bdate: Date;
  //   image?: {
  //     imageURL: string;
  //     imageName: string;
  //   };
  // }

  interface MemberProgress {
    memberName: string;
    memberImage: {
      imageName: string;
      imageURL: string;
    };
    progress: number;
    allTasks: number;
    completedTasks: number;
  }

  const [numberOfDivs, setNumberOfDivs] = useState(5);
  const [heightValue, setHeightValue] = useState(59); // Default height value
  const [projectLeader, setProjectLeader] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  // const [user, setUser] = useState<User>();
  const [likedPosts, setLikedPosts] = useState<string[]>([]); // Track liked posts
  const [likedComments, setLikedComments] = useState<string[]>([]); // Track liked posts
  const [likedReply, setLikedReply] = useState<string[]>([]); // Track liked posts
  // const [isliked, setisliked] = useState(false);
  const [comment, setComment] = useState<{ [postId: string]: string }>({});
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [showComments, setShowComments] = useState<{
    [postId: string]: boolean;
  }>({});
  const [reply, setReply] = useState<{ [key: string]: string }>({});
  const [replies, setReplies] = useState<{ [key: string]: Reply[] }>({});
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [likedstatus, setlikedstatus] = useState<{ [postId: string]: boolean }>({});

  const [change, setChange] = useState();

  const [membersProgress, setMembersProgress] = useState<MemberProgress[]>([]);

  const projectId = sessionStorage.getItem("projectID");

  const token = sessionStorage.getItem("userID");

  const colors = ['rgb(90, 13, 157)', 'purple', 'rgb(248, 174, 248)', 'rgb(116, 17, 202)']; // Shades of purple
  const fakeData = [
    { memberName: "Loading...", progress: 0 },
    { memberName: "Loading...", progress: 0 },
    { memberName: "Loading...", progress: 0 },
    { memberName: "Loading...", progress: 0 },
    { memberName: "Loading...", progress: 0 },
    { memberName: "Loading...", progress: 0 },
    { memberName: "Loading...", progress: 0 },
  ];

  const [showcommentsPopup, setShowcommentsPopup] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image
  const [showlikespopup, setshowlikespopup] = useState(false);
  const [likesforpost, setlikesforpost] = useState<any>({});
  const popupRef = useRef<HTMLDivElement>(null);
  const popupRefcomment = useRef<HTMLDivElement>(null);


  const [ShowlikesforcommentsPopup, setShowlikesforcommentsPopup] = useState(false);
  const [likesforcomment, setlikesforcomment] = useState<any>({});

  const popupRefreply = useRef<HTMLDivElement>(null);


  const [ShowlikesforreplysPopup, setShowlikesforreplysPopup] = useState(false);
  const [likesforreply, setlikesforreply] = useState<any>({});

  const [statsistisLoading, setStatsistisLoading] = useState(true);
  const [displayData, setDisplayData] = useState(fakeData);

  
  useEffect(() => {
    // Check if token exists in session storage
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      axios.get(`${import.meta.env.VITE_PROJECT_API}/project/${projectId}/leader-and-user`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
        .then((response) => {
          const { leaderId, userId, userEmail } = response.data;
          setProjectLeader(leaderId);
          setCurrentUser(userId);
          
        })
        .catch((error) => {
          console.error(
            "Error fetching project leader and current user:",
            error
          );
        });
        axios.get(`${import.meta.env.VITE_PROJECT_API}/allmemberProgress/${projectId}`)
        .then((response) => {
          console.log(response.data.membersProgress);
          setMembersProgress(response.data.membersProgress);
          setStatsistisLoading(false);
          
        })
        .catch((error) => {
          console.error("Error fetching member progress:", error);
        });
        fetchAndDisplayPosts();
      }
    }, [projectId, token, navigate]);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setDisplayData(prevData =>
          prevData.map(member => ({
            ...member,
            progress: Math.floor(Math.random() * 100) + 1 // Random progress for loading animation
          }))
        );
      }, 600); // Adjust interval as needed
  
      return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
      // Function to handle click outside of the popup
      function handleClickOutside(event: any) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Click occurred outside of the popup, close the popup here
        setshowlikespopup(false);
      }
      if (popupRefcomment.current && !popupRefcomment.current.contains(event.target)) {
        // Click occurred outside of the popup, close the popup here
          setShowlikesforcommentsPopup(false)      
        }
      if (popupRefreply.current && !popupRefreply.current.contains(event.target)) {
        // Click occurred outside of the popup, close the popup here
          setShowlikesforreplysPopup(false)
        }
    }

    // Attach the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Detach the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define the fetchAndDisplayPosts function
  async function fetchAndDisplayPosts() {    
    await axios.get(`${import.meta.env.VITE_POST_API}/posts/${projectId}`, {
      headers: {
        Authorization: `UserLoginToken ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 400) {
          console.error("Bad request. Unable to continue.");
          return;
        }
        setPosts(response.data);
        console.log(response.data);
        response.data.map((post: any) => {
          if (!likedstatus[post._id]) {
            // likedPosts[post._id] = post.liked;
            setlikedstatus(prev => ({
              ...prev,
              [post._id]: post.liked
            }));
          }
        })
        console.log(likedPosts);
        setLoading(false); // Set loading to false after fetching data
        
      })
      .catch((error) => {
        console.error("Error fetching and displaying posts:", error);
      });
  }

  useEffect(() => {fetchAndDisplayPosts()}, [change])

  const handleInputChange = (e: any) => {
    setNumberOfDivs(parseInt(e.target.value) || 0); // Parse input value as integer or default to 0
  };

  const handleHeightChange = (e: any) => {
    setHeightValue(parseInt(e.target.value) || 0); // Parse input value as integer or default to 0
  };

  const handleDeletePost = async (postId: string) => {
    await axios.delete(`${import.meta.env.VITE_POST_API}/delete-post/${postId}`, {
      headers: {
        Authorization: `UserLoginToken ${token}`,
      },
    })
      .then((response) => {
        console.log(response.data); // If you want to log the response
        // Handle success
        fetchAndDisplayPosts();
      })
      .catch((error) => {
        console.error("Error:", error);
        console.log(error.response.data.message || "An error occurred.");
        // Handle error
      });
  };

  // Toggle like status of a post
  async function toggleLike(postId: string, isLiked: boolean) {
    const method = isLiked ? "DELETE" : "POST";
    await axios({
      method,
      url: `${import.meta.env.VITE_POST_API}/like/${postId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: { userId: currentUser }, // Assuming currentUser holds the user ID
    })
      .then((response) => {
        // If successful, update likedPosts state

        if (isLiked) {
          setLikedPosts(likedPosts.filter((id) => id !== postId));
        } else {
          setLikedPosts([...likedPosts, postId]);
        }
        console.log("likedposts ", likedPosts)
        fetchAndDisplayPosts(); // Refresh posts after toggling like status
      })
      .catch((error) => {
        console.error("Error toggling like status:", error);
        // alert("An error occurred while toggling like status.");
      });
  }

  const handleSendComment = (postId: string, userId: string) => {
    axios.post(`${import.meta.env.VITE_POST_API}/comment/${postId}`, {
      userId,
      message: comment[postId],
    })
      .then((response) => {
        console.log("Comment added successfully:", response.data);
        handleFetchComments(postId);
        // Optionally, you can update the UI or perform any other action here
        setComment(prevState => ({...prevState, [postId]: ''}));
      })
      .catch((error) => {
        console.error("Error adding comment:", error.response.data.message);
        // Optionally, you can display an error message to the user
      });
  };

  const handleFetchComments = (postId: string) => {
    axios.get(`${import.meta.env.VITE_POST_API}/post/${postId}/comments/${currentUser}`)
      .then((response) => {
        console.log(response);
        setComments((prevComments) => ({
          ...prevComments,
          [postId]: response.data.comments,
        }));
        response.data.comments.map((comment: any) => {
          if (!likedstatus[comment._id]) {
            // likedcomments[comment._id] = comment.liked;
            setlikedstatus(prev => ({
              ...prev,
              [comment._id]: comment.liked
            }));
          }
        })
      })
      .catch((error) => {
        console.error("Error fetching comments:", error.message);
      });
  };

  const toggleComments = (postId: string) => {
    setShowComments((prevShowComments) => ({
      ...prevShowComments,
      [postId]: !prevShowComments[postId],
    }));
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    await axios.delete(`${import.meta.env.VITE_POST_API}/comment/${postId}/${commentId}`)
      .then((response) => {
        handleFetchComments(postId);
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
      });
  };

  // Toggle like status of a comment
  async function toggleCommentLike(
    postId: string,
    commentId: string,
    isLiked: boolean
  ) {
    const method = isLiked ? "DELETE" : "POST";
    await axios({
      method,
      url: `${import.meta.env.VITE_POST_API
        }/like-comment/${postId}/${commentId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: { userId: currentUser }, // Assuming currentUser holds the user ID
    })
      .then((response) => {
        // If successful, update the UI and state
        if (isLiked) {
          setLikedComments(likedComments.filter((id) => id !== commentId));
        } else {
          setLikedComments([...likedComments, commentId]);
        }
        handleFetchComments(postId); // Refresh comments after toggling like status
      })
      .catch((error) => {
        console.error("Error toggling comment like status:", error);
        // alert("An error occurred while toggling comment like status.");
      });
  }

  const handleSendReply = (
    postId: string,
    commentId: string,
    userId: string
  ) => {
    axios.post(`${import.meta.env.VITE_POST_API}/reply/${postId}/${commentId}`, {
      userId,
      message: reply[`${postId}-${commentId}`],
    })
      .then((response) => {
        console.log("Reply added successfully:", response.data);
        // handleFetchComments(postId); // Refresh comments after adding reply
        // Optionally, you can update the UI or perform any other action here
        handleFetchReplies(postId, commentId);
        setReply(prevComments => ({...prevComments, [`${postId}-${commentId}`]: ''}))
      })
      .catch((error) => {
        console.error("Error adding reply:", error.response.data.message);
        // Optionally, you can display an error message to the user
      });
  };

  const handleFetchReplies = (postId: string, commentId: string) => {
    axios.get(`${import.meta.env.VITE_POST_API}/post/${postId}/${commentId}/reply/${currentUser}`)
      .then((response) => {
        console.log(response);

        setReplies((prevReplies) => ({
          ...prevReplies,
          [`${postId}-${commentId}`]: response.data.replies,
        }));
        response.data.replies.map((reply: any) => {
          if (!likedstatus[reply._id]) {
            // likedreplys[reply._id] = reply.liked;
            setlikedstatus(prev => ({
              ...prev,
              [reply._id]: reply.liked
            }));
          }
        })
      })
      .catch((error) => {
        console.error("Error fetching replies:", error);
      });
  };

  const toggleReplies = (postId: string, commentId: string) => {
    setShowReplies((prevShowReplies) => ({
      ...prevShowReplies,
      [`${postId}-${commentId}`]: !prevShowReplies[`${postId}-${commentId}`],
    }));

    // Fetch replies only if they are not already fetched
    if (!showReplies[`${postId}-${commentId}`]) {
      handleFetchReplies(postId, commentId);
    }
  };

  const handleDeleteReply = async (
    postId: string,
    commentId: string,
    replyId: string
  ) => {
    await axios.delete(`${import.meta.env.VITE_POST_API}/reply/${postId}/${commentId}/${replyId}`)
      .then((response) => {
        handleFetchReplies(postId, commentId);
      })
      .catch((error) => {
        console.error("Error deleting comment:", error);
      });
  };

  // Toggle like status of a comment
  async function toggleReplyLike(
    postId: string,
    commentId: string,
    replyId: string,
    isLiked: boolean
  ) {
    const method = isLiked ? "DELETE" : "POST";
    await axios({
      method,
      url: `${import.meta.env.VITE_POST_API
        }/like-reply/${postId}/${commentId}/${replyId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: { userId: currentUser }, // Assuming currentUser holds the user ID
    })
      .then((response) => {
        // If successful, update the UI and state
        if (isLiked) {
          setLikedReply(likedReply.filter((id) => id !== replyId));
        } else {
          setLikedReply([...likedReply, replyId]);
        }
        handleFetchReplies(postId, commentId); // Refresh comments after toggling like status
      })
      .catch((error) => {
        console.error("Error toggling comment like status:", error);
        // alert("An error occurred while toggling comment like status.");
      });
  }

  const handleImageClick = (imageUrl: any) => {
    setEnlargedImage(imageUrl); // Toggle the enlarged image state
  };

  // if (loading) {
  //   // Render nothing during the loading phase or if either projectLeader or currentUser is null
  //   return <Loading/>;
  // }


  return (
    <div className="dashboard" style={{ display: "flex" }}>
      <div>
        {/* <Navbar /> */}
        <NavBarBig />

        {/* current */}
         <div style={{position: 'absolute',top:'150px'}}>
          <NavBarCurrent icon={<FaHome/>} text="Dashboard" click="/dashboard"></NavBarCurrent>
         </div>
        {/* end of current */}
    
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className="main">
          {/* header */}
          <div style={{marginLeft: '50px', marginTop: '20px'}}>
          {projectLeader && currentUser && projectLeader === currentUser ? <LeaderHp setChange={setChange} change={change} fetchAndDisplayPosts={fetchAndDisplayPosts}/> : <MemberHp />}
          </div>
          {/* Statistics */}
          <div className="statistics" style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                height: "100%",
                zIndex: "-1",
              }}
            >
              {!statsistisLoading && !loading && membersProgress &&
                membersProgress.map((member, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      height: `${member.progress}%`,
                      backgroundColor: colors[index % colors.length],
                      marginRight: "10px",
                      marginLeft: "10px",
                      width: `${100 / membersProgress.length}%`,
                      maxWidth: "100px",
                      alignSelf: "flex-end",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      textAlign: "center",
                      marginBottom: '0'
                    }}
                    title={`Completed Tasks: ${member.completedTasks}, All Tasks: ${member.allTasks}`} // Tooltip with task information
                  >
                    <div
                      style={{
                        position:
                          member.progress < 40 ? "relative" : "absolute",
                        top: member.progress < 20 ? "30px" : "0", // Adjust top position
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      {member.memberImage.imageURL && (
                        <img
                          src={`data:image/jpeg;base64,${member.memberImage.imageURL}`}
                          alt={member.memberImage.imageName}
                          style={{
                            width: member.progress < 20 ? "60px" : "60px",
                            height: member.progress < 20 ? "60px" : "60px",
                            borderRadius: "50%",
                            maxHeight: "100%",
                            objectFit: "cover",
                            marginTop: "10px",
                          }}
                          onClick={() => handleImageClick(`data:image/jpeg;base64,${member.memberImage.imageURL}`)}
                        />
                      )}
                      <p
                        style={{
                          marginTop: "5px",
                          paddingTop: "0",
                          fontSize: "12px",
                        }}
                      >
                        {member.memberName}
                      </p>
                    </div>
                    {member.completedTasks && member.allTasks && <div style={{fontSize:'10px',marginBottom:'0px'}}>
                      {` ${member.completedTasks}/${member.allTasks} tasks`}
                    </div>}
                    {member.progress === 100 && (
                      <FaCheck style={{ color: "green", marginTop: "10px" }} />
                    )}
                    <p style={{ justifyContent: "center" }}>
                      {`${
                        member.progress
                          ? parseFloat(member.progress.toFixed(1))
                          : 0
                      }` + "%"}
                    </p>
                  </div>
                ))}

{(statsistisLoading || loading) && displayData.map((member, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            height: `${member.progress}%`,
            backgroundColor: "lightgray",
            marginRight: '10px',
            marginLeft: '10px',
            width: `${100 / displayData.length}%`,
            maxWidth: '100px',
            alignSelf: 'flex-end',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '0',
            transition: 'height 0.6s linear', // Smooth transition for height changes
          }}
          title={`Loading...`} // Tooltip
        >
          <div
            style={{
              position: member.progress < 40 ? 'relative' : 'absolute',
              top: member.progress < 20 ? '30px' : '0', // Adjust top position
              width: '100%',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                marginTop: '5px',
                paddingTop: '0',
                fontSize: '12px',
              }}
            >
              {member.memberName}
            </p>
          </div>
          <p style={{ justifyContent: 'center' }}>
            {`${member.progress ? parseFloat(member.progress.toFixed(1)) : 0}` + '%'}
          </p>
        </div>
      ))}
            </div>
          </div>

          {/* post */}
          {!statsistisLoading && !loading && posts.map((post) => (
            <div
              key={post._id}
              className="postBox"
              style={{ position: "relative" }}
            >
              {/* POST */}
              <div className="post">
                {projectLeader === currentUser && (
                  <FaTrash
                    onClick={() => handleDeletePost(post._id)}
                    style={{
                      position: "absolute",
                      right: "50px",
                      top: "40px",
                      cursor: "pointer",
                      fontSize: "20px",
                      color: 'grey'
                      
                    }}
                  >
                    delete
                  </FaTrash>
                )}

                {/* author header */}
                <div style={{ display: "flex"}}>
                  {post && post.leaderImage && (
                    <img
                      src={`data:image/jpeg;base64,${post.leaderImage.imageURL}`}
                      alt={post.leaderImage.imageName}
                      style={{
                        width: "50px", // Adjust the width as needed
                        height: "50px", // Adjust the height as needed
                        borderRadius: "50%", // Makes the image round
                        marginRight: "10px", // Adjust the margin as needed
                      }}
                    />
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "10px",
                      color: 'black'
                    }}
                  >
                    {/* author name */}
                    {post && post.leaderName && (
                      <span>
                        {post.leaderName}{" "}
                        <FaFlag style={{ color: "green", marginLeft: "5px" }} />
                      </span>
                    )}

                    {/* date of publish*/}
                    {post.date && (
                      <span
                        style={{
                          color: "grey",
                          fontSize: "10px ",
                          marginTop: "5px",
                        }}
                      >
                        {moment
                          .tz(post.date, timeZone)
                          .format("h:mm A, MMMM D YYYY ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* post content */}
                {/* text */}
                {post.message && (
                  <p style={{ margin: '15px 70px', color: 'black' }}>
                    {post.message}
                  </p>
                )}
                {/* image */}
                {post.image && (
                  <img
                    src={`data:image/jpeg;base64,${post.image.imageURL}`}
                    alt={post.image.imageName}
                    style={{
                      maxWidth: "50%",
                      height: "auto", // Maintain aspect ratio
                      marginBottom: "10px", // Adjust the margin as needed
                      color: 'black',
                      marginLeft: '70px'

                    }}
                  />
                )}
                {/* file */}
                {post.file && (
                  <a
                    href={`data:application/octet-stream;base64,${post.file.fileURL}`}
                    download={post.file.fileName}
                    style={{
                      display: "block",
                      color: "#0366d6",
                      textDecoration: "none",
                      margin: "10px 0",
                      padding: "5px 10px",
                      border: "1px solid #0366d6",
                      borderRadius: "5px",
                      backgroundColor: "#f6f8fa",
                      cursor: "pointer",
                      maxWidth: "50%",
                      marginLeft: '70px'

                    }}
                    >
                    {post.file.fileName}
                  </a>
                )}

                {/* Display the total number of likes */}
                <p style={{color: 'grey', position: 'absolute', right: '50px', bottom: '50px'}}>
                  {" "}
                  {post.likes.length} <FaThumbsUp onClick={()=> {setlikesforpost(post.likes); setshowlikespopup(true)}}/>{" "}
                </p>

                {/* like and comment */}
                    <hr></hr>
                <div style={{ display: "flex", width: "100%", height: '40px', color: 'grey' }}>
                  {/* like */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      // cursor: "pointer",
                      width: "50%",
                      height: '40px',
                      placeContent: "center",
                      justifyContent: "center",
                    }}
                    className="likeorcomment"
                  >
                    {currentUser && <div
                    style={{
                      display: "flex",
                      cursor: "pointer",
                      width: "fit-content",
                      height: "fit-content",
                      alignItems: "center",
                      placeContent: "center",
                      justifyContent: "center",
                      marginTop: "10px",
                     
                    }}
                    onClick={() => {
                      setlikedstatus(prev => ({
                        ...prev,
                        [post._id]: !likedstatus[post._id]
                      }));
                      toggleLike(post._id, (likedstatus[post._id]))
                    }}
                    >
                    {/* {post.liked && <div>{post.liked}</div>} */}

                      {currentUser && (
                      <FaThumbsUp
                        style={{
                          // color: post.likes.includes(currentUser)
                          //   ? "blue"
                          //   : "grey",
                          color: (likedstatus[post._id]) ? "blue" : "grey",
                          marginRight: "10px",
                        }}
                      />
                    )}
                    Like
                    </div>}
                  </div>

                  <div className="likeorcomment" style={{display: "flex",
                      alignItems: "center",
                      // cursor: "pointer",
                      width: "50%",
                      height: '40px',
                      placeContent: "center",
                      justifyContent: "center",}}>

                  {/* comments*/}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      justifyContent: "center",
                      placeContent: "center",
                      marginTop: '10px'

                    }}
                    onClick={() => {
                      handleFetchComments(post._id);
                      toggleComments(post._id);
                      setShowcommentsPopup(true);
                    }}
                  >
                    <FaComment style={{ marginRight: "20px" }} />

                    
                      {/* {showComments[post._id]
                        ? "Hide Comments"
                        : "Show Comments"} */}
                        Comments
                    
                  </div>
                  </div>
                </div>
              </div>

              {/* COMMENTS LIST */}
              {showcommentsPopup && showComments[post._id] && comments[post._id] && comments[post._id].length > 0 && (
                <div className="commentbox" >
                  {/* <div style={{
                    height: '100px',
                    width: '50px',
                    backgroundColor: 'transparent',
                    borderBottom: '5px solid grey',
                    borderLeft: '5px solid grey',
                    borderBottomLeftRadius: '50%'
                  }}></div> */}
                  {showComments[post._id] && comments[post._id] && (
                    <div >
                      {comments[post._id].map((comment: Comment) => (
                        // replier header
                        <div
                          key={comment._id}
                          // style={{ borderBottom: "black 2px solid" }}
                        >
                          <div style={{display: 'flex', margin: 0, marginLeft: '50px'}}>
                            <div>
                            {comment && comment.user && comment.user.image && (
                              <img
                                src={`data:image/jpeg;base64,${comment.user.image.imageURL}`}
                                alt={comment.user.image.imageName}
                                style={{
                                  width: "50px", // Adjust the width as needed
                                  height: "50px", // Adjust the height as needed
                                  borderRadius: "50%", // Makes the image round
                                  marginRight: "10px", // Adjust the margin as needed
                                }}
                              />
                            )}
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                            <div className="eachcomment">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {comment.user && (
                                <span>
                                  {comment.user.name} {/* Display user name */}
                                </span>
                              )}
                              <span style={{fontSize: '10px', color: 'grey', paddingBottom: 0}}>
                              {moment
                                .tz(comment.date, timeZone)
                                .format("h:mm A, MMMM D YYYY ")}
                                </span>

                                </div>
                                <p className="replycontent" style={{marginLeft: '30px'}}>{comment.message}</p>

                            <span
                              style={{
                                color: "grey",
                                fontSize: "10px ",
                                marginTop: "5px",
                                marginRight: "20px",
                              }}
                            >
                              <p
                                style={{
                                  position: 'absolute',
                                  right :'20px',
                                  bottom: '20px',
                                  color: "white",
                                  fontSize: "15px",
                                  
                                }}
                                
                              >
                                {comment.likes.length}
                                <FaThumbsUp style={{ marginLeft: '5px'}} onClick={() => {setlikesforcomment(comment.likes);setShowlikesforcommentsPopup(true)}}/>
                              </p>
                            </span>
                            {post.leaderId && currentUser && currentUser === post.leaderId ||
                            comment && comment.user && currentUser && currentUser === comment.user._id ? (
                              <FaTrash
                                onClick={() =>
                                  handleDeleteComment(post._id, comment._id)
                                }
                                style={{
                                  position: 'absolute',
                                  right: '20px',
                                  top: '20px',
                                  // bottom: "90",
                                  cursor: "pointer",
                                  fontSize: "15px",
                                }}
                                />
                              ) : null}
                          </div>
                          <div style={{display: 'flex', flexDirection: 'column', width: '200px', position: 'relative', color: 'grey', marginLeft: '30px', marginBottom: '20px'}}>
                          {/* REPLY'S LIKE and COMMENT */}
                          <div style={{ display: "flex", flexDirection: 'row', width: "50%", margin: 0, justifyContent: "center", alignItems: "center", }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                width: "50%",
                                alignContent: "center",
                                fontSize: '12px',
                                margin:0,
                                height: '30px',
                              }}
                                onClick={() => {
                                  setlikedstatus(prev => ({
                                    ...prev,
                                    [comment._id]: !likedstatus[comment._id]
                                  }));
                                  toggleCommentLike(
                                      post._id,
                                      comment._id,
                                      likedstatus[comment._id]
                                    )
                                  }}
                              >
                              {currentUser && (
                                <FaThumbsUp
                                style={{
                                  color: likedstatus[comment._id]
                                  ? "blue"
                                  : "grey",
                                  marginRight: "5px",
                                }}
                                />
                              )}
                              Like
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                margin: 0,
                                width: "50%",
                                position: 'absolute',
                                right: 0,
                                fontSize: '12px',
                                height: '30px'
                              }}
                              onClick={() =>
                                toggleReplies(post._id, comment._id)
                              }
                            >
                              <FaReply style={{ paddingRight: "10px" }} />
                                {/* {showReplies[`${post._id}-${comment._id}`]
                                  ? "Hide Replies"
                                  : "Show Replies"} */}
                                  Replies
                            </div>
                            </div>

                            <div
                              style={{ display: "flex", alignItems: "center", margin: 0 }}
                              >
                              {currentUser && (
                                <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  width: "200px",
                                  position: 'relative',
                                  margin: 0,
                                  
                                }}
                                >
                                  <input
                                    type="text"
                                    value={reply[`${post._id}-${comment._id}`]}
                                    onChange={(e) => setReply(prevComments => ({...prevComments, [`${post._id}-${comment._id}`]: e.target.value}))}
                                    placeholder="Reply..."
                                    style={{
                                      backgroundColor: "white",
                                      borderRadius: "10px",
                                      width: "100%",
                                      padding: "5px",
                                      color: "black",
                                      fontSize: '12px'
                                    }}
                                  />
                                  <FaReply
                                    onClick={() =>
                                      handleSendReply(
                                        post._id,
                                        comment._id,
                                        currentUser
                                      )
                                    }
                                    style={{
                                      cursor: "pointer",
                                      position: "absolute",
                                      right: "10",
                                      color: "black",
                                      top: "5",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            </div>
                            </div>
                          </div>


                          {/* Replies on comments */}
                          {showReplies[`${post._id}-${comment._id}`] &&
                            replies[`${post._id}-${comment._id}`] && (
                              <div
                                style={{
                                  marginLeft: "120px",
                                }}
                              >
                                {replies[`${post._id}-${comment._id}`].map(
                                  (reply: Reply) => (
                                    <div key={reply._id}>
                                      <div style={{display: 'flex'}} >
                                      {reply &&
                                        reply.user &&
                                        reply.user.image && (
                                          <img
                                            src={`data:image/jpeg;base64,${reply.user.image.imageURL}`}
                                            alt={reply.user.image.imageName}
                                            style={{
                                              width: "50px", // Adjust the width as needed
                                              height: "50px", // Adjust the height as needed
                                              borderRadius: "50%", // Makes the image round
                                              marginRight: "10px", // Adjust the margin as needed
                                            }}
                                          />
                                        )}
                                        <div className="eachcomment" style={{marginBottom: '20px', minHeight: '20px'}}>
                                      {/* Display reply details */}
                                      {currentUser === post.leaderId ||
                                      currentUser === reply.user._id ? (
                                        <FaTrash
                                          style={{
                                            cursor: "pointer",
                                            position: "absolute",
                                            right: 20,
                                            top: 20
                                          }}
                                          onClick={() =>
                                            
                                            {handleDeleteReply(post._id, comment._id, reply._id)}
                                          }
                                        />
                                      ) : null}

                                      <div style={{margin: 0}}>
                                        {reply.user && (
                                          <p style={{margin: 0, color: "white"}}>
                                            {reply.user.name}{" "}
                                            {/* Display user name */}
                                          </p>
                                        )}

                                        <span
                                          style={{
                                            color: "grey",
                                            fontSize: "10px ",
                                            marginRight: "20px",
                                          }}
                                        >
                                          <p style={{margin: 0, color: 'grey',}}>
                                            {moment
                                              .tz(reply.date, timeZone)
                                              .format("h:mm A, MMMM D YYYY ")}
                                          </p>
                                          
                                          <p
                                        className="replycontent"
                                        style={{ margin: '10px 0px 0px 20px', fontSize: '15px' }}
                                      >
                                        {reply.message}
                                      </p>
                                          <div
                                            style={{
                                              color: "white",
                                              fontSize: "15px",
                                              display: "flex",
                                              position: 'absolute',
                                              bottom: 20, right: 20
                                            }}
                                          >
                                              <span >
                                            {reply.likes.length}
                                            <FaThumbsUp style={{ marginLeft: '5px'}} onClick={() => {setlikesforreply(reply.likes);setShowlikesforreplysPopup(true)}}/>
                                            </span>
                                          </div>
                                        </span>
                                      </div>

                                      
                                    </div>
                                    
                                    <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                margin: '0',
                                                marginLeft: '20px',
                                                color: 'grey',
                                                fontSize: '12px'
                                              }}
                                              onClick={() =>{
                                                setlikedstatus(prev => ({
                                                  ...prev,
                                                  [reply._id]: !likedstatus[reply._id]
                                                }));
                                                toggleReplyLike(
                                                  post._id,
                                                  comment._id,
                                                  reply._id,
                                                  likedstatus[reply._id]
                                                )}
                                              }
                                            >
                                              {currentUser && (
                                                <FaThumbsUp
                                                  style={{
                                                    color: likedstatus[reply._id]
                                                      ? "blue"
                                                      : "grey",
                                                    marginRight: "5px",
                                                  }}
                                                />
                                              )}

                                              Like
                                            </div>
                                    </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COMMENT INPUT */}

              <div style={{ display: "flex", alignItems: "center" }}>
                {currentUser && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "800px",
                      position: "relative",
                    }}
                  >
                    <textarea
                      value={comment[post._id] || ''}
                      onChange={(e) => setComment(prevComments => ({...prevComments, [post._id]: e.target.value}))}
                      placeholder="Enter your comment..."
                      style={{
                        marginRight: "10px",
                        marginLeft: "20px",
                        width: "800px",
                        flexWrap: 'wrap',
                        wordWrap: 'break-word',
                        height: "fit-content",
                        padding: "10px",
                        backgroundColor: "white",
                        border: "2px solid grey",
                        borderRadius: "10px",
                        color: "black",
                        fontFamily: 'sans-serif'
                      }}
                    />
                    <FaReply
                      onClick={() => handleSendComment(post._id, currentUser)}
                      style={{
                        cursor: "pointer",
                        color: "black",
                        position: "absolute",
                        right: "20",
                        top: "10",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
       {/* Enlarged Image */}
       {enlargedImage && (
            <div className="Menlarged-image-overlay" onClick={() => setEnlargedImage(null)}>
              <div className="enlarged-background" style={{opacity: '100%'}}>
              </div>
              <div className="enlarged-image-container" style={{zIndex: '4'}}>
                <img className="enlarged-img" src={enlargedImage} alt="enlarged-avatar" style={{objectFit: 'contain'}} />
              </div>
            </div>
          )}
          {/* End of Enlarged Image */}
        {showlikespopup && likesforpost.length > 0 && 
          <div className="likespopupdashboard"  ref={popupRef}>
            {likesforpost.map((like: any, index: number) => (
              <div key={index} style={{display: "flex", flexDirection: "row", color: "black"}}>
                {like.image && like.image.imageURL ? (<img
                  src={`data:image/jpeg;base64,${like.image.imageURL}`}
                  alt={like.image.imageName}
                  style={{
                    width: "50px", // Adjust the width as needed
                    height: "50px", // Adjust the height as needed
                    borderRadius: "50%", // Makes the image round
                    marginRight: "10px", // Adjust the margin as needed
                  }}
                  onClick={() => handleImageClick(`data:image/jpeg;base64,${like.image.imageURL}`)}
                />) : (<FaUser 
                  style={{
                  width: "50px", // Adjust the width as needed
                  height: "50px", // Adjust the height as needed
                  borderRadius: "50%", // Makes the image round
                  marginRight: "10px", // Adjust the margin as needed
                }}/>)}
                <p>{like.name}</p>
              </div>
            ))}
          </div>
        }

{ShowlikesforcommentsPopup && likesforcomment.length > 0 && 
          <div className="likespopupdashboard"  ref={popupRefcomment}>
            {likesforcomment.map((like: any, index: number) => (
              <div key={index} style={{display: "flex", flexDirection: "row", color: "black"}}>
                {like.image && like.image.imageURL ? (<img
                  src={`data:image/jpeg;base64,${like.image.imageURL}`}
                  alt={like.image.imageName}
                  style={{
                    width: "50px", // Adjust the width as needed
                    height: "50px", // Adjust the height as needed
                    borderRadius: "50%", // Makes the image round
                    marginRight: "10px", // Adjust the margin as needed
                  }}
                  onClick={() => handleImageClick(`data:image/jpeg;base64,${like.image.imageURL}`)}
                />) : (<FaUser 
                  style={{
                  width: "50px", // Adjust the width as needed
                  height: "50px", // Adjust the height as needed
                  borderRadius: "50%", // Makes the image round
                  marginRight: "10px", // Adjust the margin as needed
                }}/>)}
                <p>{like.name}</p>
              </div>
            ))}
          </div>
        }

{ShowlikesforreplysPopup && likesforreply.length > 0 && 
          <div className="likespopupdashboard"  ref={popupRefreply}>
            {likesforreply.map((like: any, index: number) => (
              <div key={index} style={{display: "flex", flexDirection: "row", color: "black"}}>
                {like.image && like.image.imageURL ? (<img
                  src={`data:image/jpeg;base64,${like.image.imageURL}`}
                  alt={like.image.imageName}
                  style={{
                    width: "50px", // Adjust the width as needed
                    height: "50px", // Adjust the height as needed
                    borderRadius: "50%", // Makes the image round
                    marginRight: "10px", // Adjust the margin as needed
                  }}
                  onClick={() => handleImageClick(`data:image/jpeg;base64,${like.image.imageURL}`)}
                />) : (<FaUser 
                  style={{
                  width: "50px", // Adjust the width as needed
                  height: "50px", // Adjust the height as needed
                  borderRadius: "50%", // Makes the image round
                  marginRight: "10px", // Adjust the margin as needed
                }}/>)}
                <p>{like.name}</p>
              </div>
            ))}
          </div>
        }
    </div>
  );
}

export default Dashboard;
