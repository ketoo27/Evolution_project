// src/components/JournalEditor.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './JournalEditor.css';
import AuthContext from '../context/Authcontext';

function JournalEditor() {
    const { authToken } = useContext(AuthContext);
    const [journalContent, setJournalContent] = useState('<p>Loading journal entry...</p>');
    const [journalEntryId, setJournalEntryId] = useState(null);
    const [journalTitle, setJournalTitle] = useState(''); // NEW: State for journal title
    const [isJournalBrowserOpen, setIsJournalBrowserOpen] = useState(false); // State to control browser visibility
    const [previousJournals, setPreviousJournals] = useState([]); // State to store previous journals
    const [selectedJournalContent, setSelectedJournalContent] = useState(null); // State for read-only content
    const [isReadOnly, setIsReadOnly] = useState(false); // State to control read-only mode




    useEffect(() => {
        fetchJournalEntry();
    }, [authToken]);

    const fetchJournalEntry = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            setJournalContent('<p>Please log in to access your journal.</p>');
            return;
        }
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
                setJournalTitle(data.title || ''); // NEW: Set journalTitle from fetched data
            } else if (response.status === 404) {
                setJournalContent('<p>Start writing your journal entry here.</p>');
                setJournalEntryId(null);
                setJournalTitle(''); // NEW: Clear title for new entry
                console.log("No journal entry found for today. Ready to create new.");
            } else {
                console.error(`Error fetching journal entry: HTTP status ${response.status}`);
                setJournalContent('<p>Error loading journal. Please try again later.</p>');
            }
        } catch (error) {
            console.error("Could not fetch today's journal entry:", error);
            setJournalContent('<p>Error loading journal. Please check your connection.</p>');
        }
    };

    const saveJournalEntry = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
            return;
        }

        const currentEditorContent = journalContent;
        const currentJournalTitle = journalTitle; // NEW: Get title from state
        console.log("Content from journalContent state before save:", currentEditorContent);
        console.log("Title from journalTitle state before save:", currentJournalTitle); // Log the title

        try {
            const response = await fetch('http://127.0.0.1:8000/api/journalentries/today/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: currentEditorContent,
                    title: currentJournalTitle // NEW: Include title in body
                }),
            });
            if (response.ok) {
                const data = await response.json();
                if (!journalEntryId) {
                    setJournalEntryId(data.journal_entry_id);
                }
                console.log("Journal entry saved successfully (React-Quill) with title.");
            } else {
                console.error(`Error saving journal entry (React-Quill) with title: HTTP status ${response.status}`);
            }
        } catch (error) {
            console.error("Could not save journal entry (React-Quill) with title:", error);
        }
    };

    const handleValueChange = (content, delta, source, editor) => {
        setJournalContent(content);
        setIsReadOnly(false); // Re-enable editing when user types
        setSelectedJournalContent(null); // Clear read-only content
    };

    const handleTitleChange = (event) => {
        setJournalTitle(event.target.value);
        setIsReadOnly(false); // Re-enable editing if title is changed
        setSelectedJournalContent(null); // Clear read-only content
    };

    // Function to fetch all previous journal entries
    const fetchPreviousJournals = async () => {
        if (!authToken) {
            console.error("No auth token found. User likely not logged in.");
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
                setPreviousJournals(data); // Store the array of journal entries
                setIsJournalBrowserOpen(true); // Open the browser
            } else {
                console.error(`Error fetching previous journals: HTTP status ${response.status}`);
                // Optionally handle error display to user
            }
        } catch (error) {
            console.error("Could not fetch previous journal entries:", error);
            // Optionally handle error display to user
        }
    };

    const openJournalBrowser = () => {
        fetchPreviousJournals(); // Fetch journals and then open browser
    };

    const closeJournalBrowser = () => {
        setIsJournalBrowserOpen(false); // Close the browser
        setSelectedJournalContent(null); // Clear read-only content
        setIsReadOnly(false); // Re-enable editing in main editor
    };

    const handleJournalSelect = (journal) => {
        setSelectedJournalContent(journal.content); // Set content for read-only display
        setJournalTitle(journal.title); // Set title
        setIsReadOnly(true); // Enable read-only mode
        setIsJournalBrowserOpen(false); // Close the browser
    };


    // Get today's date and format it (e.g., "March 7, 2025")
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, options);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md journal-editor-container">
            <div className="journal-editor-header">
                <h2 className="journal-editor-date text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {formattedDate}
                </h2>
                <div className="journal-title-input-container">
                    <label htmlFor="journal-title" className="journal-title-label">Title:</label>
                    <input
                        type="text"
                        id="journal-title"
                        className="journal-title-input"
                        placeholder="Enter title for today's journal"
                        value={journalTitle}
                        onChange={handleTitleChange}
                        readOnly={isReadOnly} // NEW: Read-only if viewing old journal
                    />
                </div>
            </div>

            <ReactQuill
                value={selectedJournalContent || journalContent} // Display read-only content or current content
                onChange={handleValueChange}
                className="react-quill-editor"
                readOnly={isReadOnly} // NEW: Enable read-only mode when viewing old journals
            />

            <div className="journal-buttons-container mt-10"> {/* NEW: Container for buttons */}
                <button
                    onClick={saveJournalEntry}
                    className="save-journal-button"
                >
                    Save Journal
                </button>
                <button
                    onClick={openJournalBrowser}
                    className="view-journals-button" // NEW: "View Journals" button
                >
                    View Journals
                </button>
            </div>

            {/* Journal Browser Modal/Display (Conditional rendering) */}
            {isJournalBrowserOpen && (
                <div className="journal-browser-overlay"> {/* Overlay for browser */}
                    <div className="journal-browser"> {/* Browser container */}
                        <h3 className="journal-browser-title">Previous Journals</h3>
                        <ul className="journal-list">
                            {previousJournals.map(journal => (
                                <li key={journal.journal_entry_id} className="journal-list-item" onClick={() => handleJournalSelect(journal)}>
                                    <span className="journal-title">{journal.title || `Journal Entry ${new Date(journal.date).toLocaleDateString()}`}</span>
                                    <span className="journal-date">{new Date(journal.date).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                        <button onClick={closeJournalBrowser} className="close-browser-button">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default JournalEditor;