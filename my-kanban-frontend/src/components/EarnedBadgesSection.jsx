// src/pages/EarnedBadgesSection.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EarnedBadgesSection() {
    const [earnedBadges, setEarnedBadges] = useState([]); // State to store earned badges

    useEffect(() => {
        const fetchEarnedBadges = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://127.0.0.1:8000/api/users/badges/', { // Your API endpoint URL
                    headers: {
                        Authorization: `Token ${token}`, // Include token for authentication
                    },
                });
                setEarnedBadges(response.data); // Set the fetched badges data to state
            } catch (error) {
                console.error('Error fetching earned badges:', error);
                // Handle error (e.g., display error message)
            }
        };

        fetchEarnedBadges(); // Call fetch function when component mounts
    }, []); // Empty dependency array means this effect runs only once on mount


    return (
        <div className="p-5 mb-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <time className="text-lg font-semibold text-gray-900 dark:text-white">Your Badges</time>
            <ol className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
                {earnedBadges.map((userBadge) => ( // Map through earnedBadges array
                    <li key={userBadge.id}>
                        <a href="#" className="items-center block p-3 sm:flex hover:bg-gray-100 dark:hover:bg-gray-700">
                            <img className="w-12 h-12 mb-3 me-3 rounded-full sm:mb-0" src={`/${userBadge.badge.icon}`} alt={userBadge.badge.title} /> {/* Badge icon from API data */}
                            <div className="text-gray-600 dark:text-gray-400">
                                <div className="text-base font-normal"><span className="font-medium text-gray-900 dark:text-white">{userBadge.badge.title}</span> - <span className="font-medium text-gray-900 dark:text-white">{userBadge.badge.badge_type}</span></div> {/* Badge title and type from API data */}
                                <div className="text-sm font-normal">{userBadge.badge.description}</div> {/* Badge description from API data */}
                            </div>
                        </a>
                    </li>
                ))}
                {earnedBadges.length === 0 && ( // Display message if no badges earned
                    <li>
                        <div className="block p-3 text-center text-gray-600 dark:text-gray-400">
                            No badges earned yet. Keep up the great work!
                        </div>
                    </li>
                )}
            </ol>
        </div>
    );
}

export default EarnedBadgesSection;