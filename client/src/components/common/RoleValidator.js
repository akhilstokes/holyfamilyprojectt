import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { validators } from '../../utils/validation';

const RoleValidator = ({ 
  children, 
  allowedRoles = [], 
  requireAll = false,
  fallback = null,
  showError = false 
}) => {
  const { user } = useAuth();

  // If no user is logged in
  if (!user) {
    if (showError) {
      return (
        <div className="role-error">
          <p>Please log in to access this content.</p>
        </div>
      );
    }
    return fallback;
  }

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  const hasRequiredRole = () => {
    if (requireAll) {
      // User must have ALL specified roles
      return allowedRoles.every(role => user.role === role);
    } else {
      // User must have ANY of the specified roles
      return allowedRoles.includes(user.role);
    }
  };

  // Validate user role
  const roleError = validators.role(user.role);
  if (roleError) {
    console.warn('Invalid user role:', user.role, roleError);
  }

  if (hasRequiredRole()) {
    return children;
  }

  if (showError) {
    return (
      <div className="role-error">
        <div className="error-content">
          <h3>Access Denied</h3>
          <p>You don't have permission to access this content.</p>
          <p>Required role(s): {allowedRoles.join(', ')}</p>
          <p>Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  return fallback;
};

// Higher-order component for role-based access
export const withRoleValidation = (Component, allowedRoles, options = {}) => {
  return function RoleValidatedComponent(props) {
    return (
      <RoleValidator 
        allowedRoles={allowedRoles} 
        {...options}
      >
        <Component {...props} />
      </RoleValidator>
    );
  };
};

// Hook for role validation
export const useRoleValidation = (allowedRoles = [], requireAll = false) => {
  const { user } = useAuth();

  const hasAccess = () => {
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    
    if (requireAll) {
      return allowedRoles.every(role => user.role === role);
    } else {
      return allowedRoles.includes(user.role);
    }
  };

  const canAccess = hasAccess();
  const userRole = user?.role || null;

  return {
    canAccess,
    userRole,
    hasAccess
  };
};

export default RoleValidator;
