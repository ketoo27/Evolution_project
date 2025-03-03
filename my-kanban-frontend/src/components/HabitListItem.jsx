import React from 'react';

function HabitListItem({ habit }) {
    return (
        <li className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"> {/* Dark mode border color */}
            <h3 className="font-medium text-gray-800 dark:text-gray-100">{habit.habit_name}</h3> {/* Adjusted habit name text color */}
            <div className="space-x-2">
                <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button> {/* Dark mode edit button color */}
                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</button> {/* Dark mode delete button color */}
            </div>
        </li>
    );
}

export default HabitListItem;