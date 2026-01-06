import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [notificationCount] = useState(1);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  };

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    else if (hour < 18) return "Good Afternoon";
    else return "Good Evening";
  };

  const getInitials = (name) => {
    if (!name) return 'AN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="mobile-dashboard">
      {/* Mobile Sidebar */}
      <div className="mobile-sidebar">
        {/* Header */}
        <div className="mobile-header">
          <div className="header-content">
            <div className="brand-info">
              <div className="brand-icon">
                <i className="fas fa-industry"></i>
              </div>
              <div className="brand-text">
                <h3>HFP Portal</h3>
                <span>Customer Dashboard</span>
              </div>
            </div>
            <button className="back-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
          </div>
        </div>

        {/* User Welcome Card */}
        <div className="user-welcome-card">
          <div className="user-avatar-large">
            <span>{getInitials(user?.name)}</span>
          </div>
          <div className="user-details">
            <div className="greeting">{getGreeting()}</div>
            <div className="user-name">{user?.name || 'akhil N.K'}</div>
            <div className="user-status">Premium Member</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="nav-sections">
          {/* Dashboard Section */}
          <div className="nav-section">
            <h4 className="section-title">DASHBOARD</h4>
            <div className="nav-items">
              <NavLink to="/user" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                  <div className="nav-icon">
                    <i className="fas fa-home"></i>
                  </div>
                </div>
                <span className="nav-label">Overview</span>
              </NavLink>
              
              <NavLink to="/user/my-actions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                  <div className="nav-icon">
                    <i className="fas fa-tasks"></i>
                  </div>
                </div>
                <span className="nav-label">My Actions</span>
              </NavLink>
            </div>
          </div>

          {/* Account Section */}
          <div className="nav-section">
            <h4 className="section-title">ACCOUNT</h4>
            <div className="nav-items">
              <NavLink to="/user/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                  <div className="nav-icon">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <span className="nav-label">Profile</span>
              </NavLink>
              
              <NavLink to="/user/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <div className="nav-icon-wrapper">
                  <div className="nav-icon">
                    <i className="fas fa-bell"></i>
                  </div>
                  {notificationCount > 0 && (
                    <div className="notification-dot">{notificationCount}</div>
                  )}
                </div>
                <span className="nav-label">Notifications</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sign-out-btn">
            <div className="sign-out-icon">
              <i className="fas fa-sign-out-alt"></i>
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
