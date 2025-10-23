import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import UserModule from '../../components/common/UserModule';
import './UserPage.css';

const UserPage = () => {
    const [activeModule, setActiveModule] = useState('home');
    const navigate = useNavigate();

    const sidebarItems = [
        { id: 'home', icon: 'fas fa-home', label: 'Home', path: '/user/dashboard' },
        { id: 'submit', icon: 'fas fa-plus', label: 'Submit Request', path: '/user/submit' },
        { id: 'submissions', icon: 'fas fa-sync', label: 'My Submissions', path: '/user/submissions' },
        { id: 'profile', icon: 'fas fa-user', label: 'Profile', path: '/user/profile' },
        { id: 'rates', icon: 'fas fa-chart-line', label: 'Live Rate', path: '/user/rates' },
        { id: 'history', icon: 'fas fa-history', label: 'Rate History', path: '/user/history' },
        { id: 'ai', icon: 'fas fa-robot', label: 'AI Rubber Expert', path: '/user/ai-expert' },
        // calculator removed
    ];

    const topIcons = [
        { icon: 'fas fa-book', label: 'Academics' },
        { icon: 'fas fa-calendar-check', label: 'Calendar' },
        { icon: 'fas fa-graduation-cap', label: 'Education' },
        { icon: 'fas fa-medal', label: 'Achievements' },
        { icon: 'fas fa-envelope', label: 'Messages' },
        { icon: 'fas fa-file-alt', label: 'Documents' },
        { icon: 'fas fa-edit', label: 'Edit' },
        { icon: 'fas fa-plus', label: 'Add' },
        { icon: 'fas fa-crown', label: 'Premium' },
        { icon: 'fas fa-external-link-alt', label: 'External' }
    ];

    const quickLinks = [
        { icon: 'fas fa-id-badge', label: 'View Profile', path: '/user/profile/view', color: 'indigo' },
        { icon: 'fas fa-user-edit', label: 'Edit Profile', path: '/user/profile', color: 'violet' },
        { icon: 'fas fa-shopping-cart', label: 'Cart', path: '/buyers/cart', color: 'orange' },
        { icon: 'fas fa-receipt', label: 'Orders', path: '/buyers/orders', color: 'emerald' },
        { icon: 'fas fa-bolt', label: 'Quick Checkout', path: '/buyers/quick-checkout', color: 'blue' },
        { icon: 'fas fa-store', label: 'Store', path: '/buyers/catalog', color: 'rose' },
        { icon: 'fas fa-image', label: 'Gallery', path: '/gallery', color: 'cyan' },
        { icon: 'fas fa-phone', label: 'Contact', path: '/contact', color: 'teal' },
    ];

    return (
        <div className="user-page-container">
            {/* Sidebar */}
            <aside className="user-sidebar">
                <div className="sidebar-header">
                    <div className="logo-section">
                        <div className="logo-circle">
                            <span className="logo-text">HFP</span>
                        </div>
                        <span className="company-name">Dashboard</span>
                    </div>
                </div>

                {/* Top Icons Grid */}
                <div className="sidebar-icons-grid">
                    {topIcons.map((item, index) => (
                        <button key={index} className="sidebar-icon-btn" title={item.label}>
                            <i className={item.icon}></i>
                        </button>
                    ))}
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {sidebarItems.map((item) => (
                            <li key={item.id} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={() => setActiveModule(item.id)}
                                >
                                    <i className={item.icon}></i>
                                    <span>{item.label}</span>
                                    {item.id === 'academics' || item.id === 'leave' || item.id === 'course' ? (
                                        <i className="fas fa-chevron-right nav-arrow"></i>
                                    ) : null}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="main-content-wrapper">
                {/* Header */}
                <header className="user-header">
                    <UserModule showIcons={true} showProfile={true} showLogout={true} />
                </header>

                {/* Content Area */}
                <main className="user-content">
                    <div className="content-header">
                        <h1>User Dashboard Home</h1>
                    </div>

                    {/* Quick Links */}
                    <section className="quick-links">
                        {quickLinks.map((link, idx) => (
                            <button key={idx} className={`ql-card ${link.color}`} onClick={() => navigate(link.path)}>
                                <i className={link.icon}></i>
                                <span>{link.label}</span>
                            </button>
                        ))}
                    </section>

                    {/* Dashboard Cards */}
                    <div className="dashboard-grid">
                        {/* Staff Profile Card */}
                        <div className="dashboard-card profile-card">
                            <div className="card-header">
                                <h3>Staff Profile</h3>
                                <div className="card-controls">
                                    <button className="control-btn">
                                        <i className="fas fa-chevron-down"></i>
                                    </button>
                                    <button className="control-btn">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* My Courses Card */}
                        <div className="dashboard-card courses-card">
                            <div className="card-header">
                                <h3>My Courses</h3>
                                <div className="card-controls">
                                    <button className="control-btn">
                                        <i className="fas fa-chevron-down"></i>
                                    </button>
                                    <button className="control-btn">
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Anti Ragging Button */}
                        <div className="dashboard-card anti-ragging-card">
                            <button className="anti-ragging-btn">
                                <i className="fas fa-thumbs-up"></i>
                                Anti Ragging Undertaking
                            </button>
                        </div>

                        {/* Internet Portal Credentials */}
                        <div className="dashboard-card credentials-card">
                            <h3>Internet Portal Credentials</h3>
                            <div className="credentials-info">
                                <p><strong>Username:</strong> akhil2024mca</p>
                                <p><strong>Pwd:</strong> 54028</p>
                            </div>
                        </div>

                        {/* Academic Recommendations */}
                        <div className="dashboard-card recommendations-card">
                            <button className="recommendations-btn">
                                View Academic Recommendations
                            </button>
                        </div>

                        {/* I²U Proposal Submission */}
                        <div className="dashboard-card proposal-card">
                            <button className="proposal-btn">
                                I²U Proposal Submission
                            </button>
                        </div>

                        {/* ESE Registration */}
                        <div className="dashboard-card ese-card">
                            <button className="ese-btn">
                                ESE Registration
                            </button>
                        </div>

                        {/* IEDC Notice Board */}
                        <div className="dashboard-card iedc-card">
                            <button className="iedc-btn">
                                IEDC Notice Board
                            </button>
                        </div>

                        {/* Cloud Video Rooms */}
                        <div className="dashboard-card cloud-card">
                            <h3>Cloud Video Rooms</h3>
                            <p>Check My Live Schedule</p>
                            <i className="fas fa-list"></i>
                        </div>

                        {/* Leave Status 2025 */}
                        <div className="dashboard-card leave-status-card">
                            <h3>Leave Status 2025</h3>
                            <div className="leave-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Attendance(%)</span>
                                    <span className="stat-value">88.72</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Leaves Taken</span>
                                    <span className="stat-value">2</span>
                                </div>
                            </div>
                            <button className="leave-rules-btn">Leave Rules</button>
                        </div>

                        {/* Resources for self-learning */}
                        <div className="dashboard-card resources-card">
                            <h3>Resources for self-learning</h3>
                            <div className="resource-items">
                                <div className="resource-item">
                                    <span>Moodle</span>
                                    <button className="resource-btn login-btn">Login</button>
                                </div>
                                <div className="resource-item">
                                    <span>NPTEL Video Courses</span>
                                    <div className="resource-badge">1705</div>
                                </div>
                                <div className="resource-item">
                                    <span>Course Quiz</span>
                                    <button className="resource-btn live-btn">LIVE</button>
                                </div>
                                <div className="resource-item">
                                    <span>AJCE Course Materials</span>
                                    <button className="resource-btn view-btn">VIEW</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Details Table */}
                    <div className="course-table-container">
                        <h3>Course Details</h3>
                        <div className="course-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Course</th>
                                        <th>Condonation</th>
                                        <th>Actual Hrs</th>
                                        <th>Att. by Me</th>
                                        <th>ST1</th>
                                        <th>ST2</th>
                                        <th>A1</th>
                                        <th>A2</th>
                                        <th>A3</th>
                                        <th>Int mark</th>
                                        <th>Uni Mark</th>
                                        <th>Att %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>24MCAT201<br/>Advanced Data Structures<br/>Dr. John Doe</td>
                                        <td>-</td>
                                        <td><span className="attendance-circle high">21</span></td>
                                        <td><span className="attendance-circle medium">19</span></td>
                                        <td>36.5/50</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>90</td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>24MCAT203<br/>Database Management<br/>Dr. Jane Smith</td>
                                        <td>-</td>
                                        <td><span className="attendance-circle high">20</span></td>
                                        <td><span className="attendance-circle high">20</span></td>
                                        <td>42/50</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>96</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>24MCAL291<br/>Software Engineering<br/>Dr. Mike Johnson</td>
                                        <td>Eligible</td>
                                        <td><span className="attendance-circle high">18</span></td>
                                        <td><span className="attendance-circle medium">16</span></td>
                                        <td>38/50</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>88</td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td>24MCAL293<br/>Computer Networks<br/>Dr. Sarah Wilson</td>
                                        <td>-</td>
                                        <td><span className="attendance-circle high">17</span></td>
                                        <td><span className="attendance-circle low">12</span></td>
                                        <td>26/50</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>71</td>
                                    </tr>
                                    <tr>
                                        <td>5</td>
                                        <td>24MCAT231<br/>Web Technologies<br/>Dr. David Brown</td>
                                        <td>-</td>
                                        <td><span className="attendance-circle high">19</span></td>
                                        <td><span className="attendance-circle high">19</span></td>
                                        <td>40/50</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>95</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserPage;
