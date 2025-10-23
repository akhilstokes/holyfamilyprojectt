import React from 'react';
import { NavLink } from 'react-router-dom';
import './userDashboardTheme.css';

const UserDashboard = () => {
  return (
    <div className="user-dashboard">
      <h2>Customer Dashboard</h2>
      <div className="dash-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <div className="dash-card">
          <h3>Profile</h3>
          <p>View and update your profile details.</p>
          <NavLink className="btn" to="/user/profile">Go to Profile</NavLink>
        </div>
        <div className="dash-card">
          <h3>Live Rate</h3>
          <p>Check current market rate and history.</p>
          <NavLink className="btn" to="/user/live-rate">View Live Rate</NavLink>
        </div>
        <div className="dash-card">
          <h3>Transactions & Bills</h3>
          <p>Browse past transactions and download bills.</p>
          <NavLink className="btn" to="/user/transactions">View Transactions</NavLink>
        </div>
        <div className="dash-card">
          <h3>Requests & Complaints</h3>
          <p>Request barrels or log an issue.</p>
          <NavLink className="btn" to="/user/requests">Open Requests</NavLink>
        </div>
        <div className="dash-card">
          <h3>Notifications</h3>
          <p>See recent alerts and updates.</p>
          <NavLink className="btn" to="/user/notifications">View Notifications</NavLink>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
