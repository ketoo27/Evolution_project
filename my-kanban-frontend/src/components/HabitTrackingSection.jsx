// src/components/HabitTrackingSection.jsx
import React, { useState, useEffect, useContext } from 'react';
import HabitItem from './HabitItem';
import AuthContext from '../context/Authcontext';

function HabitTrackingSection() {
    const [todayHabitTrackers, setTodayHabitTrackers] = useState([]);
    const { authToken } = useContext(AuthContext);
    const [todayDate, setTodayDate] = useState(''); // State to store today's date

    useEffect(() => {
        fetchTodayHabitTrackers();
        setTodayDate(formatDate(new Date())); // Set today's date when component mounts
    }, [authToken]);

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options); // Format date to a readable string
    };

    const fetchTodayHabitTrackers = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/habittrackers/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return;
            }
            const data = await response.json();
            setTodayHabitTrackers(data);
        } catch (error) {
            console.error("Could not fetch today's habit trackers:", error);
        }
    };

    const handleHabitUpdated = () => {
        fetchTodayHabitTrackers();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Today's Habits - {todayDate} {/* Display today's date here */}
            </h2>
            <ul>
                {todayHabitTrackers.map(habitTracker => (
                    <HabitItem
                        key={habitTracker.id}
                        habitTracker={habitTracker}
                        onHabitUpdate={handleHabitUpdated}
                    />
                ))}
            </ul>
        </div>
    );
}

export default HabitTrackingSection;