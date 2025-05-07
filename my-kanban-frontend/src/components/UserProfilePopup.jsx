import React from 'react';

const UserProfilePopup = ({ userName, userEmail, name, bio, country, profileImg, onClose, onLogout }) => {
    // Receive user data and onClose, onLogout as props

    return (
        <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] dark:text-white p-8 rounded-lg w-96" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">
            {/* Main container - Dark background and white text */}
            <div className="py-1" role="menuitem" tabIndex="-1" id="menu-item-0">
                <div className="flex flex-col md:flex-row">
                    {/* Profile Picture Section */}
                    <div className="md:w-1/3 text-center mb-4 md:mb-0">
                        <img
                            src={profileImg} //  <---- Use profileImg prop, with placeholder fallback
                            alt="Profile Picture"
                            className="rounded-full h-24 w-24"
                        />
                        {/* Edit Profile Button (You can implement this later) */}
                        {/* <button className="mt-2 bg-indigo-800 text-white px-3 py-1 rounded-lg hover:bg-blue-900 transition-colors duration-300 ring ring-gray-300 hover:ring-indigo-300 text-sm">Edit Profile</button> */}
                    </div>

                    {/* User Information Section */}
                    <div className="md:w-2/3 md:pl-6">
                        <h1 className="text-2xl font-bold text-indigo-800 dark:text-white mb-1">{name || "John Doe"}</h1> {/* User Name - White in dark mode */}
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{bio || "Software Developer"}</p> {/* User Bio/Profession - Lighter gray in dark mode */}

                        <h2 className="text-xl font-semibold text-indigo-800 dark:text-white mb-2">User Information</h2> {/* Section Heading - White in dark mode */}
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300"> {/* User Info List - Lighter gray text in dark mode */}
                            <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-800 dark:text-white " viewBox="0 0 20 20" fill="currentColor">
                                    {/* Icon - White in dark mode */}
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                {userName || "username"} {/* Username */}
                            </li>
                            <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-800 dark:text-white " viewBox="0 0 20 20" fill="currentColor">
                                    {/* Icon - White in dark mode */}
                                    <path d="M7 3a1 1 0 00-1 1v10a1 1 0 002 0V4a1 1 0 00-1-1zM14 2a2 2 0 11-4 0 2 2 0 014 0zM16 4a3 3 0 11-6 0 3 3 0 016 0zM6 15a4 4 0 11-8 0h8z" />
                                </svg>
                                {country || "Country"} {/* Country */}
                            </li>
                            <li className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-800 dark:text-white" viewBox="0 0 20 20" fill="currentColor">
                                    {/* Icon - White in dark mode */}
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                {userEmail || "email@example.com"} {/* User Email */}
                            </li>

                        </ul>

                        <hr className="border-gray-200 dark:border-gray-700 my-4" /> {/* Separator line - Darker in dark mode */}

                        {/* Logout Button */}
                        <div className="px-2 py-1">
                            <button
                                onClick={onLogout}
                                className="bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors duration-300 ring ring-gray-300 hover:ring-indigo-300 w-full dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:ring-gray-700 dark:hover:ring-indigo-700" /* Logout Button - Dark mode styles */
                            >
                                Logout
                            </button>
                        </div>
                        <div className="px-2 py-1">
                            <button
                                onClick={onClose}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 w-full text-center" role="menuitem" tabIndex="-1" id="menu-item-2" /* Close Button - Adjusted text color in dark mode */
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePopup;