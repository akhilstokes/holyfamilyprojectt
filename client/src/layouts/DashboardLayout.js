import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserModule from '../components/common/UserModule';
import './DashboardLayout.css'; // Import the new CSS

const DashboardLayout = ({ children }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout(); // update auth state and clear headers/storage
            navigate('/login');
        } catch (e) {
            navigate('/login');
        }
    };

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

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
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    HFP Dashboard
                </div>
                <ul className="sidebar-nav">
                  <li className="nav-item">
                    <NavLink to="/user/profile">
                      <i className="fas fa-user nav-icon"></i> Profile
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/user/live-rate">
                      <i className="fas fa-chart-line nav-icon"></i> Live Rate
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/user/requests">
                      <i className="fas fa-life-ring nav-icon"></i> Requests
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/user/transactions">
                      <i className="fas fa-receipt nav-icon"></i> Transactions
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/user/notifications">
                      <i className="fas fa-bell nav-icon"></i> Notifications
                    </NavLink>
                  </li>
                </ul>
                

            </aside>

            {/* Main Content */}
            <div className="main-content-wrapper">
                <header className="dashboard-header">
                    <UserModule showIcons={true} showProfile={true} showLogout={true} />
                </header>
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
