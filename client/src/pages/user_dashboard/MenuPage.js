import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuPage.css';

const links = [
  { icon: 'fas fa-home', label: 'Home', path: '/user/home', color: 'indigo' },
  { icon: 'fas fa-bell', label: 'Notifications', path: '/user/notifications', color: 'violet' },
  { icon: 'fas fa-id-badge', label: 'View Profile', path: '/user/profile/view', color: 'emerald' },
  { icon: 'fas fa-user-edit', label: 'Edit Profile', path: '/user/profile', color: 'blue' },
  { icon: 'fas fa-chart-line', label: 'Live Rate', path: '/user/live-rate', color: 'rose' },
  { icon: 'fas fa-history', label: 'Rate History', path: '/user/rate-history', color: 'amber' },
  { icon: 'fas fa-robot', label: 'AI Expert', path: '/user/ai-doubt-resolver', color: 'cyan' },
  { icon: 'fas fa-calculator', label: 'Calculator', path: '/user/rubber-calculator', color: 'teal' }
];

const MenuPage = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      <h2>Menu</h2>
      <div className="menu-grid">
        {links.map((l, i) => (
          <button key={i} className={`menu-tile ${l.color}`} onClick={() => navigate(l.path)}>
            <i className={l.icon}></i>
            <span>{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
