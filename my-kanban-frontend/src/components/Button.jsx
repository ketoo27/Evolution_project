import React from 'react';

export const Button = ({ bgColor, color, size, text, handleClick, borderRadius, width, icon }) => (
    <button
        onClick={handleClick}
        style={{ backgroundColor: bgColor, color, borderRadius, width }}
        className={` text-${size} p-3 hover:drop-shadow-xl`} // Basic styling - you can customize this further
    >
        {icon}{text}
    </button>
);