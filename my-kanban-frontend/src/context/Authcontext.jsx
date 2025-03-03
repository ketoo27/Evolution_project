import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || null); // Initialize from localStorage
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken')); // Initialize login status

    // Function to set auth token and update state and localStorage
    const setToken = (token) => {
        setAuthToken(token);
        setIsLoggedIn(!!token);
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    };

    // Function to clear auth token and log out
    const logout = () => {
        setToken(null); // This will set authToken to null and isLoggedIn to false, and remove from localStorage
    };

    useEffect(() => {
        // This useEffect is likely not strictly necessary for basic login,
        // as state is initialized from localStorage already, but can be useful
        // for more complex scenarios or initial checks.
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setAuthToken(storedToken);
            setIsLoggedIn(true);
        } else {
            setAuthToken(null);
            setIsLoggedIn(false);
        }
    }, []); // Run only once on component mount


    const contextData = {
        authToken: authToken,
        isLoggedIn: isLoggedIn,
        setAuthToken: setToken, // Provide the setToken function to update token and login status
        logout: logout, // Provide the logout function
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthProvider };