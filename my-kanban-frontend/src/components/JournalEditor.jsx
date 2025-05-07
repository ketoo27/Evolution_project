// src/components/JournalEditor.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Standard Quill snow theme
import 'react-quill/dist/quill.bubble.css'; // Bubble theme for read-only viewer
import './JournalEditor.css'; // Your custom CSS
import AuthContext from '../context/Authcontext';
// Import date-fns functions
import { parseISO, format } from 'date-fns';


function JournalEditor() {
    const { authToken } = useContext(AuthContext);
    const [journalContent, setJournalContent] = useState('<p>Loading journal entry...</p>'); // Content for the *main* editor
    const [journalEntryId, setJournalEntryId] = useState(null); // ID for today's entry
    const [journalTitle, setJournalTitle] = useState(''); // Title for today's entry
    const [isJournalBrowserOpen, setIsJournalBrowserOpen] = useState(false); // State to control browser modal visibility
    const [previousJournals, setPreviousJournals] = useState([]); // State to store previous journals list

    // NEW: State for the read-only journal viewing popup
    const [isJournalViewPopupOpen, setIsJournalViewPopupOpen] = useState(false); // Controls view popup visibility
    const [journalToView, setJournalToView] = useState(null); // Stores the selected journal data for the viewer


    // State to control read-only mode for the *main* editor
    // This should be false for today's entry by default
    const [isReadOnly, setIsReadOnly] = useState(false); // Keep this for potential future use, but default to false for main editor


    // Fetch today's journal entry on component mount or token change
    useEffect(() => {
        fetchJournalEntry();
    }, [authToken]); // Depend on authToken

    const fetchJournalEntry = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            setJournalContent('<p>Please log in to access your journal.</p>');
            setIsReadOnly(true); // Make editor read-only if not logged in
            setJournalTitle('');
            setJournalEntryId(null);
            return;
        }
        setIsReadOnly(false); // Ensure editable state before fetching
        setJournalContent('<p>Loading journal entry...</p>'); // Show loading state
        setJournalTitle('');
        setJournalEntryId(null);


        try {
            const response = await fetch('http://127.0.0.1:8000/api/journalentries/today/', {
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setJournalContent(data.content || '<p>Start writing your journal entry here.</p>');
                setJournalEntryId(data.journal_entry_id);
                setJournalTitle(data.title || ''); // Set journalTitle from fetched data
                setIsReadOnly(false); // Ensure editor is editable for today's entry
            } else if (response.status === 404) {
                setJournalContent('<p>Start writing your journal entry here.</p>');
                setJournalEntryId(null);
                setJournalTitle(''); // Clear title for new entry
                setIsReadOnly(false); // Ensure editor is editable for a new entry
                console.log("No journal entry found for today. Ready to create new.");
            } else {
                console.error(`Error fetching journal entry: HTTP status ${response.status}`);
                setJournalContent('<p>Error loading journal. Please try again later.</p>');
                setIsReadOnly(true); // Make editor read-only on load error
            }
        } catch (error) {
            console.error("Could not fetch today's journal entry:", error);
            setJournalContent('<p>Error loading journal. Please check your connection.</p>');
            setIsReadOnly(true); // Make editor read-only on network error
        }
    };

    const saveJournalEntry = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            return;
        }
        if (isReadOnly) {
             console.log("Editor is in read-only mode, cannot save.");
             return; // Prevent saving if in read-only mode (e.g., after a load error)
        }


        const currentEditorContent = journalContent;
        const currentJournalTitle = journalTitle;
        console.log("Content from journalContent state before save:", currentEditorContent);
        console.log("Title from journalTitle state before save:", currentJournalTitle);

        // Basic check if content is just the placeholder
         if (currentEditorContent.trim() === '<p><br></p>' || currentEditorContent.trim() === '<p>Start writing your journal entry here.</p>') {
             console.log("Content is placeholder, not saving.");
             // Optionally provide user feedback that there's nothing to save
             return;
         }


        try {
            // Use POST for creating or updating today's entry as per your backend logic
            const response = await fetch('http://127.0.0.1:8000/api/journalentries/today/', {
                method: 'POST', // Or PATCH/PUT if backend is designed that way
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: currentEditorContent,
                    title: currentJournalTitle
                }),
            });
            if (response.ok) {
                const data = await response.json();
                 // If a new entry was created, update the ID
                if (!journalEntryId) {
                     setJournalEntryId(data.journal_entry_id);
                }
                console.log("Journal entry saved successfully (React-Quill) with title.");
                // Optionally show a success message to the user
            } else {
                console.error(`Error saving journal entry (React-Quill) with title: HTTP status ${response.status}`);
                 // Optionally show an error message to the user
            }
        } catch (error) {
            console.error("Could not save journal entry (React-Quill) with title:", error);
             // Optionally show a network error message to the user
        }
    };

    // Handles changes in the *main* ReactQuill editor
    const handleValueChange = (content, delta, source, editor) => {
        setJournalContent(content);
        // When user types, ensure main editor is not in read-only mode
        if (isReadOnly) setIsReadOnly(false);
         // If they were viewing an old journal, clear the viewed state
        if (journalToView) setJournalToView(null);
    };

    // Handles changes in the *main* journal title input
    const handleTitleChange = (event) => {
        setJournalTitle(event.target.value);
         // When user types in title, ensure main editor is not in read-only mode
        if (isReadOnly) setIsReadOnly(false);
        // If they were viewing an old journal, clear the viewed state
         if (journalToView) setJournalToView(null);
    };

    // Function to fetch all previous journal entries for the browser
    const fetchPreviousJournals = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            // Optionally handle error display to user
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:8000/api/journalentries/', { // Assuming this endpoint fetches all entries
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                // Sort journals by date in descending order (most recent first)
                // Use parseISO for reliable date parsing and handle potential invalid dates during sort
                const sortedJournals = data.sort((a, b) => {
                    // CORRECTED: Use date_created instead of date
                    const dateA = a.date_created ? parseISO(a.date_created) : null;
                    const dateB = b.date_created ? parseISO(b.date_created) : null;

                    const timeA = dateA ? dateA.getTime() : NaN;
                    const timeB = dateB ? dateB.getTime() : NaN;

                    const isValidA = !isNaN(timeA);
                    const isValidB = !isNaN(timeB);

                    if (isValidA && isValidB) {
                        // Both are valid, sort in descending order (most recent first)
                        return timeB - timeA;
                    } else if (isValidA) {
                        // Only A is valid, put valid dates before invalid ones
                        return -1;
                    } else if (isValidB) {
                        // Only B is valid, put valid dates before invalid ones
                        return 1;
                    } else {
                        // Both are invalid, maintain relative order
                        return 0;
                    }
                });

                setPreviousJournals(sortedJournals); // Store the array of journal entries
                setIsJournalBrowserOpen(true); // Open the browser modal
            } else {
                console.error(`Error fetching previous journals: HTTP status ${response.status}`);
                 // Optionally handle error display to user
            }
        } catch (error) {
            console.error("Could not fetch previous journal entries:", error);
             // Optionally handle error display to user
        }
    };

    // Trigger fetching previous journals and open the browser modal
    const openJournalBrowser = () => {
        fetchPreviousJournals();
    };

    // Close the journal browser modal
    const closeJournalBrowser = () => {
        setIsJournalBrowserOpen(false);
        // No need to clear selectedJournalContent or isReadOnly here anymore,
        // as that state now belongs to the separate viewer popup.
    };

    // NEW: Handle selecting a journal from the browser to *view* in a popup
    const handleJournalSelect = (journal) => {
        setJournalToView(journal); // Store the selected journal data
        setIsJournalViewPopupOpen(true); // Open the viewing popup
        setIsJournalBrowserOpen(false); // Close the browser modal
        // DO NOT modify journalContent, journalTitle, or isReadOnly for the main editor here.
        // The main editor state remains untouched, holding today's entry.
    };

    // NEW: Close the journal viewing popup
    const closeJournalViewPopup = () => {
        setIsJournalViewPopupOpen(false); // Close the popup
        setJournalToView(null); // Clear the viewed journal data
    };


    // Get today's date and format it (e.g., "May 7, 2025") - Keep this for today's date display
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Use toLocaleDateString as it's for the current date determined locally
    const formattedDate = today.toLocaleDateString(undefined, options);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md journal-editor-container">
            <div className="journal-editor-header">
                <h2 className="journal-editor-date text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {formattedDate} {/* This still displays today's date */}
                    {/* Consider using date-fns here as well for consistency if needed */}
                </h2>
                <div className="journal-title-input-container mb-4"> {/* Added mb-4 */}
                    <label htmlFor="journal-title" className="journal-title-label block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title:</label> {/* Added block, text styles, mb-1 */}
                    <input
                        type="text"
                        id="journal-title"
                        className="journal-title-input form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 px-3 py-2" // Added form-input, mt-1, w-full, padding, focus styles, dark mode styles
                        placeholder="Enter title for today's journal"
                        value={journalTitle}
                        onChange={handleTitleChange}
                        readOnly={isReadOnly} // Main editor title is read-only if main editor is read-only
                    />
                </div>
            </div>

            {/* Main ReactQuill Editor for Today's Entry */}
            <ReactQuill
                value={journalContent} // Value is always the current day's content
                onChange={handleValueChange} // Changes update the current day's content
                className={`react-quill-editor ${isReadOnly ? 'read-only' : ''}`} // Apply read-only class if needed
                readOnly={isReadOnly} // Control read-only state of the main editor
            />

            <div className="journal-buttons-container mt-4 flex justify-end space-x-4"> {/* Added flex, justify-end, space-x */}
                {/* Save Button - Visible and enabled only when main editor is NOT read-only */}
                {!isReadOnly && (
                     <button
                        onClick={saveJournalEntry}
                        className="save-journal-button px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" // Added styles
                     >
                         Save Journal
                     </button>
                )}

                 {/* View Journals Button */}
                 <button
                    onClick={openJournalBrowser}
                    className="view-journals-button px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" // Added styles
                 >
                     View Journals
                 </button>
            </div>

            {/* Journal Browser Modal (Conditional rendering) */}
            {isJournalBrowserOpen && (
                <div className="journal-browser-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> {/* Styled as fixed modal overlay */}
                    <div className="journal-browser bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg w-11/12 max-w-lg max-h-3/4 overflow-y-auto relative"> {/* Styled modal container */}
                        <h3 className="journal-browser-title text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Previous Journals</h3>
                        <button onClick={closeJournalBrowser} className="close-browser-button absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-2xl font-bold">&times;</button> {/* Close button */}
                        {previousJournals.length > 0 ? (
                            <ul className="journal-list">
                                {previousJournals.map(journal => (
                                    // Use a button or div with cursor-pointer for clickable items
                                    <li key={journal.journal_entry_id} className="journal-list-item p-3 mb-2 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150 ease-in-out rounded" onClick={() => handleJournalSelect(journal)}>
                                        <div className="journal-item-title text-lg font-medium text-gray-800 dark:text-gray-100">{journal.title || `Journal Entry`}</div>
                                        {/* Using date-fns for display - CORRECTED field name */}
                                        <div className="journal-item-date text-sm text-gray-500 dark:text-gray-400">
                                            {journal.date_created ? format(parseISO(journal.date_created), 'PPP') : 'No Date'}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-gray-600 dark:text-gray-300">No previous journal entries found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* NEW: Journal Viewing Popup (Conditional rendering) */}
            {isJournalViewPopupOpen && journalToView && (
                <div className="journal-view-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"> {/* Styled as fixed modal overlay */}
                    <div className="journal-view-popup bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-11/12 max-w-xl max-h-3/4 overflow-y-auto relative"> {/* Styled modal container */}
                        <div className="journal-view-header mb-4 border-b pb-2 border-gray-200 dark:border-gray-600">
                            <h3 className="journal-view-title text-xl font-semibold text-gray-800 dark:text-gray-100">{journalToView.title || `Journal Entry`}</h3> {/* Display title */}
                            {/* Using date-fns for display - CORRECTED field name */}
                            <p className="journal-view-date text-sm text-gray-500 dark:text-gray-400">
                                {journalToView.date_created ? format(parseISO(journalToView.date_created), 'PPP') : 'No Date'}
                            </p>
                            {/* Close button */}
                            <button onClick={closeJournalViewPopup} className="close-view-popup-button absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-2xl font-bold">&times;</button> {/* '×' symbol */}
                        </div>
                         {/* Display content using ReactQuill in read-only mode */}
                         {/* Using Quill bubble theme for simpler rendering */}
                        <div className="journal-view-content-container">
                             <ReactQuill
                                value={journalToView.content || ''} // Display the selected journal's content
                                readOnly={true} // Always read-only in the popup
                                theme="bubble" // Use bubble theme for simple rendering
                                modules={{ toolbar: false }} // Explicitly hide the toolbar
                                className="react-quill-viewer" // Custom class for viewer styles
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default JournalEditor;