import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
