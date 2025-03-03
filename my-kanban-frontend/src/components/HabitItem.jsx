import React from 'react';

function HabitItem({ habit }) {
    return (
        <li className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"> {/* Dark mode border color */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-500 dark:checked:bg-indigo-500 dark:focus:ring-indigo-500" // Dark mode checkbox styles
                />
                <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">{habit.habit_name}</h3> {/* Adjusted habit name text color */}
                    <p className="text-gray-500 text-sm dark:text-gray-400">{habit.habit_description}</p> {/* Adjusted description text color */}
                </div>
            </div>
        </li>
    );
}

export default HabitItem;