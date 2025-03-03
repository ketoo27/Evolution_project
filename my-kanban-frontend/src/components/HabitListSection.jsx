import React from 'react';
import HabitListItem from './HabitListItem';

function HabitListSection() {
    // Static habit list data - replace with API data later
    const allHabits = [
        { id: 1, habit_name: "Drink Water", habit_description: "Drink 8 glasses of water daily" },
        { id: 2, habit_name: "Exercise", habit_description: "30 minutes of workout 3 times a week" },
        { id: 3, habit_name: "Read", habit_description: "Read non-fiction for 30 minutes every day" },
        { id: 4, habit_name: "Meditate", habit_description: "10 minutes of daily meditation" },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"> {/* Dark mode background color */}
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Manage Habits</h2> {/* Adjusted heading text color */}
            <button
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4" // Dark mode button styles
            >
                Add New Habit
            </button>
            <ul>
                {allHabits.map(habit => (
                    <HabitListItem key={habit.id} habit={habit} />
                ))}
            </ul>
        </div>
    );
}

export default HabitListSection;