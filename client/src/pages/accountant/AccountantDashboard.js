import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AccountantDashboard.css';

const AccountantDashboard = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        // Check if user is authenticated before making the request
        if (!token) {
          console.log('No authentication token found, skipping notifications');
          setNotifs([]);
          setUnread(0);
          return;
        }

        const res = await fetch(`${base}/api/notifications?limit=10`, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
          setNotifs(list);
          setUnread(Number(data?.unread || (list.filter(n=>!n.read).length)));
        } else if (res.status === 401) {
          // Unauthorized - user needs to login
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
          return;
        } else {
          setNotifs([]);
          setUnread(0);
        }
      } catch {
        setNotifs([]);
        setUnread(0);
      }
    };
    loadNotifs();
    const id = setInterval(loadNotifs, 30000);
    return () => clearInterval(id);
  }, [base, headers, token, navigate]);

  const markRead = async (id) => {
    try {
      const res = await fetch(`${base}/api/notifications/${id}/read`, { method: 'PATCH', headers });
      if (res.ok) {
        setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnread(u => Math.max(0, u - 1));
      }
    } catch {}
  };

  // Format notification metadata in a user-friendly way
  const formatMetadata = (meta) => {
    if (!meta) return null;
    
    const friendlyLabels = {
      sampleId: 'Sample ID',
      customerName: 'Customer',
      calculatedAmount: 'Amount',
      marketRate: 'Market Rate',
      companyRate: 'Company Rate',
      quantity: 'Quantity',
      drcPercentage: 'DRC %',
      requestId: 'Request ID',
      barrelCount: 'Barrel Count',
      customer: 'Customer',
      receivedAt: 'Received At'
    };

    return Object.entries(meta)
      .filter(([k, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => ({
        label: friendlyLabels[key] || key.replace(/([A-Z])/g, ' $1').trim(),
        value: String(value)
      }));
  };

  // Get notification icon based on title/type
  const getNotificationIcon = (title) => {
    if (!title) return '📋';
    const lower = title.toLowerCase();
    if (lower.includes('billing') || lower.includes('latex')) return '💰';
    if (lower.includes('drc') || lower.includes('test')) return '🧪';
    if (lower.includes('wages') || lower.includes('salary')) return '💵';
    if (lower.includes('stock') || lower.includes('inventory')) return '📦';
    if (lower.includes('payment') || lower.includes('bill')) return '💳';
    if (lower.includes('delivery')) return '🚚';
    return '📋';
  };

  return (
    <div className="accountant-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Accountant Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's your financial overview.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link className="action-button action-primary" to="/accountant/latex">
            <span className="action-icon">💰</span>
            <span className="action-text">Verify Latex Billing</span>
          </Link>
          <Link className="action-button action-secondary" to="/accountant/wages">
            <span className="action-icon">💵</span>
            <span className="action-text">Auto Wages</span>
          </Link>
          <Link className="action-button action-tertiary" to="/accountant/stock">
            <span className="action-icon">📦</span>
            <span className="action-text">Stock Monitor</span>
          </Link>
          <Link className="action-button action-info" to="/accountant/payments">
            <span className="action-icon">💳</span>
            <span className="action-text">Bill Payments</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      <div className="notifications-card">
        <div className="notifications-header">
          <h2 className="section-title">Notifications</h2>
          {unread > 0 && (
            <span className="unread-badge">{unread} new</span>
          )}
        </div>
        {notifs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p className="empty-text">No notifications at the moment</p>
            <p className="empty-subtext">You're all caught up!</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifs.map(n => (
              <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                <div className="notification-icon">{getNotificationIcon(n.title)}</div>
                <div className="notification-content">
                  <div className="notification-title">{n.title || 'Update'}</div>
                  <div className="notification-message">{n.message}</div>
                  {n.meta && formatMetadata(n.meta) && formatMetadata(n.meta).length > 0 && (
                    <div className="notification-metadata">
                      {formatMetadata(n.meta).map((item, idx) => (
                        <span key={idx} className="metadata-item">
                          <strong>{item.label}:</strong> {item.value}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="notification-time">
                    {new Date(n.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="notification-actions">
                  {n.link && (
                    <Link className="notif-action-btn notif-open-btn" to={n.link}>
                      Open
                    </Link>
                  )}
                  {!n.read && (
                    <button 
                      className="notif-action-btn notif-mark-btn" 
                      onClick={() => markRead(n._id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;
