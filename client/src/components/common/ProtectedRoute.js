import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    
    // Show loading while validating token
    if (loading) {
        return <div>Loading...</div>;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;