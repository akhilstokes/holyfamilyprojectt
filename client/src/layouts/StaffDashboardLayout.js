import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

const StaffDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  // Global numeric-only guard for staff dashboard pages
  useEffect(() => {
    const keydownHandler = (e) => {
      const el = e.target;
      if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;
      const allowedControlKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Tab'];
      if (e.ctrlKey || e.metaKey) return;
      const allowNegative = el.hasAttribute('data-allow-negative');
      const invalidKeys = allowNegative ? ['e','E','+'] : ['e','E','+','-'];
      if (invalidKeys.includes(e.key)) { e.preventDefault(); return; }
      if (e.key.length === 1) {
        const isDigit = /[0-9]/.test(e.key);
        const isDot = e.key === '.';
        const isMinus = e.key === '-';
        const stepAttr = el.getAttribute('step');
        const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);
        if (isMinus && allowNegative) {
          const selectionStart = el.selectionStart ?? 0;
          const value = el.value || '';
          if (selectionStart !== 0 || value.includes('-')) {
            e.preventDefault();
          }
          return;
        }
        if (!isDigit && !(isDot && allowsDecimal)) {
          if (!allowedControlKeys.includes(e.key)) e.preventDefault();
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
        sanitized = sanitized.replace(/-/g, '');
        sanitized = (text.trim().startsWith('-') ? '-' : '') + sanitized;
      }
      if (sanitized !== text) {
        e.preventDefault();
        const start = el.selectionStart, end = el.selectionEnd;
        const value = el.value || '';
        el.value = value.slice(0, start) + sanitized + value.slice(end);
        el.dispatchEvent(new Event('input', { bubbles: true }));
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
      <aside className="sidebar sidebar--flush-left">
        <div className="sidebar-header">Staff</div>
        <ul className="sidebar-nav">
          <li className="nav-item">
            <button className="logout-button w-100" onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </aside>
      <div className="main-content-wrapper">
        <header className="dashboard-header">
          <div>Staff Panel</div>
          <nav className="top-nav">
            <NavLink to="/staff/profile">Profile</NavLink>
            <NavLink to="/staff/operations">Operations</NavLink>
            <NavLink to="/staff/operations/upload-document">Upload Document</NavLink>
            <NavLink to="/staff/attendance">Attendance</NavLink>
            <NavLink to="/staff/salary">Salary</NavLink>
            <NavLink to="/staff/leave">Leave</NavLink>
            <NavLink to="/staff/shift-schedule">Shift Schedule</NavLink>
            <NavLink to="/staff/operations/add-barrel">Add Barrel</NavLink>
            <NavLink to="/staff/operations/trip-km">Log Trip KM</NavLink>
            <NavLink to="/staff/inventory">Inventory</NavLink>
            <NavLink to="/staff/weigh-latex">Weigh Latex</NavLink>
            <NavLink to="/staff/dispatch-barrels">Dispatch Barrels</NavLink>
            <NavLink to="/staff/return-barrels">Return Barrels</NavLink>
          </nav>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default StaffDashboardLayout;






