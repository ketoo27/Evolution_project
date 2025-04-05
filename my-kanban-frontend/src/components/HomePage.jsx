import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import EarnedBadgesSection from './EarnedBadgesSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function HomePage() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [taskCompletionRateData, setTaskCompletionRateData] = useState([]);
    const [loadingTaskCompletionRate, setLoadingTaskCompletionRate] = useState(true);
    const [errorTaskCompletionRate, setErrorTaskCompletionRate] = useState(null);
    const [habitWeeklyCompletionData, setHabitWeeklyCompletionData] = useState([]);
    const [loadingHabitWeeklyCompletion, setLoadingHabitWeeklyCompletion] = useState(true);
    const [errorHabitWeeklyCompletion, setErrorHabitWeeklyCompletion] = useState(null);
    const [habitStreak, setHabitStreak] = useState(0);
    const [loadingHabitStreak, setLoadingHabitStreak] = useState(true);
    const [errorHabitStreak, setErrorHabitStreak] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    useEffect(() => {
        const fetchTaskCompletionRate = async () => {
            setLoadingTaskCompletionRate(true);
            setErrorTaskCompletionRate(null);
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/completion-rate/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTaskCompletionRateData(data);
            } catch (error) {
                setErrorTaskCompletionRate(error.message);
            } finally {
                setLoadingTaskCompletionRate(false);
            }
        };

        const fetchHabitWeeklyCompletion = async () => {
            setLoadingHabitWeeklyCompletion(true);
            setErrorHabitWeeklyCompletion(null);
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch('http://127.0.0.1:8000/api/habits/weekly-completion/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setHabitWeeklyCompletionData(data);
            } catch (error) {
                setErrorHabitWeeklyCompletion(error.message);
            } finally {
                setLoadingHabitWeeklyCompletion(false);
            }
        };

        const fetchHabitStreak = async () => {
            setLoadingHabitStreak(true);
            setErrorHabitStreak(null);
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch('http://127.0.0.1:8000/api/habits/streak/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setHabitStreak(data.habitStreak);
            } catch (error) {
                setErrorHabitStreak(error.message);
            } finally {
                setLoadingHabitStreak(false);
            }
        };

        fetchTaskCompletionRate();
        fetchHabitWeeklyCompletion();
        fetchHabitStreak();
    }, []);

    return (
        <div className=" bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-8 mt-16 flex">
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Your Dashboard</h1>

                        {/* Task Completion Rate Chart */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Total vs. Completed Tasks (Current Week)</h2>
                            {loadingTaskCompletionRate ? (
                                <p>Loading task completion rate...</p>
                            ) : errorTaskCompletionRate ? (
                                <p className="text-red-500">Error loading task completion rate: {errorTaskCompletionRate}</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={taskCompletionRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dueDate" tick={{ fill: '#8884d8' }} />
                                        <YAxis tick={{ fill: '#8884d8' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="total" fill="#8884d8" name="Total Tasks" />
                                        <Bar dataKey="completed" fill="#82ca9d" name="Completed Tasks" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Habit Completion Weekly Chart */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Habit Completion (Current Week)</h2>
                            {loadingHabitWeeklyCompletion ? (
                                <p>Loading habit completion data...</p>
                            ) : errorHabitWeeklyCompletion ? (
                                <p className="text-red-500">Error loading habit completion data: {errorHabitWeeklyCompletion}</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={habitWeeklyCompletionData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" tick={{ fill: '#8884d8' }} />
                                        <YAxis tick={{ fill: '#8884d8' }} />
                                        <Tooltip />
                                        <Bar dataKey="completedHabits" fill="#a4add3" name="Completed Habits" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* You can add other visualizations here later */}

                    </div>
                    <div className="w-1/3 ml-8">
                        <EarnedBadgesSection />
                        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Habit Streak</h2>
                            {loadingHabitStreak ? (
                                <p>Loading habit streak...</p>
                            ) : errorHabitStreak ? (
                                <p className="text-red-500">Error loading habit streak: {errorHabitStreak}</p>
                            ) : (
                                <p className="text-xl font-bold text-green-500 dark:text-green-400">{habitStreak} days</p>
                            )}
                        </div>
                        {/* Removed Quick Actions and Logout button */}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;