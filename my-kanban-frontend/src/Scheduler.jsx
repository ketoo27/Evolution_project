import React, { useState, useEffect, useRef, useContext } from "react";
import {
    ScheduleComponent,
    ViewsDirective,
    ViewDirective,
    Day,
    Week,
    WorkWeek,
    Month,
    Agenda,
    Inject,
    Resize,
    DragAndDrop,
} from "@syncfusion/ej2-react-schedule";
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";
import Header from "./components/Header";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './index.css';
import AuthContext from "./context/Authcontext";


const PropertyPane = (props) => <div className="mt-5">{props.children}</div>;

const Scheduler = () => {
    const [scheduleObj, setScheduleObj] = useState(null);
    const [eventsData, setEventsData] = useState([]);
    const datePickerRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    // State variables for event input fields in the modal
    const [newEventSubject, setNewEventSubject] = useState('');
    const [newEventLocation, setNewEventLocation] = useState('');
    const [newEventStartTime, setNewEventStartTime] = useState('');
    const [newEventEndTime, setNewEventEndTime] = useState('');
    const [newEventCategoryColor, setNewEventCategoryColor] = useState('#1AAA55'); // Default color
    const [newEventDescription, setNewEventDescription] = useState(''); // State for new event description
    const { authToken } = useContext(AuthContext);


    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        if (!isSidebarOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleAddTaskClick = () => { // Function to open Add Event Modal
        setIsAddEventModalOpen(true);
    };

    const clearEventInputFields = () => {
        setNewEventSubject('');
        setNewEventLocation('');
        setNewEventStartTime('');
        setNewEventEndTime('');
        setNewEventCategoryColor('#1AAA55');
        setNewEventDescription(''); // Clear description field
    };

    const handleCloseAddEventModal = () => { // Function to close Add Event Modal
        setIsAddEventModalOpen(false);
        clearEventInputFields();
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/events/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const formattedEvents = data.map(event => ({
                Id: event.id,
                Subject: event.subject,
                Location: event.location,
                StartTime: new Date(event.start_time),
                EndTime: new Date(event.end_time),
                CategoryColor: event.category_color,
                Description: event.description, // Include description
            }));
            setEventsData(formattedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };


    const handleSaveEvent = async () => {
        // Convert datetime-local values to ISO string format
        const formattedStartTime = new Date(newEventStartTime).toISOString();
        const formattedEndTime = new Date(newEventEndTime).toISOString();

        const eventData = {
            subject: newEventSubject,
            location: newEventLocation,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            category_color: newEventCategoryColor,
            description: newEventDescription, // Include description
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/events/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`,
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                console.error('Failed to create event:', response);
            } else {
                fetchEvents();
                setIsAddEventModalOpen(false);
                clearEventInputFields();
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    

    const handleCellClick = (args) => {
        console.log("cellClick event triggered!", args); // ADD THIS LINE
        setIsAddEventModalOpen(true);
    
        if (args.startTime) {
            setNewEventStartTime(args.startTime.toISOString().slice(0, 16));
            const defaultEndTime = new Date(args.startTime);
            defaultEndTime.setHours(defaultEndTime.getHours() + 1);
            setNewEventEndTime(defaultEndTime.toISOString().slice(0, 16));
        }
    };



    useEffect(() => {
        fetchEvents();
    }, []);

    const change = (args) => {
        if (scheduleObj) {
            scheduleObj.selectedDate = args.value;
            scheduleObj.dataBind();
        }
    };

    const onDragStart = (arg) => {
        arg.navigation.enable = true;
    };

    const onEventRendered = (args) => {
        if (args.data.CategoryColor) {
            args.element.style.backgroundColor = args.data.CategoryColor;
        }
    };

    const handleActionBegin = async (args) => {
        if (args.requestType === 'eventChange' || args.requestType === 'eventRemove') {
            const eventData = args.data instanceof Array ? args.data[0] : args.data; // Handle both single event and array of events

            if (!eventData) {
                console.error("Event data is missing in actionBegin event.");
                return; // Exit if event data is missing
            }

            const eventId = eventData.Id;

            if (args.requestType === 'eventChange') {
                const updatedEventData = {
                    subject: eventData.Subject,
                    location: eventData.Location,
                    start_time: eventData.StartTime,
                    end_time: eventData.EndTime,
                    category_color: eventData.CategoryColor,
                    description: eventData.Description, // Include description in update
                };
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/events/${eventId}/`, { // <-- PUT or PATCH with eventId
                        method: 'PUT', // Or PATCH, depending on your API
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authToken}`,
                        },
                        body: JSON.stringify(updatedEventData),
                    });
                    if (!response.ok) {
                        console.error('Failed to update event:', response);
                        // Optionally, you might want to revert the change in the scheduler if backend update fails
                        args.cancel = true; // Cancel the action in scheduler if backend fails
                    } else {
                        fetchEvents(); // Refresh events to ensure scheduler is in sync with backend
                    }
                } catch (error) {
                    console.error('Error updating event:', error);
                    args.cancel = true; // Cancel action if error occurs
                }


            } else if (args.requestType === 'eventRemove') { // For event deletion
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/events/${eventId}/`, { // <-- DELETE with eventId
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Token ${authToken}`,
                        },
                    });
                    if (!response.ok) {
                        console.error('Failed to delete event:', response);
                        args.cancel = true; // Cancel if delete fails
                    } else {
                        fetchEvents(); // Refresh events after successful deletion
                    }
                } catch (error) {
                    console.error('Error deleting event:', error);
                    args.cancel = true; // Cancel action if error occurs
                }
            }
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className="flex">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
                <main className="flex-1 p-8 mt-16" style={{ overflow: isSidebarOpen ? 'hidden' : 'auto' }}>
                    <Header category="App" title="Calendar" onAddTaskClick={handleAddTaskClick} />
                    <div className="bg-white dark:bg-secondary-dark-bg rounded-xl p-4 md:p-8">
                    <ScheduleComponent
                        height="700px" // Reduced height (adjust as needed)
                        width="100%"   // Example width - you can use percentage or pixel values (adjust as needed)
                        ref={(schedule) => setScheduleObj(schedule)}
                        selectedDate={new Date()}
                        eventSettings={{
                            dataSource: eventsData,
                            allowEditing: true,
                            allowDeleting: true,
                            allowDragAndDrop: true,
                            allowResize: true,
                        }}
                        dragStart={onDragStart}
                        eventRendered={onEventRendered}
                        cellClick={handleCellClick}
                        actionBegin={handleActionBegin}
                        
                        
                    >
                            <ViewsDirective>
                                {["Day", "Week", "WorkWeek", "Month", "Agenda"].map((item) => (
                                    <ViewDirective key={item} option={item} />
                                ))}
                            </ViewsDirective>
                            <Inject
                                services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]}
                            />
                        </ScheduleComponent>
                    </div>
                    <PropertyPane>
                        <table style={{ width: "100%", background: "white" }}>
                            <tbody>
                                <tr style={{ height: "50px" }}>
                                    <td style={{ width: "100%" }}>
                                        <DatePickerComponent
                                            ref={datePickerRef}
                                            value={new Date()}
                                            showClearButton={false}
                                            placeholder="Current Date"
                                            floatLabelType="Always"
                                            change={change}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </PropertyPane>
                    {isAddEventModalOpen && (
                        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                                <div className="inline-block align-bottom bg-gray-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <div className="bg-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                                            Add New Event
                                        </h3>
                                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="eventSubject" className="block text-base font-medium text-white">Subject</label>
                                                <input type="text" name="eventSubject" id="eventSubject" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newEventSubject} onChange={(e) => setNewEventSubject(e.target.value)} placeholder="Event subject" />
                                            </div>
                                            <div>
                                                <label htmlFor="eventLocation" className="block text-base font-medium text-white">Location</label>
                                                <input type="text" name="eventLocation" id="eventLocation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newEventLocation} onChange={(e) => setNewEventLocation(e.target.value)} placeholder="Event location" />
                                            </div>
                                            <div>
                                                <label htmlFor="eventStartTime" className="block text-base font-medium text-white">Start Time</label>
                                                <input type="datetime-local" name="eventStartTime" id="eventStartTime" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newEventStartTime} onChange={(e) => setNewEventStartTime(e.target.value)} />
                                            </div>
                                            <div>
                                                <label htmlFor="eventEndTime" className="block text-base font-medium text-white">End Time</label>
                                                <input type="datetime-local" name="eventEndTime" id="eventEndTime" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={newEventEndTime} onChange={(e) => setNewEventEndTime(e.target.value)} />
                                            </div>
                                            <div>
                                                <label htmlFor="eventCategoryColor" className="block text-base font-medium text-white">Category Color</label>
                                                <input type="color" name="eventCategoryColor" id="eventCategoryColor" className="w-full h-10 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-600 dark:border-gray-500" value={newEventCategoryColor} onChange={(e) => setNewEventCategoryColor(e.target.value)} />
                                            </div>
                                            <div>
                                                <label htmlFor="eventDescription" className="block text-base font-medium text-white">Description</label>
                                                <textarea
                                                    id="eventDescription"
                                                    name="eventDescription"
                                                    rows="3"
                                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                                    placeholder="Event description"
                                                    value={newEventDescription}
                                                    onChange={(e) => setNewEventDescription(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 sm:ml-3 sm:w-auto text-base" onClick={handleSaveEvent}>
                                            Create
                                        </button>
                                        <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto text-base" onClick={handleCloseAddEventModal}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Add Event Modal will be placed here in the next step */}
                </main>
            </div>
        </div>
    );
};

export default Scheduler;