import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserDisplay from './UserDisplay';
import LogoutButton from './LogoutButton';

const AppHeader = ({ 
  title = '', 
  showTitle = true,
  showUserInfo = true,
  showLogout = true,
  showNotifications = false,
  className = '',
  style = {}
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 100,
    ...style
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const userMenuStyle = {
    position: 'relative'
  };

  const userButtonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    minWidth: '250px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e5e7eb',
    padding: '12px',
    zIndex: 1000
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#374151',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left'
  };

  const getRoleBasedTitle = () => {
    if (title) return title;
    
    const roleMap = {
      admin: 'Admin Dashboard',
      manager: 'Manager Dashboard', 
      accountant: 'Accountant Dashboard',
      field_staff: 'Staff Dashboard',
      delivery_staff: 'Delivery Dashboard',
      lab: 'Lab Dashboard',
      lab_manager: 'Lab Manager Dashboard',
      lab_staff: 'Lab Staff Dashboard',
      user: 'User Dashboard'
    };
    
    return roleMap[user?.role] || 'Dashboard';
  };

  return (
    <header className={`app-header ${className}`} style={headerStyle}>
      {showTitle && (
        <h1 style={titleStyle}>
          {getRoleBasedTitle()}
        </h1>
      )}
      
      <div style={rightSectionStyle}>
        {showNotifications && (
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <i className="fas fa-bell"></i>
          </button>
        )}
        
        {showUserInfo && (
          <div style={userMenuStyle} ref={menuRef}>
            <button
              style={userButtonStyle}
              onClick={() => setShowUserMenu(!showUserMenu)}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <UserDisplay 
                size="small" 
                showRole={false} 
                showEmail={false}
                style={{ color: 'white' }}
              />
              <i className="fas fa-chevron-down" style={{ fontSize: '12px', opacity: 0.7 }}></i>
            </button>
            
            {showUserMenu && (
              <div style={dropdownStyle}>
                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                  <UserDisplay 
                    size="medium" 
                    showEmail={true}
                    layout="horizontal"
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    style={dropdownItemStyle}
                    onClick={() => {
                      navigate('/user/profile');
                      setShowUserMenu(false);
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <i className="fas fa-user" style={{ width: '16px', color: '#6b7280' }}></i>
                    <span>View Profile</span>
                  </button>
                  
                  <button
                    style={dropdownItemStyle}
                    onClick={() => {
                      navigate('/user/profile');
                      setShowUserMenu(false);
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <i className="fas fa-edit" style={{ width: '16px', color: '#6b7280' }}></i>
                    <span>Edit Profile</span>
                  </button>
                  
                  <div style={{ margin: '8px 0', borderTop: '1px solid #e5e7eb' }}></div>
                  
                  <LogoutButton 
                    variant="minimal" 
                    size="small"
                    style={{ 
                      justifyContent: 'flex-start',
                      padding: '10px 12px',
                      width: '100%'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        {showLogout && !showUserInfo && (
          <LogoutButton variant="minimal" />
        )}
      </div>
    </header>
  );
};

export default AppHeader;