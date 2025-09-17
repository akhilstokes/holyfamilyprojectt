import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StaffProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'field_staff' && user.role !== 'admin') {
        return <Navigate to="/user/home" />;
    }

    return children;
};

export default StaffProtectedRoute;




