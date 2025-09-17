import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Notifications.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API}/api/users/notifications`, { headers });
        setItems(Array.isArray(res.data) ? res.data : (res.data?.notifications || []));
      } catch (e) {
        setItems([
          { id: 'n1', title: 'Welcome to HFP', message: 'Your account is ready.', createdAt: new Date().toISOString(), read: false },
          { id: 'n2', title: 'Rate Update', message: 'New live rate is available.', createdAt: new Date().toISOString(), read: false },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const tokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const markAsRead = async (id) => {
    // optimistic
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await axios.post(`${API}/api/users/notifications/${id}/read`, {}, { headers: tokenHeaders() });
    } catch (e) {
      // rollback on failure
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  const clearAll = async () => {
    const backup = items;
    setItems([]);
    try {
      await axios.post(`${API}/api/users/notifications/clear`, {}, { headers: tokenHeaders() });
    } catch (e) {
      setItems(backup);
    }
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="notif-container">
      <div className="notif-head">
        <h2>Notifications</h2>
        <div className="notif-actions">
          <button className="btn-secondary" onClick={clearAll} disabled={items.length === 0}>Clear all</button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {items.length === 0 ? (
        <div className="notif-empty">No notifications</div>
      ) : (
        <div className="notif-grid">
          {items.map((n) => (
            <div key={n.id} className={`notif-card ${n.read ? 'read' : ''}`}>
              <div className="notif-card-head">
                <div className="notif-title">{n.title || 'Notification'}</div>
                {!n.read && (
                  <button className="btn-mark" onClick={() => markAsRead(n.id)} title="Mark as read">
                    <i className="fas fa-check"></i>
                  </button>
                )}
              </div>
              <div className="notif-message">{n.message}</div>
              <div className="notif-meta">{new Date(n.createdAt || Date.now()).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;


