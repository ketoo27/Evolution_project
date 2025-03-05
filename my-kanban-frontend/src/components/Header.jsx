import React from 'react';

const Header = ({ category, title, onAddTaskClick }) => (
    <div className="mb-10 flex justify-between items-center">
        <div>
            <p className="text-lg text-white">{category}</p>
            <p className="text-3xl font-extrabold tracking-tight text-white">
                {title}
            </p>
        </div>
        {onAddTaskClick && ( // Conditionally render the button only if onAddTaskClick prop is provided
            <button
                onClick={onAddTaskClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Add Event
            </button>
        )}
    </div>
);

export default Header;