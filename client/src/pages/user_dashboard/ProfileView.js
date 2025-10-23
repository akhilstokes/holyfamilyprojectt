import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ProfileView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState({ name: '', email: '', phoneNumber: '', location: '' });

  useEffect(() => {
    const init = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setUser({ name: u.name || '', email: u.email || '', phoneNumber: u.phoneNumber || '', location: u.location || '' });
        }
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API}/api/users/profile`, { headers });
        const u = res.data;
        setUser({ name: u.name || '', email: u.email || '', phoneNumber: u.phoneNumber || '', location: u.location || '' });
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container navy-theme">
      {/* Left summary */}
      <aside className="profile-summary">
        <div className="summary-title">
          <i className="fas fa-user-circle" />
          <span>Your Profile Details</span>
        </div>
        <div className="summary-item">
          <div className="label">Your Name</div>
          <div className="value">{user.name || '--'}</div>
        </div>
        <div className="summary-item">
          <div className="label">Your Email</div>
          <div className="value"><a href={`mailto:${user.email}`}>{user.email || '--'}</a></div>
        </div>
        <div className="summary-item">
          <div className="label">Your Mobile</div>
          <div className="value">{user.phoneNumber || '--'}</div>
        </div>
        <div className="summary-item">
          <div className="label">Status</div>
          <div className="value active">Active</div>
        </div>
      </aside>

      {/* Right content (read-only) */}
      <section className="profile-content">
        <div className="tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
          <button className="tab active">Profile</button>
        </div>
        {error && <div className="alert error">{error}</div>}
        <div className="profile-form">
          <div className="grid-2">
            <div className="form-row">
              <label>Name</label>
              <input type="text" value={user.name} disabled />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-row">
              <label>Phone Number</label>
              <input type="tel" value={user.phoneNumber} disabled />
            </div>
            <div className="form-row">
              <label>Location</label>
              <input type="text" value={user.location} disabled />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileView;


