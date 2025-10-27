import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const StaffDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
            <NavLink to="/staff/profile">
              <i className="fas fa-user nav-icon"></i> Profile
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/staff/operations">
              <i className="fas fa-clipboard-check nav-icon"></i> Operations
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/staff/operations/upload-document">
              <i className="fas fa-file-upload nav-icon"></i> Upload Document
            </NavLink>
          </li>
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
      <div className="main-content-wrapper" style={{ marginLeft: 0, width: '100%' }}>
        <header className="dashboard-header">
          <div>Staff</div>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>Logout</button>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;






