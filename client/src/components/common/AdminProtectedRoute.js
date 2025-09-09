import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    
    // Show loading while validating token
    if (loading) {
        return <div>Loading...</div>;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }
    
    // If not admin, redirect to user dashboard
    if (user.role !== 'admin') {
        return <Navigate to="/user/home" />;
    }

    return children;
};

export default AdminProtectedRoute;