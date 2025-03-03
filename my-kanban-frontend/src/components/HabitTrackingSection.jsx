import React from 'react';
import HabitItem from './HabitItem';

function HabitTrackingSection() {
    // Static habit data for now - replace with API data later
    const todayHabits = [
        { id: 1, habit_name: "Drink Water", habit_description: "Drink 8 glasses of water" },
        { id: 2, habit_name: "Exercise", habit_description: "30 minutes of workout" },
        { id: 3, habit_name: "Read", habit_description: "Read for 30 minutes" },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"> {/* Dark mode background color */}
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Today's Habits</h2> {/* Adjusted heading text color */}
            <ul>
                {todayHabits.map(habit => (
                    <HabitItem key={habit.id} habit={habit} />
                ))}
            </ul>
        </div>
    );
}

export default HabitTrackingSection;