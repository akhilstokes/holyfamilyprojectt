import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const ManagerDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen] = useState(true);
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
        // Menu close logic removed since menuOpen is not used
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="dashboard-container">
      <aside className={`sidebar sidebar--flush-left ${sidebarOpen ? '' : 'sidebar--hidden'}`}>
        <div className="sidebar-header">Manager</div>
        <ul className="sidebar-nav">
          <li className="nav-item"><NavLink to="/manager">Dashboard</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/home">Overview</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/live">Live Check-ins</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/leaves">Pending Leaves</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/attendance">Attendance Verify</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/completed">Complaint & action</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/hanger-space">Hanger Space</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/shifts">Shift Planning</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/sell-requests">Sell Requests</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/barrel-requests">Barrel Requests</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/barrel-allocation">Barrel Allocation</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/latex-billing">Latex Billing</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/rates">Set Live Rate</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/wages">Wages</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/staff-salary">Staff Salary</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/stock">Stock</NavLink></li>
          <li className="nav-item"><NavLink to="/manager/chem-requests">Chemical Requests</NavLink></li>
        </ul>
      </aside>
      <div className="main-content-wrapper">
        <header className="dashboard-header" style={{ justifyContent: 'flex-end' }}>
          <div className="user-header-actions">
            <div className="profile-menu" ref={menuRef}>
              <button type="button" className="profile-link" onClick={() => {}}>
                <i className="fas fa-user-circle" />
                <span>Profile</span>
              </button>
            </div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default ManagerDashboardLayout;
