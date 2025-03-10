import React, { useState, useContext } from 'react';
import AuthContext from '../context/Authcontext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState({});
    const navigate = useNavigate();
    const { registerUser } = useContext(AuthContext);

    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError({});
        setMessage('');

        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('email', email);
        formData.append('name', name);
        formData.append('country', country);
        formData.append('bio', bio);
        if (profileImage) {
            formData.append('profile_image', profileImage);
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/register/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message);
            setUsername('');
            setPassword('');
            setEmail('');
            setName('');
            setCountry('');
            setBio('');
            setProfileImage(null);
            setError({});
            navigate('/login');

        } catch (error) {
            console.log("Full error response:", error.response);
            if (error.response && error.response.data && error.response.data.errors) {
                setError(error.response.data.errors);
            } else {
                setError({ non_field_error: [error.response?.data?.error || 'Registration failed'] });
            }
            setMessage('');
        }
    };

    return (
        <div className="flex justify-center h-screen items-center bg-gray-900"> {/* Dark background for the entire page */}
            <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md"> {/* Darker container background */}
                <h2 className="text-2xl font-bold text-white text-center mb-6">Register</h2> {/* White text for heading */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username:</label> {/* Lighter text for labels */}
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                        />
                        {error.username && <p className="text-red-400 text-xs mt-1">{error.username}</p>} {/* Adjusted error text color */}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password:</label> {/* Lighter text for labels */}
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                        />
                        {error.password && <p className="text-red-400 text-xs mt-1">{error.password}</p>} {/* Adjusted error text color */}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email:</label> {/* Lighter text for labels */}
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                        />
                        {error.email && <p className="text-red-400 text-xs mt-1">{error.email}</p>} {/* Adjusted error text color */}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name:</label> {/* Lighter text for labels */}
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                        />
                        {error.name && <p className="text-red-400 text-xs mt-1">{error.name}</p>} {/* Adjusted error text color */}
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-300">Country:</label> {/* Lighter text for labels */}
                        <input
                            type="text"
                            id="country"
                            name="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                        />
                        {error.country && <p className="text-red-400 text-xs mt-1">{error.country}</p>} {/* Adjusted error text color */}
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio:</label> {/* Lighter text for labels */}
                        <textarea
                            id="bio"
                            name="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                        ></textarea>
                        {error.bio && <p className="text-red-400 text-xs mt-1">{error.bio}</p>} {/* Adjusted error text color */}
                    </div>
                    <div>
                        <label htmlFor="profileImage" className="block text-sm font-medium text-gray-300"> {/* Lighter text for labels */}
                            Profile Image (Optional)
                        </label>
                        <input
                            type="file"
                            id="profileImage"
                            accept="image/*"
                            className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white" // Dark input background and white text
                            onChange={handleImageChange}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" // Adjusted button colors
                        >
                            Register
                        </button>
                    </div>
                    {message && <p className="text-green-400 text-sm mt-2 text-center">{message}</p>} {/* Adjusted success message color */}
                    {error.non_field_error && <p className="text-red-400 text-sm mt-2 text-center">{error.non_field_error}</p>} {/* Adjusted error text color */}
                    <div className="text-sm mt-2 text-gray-400 text-center"> {/* Added container for login link */}
                        <span>Already have an account? </span>
                        <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-semibold">Login</Link> {/* Link to login page */}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterForm;