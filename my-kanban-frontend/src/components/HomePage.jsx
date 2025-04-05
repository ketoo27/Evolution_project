import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import EarnedBadgesSection from './EarnedBadgesSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Fainter color palette
const COLORS = ['#a0c4ff', '#a7edba', '#ffdd91', '#ffb370', '#c1b3ff'];
const taskColors = { Done: COLORS[1], ToDo: COLORS[0] }; // Define colors for task chart
const habitColor = COLORS[2]; // Define color for habit chart

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
    const [taskStatusCounts, setTaskStatusCounts] = useState([]);
    const [loadingTaskStatus, setLoadingTaskStatus] = useState(true);
    const [errorTaskStatus, setErrorTaskStatus] = useState(null);
    const [taskPriorityCounts, setTaskPriorityCounts] = useState([]);
    const [loadingTaskPriority, setLoadingTaskPriority] = useState(true);
    const [errorTaskPriority, setErrorTaskPriority] = useState(null);
    const [taskTypeCounts, setTaskTypeCounts] = useState([]);
    const [loadingTaskType, setLoadingTaskType] = useState(true);
    const [errorTaskType, setErrorTaskType] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loadingUpcomingEvents, setLoadingUpcomingEvents] = useState(true);
    const [errorUpcomingEvents, setErrorUpcomingEvents] = useState(null);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        const fetchTaskCompletionRate = async () => {
            setLoadingTaskCompletionRate(true);
            setErrorTaskCompletionRate(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/completion-rate/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTaskCompletionRateData(data);
            } catch (error) { setErrorTaskCompletionRate(error.message); } finally { setLoadingTaskCompletionRate(false); }
        };

        const fetchHabitWeeklyCompletion = async () => {
            setLoadingHabitWeeklyCompletion(true);
            setErrorHabitWeeklyCompletion(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/habits/weekly-completion/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setHabitWeeklyCompletionData(data);
            } catch (error) { setErrorHabitWeeklyCompletion(error.message); } finally { setLoadingHabitWeeklyCompletion(false); }
        };

        const fetchHabitStreak = async () => {
            setLoadingHabitStreak(true);
            setErrorHabitStreak(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/habits/streak/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setHabitStreak(data.habitStreak);
            } catch (error) { setErrorHabitStreak(error.message); } finally { setLoadingHabitStreak(false); }
        };

        const fetchTaskStatusCounts = async () => {
            setLoadingTaskStatus(true);
            setErrorTaskStatus(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/status-counts/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTaskStatusCounts(data);
            } catch (error) { setErrorTaskStatus(error.message); } finally { setLoadingTaskStatus(false); }
        };

        const fetchTaskPriorityCounts = async () => {
            setLoadingTaskPriority(true);
            setErrorTaskPriority(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/priority-counts/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTaskPriorityCounts(data);
            } catch (error) { setErrorTaskPriority(error.message); } finally { setLoadingTaskPriority(false); }
        };

        const fetchTaskTypeCounts = async () => {
            setLoadingTaskType(true);
            setErrorTaskType(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/tasks/type-counts/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTaskTypeCounts(data);
            } catch (error) { setErrorTaskType(error.message); } finally { setLoadingTaskType(false); }
        };

        const fetchUpcomingEvents = async () => {
            setLoadingUpcomingEvents(true);
            setErrorUpcomingEvents(null);
            try {
                const response = await fetch('http://127.0.0.1:8000/api/events/upcoming/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setUpcomingEvents(data);
            } catch (error) { setErrorUpcomingEvents(error.message); } finally { setLoadingUpcomingEvents(false); }
        };

        fetchTaskCompletionRate();
        fetchHabitWeeklyCompletion();
        fetchHabitStreak();
        fetchTaskStatusCounts();
        fetchTaskPriorityCounts();
        fetchTaskTypeCounts();
        fetchUpcomingEvents();
    }, []);

    const formatTooltipContent = (props) => {
        if (!props || !props.payload || props.payload.length === 0) {
            return null;
        }
        return (
            <div className="recharts-tooltip-content" style={{ backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #ccc' }}>
                {props.payload.map((item, index) => (
                    <div key={`tooltip-item-${index}`} className="recharts-tooltip-item">
                        <span className="recharts-tooltip-item-name" style={{ color: item.color }}>
                            {item.name}
                        </span>
                        <span className="recharts-tooltip-item-separator"> : </span>
                        <span className="recharts-tooltip-item-value">{item.value}</span>
                    </div>
                ))}
                {props.label && (
                    <div className="recharts-tooltip-label" style={{ marginTop: '5px', fontWeight: 'bold' }}>
                        {props.label}
                    </div>
                )}
            </div>
        );
    };

    const formatYAxisTick = (value) => {
        return Math.round(value);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-8 mt-16 flex">
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Your Dashboard</h1>

                        {/* Task Status, Priority, and Type Pie Charts */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 flex justify-around" style={{ height: '280px' }}>
                            {/* Task Status Pie Chart */}
                            <div className="w-1/3 flex flex-col items-center">
                                <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-100">Task Status</h3>
                                {loadingTaskStatus ? <p>Loading...</p> : errorTaskStatus ? <p className="text-red-500">Error</p> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={taskStatusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                                                {taskStatusCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Task Priority Pie Chart */}
                            <div className="w-1/3 flex flex-col items-center">
                                <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-100">Task Priority</h3>
                                {loadingTaskPriority ? <p>Loading...</p> : errorTaskPriority ? <p className="text-red-500">Error</p> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={taskPriorityCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                                                {taskPriorityCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Task Type Pie Chart */}
                            <div className="w-1/3 flex flex-col items-center">
                                <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-100">Task Type</h3>
                                {loadingTaskType ? <p>Loading...</p> : errorTaskType ? <p className="text-red-500">Error</p> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={taskTypeCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                                                {taskTypeCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Task Completion Rate Chart (Weekly - Done vs ToDo) */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Weekly Task Status</h2>
                            {loadingTaskCompletionRate ? (
                                <p>Loading task status...</p>
                            ) : errorTaskCompletionRate ? (
                                <p className="text-red-500">Error loading task status: {errorTaskCompletionRate}</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={taskCompletionRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dueDate" tick={{ fill: '#8884d8' }} />
                                        <YAxis tick={{ fill: '#8884d8' }} tickFormatter={formatYAxisTick} />
                                        <Tooltip content={formatTooltipContent} />
                                        <Legend />
                                        <Bar dataKey="Done" fill={taskColors.Done} name="Done" />
                                        <Bar dataKey="ToDo" fill={taskColors.ToDo} name="To Do" />
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
                                    <BarChart data={habitWeeklyCompletionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" tick={{ fill: '#8884d8' }} />
                                        <YAxis tick={{ fill: '#8884d8' }} tickFormatter={formatYAxisTick} />
                                        <Tooltip content={formatTooltipContent} />
                                        <Legend />
                                        <Bar dataKey="completedHabits" fill={habitColor} name="Completed Habits" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* You can add other visualizations here later */}

                    </div>
                    <div className="w-1/4 ml-8">
                        <EarnedBadgesSection />
                        {/* Habit Streak */}
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

                        {/* Upcoming Events */}
                        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Upcoming Events</h2>
                            {loadingUpcomingEvents ? (
                                <p>Loading upcoming events...</p>
                            ) : errorUpcomingEvents ? (
                                <p className="text-red-500">Error loading upcoming events: {errorUpcomingEvents}</p>
                            ) : (
                                upcomingEvents.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {upcomingEvents.map((event, index) => (
                                            <li key={index} className="mb-2">
                                                <strong className="text-gray-800 dark:text-gray-100">{event.title}</strong>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Date: {new Date(event.date).toLocaleDateString()}, Time: {event.time}
                                                </p>
                                                {event.description && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-300">No upcoming events.</p>
                                )
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