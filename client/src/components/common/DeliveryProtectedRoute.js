import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DeliveryProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  // Normalize role to handle values like 'delivery staff' vs 'delivery_staff'
  const role = String(user.role || '').toLowerCase().replace(/\s+/g, '_');
  // Allow delivery staff, admin, and lab (for delivery->lab check-in flow)
  if (role !== 'delivery_staff' && role !== 'admin' && role !== 'lab') {
    return <Navigate to="/user" />;
  }

  return children;
};

export default DeliveryProtectedRoute;
