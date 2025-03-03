import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function HomePage() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200"> {/* Main container: Adjusted text color */}
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-8 mt-16">
                    <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Welcome to Your Dashboard</h1> {/* Adjusted heading text color */}
                    <p className="text-gray-700 dark:text-gray-300 mb-4">This is your home page content. You can customize this section.</p> {/* Adjusted paragraph text color */}
                    <div className="flex flex-col items-center justify-center h-full  bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-8"> {/* Dashboard content container: Darker background, rounded corners, shadow */}
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome to your Kanban Board!</h1> {/* Adjusted Kanban heading text color */}
                        <p className="text-gray-600 dark:text-gray-400 mb-8">You are logged in.</p> {/* Adjusted logged in text color */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-red-600 dark:hover:bg-red-700" /* Dark mode button styles */
                        >
                            Logout
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;