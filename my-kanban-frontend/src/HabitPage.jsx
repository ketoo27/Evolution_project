import React from 'react';
import HabitTrackingSection from './components/HabitTrackingSection';
import HabitListSection from './components/HabitListSection';

function HabitPage() {
    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200"> {/* Adjusted container for content within main */}
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Habit Tracker</h1> {/* Adjusted heading text color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <HabitTrackingSection className="md:col-span-2" />
                <HabitListSection className="md:col-span-1" />
            </div>
        </div>
    );
}

export default HabitPage;