 import React from 'react';
import { Link } from 'react-router-dom';

const tileStyle = {
  display: 'block',
  padding: '16px',
  borderRadius: 8,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  textDecoration: 'none',
  color: '#111827'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 16
};

const UserHome = () => (
  <div className="container py-3">
    <h2 style={{ marginBottom: 12 }}>User Dashboard</h2>
    <div style={gridStyle}>
      <Link to="/user/menu" style={tileStyle}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Menu</div>
        <div style={{ color: '#6b7280' }}>Open quick actions and tools</div>
      </Link>
    </div>
  </div>
);

export default UserHome;