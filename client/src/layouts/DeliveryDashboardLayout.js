import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const DeliveryDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login'); }
  };

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="dashboard-container">
      <aside className={`sidebar sidebar--flush-left ${sidebarOpen ? '' : 'sidebar--hidden'}`}>
        <div className="sidebar-header">Delivery Staff</div>
        <ul className="sidebar-nav">
          <li className="nav-item"><NavLink to="/delivery">Dashboard</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/route-plan">Route Plan</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/tasks">My Tasks</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/task-history">Task History</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/live-location">Live Location</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/barrel-intake">Barrel Intake</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/attendance">Attendance</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/leave">Leave</NavLink></li>
          <li className="nav-item"><NavLink to="/delivery/salary">My Salary</NavLink></li>
        </ul>
      </aside>
      <div className="main-content-wrapper">
        <header className="dashboard-header" style={{ justifyContent: 'flex-end' }}>
          <div className="user-header-actions">
            <div className="profile-menu" ref={menuRef}>
              <button type="button" className="profile-link" onClick={() => setMenuOpen(v => !v)}>
                <i className="fas fa-user-circle" />
                <span>Profile</span>
              </button>
              {menuOpen && (
                <div className="profile-dropdown" style={{ position: 'absolute', right: 92, top: 56, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minWidth: 240, boxShadow: '0 10px 24px rgba(0,0,0,0.10)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', display: 'grid', placeItems: 'center', color: '#6b7280' }}>
                      <i className="fas fa-user" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{user?.name || user?.email || 'User'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{user?.email || ''}</div>
                      <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>{(user?.role || '').replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <NavLink to="/user/profile/view" onClick={() => setMenuOpen(false)} className="dropdown-item">View Profile</NavLink>
                    <NavLink to="/user/profile" onClick={() => setMenuOpen(false)} className="dropdown-item">Edit Profile</NavLink>
                  </div>
                </div>
              )}
            </div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DeliveryDashboardLayout;
