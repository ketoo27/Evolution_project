// RegistrationForm.jsx
import React, { useState, useContext } from 'react';
import AuthContext from '../context/Authcontext'; // Import AuthContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(null); //  <---- State for profile image file
    const [message, setMessage] = useState('');
    // Initialize error as an empty object to store field-specific errors
    const [error, setError] = useState({});
    const navigate = useNavigate(); // Get navigate function
    const { registerUser } = useContext(AuthContext); // Get registerUser from context - although it might not be used directly here in this form

    const handleImageChange = (e) => { //  <---- Function to handle image file selection
        setProfileImage(e.target.files[0]); // Get the first selected file
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setError({}); // Clear previous errors at the beginning of submission
        setMessage('');

        const formData = new FormData(); // Create FormData object to send files
        formData.append('username', username);
        formData.append('password', password);
        formData.append('email', email);
        formData.append('name', name);
        formData.append('country', country);
        formData.append('bio', bio);
        if (profileImage) { // Append profileImage only if a file is selected
            formData.append('profile_image', profileImage);
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', //  <---- Set Content-Type to multipart/form-data
                },
            });
            setMessage(response.data.message); // Success message from backend
            // Optionally, clear form fields after successful registration
            setUsername('');
            setPassword('');
            setEmail('');
            setName('');
            setCountry('');
            setBio('');
            setProfileImage(null); // Clear profile image state
            setError({}); // Clear errors on successful submission as well
            navigate('/login'); // Redirect to login page after successful registration

        } catch (error) {
            console.log("Full error response:", error.response); // Log full error response for debugging
            if (error.response && error.response.data && error.response.data.errors) {
                setError(error.response.data.errors); // Set errors from backend response
            } else {
                setError({ non_field_error: [error.response?.data?.error || 'Registration failed'] }); // Generic error
            }
            setMessage(''); // Clear any previous success messages
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
                        <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        {error.username && <p className="text-red-500 text-xs mt-1">{error.username}</p>} {/* Display username error */}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        {error.password && <p className="text-red-500 text-xs mt-1">{error.password}</p>} {/* Display password errors */}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
                        <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                        {error.email && <p className="text-red-500 text-xs mt-1">{error.email}</p>} {/* Display email errors */}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
                        <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        {error.name && <p className="text-red-500 text-xs mt-1">{error.name}</p>} {/* Display name error */}
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country:</label>
                        <input type="text" id="country" name="country" value={country} onChange={(e) => setCountry(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        {error.country && <p className="text-red-500 text-xs mt-1">{error.country}</p>} {/* Display country error */}
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio:</label>
                        <textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        {error.bio && <p className="text-red-500 text-xs mt-1">{error.bio}</p>} {/* Display bio error */}
                    </div>
                    <div>
                        <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                            Profile Image (Optional)
                        </label>
                        <input
                            type="file"
                            id="profileImage"
                            accept="image/*" // Accept only image files
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            onChange={handleImageChange} // Call handleImageChange on file selection
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Register</button>
                    </div>
                    {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
                    {error.non_field_error && <p className="text-red-500 text-sm mt-2 text-center">{error.non_field_error}</p>} {/* Display general error */}
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;