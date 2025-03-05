// src/components/HabitListSection.jsx
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/Authcontext';

function HabitListSection() {
    const [habits, setHabits] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [newHabitDescription, setNewHabitDescription] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit modal
    const [editHabitId, setEditHabitId] = useState(null); // State to track habit ID being edited
    const [editHabitName, setEditHabitName] = useState(''); // State for editing habit name
    const [editHabitDescription, setEditHabitDescription] = useState(''); // State for editing habit description
    const { authToken } = useContext(AuthContext);

    useEffect(() => {
        fetchHabits();
    }, [authToken]);

    const fetchHabits = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/habits/', {
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
            setHabits(data);
        } catch (error) {
            console.error("Could not fetch habits:", error);
        }
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        clearInputFields();
    };

    const clearInputFields = () => {
        setNewHabitName('');
        setNewHabitDescription('');
    };

    const handleSaveHabit = async () => {
        const habitData = {
            habit_name: newHabitName,
            habit_description: newHabitDescription,
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/habits/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(habitData),
            });
            if (!response.ok) {
                console.error(`Failed to create habit: HTTP status ${response.status}`);
            } else {
                fetchHabits();
                handleCloseAddModal();
            }
        } catch (error) {
            console.error("Error creating habit:", error);
        }
    };

    // Delete Habit Function
    const handleDeleteHabit = async (id) => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            return;
        }
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/habits/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                console.error(`Failed to delete habit: HTTP status ${response.status}`);
            } else {
                fetchHabits(); // Refetch habits to update the list
            }
        } catch (error) {
            console.error("Error deleting habit:", error);
        }
    };

    // Edit Habit Modal Functions
    const handleOpenEditModal = (habit) => {
        setEditHabitId(habit.id);
        setEditHabitName(habit.habit_name);
        setEditHabitDescription(habit.habit_description); // Now set description as well
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditHabitId(null);
        setEditHabitName('');
        setEditHabitDescription(''); // Clear description state as well
    };

    const handleUpdateHabit = async () => {
        const updatedHabitData = {
            habit_name: editHabitName,
            habit_description: editHabitDescription, // Include description in update data
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/habits/${editHabitId}/`, {
                method: 'PUT', // Or PATCH, depending on your backend API
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedHabitData),
            });
            if (!response.ok) {
                console.error(`Failed to update habit: HTTP status ${response.status}`);
            } else {
                fetchHabits();
                handleCloseEditModal();
            }
        } catch (error) {
            console.error("Error updating habit:", error);
        }
    };


    return (
        <div className="bg-white dark:bg-secondary-dark-bg rounded-3xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Habits</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                    Add Habit
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {habits.map(habit => (
                    <li key={habit.id} className="py-3 flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{habit.habit_name}</span>
                        <div className="space-x-2">
                            <button
                                onClick={() => handleOpenEditModal(habit)}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-xs"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline text-xs"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/*  "Add Habit" Modal */}
            {isAddModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-gray-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                                    Add New Habit
                                </h3>
                                <div className="mt-2 grid grid-cols-1 gap-4">
                                    <div>
                                        <label htmlFor="habitName" className="block text-base font-medium text-white">Habit Name</label>
                                        <input
                                            type="text"
                                            name="habitName"
                                            id="habitName"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="Habit name"
                                            value={newHabitName}
                                            onChange={(e) => setNewHabitName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="habitDescription" className="block text-base font-medium text-white">Habit Description</label>
                                        <textarea
                                            name="habitDescription"
                                            id="habitDescription"
                                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Habit description"
                                            value={newHabitDescription}
                                            onChange={(e) => setNewHabitDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 sm:ml-3 sm:w-auto text-base"
                                    onClick={handleSaveHabit}
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto text-base"
                                    onClick={handleCloseAddModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Habit Modal */}
            {isEditModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="editModalTitle" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-gray-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-white" id="editModalTitle">
                                    Edit Habit
                                </h3>
                                <div className="mt-2 grid grid-cols-1 gap-4">
                                    <div>
                                        <label htmlFor="editHabitName" className="block text-base font-medium text-white">Habit Name</label>
                                        <input
                                            type="text"
                                            name="editHabitName"
                                            id="editHabitName"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="Habit name"
                                            value={editHabitName}
                                            onChange={(e) => setEditHabitName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="editHabitDescription" className="block text-base font-medium text-white">Habit Description</label>
                                        <textarea
                                            name="editHabitDescription"
                                            id="editHabitDescription"
                                            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Habit description"
                                            value={editHabitDescription}
                                            onChange={(e) => setEditHabitDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 sm:ml-3 sm:w-auto text-base"
                                    onClick={handleUpdateHabit}
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto text-base"
                                    onClick={handleCloseEditModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HabitListSection;