import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import EarnedBadgesSection from './EarnedBadgesSection';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Updated color palette - a bit more vibrant and accessible
const PRIMARY_COLOR = '#3b82f6'; // Blue
const SECONDARY_COLOR = '#6d28d9'; // Purple
const SUCCESS_COLOR = '#16a34a'; // Green
const WARNING_COLOR = '#d97706'; // Orange
const INFO_COLOR = '#0ea5e9'; // Cyan
const GRAY_LIGHT = '#f3f4f6';
const GRAY_DARK = '#1f2937';

const COLORS = [PRIMARY_COLOR, SUCCESS_COLOR, WARNING_COLOR, SECONDARY_COLOR, INFO_COLOR];
const taskColors = { Done: SUCCESS_COLOR, ToDo: PRIMARY_COLOR }; // Define colors for task chart
const habitColor = SECONDARY_COLOR; // Define color for habit chart

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

    // --- New state for user's name ---
    const [userName, setUserName] = useState('Your'); // Default to 'Your'
    const [loadingUserName, setLoadingUserName] = useState(true);
    const [errorUserName, setErrorUserName] = useState(null);
    // --- End of new state ---


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        // --- New function to fetch user profile ---
        const fetchUserProfile = async () => {
            setLoadingUserName(true);
            setErrorUserName(null);
            try {
                // *** ASSUMPTION: You have an API endpoint like /api/user/profile/
                // *** that returns user details including the 'name' field.
                // *** Adjust the URL if your endpoint is different.
                const response = await fetch('http://127.0.0.1:8000/api/user/profile/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                // *** ASSUMPTION: The user's name is available in the 'name' field of the response.
                // *** Adjust 'data.name' if your backend uses a different field name.
                if (data.name) {
                     setUserName(data.name);
                } else if (data.username) {
                    // Fallback to username if name is not available
                    setUserName(data.username);
                } else {
                     setUserName('Your'); // Default if no name or username found
                }

            } catch (error) {
                console.error("Error fetching user profile:", error);
                setErrorUserName(error.message);
                setUserName('Your'); // Revert to default on error
            } finally {
                setLoadingUserName(false);
            }
        };
        // --- End of fetch user profile function ---


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
                // *** Assuming the habit streak is returned in the login response
                // *** or a separate endpoint. If using the updated login response,
                // *** you might get it from AuthContext or directly from login data.
                // *** For now, keeping the separate fetch as in your original code.
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
                // Assuming your UpcomingEventsView API endpoint is /api/events/upcoming/
                const response = await fetch('http://127.0.0.1:8000/api/events/upcoming/', { headers: { 'Authorization': `Token ${token}` } });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                 // *** Update how upcoming event dates and times are displayed
                 const formattedEvents = data.map(event => ({
                    ...event,
                    // Assuming start_time is sent as ISO string from backend
                    displayDate: new Date(event.start_time).toLocaleDateString(),
                    // Format time in 12 or 24 hour format based on locale
                    // Options object can be adjusted for specific time format
                    displayTime: new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }));
                setUpcomingEvents(formattedEvents);
            } catch (error) {
                console.error("Error fetching upcoming events:", error);
                setErrorUpcomingEvents(error.message);
            } finally { setLoadingUpcomingEvents(false); }
        };

        // Call the new fetch user profile function
        fetchUserProfile();

        // Keep existing data fetching calls
        fetchTaskCompletionRate();
        fetchHabitWeeklyCompletion();
        fetchHabitStreak();
        fetchTaskStatusCounts();
        fetchTaskPriorityCounts();
        fetchTaskTypeCounts();
        fetchUpcomingEvents();

    }, []); // Empty dependency array ensures this runs only once on mount

    const formatTooltipContent = (props) => {
        if (!props || !props.payload || props.payload.length === 0) {
            return null;
        }
        return (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-md p-3 border border-gray-200 dark:border-gray-700 text-sm">
                {props.payload.map((item, index) => (
                    <div key={`tooltip-item-${index}`} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-800 dark:text-gray-300 font-medium">{item.name}:</span>
                        <span className="text-gray-700 dark:text-gray-400">{item.value}</span>
                    </div>
                ))}
                {props.label && (
                    <div className="mt-2 pt-1 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 text-xs font-semibold">{props.label}</span>
                    </div>
                )}
            </div>
        );
    };

    const formatYAxisTick = (value) => {
        return Math.round(value);
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <main className="flex-1 p-8 mt-16 flex">
                    <div className="flex-grow">
                        <div className="mb-6">
                            {/* Updated heading to include user's name */}
                            {loadingUserName ? (
                                <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Loading Dashboard...</h1>
                            ) : errorUserName ? (
                                <h1 className="text-3xl font-semibold text-red-500 mb-2">Error loading user name</h1>
                            ) : (
                                <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{userName}'s Dashboard</h1>
                            )}
                            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's an overview of your progress.</p>
                        </div>

                        {/* Task Status, Priority, and Type Pie Charts */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 flex justify-around" style={{ height: '280px' }}>
                            {/* Task Status Pie Chart */}
                            <div className="w-1/3 flex flex-col items-center">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Task Status</h3>
                                {loadingTaskStatus ? <p>Loading...</p> : errorTaskStatus ? <p className="text-red-500">Error</p> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={taskStatusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                                                {taskStatusCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={formatTooltipContent} /> {/* Added content prop */}
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Task Priority Pie Chart */}
                            <div className="w-1/3 flex flex-col items-center">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Task Priority</h3>
                                {loadingTaskPriority ? <p>Loading...</p> : errorTaskPriority ? <p className="text-red-500">Error</p> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={taskPriorityCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                                                {taskPriorityCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={formatTooltipContent} /> {/* Added content prop */}
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Task Type Pie Chart */}
                            <div className="w-1/3 flex flex-col items-center">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Task Type</h3>
                                {loadingTaskType ? <p>Loading...</p> : errorTaskType ? <p className="text-red-500">Error</p> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={taskTypeCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                                                {taskTypeCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={formatTooltipContent} /> {/* Added content prop */}
                                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Task Completion Rate Chart (Weekly - Done vs ToDo) */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Weekly Task Status</h2>
                            {loadingTaskCompletionRate ? (
                                <p>Loading task status...</p>
                            ) : errorTaskCompletionRate ? (
                                <p className="text-red-500">Error loading task status: {errorTaskCompletionRate}</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={taskCompletionRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dueDate" tick={{ fill: '#8884d8', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#8884d8', fontSize: 12 }} tickFormatter={formatYAxisTick} />
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
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Habit Completion (Current Week)</h2>
                            {loadingHabitWeeklyCompletion ? (
                                <p>Loading habit completion data...</p>
                            ) : errorHabitWeeklyCompletion ? (
                                <p className="text-red-500">Error loading habit completion data: {errorHabitWeeklyCompletion}</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={habitWeeklyCompletionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" tick={{ fill: '#8884d8', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#8884d8', fontSize: 12 }} tickFormatter={formatYAxisTick} />
                                        <Tooltip content={formatTooltipContent} />
                                        <Legend />
                                        <Bar dataKey="completedHabits" fill={habitColor} name="Completed Habits" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                    <div className="w-1/4 ml-8">
                    <div className="bg-white mt-10 dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                                <EarnedBadgesSection />
                            </div>
                        {/* Habit Streak */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Habit Streak</h2>
                            {loadingHabitStreak ? (
                                <p>Loading habit streak...</p>
                            ) : errorHabitStreak ? (
                                <p className="text-red-500">Error loading habit streak: {errorHabitStreak}</p>
                            ) : (
                                <p className="text-2xl font-bold text-green-500 dark:text-green-400">{habitStreak} days</p>
                            )}
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Upcoming Events This Month</h2>
                            {loadingUpcomingEvents ? (
                                <p>Loading upcoming events...</p>
                            ) : errorUpcomingEvents ? (
                                <p className="text-red-500">Error loading upcoming events: {errorUpcomingEvents}</p>
                            ) : (
                                upcomingEvents.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {upcomingEvents.map((event, index) => (
                                            <li key={index} className="mb-3">
                                                <strong className="text-gray-800 dark:text-gray-100">{event.title}</strong>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    {/* Display using the formatted fields */}
                                                    Date: {event.displayDate},
                                                    Time: {event.displayTime}
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
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;