import React, { useState, useEffect, useRef, useContext } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './index.css';
import AuthContext from './context/Authcontext';

const Header = ({ category, title, onAddTaskClick }) => (
    <div className="mb-10 flex justify-between items-center">
        <div>
            <p className="text-lg text-white">{category}</p> {/* Changed text-gray-400 to text-white */}
            <p className="text-3xl font-extrabold tracking-tight text-white"> {/* Changed text-slate-900 to text-white */}
                {title}
            </p>
        </div>
        <button
            onClick={onAddTaskClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
            Add Task
        </button>
    </div>
);

const TaskManagementPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [kanbanData, setKanbanData] = useState([]);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskSummary, setNewTaskSummary] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState('to_do');
    const [newTaskType, setNewTaskType] = useState('personal'); // Updated default to 'personal'
    const [newTaskPriority, setNewTaskPriority] = useState('low');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    // --- New state variables for event relation ---
    const [relatedEvent, setRelatedEvent] = useState(null);
    const [eventsList, setEventsList] = useState([]); // Initialize as empty array
    // --- End of new state variables ---

    // Updated choices to match user's provided options
    const taskTypes = [
        'personal',
        'professional',
        'educational',
        'health_wellness',
        'financial',
        'other'
    ];
    const priorities = [
        'low',
        'medium',
        'high',
    ];
    const statusChoices = [ // Keeping these for reference, but Kanban columns are 'to_do', 'in_progress', 'done'
        ('to_do', 'To Do'),
        ('processing', 'Processing'), // Updated to 'Processing'
        ('done', 'Done'),
    ];


    const kanbanGrid = [
        { headerText: 'To Do', keyField: 'to_do', allowToggleDragAndDrop: true },
        { headerText: 'Processing', keyField: 'processing', allowToggleDragAndDrop: true },
        { headerText: 'Done', keyField: 'done', allowToggleDragAndDrop: true },
    ];

    const kanbanInstance = useRef(null);
    const { authToken } = useContext(AuthContext);

    const handleToggleSidebar = () => { // New handler for toggling sidebar
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            document.body.classList.add('overflow-hidden'); // Disable body scroll when sidebar opens
        } else {
            document.body.classList.remove('overflow-hidden'); // Re-enable body scroll when sidebar closes
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    useEffect(() => {
        fetchTasks();
        fetchEvents();
    }, []);



    const fetchTasks = async () => {
        try {
            if (!authToken) {
                console.error("No auth token found. User likely not logged in.");
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
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
            const formattedData = data.map(task => ({
                Id: task.id,
                Status: task.status,
                Summary: task.summary,
                Title: task.title,
                TaskType: task.task_type,
                Priority: task.priority,
                DueDate: task.due_date,
            }));
            setKanbanData(formattedData);
        } catch (error) {
            console.error("Could not fetch Kanban data:", error);
        }
    };

    // --- Function to fetch events and filter ---
    const fetchEvents = async () => {
        try {
            if (!authToken) {
                console.error("No auth token found for fetching events.");
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/events/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                console.error(`HTTP error fetching events! status: ${response.status}`);
                return;
            }
            const data = await response.json();
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

            // Assuming your event data has a field like 'start_date' or similar
            const filteredEvents = data.filter(event => {
                if (event.start_time) {
                    const eventDate = new Date(event.start_time);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate >= today;
                }
                return false; // If no start_date, don't include
            });

            setEventsList(filteredEvents);
        } catch (error) {
            console.error("Could not fetch events:", error);
        }
    };
    // --- End of fetchEvents function ---

    const handleCardDragStop = async (args) => {
        const taskId = args.draggedCardData.Id;
        const newStatus = args.targetColumn.keyField;
        console.log(`Task ID: ${taskId}, New Status: ${newStatus}`);
        await updateTaskOnBackend(taskId, { status: newStatus });
    };

    async function updateTaskOnBackend(taskId, updatedTaskData) {
        console.log("Updating task:", taskId, "with data:", updatedTaskData); // Log data being sent
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
                body: JSON.stringify(updatedTaskData),
            });
            if (!response.ok) {
                console.error(`Failed to update task: HTTP status ${response.status}`);
            } else {
                console.log(`Task ${taskId} updated successfully on backend`);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }

    async function createTask(taskData) {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
                body: JSON.stringify(taskData),
            });
            if (!response.ok) {
                console.error(`Failed to create task: HTTP status ${response.status}`);
            } else {
                fetchTasks();
                setIsAddTaskModalOpen(false);
                clearTaskInputFields();
            }
        } catch (error) {
            console.error("Error creating task:", error);
        }
    }
    async function deleteTask(taskId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${authToken}`,
                },
            });
            if (!response.ok) {
                console.error(`Failed to delete task: HTTP status ${response.status}`);
            } else {
                fetchTasks();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    const handleActionBegin = (args) => {
        if (args.requestType === 'cardRemove') {
            if (args.deletedRecords && Array.isArray(args.deletedRecords) && args.deletedRecords.length > 0) {
                const taskId = args.deletedRecords[0].Id;
                if (taskId) {
                    deleteTask(taskId);
                } else {
                    console.error("Task ID missing for delete operation.");
                }
            }
            args.cancel = true;
        }
    };

    const handleActionComplete = async (args) => {
        if (args.requestType === 'cardChanged') {
            if (args.changedRecords && args.changedRecords.length > 0) {
                const updatedRecord = args.changedRecords[0];
                const taskId = updatedRecord.Id;

                // **Fetch the existing task data to get the title**
                try {
                    const taskResponse = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                        headers: {
                            'Authorization': `Token ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!taskResponse.ok) {
                        console.error(`Failed to fetch task details for task ID: ${taskId}`);
                        return; // Exit if fetch fails
                    }
                    const taskData = await taskResponse.json();
                    const originalTitle = taskData.title; // Get the title from fetched data


                    // Include ALL task fields in the update data, **including the original title**
                    const updatedData = {
                        status: updatedRecord.Status,
                        summary: updatedRecord.Summary,
                        title: originalTitle,         // **Use the fetched original title**
                        task_type: updatedRecord.TaskType, // Include task_type
                        priority: updatedRecord.Priority,   // Include priority
                        due_date: updatedRecord.DueDate,     // Include due_date
                    };
                    console.log("Data being sent to updateTaskOnBackend:", updatedData); // Log updatedData
                    await updateTaskOnBackend(taskId, updatedData);

                } catch (fetchError) {
                    console.error("Error fetching task details before update:", fetchError);
                }
            }
        }
    };

    const handleAddTaskClick = () => {
        setIsAddTaskModalOpen(true);
        setNewTaskStatus('to_do');
    };

    const handleCloseAddTaskModal = () => {
        setIsAddTaskModalOpen(false);
        clearTaskInputFields();
    };

    const clearTaskInputFields = () => {
        setNewTaskTitle('');
        setNewTaskSummary('');
        setNewTaskType('personal');
        setNewTaskPriority('low');
        setNewTaskDueDate('');
        setRelatedEvent(null); // Reset relatedEvent
    };

    const handleSaveTask = () => {
        const taskData = {
            title: newTaskTitle,
            summary: newTaskSummary,
            status: newTaskStatus,
            task_type: newTaskType,
            priority: newTaskPriority,
            due_date: newTaskDueDate,
            is_habit: false, // Assuming this is set elsewhere or defaults to false
            is_event: true, // Set is_event to true for all new tasks
            related_event: relatedEvent === null ? null : parseInt(relatedEvent), // Include relatedEvent
        };
        createTask(taskData);
    };


    return (
        <div className="bg-gray-50 dark:bg-gray-900 dark:text-white">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} /> {/* Pass props to Sidebar */}
                <main className="flex-1 p-8 mt-16" style={{overflow: isSidebarOpen ? 'hidden' : 'auto'}}> {/* Conditionally disable main content scroll */}
                    <Header category="Page" title="Task Management Kanban" onAddTaskClick={handleAddTaskClick} />
                    <div className="bg-white dark:bg-secondary-dark-bg rounded-3xl p-4 md:p-8">
                        <KanbanComponent
                            id="kanban"
                            keyField="Status"
                            dataSource={kanbanData}
                            cardSettings={{
                                contentField: 'Summary',
                                headerField: 'Title',
                                isDialog: true,
                            }}
                            cardDragStop={handleCardDragStop}
                            actionComplete={handleActionComplete}
                            actionBegin={handleActionBegin}
                            ref={kanbanInstance}
                        >
                            <ColumnsDirective>
                                {kanbanGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
                            </ColumnsDirective>
                        </KanbanComponent>
                    </div>


                            {isAddTaskModalOpen && (
                        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-gray-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                                            Add New Task
                                        </h3>
                                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="taskTitle" className="block text-base font-medium text-white">Title</label>
                                                <input type="text" name="taskTitle" id="taskTitle" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title" />
                                            </div>
                                            <div>
                                                <label htmlFor="taskSummary" className="block text-base font-medium text-white">Summary</label>
                                                <textarea name="taskSummary" id="taskSummary" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={newTaskSummary} onChange={(e) => setNewTaskSummary(e.target.value)} placeholder="Task summary" />
                                            </div>
                                            <div>
                                                <label htmlFor="taskType" className="block text-base font-medium text-white">Type</label>
                                                <select id="taskType" name="taskType" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newTaskType} onChange={(e) => setNewTaskType(e.target.value)}>
                                                    {taskTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="relatedEvent" className="block text-base font-medium text-white">Related Event</label>
                                                <select
                                                    id="relatedEvent"
                                                    name="relatedEvent"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                    value={relatedEvent || (eventsList && eventsList.length > 0 ? eventsList[0].id : '')} // Set default to the first event if available
                                                    onChange={(e) => setRelatedEvent(e.target.value ? parseInt(e.target.value) : null)} // Handle selection
                                                >
                                                    {eventsList.map(event => (
                                                        <option key={event.id} value={event.id}>
                                                            {event.subject}
                                                        </option>
                                                    ))}
                                                    {eventsList.length === 0 ? <option disabled>No events available</option> : null}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="taskPriority" className="block text-base font-medium text-white">Priority</label>
                                                <select id="taskPriority" name="taskPriority" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}>
                                                    {priorities.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="taskDueDate" className="block text-base font-medium text-white">Due Date</label>
                                                <div className="relative max-w-sm">
                                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        name="taskDueDate"
                                                        id="taskDueDate"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        placeholder="Select date"
                                                        value={newTaskDueDate}
                                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 sm:ml-3 sm:w-auto text-base" onClick={handleSaveTask}>
                                            Create
                                        </button>
                                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto text-base" onClick={handleCloseAddTaskModal}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TaskManagementPage;