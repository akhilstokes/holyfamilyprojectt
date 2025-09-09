import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const force = params.get('force') === '1' || params.get('switch') === '1';
    
    // Show loading while validating token
    if (loading) {
        return <div>Loading...</div>;
    }
    
    // If the user is authenticated, redirect unless forced to show guest page
    if (!force && isAuthenticated && user) {
        if (user.role === 'admin') {
            return <Navigate to="/admin/home" />;
        } else {
            return <Navigate to="/user/home" />;
        }
    }

    // If not authenticated (or force flag present), show the page
    return children;
};

export default GuestRoute;