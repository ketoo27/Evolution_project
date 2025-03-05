// src/components/HabitItem.jsx
import React, { useState, useContext, useEffect } from 'react'; // Import useEffect
import AuthContext from '../context/Authcontext';

function HabitItem({ habitTracker, onHabitUpdate }) { // Expecting habitTracker prop, and onHabitUpdate callback
    const [isChecked, setIsChecked] = useState(habitTracker.is_completed); // Initialize from habitTracker prop
    const { authToken } = useContext(AuthContext);

    useEffect(() => {
        setIsChecked(habitTracker.is_completed); // Sync checkbox with prop changes
    }, [habitTracker.is_completed]); // Effect to update checkbox when prop changes


    const handleCheckboxChange = async (event) => {
        const newCheckedState = event.target.checked;
        setIsChecked(newCheckedState); // Optimistically update local checkbox state

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/habittrackers/${habitTracker.id}/`, { // Use habitTracker.id for URL
                method: 'PUT', // Use PUT request as per HabitTrackerViewSet update method
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_completed: newCheckedState }), // Send only is_completed in request body
            });

            if (!response.ok) {
                console.error(`Failed to update habit completion: HTTP status ${response.status}`);
                setIsChecked(!newCheckedState); // Revert checkbox state on failure
                // Optionally, display an error message to the user
            } else {
                console.log("Habit completion updated successfully");
                // Optionally, provide visual feedback to the user
                if (onHabitUpdate) {
                    onHabitUpdate(); // Call the callback to refresh HabitTrackingSection
                }
            }
        } catch (error) {
            console.error("Error updating habit completion:", error);
            setIsChecked(!newCheckedState); // Revert checkbox state on error
            // Optionally, display an error message to the user
        }
    };

    return (
        <li className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-500 dark:checked:bg-indigo-500 dark:focus:ring-indigo-500"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-100">{habitTracker.habit_name}</h3> {/* Use habitTracker.habit_name */}
                    <p className="text-gray-500 text-sm dark:text-gray-400">{habitTracker.habit_description}</p> {/* Use habitTracker.habit_description */}
                </div>
            </div>
        </li>
    );
}

export default HabitItem;