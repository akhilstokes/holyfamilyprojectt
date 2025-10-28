import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const StaffDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">Staff Panel</div>
        <ul className="sidebar-nav">
          <li className="nav-item">
            <NavLink to="/staff/attendance">
              <i className="fas fa-user-clock nav-icon"></i> Attendance
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/staff/salary">
              <i className="fas fa-wallet nav-icon"></i> Salary
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/staff/leave">
              <i className="fas fa-calendar-days nav-icon"></i> Leave
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/staff/shift-schedule">
              <i className="fas fa-clock nav-icon"></i> Shift Schedule
            </NavLink>
          </li>
        </ul>
      </aside>
      <div className="main-content-wrapper">
        <header className="dashboard-header">
          <div>Staff</div>
          <div className="user-header-actions" style={{ marginLeft: 'auto' }}>
            <div className="profile-menu" ref={menuRef}>
              <button type="button" className="profile-link" title="Profile" onClick={() => setMenuOpen((m)=>!m)}>
                <i className="fas fa-user-circle"></i>
                <span>{(user && (user.name || 'Staff')) || 'Staff'}</span>
              </button>
              {menuOpen && (
                <div className="profile-dropdown">
                  <NavLink to="/staff/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </NavLink>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;






