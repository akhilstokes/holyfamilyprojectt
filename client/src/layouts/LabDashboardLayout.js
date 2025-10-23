import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const LabDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="dashboard-container">
      <aside className={`sidebar sidebar--flush-left ${sidebarOpen ? '' : 'sidebar--hidden'}`}>
        <div className="sidebar-header">Lab</div>
        <ul className="sidebar-nav">
          <li className="nav-item"><NavLink to="/lab/dashboard">Overview</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/attendance">My Attendance</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/leave">My Leave</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/shift-schedule">Shift Schedule</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/check-in">Sample Check-In</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/drc-update">DRC Test</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/chem-requests">Chemical Requests</NavLink></li>

          <li className="nav-item"><NavLink to="/lab/salary">My Salary</NavLink></li>
          <li className="nav-item"><NavLink to="/lab/reports">Reports</NavLink></li>
        </ul>
      </aside>
      <div className="main-content-wrapper">
        <header className="dashboard-header">
          <button className="hamburger" onClick={() => setSidebarOpen((s)=>!s)} title="Toggle sidebar">
            <i className="fas fa-bars" />
          </button>
          <div style={{ marginLeft: 8, fontWeight: 700 }}>HFP Lab</div>
          <div className="user-header-actions" style={{ marginLeft: 'auto' }}>
            <div className="profile-menu" ref={menuRef}>
              <button type="button" className="profile-link" title="Account" onClick={() => setMenuOpen((m)=>!m)}>
                <i className="fas fa-user-circle"></i>
                <span>{(user && (user.name || 'Lab Staff')) || 'Lab Staff'}</span>
              </button>
              {menuOpen && (
                <div className="profile-dropdown">
                  <NavLink to="/lab/dashboard" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-home"></i>
                    <span>Dashboard</span>
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

export default LabDashboardLayout;
