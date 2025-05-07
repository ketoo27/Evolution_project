import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Re-using the color palette from HomePage
const PRIMARY_COLOR = '#3b82f6'; // Blue
const SECONDARY_COLOR = '#6d28d9'; // Purple
const SUCCESS_COLOR = '#16a34a'; // Green
const WARNING_COLOR = '#d97706'; // Orange
const INFO_COLOR = '#0ea5e9'; // Cyan
const GRAY_LIGHT = '#f3f4f6';
const GRAY_DARK = '#1f2937';

// Define the base API URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

function SettingsPage() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null); // State to hold fetched user data
    const [loading, setLoading] = useState(true); // State for initial data fetching loading
    const [error, setError] = useState(null); // State for initial data fetching error

    // State for form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        country: '',
        bio: '',
        profile_image: undefined, // <--- Initialize to undefined for "no change"
        current_password: '',
        password: '', // New password
    });

    // State for profile image preview
    const [profileImagePreview, setProfileImagePreview] = useState(null);

    // State for update operation
    const [isUpdating, setIsUpdating] = useState(false);
    // Keep updateError state to display errors on the page
    const [updateError, setUpdateError] = useState(null);
    // State for success message after update
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // State to control visibility of the new password field
    const [showNewPasswordField, setShowNewPasswordField] = useState(false); // <--- New state


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    // --- Fetch User Profile Data ---
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login'); // Redirect to login if no token
            return;
        }

        const fetchUserProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/user/profile/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                if (!response.ok) {
                    if (response.status === 401) {
                         navigate('/login'); // Redirect on unauthorized
                         return;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setUserData(data);
                // Populate form data with fetched user data
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    country: data.country || '',
                    bio: data.bio || '',
                    profile_image: undefined, // <--- Keep undefined on fetch for "no change" state
                    current_password: '', // Passwords are not fetched
                    password: '',
                });
                // Set initial preview URL if user has a profile image
                if (data.profile_image) {
                    setProfileImagePreview(data.profile_image); // Use the URL from the backend
                } else {
                    setProfileImagePreview(null); // No initial image, preview is null
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    // --- Handle Form Input Changes ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setUpdateSuccess(false); // Clear success message on input change
        setUpdateError(null); // Clear update errors on input change
    };

    // --- Handle File Input Change for Profile Image ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                profile_image: file, // <--- Set to File object when a file is selected
            });
            // Create a preview URL for the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result); // reader.result is the data URL
            };
            reader.readAsDataURL(file);
        } else {
             // If user cancels file selection or input is cleared by browser controls
             // With a hidden input and separate remove button, this else might not be needed
             console.log("File input cleared or cancelled.");
        }
        setUpdateSuccess(false); // Clear success message on file change
        setUpdateError(null); // Clear update errors on file change
    };

    // --- Handle Profile Image Removal ---
    const handleRemoveImage = () => {
        setFormData({
            ...formData,
            profile_image: null, // <--- Set to null explicitly to signal removal
        });
        setProfileImagePreview(null); // Clear the preview
        setUpdateSuccess(false); // Clear success message
        setUpdateError(null); // Clear update errors
    };

    // --- Toggle New Password Field Visibility ---
    const toggleNewPasswordField = () => { // <--- New toggle function
        setShowNewPasswordField(!showNewPasswordField);
        // Clear the new password field and any related errors when hiding it
        if (showNewPasswordField) {
             setFormData(prev => ({ ...prev, password: '' }));
             // Clear errors related to the password field specifically if needed, or clear all update errors
             setUpdateError(null);
        }
    };


    // --- Handle Form Submission for Update ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setIsUpdating(true);
        setUpdateError(null); // Clear previous errors
        setUpdateSuccess(false); // Clear previous success

        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }

        // --- Client-side check: Current Password is required ---
        if (!formData.current_password) {
             setUpdateError("Current password is required for any profile update.");
             setIsUpdating(false);
             return;
        }
        // --- End client-side check ---


        const dataToSubmit = new FormData(); // Use FormData for potentially sending file

        // --- Append ALL relevant fields from formData state ---
        // Append current_password (guaranteed to be not empty by the check above)
        dataToSubmit.append('current_password', formData.current_password);

        // Append other text fields (even if empty, backend serializer handles blank=True)
        dataToSubmit.append('name', formData.name);
        dataToSubmit.append('email', formData.email);
        dataToSubmit.append('country', formData.country);
        dataToSubmit.append('bio', formData.bio);


        // --- Append profile image based on its state (undefined, File, or null) ---
        if (formData.profile_image instanceof File) {
            dataToSubmit.append('profile_image', formData.profile_image);
            console.log("Appending new profile image file to FormData.");
        } else if (formData.profile_image === null) {
             dataToSubmit.append('profile_image', ''); // Signal to remove the image
             console.log("Appending empty string for profile image to signal removal.");
        }
        // else if formData.profile_image is undefined, we do nothing.


        // Append new password ONLY if it's provided (changing password)
        if (formData.password) {
             dataToSubmit.append('password', formData.password);
        }


         // --- Keep a basic check if any actual data change occurred ---
         let isDataChanged = false;
         // Check text/email/country/bio fields vs initial data
         if (formData.name !== (userData.name || '') ||
             formData.email !== (userData.email || '') ||
             formData.country !== (userData.country || '') ||
             formData.bio !== (userData.bio || '')) {
              isDataChanged = true;
         }
         // Check if new password is being set (only if the field was shown and populated)
         // The check `if (formData.password)` implicitly covers this.
         if (formData.password) {
             isDataChanged = true;
         }
         // Check if profile image state is NOT undefined (meaning it was changed or removed)
         if (formData.profile_image !== undefined) {
              isDataChanged = true;
         }


         if (!isDataChanged) {
              setUpdateError("No changes detected.");
              setIsUpdating(false);
              return;
         }


        try {
            const response = await fetch(`${API_BASE_URL}/user/profile/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: dataToSubmit,
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    const fieldErrors = Object.keys(result).map(field => {
                         if (['current_password', 'email', 'password'].includes(field)) {
                              return `${field.replace('_', ' ')}: ${result[field].join(', ')}`;
                         }
                         return `${field}: ${result[field].join(', ')}`;

                    }).join(' | ');
                    setUpdateError(`Update failed: ${fieldErrors}`);
                } else if (response.status === 401) {
                     navigate('/login');
                }
                 else {
                    setUpdateError(result.detail || `HTTP error! status: ${response.status}`);
                }
                 setIsUpdating(false);
                return;

            }

            // Success
            setUserData(result);
            if (result.profile_image) {
                 setProfileImagePreview(result.profile_image);
            } else { // If profile_image is null in the response (means it was removed)
                 setProfileImagePreview(null);
            }


            // Reset password fields and file input state after successful update
            setFormData(prev => ({
                ...prev,
                profile_image: undefined, // Reset to undefined after successful save
                current_password: '', // Clear current password field
                password: '', // Clear new password field
            }));
            setUpdateError(null);
            setUpdateSuccess(true);
            // Hide the new password field on successful update
            setShowNewPasswordField(false); // <--- Hide on success


        } catch (err) {
            console.error("Error updating profile:", err);
            if (!updateError && !updateSuccess) {
                 setUpdateError(`An unexpected error occurred.`);
            }
        } finally {
            setIsUpdating(false);
        }
    };


    if (loading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-200 min-h-screen flex items-center justify-center">
                <p>Loading profile data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-200 min-h-screen flex items-center justify-center">
                <p className="text-red-500">Error loading profile: {error}</p>
            </div>
        );
    }

    if (!userData) {
         return (
            <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-200 min-h-screen flex items-center justify-center">
                <p>No profile data available.</p>
            </div>
         );
    }


    return (
        <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-8 mt-16">

                    <div className="mb-6">
                        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage your profile information.</p>
                    </div>

                    {/* Profile Update Section */}
                    <div className="font-std mb-10 w-full rounded-2xl bg-white dark:bg-gray-800 p-10 font-normal leading-relaxed text-gray-900 dark:text-gray-200 shadow-xl">
                        <h2 className="text-2xl font-semibold text-indigo-800 dark:text-indigo-300 mb-6">Profile Information</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col md:flex-row md:space-x-8">
                                {/* Left Column - Profile Image */}
                                <div className="md:w-1/3 text-center mb-8 md:mb-0 flex flex-col items-center">
                                    {/* Profile Image Display and Upload */}
                                    <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-indigo-800 dark:border-indigo-600 ring ring-gray-300 dark:ring-gray-600 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                        {profileImagePreview ? (
                                            <img
                                                src={profileImagePreview}
                                                alt="Profile Picture"
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                                                No Image
                                            </div>
                                        )}
                                        {/* Overlay for changing/removing */}
                                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                            <label htmlFor="profile-image-upload" className="cursor-pointer text-white text-sm font-semibold mr-2">
                                                Change
                                            </label>
                                            {/* Show Remove button only if there is a preview image */}
                                            {profileImagePreview && (
                                                <>
                                                    <span className="text-white text-sm font-semibold">|</span>
                                                    <button type="button" onClick={handleRemoveImage} className="text-white text-sm font-semibold ml-2 hover:text-red-400">
                                                        Remove
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <input
                                             id="profile-image-upload"
                                             type="file"
                                             accept="image/*"
                                             className="hidden"
                                             onChange={handleFileChange}
                                             // You might need a ref or conditional rendering to reset file input if needed
                                        />
                                    </div>

                                    {/* Username (Read Only) - Improved Label Styling */}
                                     <div className="mb-4 w-full px-4 text-left">
                                        <label className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">Username</label>
                                        <input
                                            type="text"
                                            value={userData.username || ''} // Use || '' for safety if username is ever null
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:opacity-70 disabled:cursor-not-allowed px-3 py-2"
                                            disabled
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Profile Details Form */}
                                <div className="md:w-2/3">
                                    {/* Name - Improved Label and Input Styling */}
                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
                                        />
                                    </div>

                                     {/* Email - Improved Label and Input Styling */}
                                    <div className="mb-4">
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
                                        />
                                    </div>


                                    {/* Country - Improved Label and Input Styling */}
                                    <div className="mb-4">
                                        <label htmlFor="country" className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">Country</label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
                                        />
                                    </div>

                                    {/* Bio - Improved Label and Input Styling */}
                                    <div className="mb-6">
                                        <label htmlFor="bio" className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">Bio</label>
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows="3"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
                                        ></textarea>
                                    </div>

                                     {/* Password Change Section */}
                                     {/* Removed the h3 heading and added the current password field and toggle button */}

                                     {/* Current Password - Required for any update */}
                                    <div className="mb-4">
                                        <label htmlFor="current_password" className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                                            Current Password <span className="text-red-500">*</span> {/* Indicate required field */}
                                        </label>
                                        <input
                                            type="password"
                                            id="current_password"
                                            name="current_password"
                                            value={formData.current_password}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
                                            required // Add HTML required attribute
                                        />
                                    </div>

                                    {/* Button to toggle New Password field visibility */}
                                    <button
                                        type="button" // Use type="button" to prevent form submission
                                        onClick={toggleNewPasswordField}
                                        className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 hover:underline mb-4 focus:outline-none" // Styled as a text link/button
                                    >
                                        {showNewPasswordField ? 'Hide New Password Field' : 'Change Password'} {/* Button text changes based on state */}
                                    </button>


                                     {/* New Password - Conditionally rendered based on showNewPasswordField state */}
                                    {showNewPasswordField && (
                                        <div className="mb-6"> {/* This div is now conditional */}
                                            <label htmlFor="password" className="block text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">New Password</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2"
                                                // Add required if you want the new password field to be required when shown
                                                // required={showNewPasswordField} // Optional: Make new password required when shown
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Update Button */}
                            <div className="mt-6 text-center">
                                 {/* Display Update Error */}
                                 {updateError && (
                                     <p className="text-red-500 text-sm mb-3">{updateError}</p>
                                 )}
                                  {/* Display Update Success Message */}
                                 {updateSuccess && (
                                     <p className="text-green-500 text-sm mb-3">Profile updated successfully!</p>
                                 )}
                                <button
                                    type="submit"
                                    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                                        isUpdating ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-800 hover:bg-blue-900 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                                    } text-white`}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SettingsPage;