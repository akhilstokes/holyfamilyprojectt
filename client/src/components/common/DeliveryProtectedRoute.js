import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeliveryProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  // Allow delivery staff and admin
  if (user.role !== 'delivery_staff' && user.role !== 'admin') {
    return <Navigate to="/user" />;
  }

  return children;
};

export default DeliveryProtectedRoute;
