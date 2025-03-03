import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AuthContext from '../context/Authcontext'; // Adjust path to your AuthContext

function PrivateRoute({ children }) {
    const { isLoggedIn } = useContext(AuthContext); // Access isLoggedIn from AuthContext

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; // Redirect to login if not logged in
    }

    return children; // Render the protected route (children) if logged in
}

export default PrivateRoute;