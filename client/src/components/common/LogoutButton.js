import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LogoutButton = ({ 
  className = '', 
  style = {}, 
  showIcon = true, 
  showText = true, 
  variant = 'default',
  size = 'medium'
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  };

  // Variant styles
  const variants = {
    default: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 20px' : '8px 16px',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: showIcon && showText ? '8px' : '0',
      ':hover': {
        background: '#ef4444',
        color: 'white'
      }
    },
    minimal: {
      background: 'transparent',
      color: '#64748b',
      border: 'none',
      padding: size === 'small' ? '4px 8px' : size === 'large' ? '8px 12px' : '6px 10px',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: showIcon && showText ? '6px' : '0',
      ':hover': {
        color: '#ef4444'
      }
    },
    danger: {
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: size === 'small' ? '6px 12px' : size === 'large' ? '12px 20px' : '8px 16px',
      fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: showIcon && showText ? '8px' : '0',
      ':hover': {
        background: '#dc2626'
      }
    }
  };

  const baseStyle = variants[variant] || variants.default;

  return (
    <button
      onClick={handleLogout}
      className={`logout-button ${className}`}
      style={{
        ...baseStyle,
        ...style
      }}
      onMouseEnter={(e) => {
        if (variant === 'default') {
          e.target.style.background = '#ef4444';
          e.target.style.color = 'white';
        } else if (variant === 'minimal') {
          e.target.style.color = '#ef4444';
        } else if (variant === 'danger') {
          e.target.style.background = '#dc2626';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'default') {
          e.target.style.background = 'rgba(239, 68, 68, 0.1)';
          e.target.style.color = '#ef4444';
        } else if (variant === 'minimal') {
          e.target.style.color = '#64748b';
        } else if (variant === 'danger') {
          e.target.style.background = '#ef4444';
        }
      }}
      title="Logout"
    >
      {showIcon && <i className="fas fa-sign-out-alt"></i>}
      {showText && <span>Logout</span>}
    </button>
  );
};

export default LogoutButton;