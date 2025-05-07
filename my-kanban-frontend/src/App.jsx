import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './components/HomePage';
import './index.css';
import './App.css';
import { AuthProvider } from "./context/Authcontext"; // Import AuthProvider  <---- ADDED IMPORT
import TaskManagementPage from './TaskManagementPage'; 
import HabitPage from './HabitPage';
import PrivateRoute from './components/PrivateRoute';
import SettingsPage from './components/settings';
import Scheduler from './Scheduler';
import JournalPage from './JournalPage';



function App() {
    // const isLoggedIn = !!localStorage.getItem('authToken'); // REMOVE THIS LINE - Login state will be from Context

    return (
        <BrowserRouter>
            <AuthProvider> {/* Wrap BrowserRouter with AuthProvider  <---- ADDED AuthProvider */}
                <Routes>
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                    <Route path="/*" element={<PrivateRoute><HomePage /></PrivateRoute>} /> {/* Catch-all route - Protected by context in HomePage component */}
                    <Route path="/task-management" element={<PrivateRoute><TaskManagementPage /></PrivateRoute>} />
                    <Route path="/habits" element={<PrivateRoute><HabitPage /></PrivateRoute>} /> {/* <---- Task Management Route */}
                    <Route path="/schedule" element={<PrivateRoute><Scheduler /></PrivateRoute>} />
                    <Route path="/journal" element={<PrivateRoute><JournalPage /></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;