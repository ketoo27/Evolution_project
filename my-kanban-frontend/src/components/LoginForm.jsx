import React, { useState, useContext } from 'react'; // Import useContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/Authcontext'; // Import AuthContext

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const authContext = useContext(AuthContext); // Access AuthContext  <---- ADD THIS LINE

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', {
                username, password
            });

            authContext.setAuthToken(response.data.token); // Update auth token and login state using context <---- CHANGE THIS LINE
            navigate('/'); // Redirect to home page after successful login

        } catch (error) {
            setError(error.response?.data?.error || 'Login failed');
            // localStorage.removeItem('authToken'); // REMOVE THIS LINE - Context handles token removal now
        }
    };

    return (
        <div className="flex justify-center mt-20">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
                        <input type="text" id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Login</button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default LoginForm;