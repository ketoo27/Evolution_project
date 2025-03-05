// src/HabitPage.jsx
import React, { useState } from 'react';
import HabitTrackingSection from './components/HabitTrackingSection';
import HabitListSection from './components/HabitListSection';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function HabitPage() {
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
        <div className="h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
                <main className="flex-1 p-4 mt-16" style={{ overflow: isSidebarOpen ? 'hidden' : 'auto' }}>
                    <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Habit Tracker</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Changed grid-cols-3 to grid-cols-2 */}
                        <div className="md:col-span-1 bg-white dark:bg-secondary-dark-bg rounded-3xl shadow-lg p-6"> {/* Changed md:col-span-2 to md:col-span-1 */}
                            <HabitTrackingSection />
                        </div>
                        <div className="md:col-span-1 bg-white dark:bg-secondary-dark-bg rounded-3xl shadow-lg p-6"> {/* Changed md:col-span-1 to md:col-span-1 */}
                            <HabitListSection />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HabitPage;