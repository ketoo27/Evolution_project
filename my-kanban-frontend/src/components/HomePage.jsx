import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import EarnedBadgesSection from './EarnedBadgesSection';

function HomePage() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    // src/pages/HomePage.jsx (Modified return statement)
return (
            <div className="h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
                <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <div className="flex">
                    <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <main className="flex-1 p-8 mt-16 flex"> {/* Added 'flex' to main container */}
                        <div className="flex-grow"> {/* Main content takes up most space */}
                            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Welcome to Your Dashboard</h1>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">This is your home page content. You can customize this section.</p>
                            <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-8">
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome to your Evolution Board!</h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-8">You are logged in.</p>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-red-600 dark:hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                        <div className="w-1/3 ml-8"> {/* Right-side section for badges - adjust width as needed, added margin-left */}
                            <EarnedBadgesSection /> {/* Render the EarnedBadgesSection component */}
                        </div>
                    </main>
                </div>
            </div>
        );
}

export default HomePage;