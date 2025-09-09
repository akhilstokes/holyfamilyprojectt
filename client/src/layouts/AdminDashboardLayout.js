import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboardLayout.css'; // This line is very important

const AdminDashboardLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            navigate('/login');
        }
    };

    return (
        <div className="admin-dashboard-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    Admin Panel
                </div>

                {/* Updated Sidebar Nav with isActive logic */}
                <ul className="admin-sidebar-nav">
                    <li className="admin-nav-item">
                        <NavLink to="/admin/home" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-tachometer-alt admin-nav-icon"></i> Dashboard
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/bills" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-file-invoice-dollar admin-nav-icon"></i> Bill Requests
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/shifts" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-calendar-alt admin-nav-icon"></i> Manage Shifts
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/stock" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-warehouse admin-nav-icon"></i> Stock
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/leave" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-user-clock admin-nav-icon"></i> Leave Management
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/live-rates" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-chart-line admin-nav-icon"></i> Live Rate Update
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/rate-history" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-history admin-nav-icon"></i> Rate History
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/latex-management" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-seedling admin-nav-icon"></i> Latex Management
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/barrel-logistics" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-drum admin-nav-icon"></i> Barrel Logistics
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/user-management" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-users admin-nav-icon"></i> User Management
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/enquiries" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-shopping-cart admin-nav-icon"></i> Buyer Enquiries
                        </NavLink>
                    </li>
                </ul>
            </aside>

            <div className="admin-main-wrapper">
                <header className="admin-header">
                    <h1>Holy Family Polymers</h1>
                    <div className="admin-user-info">
                        <span>Welcome, {user ? user.name : 'Admin'}</span>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </div>
                </header>
                <main className="admin-page-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
