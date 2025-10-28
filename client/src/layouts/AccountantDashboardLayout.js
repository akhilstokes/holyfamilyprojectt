import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const AccountantDashboardLayout = ({ children }) => {
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
        // no-op
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="dashboard-container">
      <aside className={`sidebar sidebar--flush-left ${sidebarOpen ? '' : 'sidebar--hidden'}`}>
        <div className="sidebar-header">Accountant</div>
        <ul className="sidebar-nav">
          <li className="nav-item"><NavLink to="/accountant">Dashboard</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/latex">Verify Latex Billing</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/wages">Auto Wages</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/stock">Stock Monitor</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/my-attendance">My Attendance</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/mark-attendance">Mark Attendance</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/leave">Leave</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/salaries">Salaries</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/salary">My Salary</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/payments">Bill Payments</NavLink></li>
          <li className="nav-item"><NavLink to="/accountant/barrels">Delivery Intake/Verify</NavLink></li>
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

export default AccountantDashboardLayout;
