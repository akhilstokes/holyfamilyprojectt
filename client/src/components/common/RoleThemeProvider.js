import React, { createContext, useContext, useEffect, useState } from 'react';

// Role-based theme context
const RoleThemeContext = createContext();

// Role color mappings
const ROLE_COLORS = {
  admin: {
    primary: '#4f46e5',
    secondary: '#6366f1',
    light: '#e0e7ff',
    dark: '#312e81',
    name: 'Admin'
  },
  manager: {
    primary: '#0ea5a4',
    secondary: '#14b8a6',
    light: '#ccfbf1',
    dark: '#134e4a',
    name: 'Manager'
  },
  labour: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    light: '#fef3c7',
    dark: '#92400e',
    name: 'Labour'
  },
  field_staff: {
    primary: '#06b6d4',
    secondary: '#22d3ee',
    light: '#cffafe',
    dark: '#155e75',
    name: 'Field Staff'
  },
  lab: {
    primary: '#7c3aed',
    secondary: '#8b5cf6',
    light: '#ede9fe',
    dark: '#581c87',
    name: 'Lab'
  },
  customer: {
    primary: '#10b981',
    secondary: '#34d399',
    light: '#d1fae5',
    dark: '#064e3b',
    name: 'Customer'
  }
};

// Role theme provider component
export const RoleThemeProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [roleColors, setRoleColors] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'customer';
    
    setUserRole(role);
    setRoleColors(ROLE_COLORS[role] || ROLE_COLORS.customer);
    
    // Apply role class to body
    document.body.className = document.body.className.replace(/role-\w+/g, '');
    document.body.classList.add(`role-${role}`);
  }, []);

  const getRoleColor = (colorType = 'primary') => {
    return roleColors?.[colorType] || ROLE_COLORS.customer[colorType];
  };

  const getRoleName = () => {
    return roleColors?.name || 'Customer';
  };

  const value = {
    userRole,
    roleColors,
    getRoleColor,
    getRoleName,
    ROLE_COLORS
  };

  return (
    <RoleThemeContext.Provider value={value}>
      {children}
    </RoleThemeContext.Provider>
  );
};

// Hook to use role theme
export const useRoleTheme = () => {
  const context = useContext(RoleThemeContext);
  if (!context) {
    throw new Error('useRoleTheme must be used within a RoleThemeProvider');
  }
  return context;
};

// Role-based dashboard card component
export const RoleDashboardCard = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  icon, 
  onClick,
  ...props 
}) => {
  const { userRole } = useRoleTheme();
  
  return (
    <div 
      className={`dashboard-card role-${userRole} ${className}`}
      onClick={onClick}
      {...props}
    >
      {(title || icon) && (
        <div className="card-header" style={{ marginBottom: '16px' }}>
          {icon && <i className={`${icon} text-role-primary`} style={{ fontSize: '1.5rem', marginRight: '12px' }}></i>}
          {title && <h3 className="card-title" style={{ margin: 0, color: 'var(--role-primary)' }}>{title}</h3>}
          {subtitle && <p className="card-subtitle" style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '0.875rem' }}>{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

// Role-based button component
export const RoleButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  className = '',
  icon,
  loading = false,
  disabled = false,
  ...props 
}) => {
  const { userRole } = useRoleTheme();
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'btn-role',
    outline: 'btn-role-outline',
    ghost: 'bg-transparent text-role-primary hover:bg-role-primary hover:text-white'
  };
  
  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} role-${userRole}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
      {icon && !loading && <i className={`${icon} mr-2`}></i>}
      {children}
    </button>
  );
};

// Status indicator component
export const StatusIndicator = ({ 
  status, 
  children, 
  className = '',
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`status-indicator ${status} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

// Progress indicator component
export const ProgressIndicator = ({ 
  progress, 
  label, 
  className = '',
  showPercentage = true 
}) => {
  const { userRole } = useRoleTheme();
  
  return (
    <div className={`progress-container ${className}`}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && <span className="text-sm font-medium">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
    </div>
  );
};

// Floating prompt component
export const FloatingPrompt = ({ 
  children, 
  visible = true, 
  onClose,
  className = '',
  ...props 
}) => {
  const { userRole } = useRoleTheme();
  
  if (!visible) return null;
  
  return (
    <div className={`floating-prompt role-${userRole} ${className}`} {...props}>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px', 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}
        >
          ×
        </button>
      )}
      {children}
    </div>
  );
};

// Tooltip component
export const Tooltip = ({ 
  children, 
  content, 
  position = 'top',
  className = '' 
}) => {
  return (
    <div className={`tooltip ${className}`}>
      {children}
      <span className="tooltip-text">{content}</span>
    </div>
  );
};

// Workflow step indicator
export const WorkflowStep = ({ 
  step, 
  totalSteps, 
  currentStep, 
  className = '' 
}) => {
  const { userRole } = useRoleTheme();
  
  return (
    <div className={`workflow-step role-${userRole} ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
        <span className="text-sm text-role-primary">{Math.round((step / totalSteps) * 100)}% Complete</span>
      </div>
      <ProgressIndicator progress={(step / totalSteps) * 100} />
    </div>
  );
};

export default {
  RoleThemeProvider,
  useRoleTheme,
  RoleDashboardCard,
  RoleButton,
  StatusIndicator,
  ProgressIndicator,
  FloatingPrompt,
  Tooltip,
  WorkflowStep,
  ROLE_COLORS
};

