import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();
    
    // Show loading while validating token
    if (loading) {
        return <div>Loading...</div>;
    }
    
    // If not authenticated, redirect to login page
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    // Guard: if a Lab user somehow hits /user/*, reroute to lab dashboard
    if (user.role === 'lab' && String(location.pathname || '').startsWith('/user')) {
        return <Navigate to="/lab/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;