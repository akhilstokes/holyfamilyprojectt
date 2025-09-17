import React, { useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserModule from '../components/common/UserModule';
import './DashboardLayout.css';

const BuyersDashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      navigate('/login');
    }
  };

  // Global numeric-only guard for buyers dashboard pages
  useEffect(() => {
    const keydownHandler = (e) => {
      const el = e.target;
      if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;
      const allowedControlKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Tab'];
      if (e.ctrlKey || e.metaKey) return;
      const invalidKeys = ['e','E','+','-'];
      if (invalidKeys.includes(e.key)) { e.preventDefault(); return; }
      if (e.key.length === 1) {
        const isDigit = /[0-9]/.test(e.key);
        const isDot = e.key === '.';
        const stepAttr = el.getAttribute('step');
        const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);
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
      const sanitized = allowsDecimal ? text.replace(/[^0-9.]/g, '') : text.replace(/[^0-9]/g, '');
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
      <aside className="sidebar">
        <div className="sidebar-header">Buyers</div>
        <ul className="sidebar-nav">
          <li className="nav-item"><NavLink to="/buyers/dashboard">Home</NavLink></li>
          <li className="nav-item"><NavLink to="/buyers/quick-checkout">Quick Checkout</NavLink></li>
          <li className="nav-item"><NavLink to="/buyers/profile">Profile</NavLink></li>
          <li className="nav-item"><NavLink to="/buyers/cart">Cart</NavLink></li>
          <li className="nav-item"><NavLink to="/buyers/orders">Orders</NavLink></li>
        </ul>
      </aside>
      <div className="main-content-wrapper">
        <header className="dashboard-header">
          <UserModule showIcons={true} showProfile={true} showLogout={true} />
        </header>
        <main className="dashboard-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default BuyersDashboardLayout;


