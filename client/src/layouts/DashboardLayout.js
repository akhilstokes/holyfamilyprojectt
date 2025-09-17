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

    // menuOpen reserved for future dropdown menu
    // const [menuOpen, setMenuOpen] = useState(false);
    // const menuRef = useRef(null);

    // Global numeric-only guard for all number inputs inside user dashboard pages
    useEffect(() => {
        const keydownHandler = (e) => {
            const el = e.target;
            if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;

            const allowedControlKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End', 'Tab'
            ];

            if (e.ctrlKey || e.metaKey) return; // allow copy/paste/select-all

            const invalidKeys = ['e', 'E', '+', '-'];
            if (invalidKeys.includes(e.key)) {
                e.preventDefault();
                return;
            }

            if (e.key.length === 1) {
                const isDigit = /[0-9]/.test(e.key);
                const isDot = e.key === '.';
                const stepAttr = el.getAttribute('step');
                const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);
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
            const sanitized = allowsDecimal ? text.replace(/[^0-9.]/g, '') : text.replace(/[^0-9]/g, '');
            if (sanitized !== text) {
                e.preventDefault();
                const start = el.selectionStart;
                const end = el.selectionEnd;
                const value = el.value || '';
                const newValue = value.slice(0, start) + sanitized + value.slice(end);
                el.value = newValue;
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
                        <NavLink to="/user/scrape-entry">
                            <i className="fas fa-barcode nav-icon"></i> Scrape Entry
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/submissions">
                            <i className="fas fa-history nav-icon"></i> My Submissions
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/work-history">
                            <i className="fas fa-list nav-icon"></i> Work History
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
                        <NavLink to="/user/sales">
                            <i className="fas fa-chart-area nav-icon"></i> Sales
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/user/inventory">
                            <i className="fas fa-boxes-stacked nav-icon"></i> Inventory
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
