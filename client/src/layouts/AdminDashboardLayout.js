import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboardLayout.css'; // This line is very important

const AdminDashboardLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { logout } = useAuth?.() || { logout: () => {} };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Global numeric-only guard for all number inputs inside admin pages
    useEffect(() => {
        // Block non-numeric characters in number inputs (e/E/+/-) and sanitize pasted text
        const keydownHandler = (e) => {
            const el = e.target;
            if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;

            const allowedControlKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End', 'Tab'
            ];

            // Allow Ctrl/Cmd combos (copy, paste, select-all, etc.)
            if (e.ctrlKey || e.metaKey) return;

            // Block common invalid characters for numeric input
            const allowNegative = el.hasAttribute('data-allow-negative');
            const invalidKeys = allowNegative ? ['e', 'E', '+'] : ['e', 'E', '+', '-'];
            if (invalidKeys.includes(e.key)) {
                e.preventDefault();
                return;
            }

            // If key is a single character and not a digit or decimal point, block it
            if (e.key.length === 1) {
                const isDigit = /[0-9]/.test(e.key);
                const isDot = e.key === '.';
                const isMinus = e.key === '-';

                // If input doesn't support decimals (step is integer-like), block dot
                const stepAttr = el.getAttribute('step');
                const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);

                // Allow minus only at the start if allowed
                if (isMinus && allowNegative) {
                    const selectionStart = el.selectionStart ?? 0;
                    const value = el.value || '';
                    // allow minus only if cursor at start and no existing minus
                    if (selectionStart !== 0 || value.includes('-')) {
                        e.preventDefault();
                    }
                    return;
                }

                if (!isDigit && !(isDot && allowsDecimal)) {
                    if (!allowedControlKeys.includes(e.key)) {
                        e.preventDefault();
                    }
                }
            }
        };

        const pasteHandler = (e) => {
            const el = e.target;
            if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;
            const text = (e.clipboardData || window.clipboardData)?.getData('text');
            if (typeof text !== 'string') return;

            const stepAttr = el.getAttribute('step');
            const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);
            const allowNegative = el.hasAttribute('data-allow-negative');
            let sanitized = allowsDecimal ? text.replace(/[^0-9.\-]/g, '') : text.replace(/[^0-9\-]/g, '');
            if (!allowNegative) {
                sanitized = sanitized.replace(/-/g, '');
            } else {
                // keep only a single leading minus
                sanitized = sanitized.replace(/-/g, '');
                sanitized = (text.trim().startsWith('-') ? '-' : '') + sanitized;
            }

            if (sanitized !== text) {
                e.preventDefault();
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const value = el.value || '';
                const newValue = value.slice(0, start) + sanitized + value.slice(end);
                el.value = newValue;

                // Trigger an input event so React state stays in sync if onChange is used
                const inputEvent = new Event('input', { bubbles: true });
                el.dispatchEvent(inputEvent);
            }
        };

        document.addEventListener('keydown', keydownHandler, true);
        document.addEventListener('paste', pasteHandler, true);

        return () => {
            document.removeEventListener('keydown', keydownHandler, true);
            document.removeEventListener('paste', pasteHandler, true);
        };
    }, []);

    const handleLogout = () => {
        try { logout && logout(); } catch (e) {}
        navigate('/login');
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
                        <NavLink to="/admin/barrel-distribution" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-dolly admin-nav-icon"></i> Barrel Distribution
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/requests-issues" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-inbox admin-nav-icon"></i> Requests & Issues
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
                        <NavLink to="/admin/price" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-tags admin-nav-icon"></i> Price Latex
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/attendance-report" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-user-check admin-nav-icon"></i> Attendance Report
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/salary" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-wallet admin-nav-icon"></i> Salary Management
                        </NavLink>
                    </li>
                    <li className="admin-nav-item">
                        <NavLink to="/admin/worker-report" className={({ isActive }) => isActive ? "active" : ""}>
                            <i className="fas fa-chart-bar admin-nav-icon"></i> Worker Report
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
