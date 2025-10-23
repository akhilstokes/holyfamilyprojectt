import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './AdminDashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const AdminDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  // Allow both children (explicit) and Outlet (nested routes) usage
  return (
    <div className="admin-layout role-admin">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/images/logo.png" alt="HFP" />
          <span>Admin Dashboard</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/home" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Home</NavLink>
          <NavLink to="/admin/attendance" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Attendance</NavLink>
          <NavLink to="/admin/staff" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Staff</NavLink>
          <NavLink to="/admin/yard-stock" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Yard Stock</NavLink>
          <NavLink to="/admin/godown-rubber-stock" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Godown Rubber Stock</NavLink>
          <NavLink to="/admin/hanger-space" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Hanger Free Space</NavLink>
          <NavLink to="/admin/chemical-stock-history" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Chemical Stock History</NavLink>
          <NavLink to="/admin/worker-schedule" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Worker Schedule</NavLink>
          <NavLink to="/admin/worker-documents" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Worker Documents</NavLink>
          <NavLink to="/admin/create-barrel" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Barrel</NavLink>
          <NavLink to="/admin/chem-requests" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Chemical Requests</NavLink>
          <NavLink to="/admin/rates" className={({ isActive }) => isActive ? 'admin-link active' : 'admin-link'}>Rates</NavLink>
        </nav>
      </aside>
      <main className="admin-content brand-gradient">
        <div className="admin-header">
          <h1>Administration</h1>
          <button className="admin-signout" onClick={handleSignOut} title="Sign out">
            <i className="fas fa-sign-out-alt" />
            <span>Sign out</span>
          </button>
        </div>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
