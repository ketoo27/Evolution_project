import React, { useContext, useEffect, useState } from 'react';
import AuthContext from "../context/Authcontext";
import axios from 'axios';
import { FaBars } from 'react-icons/fa';
import { AiOutlineMenu } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi';
import { BsChatLeft } from 'react-icons/bs';
import { RiNotification3Line } from 'react-icons/ri';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import UserProfilePopup from './UserProfilePopup'; //  <---- IMPORT UserProfilePopup

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
    <TooltipComponent content={title} position="BottomCenter">
        <button
            type="button"
            onClick={customFunc}
            style={{ color }}
            className="relative text-xl rounded-full p-3 hover:bg-light-gray dark:hover:bg-gray-700" // Added dark:hover:bg-gray-700 for dark mode hover
        >
            <span
                style={{ background: dotColor }}
                className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
            />
            {icon}
        </button>
    </TooltipComponent>
);

function Navbar({ toggleSidebar, isSidebarOpen }) {
    const { authToken, setAuthToken } = useContext(AuthContext); // Get setAuthToken from context
    const navigate = useNavigate(); // Initialize useNavigate
    const [fullName, setFullName] = useState("User");
    const [userName, setUserName] = useState("username"); //  <---- ADD state for username
    const [userEmail, setUserEmail] = useState("");
    const [userBio, setUserBio] = useState("Software Developer"); //  <---- ADD state for bio
    const [userCountry, setUserCountry] = useState("Country"); //  <---- ADD state for country
    const [profileImg, setUserProfileImg] = useState(null); //  <---- Initialize state for profile image here

    const [isClicked, setIsClicked] = useState({});
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authToken) {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/user/profile/', {
                        headers: {
                            'Authorization': `Token ${authToken}`,
                        }
                    });
                    if (response.data) {
                        if (response.data.name) {
                            setFullName(response.data.name);
                        } else if (response.data.username) {
                            setFullName(response.data.username);
                        }
                        if (response.data.email) {
                            setUserEmail(response.data.email);
                        }
                        if (response.data.username) { //  <---- SET username from response
                            setUserName(response.data.username);
                        }
                        if (response.data.bio) { //  <---- SET bio from response (if available in your API)
                            setUserBio(response.data.bio || "Software Developer"); // Default bio if not provided
                        }
                        if (response.data.country) { //  <---- SET country from response (if available)
                            setUserCountry(response.data.country || "Country"); // Default country if not provided
                        }
                        if (response.data.profile_image) { //  <---- SET profile_image from response
                            setUserProfileImg(response.data.profile_image);
                        } else {
                            setUserProfileImg(null); // Or set to a default placeholder image URL if you have one
                        }
                        // You can also fetch and set profile image URL here if your API returns it
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            }
        };
        fetchUserProfile();
    }, [authToken]);

    const handleClick = (clicked) => () => {
        console.log('handleClick function is called for:', clicked); //  <---- ADD THIS LINE
        setIsClicked({ ...isClicked, [clicked]: true });
        if (clicked === 'userProfile') {
            setIsProfileOpen(!isProfileOpen);
            setIsClicked({});
        } else {
            setIsProfileOpen(false);
        }
    };

    const closeUserProfilePopup = () => {
        setIsProfileOpen(false);
    };

    const handleLogout = () => {
        console.log("Logout clicked"); // Keep this console log for debugging
        setAuthToken(null); // Clear the authentication token in AuthContext
        setIsProfileOpen(false); // Close the profile popup
        navigate('/login/'); // Redirect to the login page (adjust path if your login route is different)
    };

    const handleActiveMenu = () => toggleSidebar();

    return (
        <div className="bg-white dark:bg-secondary-dark-bg md:ml-0 transition-all duration-300 fixed w-full nav-item top-0">
            <div className="flex justify-between p-2 md:ml-6 md:mr-6 relative">

                <button
                    type="button"
                    onClick={handleActiveMenu}
                    className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block dark:hover:bg-gray-700" // Dark mode hover for menu button
                >
                    <AiOutlineMenu className="dark:text-white" />  {/* White menu icon in dark mode */}
                </button>
                <span className="font-bold text-xl text-indigo-700 mt-4 ml-4 dark:text-white">EVOLUTION</span> {/* White brand text in dark mode */}

                <div className="flex items-center space-x-4">
                   
                   
                    <NavButton color="gray" dotColor="rgb(254, 201, 15)" icon={<RiNotification3Line className="dark:text-white" />} title="Notification" customFunc={() => handleClick('notification')} /> {/* White icons in dark mode */}
                    <TooltipComponent content="Profile" position="BottomCenter">
                        <div
                            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg relative dark:hover:bg-gray-700" // Dark mode hover for profile div
                            onClick={() => { //  <---- INLINE onClick handler
                                console.log('Direct onClick handler on profile div is triggered!'); //  <---- ADD THIS console.log
                                setIsProfileOpen(!isProfileOpen); // Keep the setIsProfileOpen for now
                            }}
                        >
                            <img
                                className="rounded-full w-8 h-8"
                                src={profileImg || "https://i.pravatar.cc/300"} // Use profileImg state here, with default avatar as fallback
                                alt="user-profile"
                            />
                            <p>
                                <span className="text-gray-400 text-14 dark:text-gray-300">Hi,</span>{' '} {/* Adjusted "Hi" text color in dark mode */}
                                <span className="text-gray-400 font-bold ml-1 text-14 dark:text-white">
                                    {fullName} {/* White user name in dark mode */}
                                </span>
                            </p>
                            <MdKeyboardArrowDown className="text-gray-400 text-14 dark:text-white" /> {/* White arrow icon in dark mode */}
                        </div>
                    </TooltipComponent>
                    {isProfileOpen && (
                        <UserProfilePopup
                            userName={userName} //  <---- Pass username
                            name={fullName} //  <---- Pass full name
                            userEmail={userEmail}
                            bio={userBio} //  <---- Pass bio
                            country={userCountry} //  <---- Pass country
                            profileImg={profileImg || "https://i.pravatar.cc/300"} // Use profileImg state here, with default avatar as fallback
                            onClose={closeUserProfilePopup}
                            onLogout={handleLogout}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;