import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LabProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}` }} replace />;
  }

  // Only allow lab role (and optionally admin for troubleshooting)
  if (String(user.role || '').toLowerCase() !== 'lab') {
    // Force login as lab and preserve the full URL so query params are kept
    return <Navigate to="/login" state={{ from: `${location.pathname}${location.search}`, reason: 'lab_only' }} replace />;
  }

  return children;
};

export default LabProtectedRoute;
