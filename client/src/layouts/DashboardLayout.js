import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    HFP Dashboard
                </div>
                <ul className="sidebar-nav">
                    <li className="nav-item">
                        <NavLink to="/user/home">
                            <i className="fas fa-home nav-icon"></i> Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/submit-request">
                            <i className="fas fa-plus-circle nav-icon"></i> Submit Request
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/submissions">
                            <i className="fas fa-history nav-icon"></i> My Submissions
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/profile">
                            <i className="fas fa-user nav-icon"></i> Profile
                        </NavLink>
                    </li>

                    {/* New Links */}
                    <li className="nav-item">
                        <NavLink to="/user/live-rate">
                            <i className="fas fa-chart-line nav-icon"></i> Live Rate
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/rate-history">
                            <i className="fas fa-clock-rotate-left nav-icon"></i> Rate History
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/ai-doubt-resolver">
                            <i className="fas fa-robot nav-icon"></i> AI Rubber Expert
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/rubber-calculator">
                            <i className="fas fa-calculator nav-icon"></i> Rubber Calculator
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/latex-selling">
                            <i className="fas fa-seedling nav-icon"></i> Latex Selling
                        </NavLink>
                    </li>
                </ul>
            </aside>

            {/* Main Content */}
            <div className="main-content-wrapper">
                <header className="dashboard-header">
                    <div className="user-header-actions">
                        <NavLink to="/user/profile" className="profile-link">
                            <i className="fas fa-user-circle"></i>
                            <span>Profile</span>
                        </NavLink>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </div>
                </header>
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
