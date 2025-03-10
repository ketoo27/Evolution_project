// src/pages/JournalPage.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import JournalEditor from './components/JournalEditor'; // Import JournalEditor

function JournalPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
                <main className="flex-1 p-8 mt-16" style={{ overflow: isSidebarOpen ? 'hidden' : 'auto' }}>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-4">Journal</h1>
                    <JournalEditor /> {/* Render the JournalEditor component */}
                </main>
            </div>
        </div>
    );
}

export default JournalPage;