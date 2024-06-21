
//has edits of popup before deleting account to leave the projects you are leader in

import "./css/ProfilePage.css";
import Navbar from "./Navbar";
import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { FaCheckCircle, FaEye, FaEyeSlash, FaPen, FaUser, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { To, useLocation, useNavigate } from "react-router-dom";
import Modal from './Modal';
import Loading from "./Loading";
import NavBarBig from "./NavBarBig";
import NavBarCurrent from "./NavBarCurrent";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get("source");

  // const handleNavigation = (route: To) => {
  //   navigate(route);
  // };
  interface Project {
    projectName: string;
}

//shady
const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
const [projects, setProjects] = useState<any>([]);
//shady

  const [showPopup, setShowPopup] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oldpassword, setOldPassword] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState(null); // State to store the image data

  const [emailverification, setemailverification] = useState(false);
  const [phoneverification, setphoneverification] = useState(false);

  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("**");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPasswordInput, setShowConfirmPasswordInput] =
    useState(false);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  const [editingFullName, setEditingFullName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editingPhoneNumber, setEditingPhoneNumber] = useState(false);

  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ensure correct type for fileInputRef

  const [deleteAccount, setDeleteAccount] = useState(false);

  const [loading, setLoading] = useState(true);
  const [change, setchange] = useState(false);

  const [pass, setPass] = useState<any>(false);

  const [enlargedImage, setEnlargedImage] = useState(null); // State for enlarged image

  const token = sessionStorage.getItem("userID");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [passwordErrorMinLength, setPasswordErrorMinLength] = useState(true);
  const [passwordErrorSpecialChar, setPasswordErrorSpecialChar] = useState(true);
  const [passwordErrorNumber, setPasswordErrorNumber] = useState(true);
  const [passwordErrorLowercase, setPasswordErrorLowercase] = useState(true);
  const [passwordErrorUppercase, setPasswordErrorUppercase] = useState(true);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordfocus, setpasswordfocus] = useState(false);
  const [confirmpasswordfocus, setconfirmpasswordfocus] = useState(false);
  
  const handleImageClick = (imageUrl: any) => {
    setEnlargedImage(imageUrl); // Toggle the enlarged image state
  };

  useEffect(() => {
    // Fetch user profile data when the component mounts
    if (!token) {
      console.error("User token not found in session storage");
      navigate("/signin");
    } else {
      fetchUserProfile();
    }
  }, [token, navigate]);

  const fetchprojects = async() =>{

    await axios
    .get(
     `${import.meta.env.VITE_PROJECT_API}/projects/`,
     {
       headers: {
         Authorization: `UserLoginToken ${token}`,
       },
     }
   )
     .then((response) => {
      if (response.data.data.projects.length > 0) {
      const projects = response.data.data.projects.map((project: any) => ({
        projectId: project._id,   // Assuming the ID field in the response is _id
        projectName: project.title // Assuming the name field in the response is title
      }));
    
         setProjects(projects);
        //  console.log(response.data.data.projects);
    }else {
      setPasswordError("")
      console.log("pass", pass);
      axios
      .post(
        `${import.meta.env.VITE_USER_API}/deleteAccount`,
        { password: pass },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        if (response.data.message == "Account deleted successfully") {
          toast.success(response.data.message);
          navigate("/signin");
        } else if (response.status === 201 ) {
          // setProjects(response.data.projects);
          fetchprojects();
          setIsModalOpen(true);
        }
      })
      .catch((error) => {
        if (error.response.data.error == "Invalid password") setPasswordError("Invalid password")
        if (error.response.data.message) {
          // alert(`deleting account, ${error.response.data.message}`);
        } else {
          // alert(`Error deleting account, ${error.response.data.error}`);
        }
      });
    }
     
     })
     .catch((error) => {
      console.error("Error deleting account", error);
    });
      
    }
         

    const validatePasswordChange = (value: string) => {
      const minLengthRegex = /.{8,}/; // At least 8 characters
      const specialCharRegex = /[!@#$%^&*()-+=]/; // At least one special character
      const numberRegex = /\d/; // At least one number
      const lowercaseRegex = /[a-z]/; // At least one lowercase letter
      const uppercaseRegex = /[A-Z]/; // At least one uppercase letter

      if (!minLengthRegex.test(value)) {
          setPasswordErrorMinLength(true);
      } else {
          setPasswordErrorMinLength(false);
      }
      if (!specialCharRegex.test(value)) {
          setPasswordErrorSpecialChar(true);
      } else {
          setPasswordErrorSpecialChar(false);
      }
      if (!numberRegex.test(value)) {
          setPasswordErrorNumber(true);
      } else {
          setPasswordErrorNumber(false);
      }
      if (!lowercaseRegex.test(value)) {
          setPasswordErrorLowercase(true);
      } else {
          setPasswordErrorLowercase(false);
      }
      if (!uppercaseRegex.test(value)) {
          setPasswordErrorUppercase(true);
      } else {
          setPasswordErrorUppercase(false);
      }
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== newPassword) {
        setConfirmPasswordError('Passwords do not match');
    } else {
        setConfirmPasswordError('');
    }
};

  const fetchUserProfile = () => {
    axios
      .post(
        `${import.meta.env.VITE_USER_API}/viewprofile`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        const userData = response.data.user;
        console.log("Server Response:", response); // Log the entire response
        setFullName(userData.name);
        setEmail(userData.email.address);
        setPhoneNumber(userData.phone.number);
        setImage(userData.image.imageURL);
        setPassword("********"); // Set the image data
        setemailverification(userData.email.isVerified);
        setphoneverification(userData.phone.isVerified);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };

  if (loading) {
      return <Loading/>;
  }

  const handleEditClick = (field: string) => {
    switch (field) {
      case "fullName":
        setNewFullName("");
        setEditingFullName(true);
        setShowCancelButton(true);
        setShowSaveButton(true);
        setIsProfileChanged(true);
        break;
      case "password":
        setNewPassword("");
        setEditingPassword(true);
        setShowConfirmPasswordInput(true);
        setShowCancelButton(true);
        setShowSaveButton(true);
        break;
      case "phoneNumber":
        setNewPhoneNumber("");
        setEditingPhoneNumber(true);
        setShowCancelButton(true);
        setShowSaveButton(true);
        setIsProfileChanged(true);
        break;
      default:
        break;
    }
  };

  const handleSaveChanges = async () => {
    setConfirmDialogVisible(true);
    setShowPopup(!showPopup);
  };

  const handleDeleteAccount = () => {
    setDeleteAccount(true);
    handleSaveChanges();
  };

  const handleConfirmDialog = async () => {
    setPasswordError("")

    if (oldpassword === "") {
      toast.error("Please enter your old password.");
      return;
    }

    // console.log("Old Full Name:", fullName);
    // console.log("New Full Name:", newFullName);
    // console.log("Old Phone Number:", phoneNumber);
    // console.log("New Phone Number:", newPhoneNumber);

    // const isProfileChanged =
    //   (fullName !== newFullName && newFullName !== "") ||
    //   (phoneNumber !== newPhoneNumber && newPhoneNumber !== "");

    setPass(oldpassword)

    console.log("Is Profile Changed:", isProfileChanged);

    // Handle password update only if new password is not empty
    if (isProfileChanged) {
      // Update other profile information
      await updateProfile();
      setNewFullName("");
      setNewPhoneNumber("");
      setIsProfileChanged(false);
    }

    if (newPassword !== "") {
      // Password update logic here...
      if (newPassword === confirmPassword) {
        await axios
          .put(
            `${import.meta.env.VITE_USER_API}/editpassword`,
            {
              newpassword: newPassword,
              password: oldpassword,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `UserLoginToken ${token}`,
              },
            }
          )
          .then((response) => {
            if (response.data.success) {
              toast.success("Password updated successfully!");
              setConfirmDialogVisible(false);
              setShowPopup(!showPopup);
              setOldPassword("");
            }
          })
          .catch((error) => {
            console.error(error);
            console.log(error.response.data.message);
            if (error.response.data.validator) {
              toast.error(
                "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
              );
              setConfirmDialogVisible(false);
              setShowPopup(!showPopup);
              setOldPassword("");
            }
          });
      }

      // Clear password-related fields after saving changes
      setNewPassword("");
      setConfirmPassword("");
    }

    if (deleteAccount) {
      console.log(oldpassword);
      setPasswordError("")
      axios
        .post(
          `${import.meta.env.VITE_USER_API}/deleteAccount`,
          { password: oldpassword },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `UserLoginToken ${token}`,
            },
          }
        )
        .then((response) => {
          if (response.data.message == "Account deleted successfully") {
            toast.success(response.data.message);
            navigate("/signin");
          } else if (response.status === 201 ) {
            // setProjects(response.data.projects);
            fetchprojects();
                setIsModalOpen(true);
          }
        })
        .catch((error) => {
          if (error.response.data.error == "Invalid password") setPasswordError("Invalid password")
          if (error.response.data.message) {
            // alert(`deleting account, ${error.response.data.message}`);
          } else {
            // alert(`Error deleting account, ${error.response.data.error}`);
          }
        });

      setDeleteAccount(false);
      setConfirmDialogVisible(false);
      setShowPopup(!showPopup);
      setOldPassword("");
    }
    setShowCancelButton(false);
    setShowSaveButton(false);
    setEditingFullName(false);
    setEditingPassword(false);
    setEditingPhoneNumber(false);
  };

 


  
  const updateProfile = async () => {
    axios
      .put(
        `${import.meta.env.VITE_USER_API}/editprofile`,
        {
          name: newFullName,
          phone: newPhoneNumber,
          password: oldpassword, // Send old password for validation
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `UserLoginToken ${token}`,
          },
        }
      )
      .then((response) => {
        console.log("Server Response:", response);

        if (response.data.success) {
          setFullName(newFullName || fullName); // Update fullName with newFullName if it exists, otherwise keep the old value
          setPhoneNumber(newPhoneNumber || phoneNumber); // Update phoneNumber with newPhoneNumber if it exists, otherwise keep the old value

          setConfirmDialogVisible(false);
          setShowPopup(!showPopup);
          setOldPassword("");
          toast.success("Changes saved successfully!");
        } else {
          toast.error("Failed to save changes. Please try again.");
        }
      })
      .catch((error) => {
        if (error.response.data.error == "Invalid email or password") setPasswordError("Invalid password")
        console.error("Error updating profile:", error);
        console.log(error.response.data.error);
      });
  };

  const handleCancelDialog = () => {
    setNewFullName(fullName);
    setNewPhoneNumber(phoneNumber);
    setNewPassword(password);
    setShowConfirmPasswordInput(false);
    setConfirmDialogVisible(false);
    setShowPopup(!showPopup);
    setShowCancelButton(false);
    setShowSaveButton(false);
    setEditingFullName(false);
    setEditingPassword(false);
    setEditingPhoneNumber(false);
    setPasswordError("");
    setShowPopup(true);
  };

  const readAndProcessFile = () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      console.error("Please select a file to upload.");
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      updateImage(reader.result as ArrayBuffer, file.name); // Explicitly define type for fileData
    };
    reader.readAsArrayBuffer(file);
  };

  const updateImage = async (fileData: ArrayBuffer, fileType: string) => {
    // Define type for fileData
    const formData = new FormData();
    formData.append(
      "profileImage",
      new Blob([fileData], { type: "image/jpeg" }),
      fileType
    );

    await axios
      .patch(`${import.meta.env.VITE_USER_API}/updateimage`, formData, {
        headers: {
          Authorization: `UserLoginToken ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          console.log("Image updated successfully");
          // Optionally update state or trigger a fetch of updated user data
        } else {
          console.error("Failed to update image");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(
          `Failed to update image. Please try again.  ${error.response.data.message}`
        );
      });
    fetchUserProfile();
  };

  const requestPhoneVerification = () => {
    return axios.post(`${import.meta.env.VITE_USER_API}/requestPhoneVerification`, {
      phone: phoneNumber,
    })
    .then(response => {
      console.log('Send OTP Success:', response.data);
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('otpredirection', 'phone');
      // alert('OTP sent successfully');
      navigate('/verify');
      return response.data; // Return the response data if needed
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error('Error sending OTP. Please try again.');
      throw error; // Throw the error to handle it outside if needed
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div>
      <div>
      {source === "outside" ? <Navbar /> : <NavBarBig />}
       {/* current */}
       <div style={{position: 'absolute', top: source === "outside" ? '150px' : "550px"}}>
          <NavBarCurrent icon={<FaUser/>} text="Profile"></NavBarCurrent>
         </div>
        {/* end of current */}
        </div>
    <div className="profilemain" style={{backgroundColor: 'white', position: 'fixed'}}>
      <ToastContainer style={{zIndex: 5}}/>
      {/* <center> */}
      <div className="profile-container">
        <center>
          <div
            style={{
              position: "relative",
              clipPath: "circle(49% at 50% 49%)",
              width: "fit-content",
            }}
          >
            {image ? (
              <img
                src={`data:image/jpeg;base64,${image}`}
                alt="User"
                className="avatar-image"
                onClick={() => handleImageClick(`data:image/jpeg;base64,${image}`)}
              />
            ) : (
              <FaUserCircle
                style={{
                  width: "150px",
                  height: "150px",
                  color: "rgb(231, 229, 229)",
                }}
              />
            )}

            {/* File input for image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png"
              style={{ display: "none" }}
              onChange={readAndProcessFile}
            />
            <button
              type="button"
              className="upload"
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
            >
              Upload Image
            </button>
          </div>
        </center>

        {/* Full Name */}
        <div className="profileform-group">
          <h3 style={{marginTop: '0px'}}>Name</h3>
          {editingFullName ? (
            <div style={{display: 'flex'}}>
              <InputText
                className="textbox"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
              {/* <FaPen
                style={{ marginTop: "20px", bottom: "0", cursor: "pointer" }}
                onClick={() => handleEditClick("fullName")}
              /> */}
            </div>
          ) : (
            <div  style={{display: 'flex'}}>
              <div className="inputp">{fullName}</div>
              <FaPen
                style={{ marginTop: "20px", bottom: "0", cursor: "pointer" }}
                onClick={() => handleEditClick("fullName")}
              />
            </div>
          )}
        </div>

        {/* Email */}
        <div className="profileform-group">
          <h3>Email</h3>
          <div style={{width: '390px' }}>
            <div className="inputp">
              {email}
              {emailverification && (
                <FaCheckCircle style={{ color: "green", float: "right" }} />
              )}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="profileform-group">
          <h3>Password</h3>
          {editingPassword ? (
            <>
              <div className={`${passwordError && 'error'}`} style={{display: 'flex'}}>
                <input
                  type="password"
                  value={newPassword}
                  className="textbox"
                  onChange={(e) => {setNewPassword(e.target.value); validatePasswordChange(e.target.value)}}
                  onFocus={() => {setpasswordfocus(true);}}
                  onBlur={() => {setpasswordfocus(false);}}
                  placeholder="New Password"
                  style={{ marginRight: "10px", width: '390px', height: '20px' }}
                />
                {passwordfocus && password.length != 0 && <div style={{fontSize: 10, display: 'flex', marginTop: '10px', paddingBottom: 0, marginBottom: 0}}>
                                <div style={{marginRight: '20px', marginBottom: 0, paddingBottom: 0}}>
                                <div style={{ color: passwordErrorMinLength ? "red" : "green", marginBottom: '3px'}}>At Least 8 Characters</div>
                                <div style={{ color: passwordErrorSpecialChar ? "red" : "green"}}>A Special Character</div>
                                </div>
                                <div style={{marginBottom: 0, paddingBottom: 0}}>
                                <div style={{ color: passwordErrorNumber ? "red" : "green", marginBottom: '3px'}}>A Number</div>
                                <div style={{ color: passwordErrorUppercase ? "red" : "green"}}>1 Uppercase Letter</div>
                                </div>
                                </div>}
                {/* <FaPen
                  style={{ marginTop: "20px", bottom: "0", cursor: "pointer" }}
                  onClick={() => handleEditClick("password")}
                /> */}
              </div>
              {showConfirmPasswordInput && (
                <div className={`${confirmPasswordError && confirmPassword.length != 0 && 'error'}`}>
                <input
                  type="password"
                  className="textbox"
                  value={confirmPassword}
                  onChange={(e) => {setConfirmPassword(e.target.value); validateConfirmPassword(e.target.value)}}
                  onFocus={() => {setconfirmpasswordfocus(true);}}
                  onBlur={() => {setconfirmpasswordfocus(false);}}
                  placeholder="Confirm Password"
                  style={{ marginTop: "20px", marginRight: "10px" , width: '355px', height: '20px'}}
                  />
                {confirmpasswordfocus && confirmPassword.length != 0  && <div style={{fontSize: 10, color: confirmPasswordError ? "red" : "green"}}>{confirmPasswordError}</div>}
                  </div>
              )}
            </>
          ) : (
            <div style={{display: 'flex'}}>
              <div className="inputp">{password}</div>
              <FaPen
                style={{ marginTop: "20px", bottom: "0", cursor: "pointer" }}
                onClick={() => handleEditClick("password")}
              />
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div className="profileform-group">
          <h3>Phone Number</h3>
          {editingPhoneNumber ? (
            <div>
              <InputText
                className="textbox"
                value={newPhoneNumber}
                maxLength={11}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                style={{ marginRight: "10px" }}
              />
              {/* <FaPen
                style={{ marginTop: "20px", bottom: "0", cursor: "pointer" }}
                onClick={() => handleEditClick("phoneNumber")}
              /> */}
            </div>
          ) : (
            <div  style={{display: 'flex'}}>
              <div  style={{display: 'flex'}} className="inputp">
                {phoneNumber}

                {phoneverification ? (
                  <FaCheckCircle style={{ color: "green", float: 'right'}} />
                ) : (
                  <button className="verifybtn"
                  onClick={requestPhoneVerification}>Verify?</button>
                )}
              </div>
              <FaPen
                style={{ marginTop: "20px", bottom: "0", cursor: "pointer" }}
                onClick={() => handleEditClick("phoneNumber")}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <center>
          {showCancelButton && (
            <button
              type="button"
              className="profilebutton button2"
              onClick={handleCancelDialog}
            >
              Cancel
            </button>
          )}
          {showSaveButton && (
            <button
              type="button"
              className="profilebutton"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
          )}
          <button
            type="button"
            className="profilebutton"
            style={{ backgroundColor: "red" }}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </center>

        {/* Confirm Dialog */}
        <Dialog
          showHeader={false}
          className="alert"
          style={{ zIndex: "1" ,backgroundColor:"white", padding: '20px 40px 20px 40px'}}
          visible={confirmDialogVisible}
          onHide={handleCancelDialog}
          footer={
            <div style={{margin: 0}}>
              <center>
                {showPopup && (
                  <div>
                    <div className="overlay"></div>
                  </div>
                )}
                <button
                  className="confirmbtn"
                  onClick={handleConfirmDialog}
                >
                  Confirm
                </button>
                <button
                
                  className="cancelbtn"
                  onClick={handleCancelDialog}
                >
                  Cancel
                </button>
                
              </center>
            </div>
          }
        > 
        <h3 style={{color: 'purple'}}>Confirm Action</h3><hr/>
          <center style={{ zIndex: "1" ,color:"black"}}>
            Please confirm your password to save changes
          </center>
          <div className="inputdialog" style={{position: 'relative'}} >
            <h4 style={{color:"black", marginBottom: '5px'}}>Password</h4>
            <input
              className="inputd"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {passwordError && <div className="error-message">{passwordError}</div>}
            <p
              className="show-password-icon"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye/> : <FaEyeSlash/>}
            </p>
          </div>
        </Dialog>
      </div>
      {/* </center> */}
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

          {!showPopup && <div className='backdrop'></div>}
          {token && <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} projects={projects} token={token} refresh={fetchprojects} />}

    </div>
  );
};

export default ProfilePage;
