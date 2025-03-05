// src/components/HabitTrackingSection.jsx
import React, { useState, useEffect, useContext } from 'react';
import HabitItem from './HabitItem';
import AuthContext from '../context/Authcontext';

function HabitTrackingSection() {
    const [todayHabitTrackers, setTodayHabitTrackers] = useState([]); // State to store HabitTracker data
    const { authToken } = useContext(AuthContext);

    useEffect(() => {
        fetchTodayHabitTrackers();
    }, [authToken]);

    const fetchTodayHabitTrackers = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            return;
        }
        try {
            // Fetching from /api/habittrackers/ which should list today's trackers
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
            setTodayHabitTrackers(data); // Store HabitTracker data
        } catch (error) {
            console.error("Could not fetch today's habit trackers:", error);
        }
    };

    const handleHabitUpdated = () => {
        // Callback function to refresh habits after update in HabitItem
        fetchTodayHabitTrackers();
    };


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Today's Habits</h2>
            <ul>
                {todayHabitTrackers.map(habitTracker => ( // Map over todayHabitTrackers
                    <HabitItem
                        key={habitTracker.id}
                        habitTracker={habitTracker} // Pass HabitTracker object as prop
                        onHabitUpdate={handleHabitUpdated} // Pass the callback function
                    />
                ))}
            </ul>
        </div>
    );
}

export default HabitTrackingSection;