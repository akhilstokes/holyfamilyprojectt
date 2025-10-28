import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LabDashboard.css';

const LabDashboard = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await fetch(`${base}/api/lab/summary`, { headers });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          setSummary(null);
        }
      } catch (e) {
        setError(e?.message || 'Failed to load');
        setSummary(null);
      }
    };
    load();
  }, [base, headers]);

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

  const buildNotificationUrl = (notification) => {
    const { title, meta, link } = notification;
    
    // If notification has a specific link, use it
    if (link) {
      return link;
    }
    
    // Route based on notification title/type
    if (title?.toLowerCase().includes('pickup scheduled') || title?.toLowerCase().includes('sample')) {
      // For sample/pickup related notifications, go to sample check-in with data
      const params = new URLSearchParams();
      if (meta?.sampleId) params.set('sampleId', meta.sampleId);
      if (meta?.customer) params.set('customerName', meta.customer);
      if (meta?.barrelCount) params.set('barrelCount', meta.barrelCount);
      if (meta?.receivedAt) params.set('receivedAt', meta.receivedAt);
      // Add barrel IDs if available in meta
      if (meta?.barrels && Array.isArray(meta.barrels)) {
        meta.barrels.forEach((barrel, idx) => {
          if (barrel?.barrelId) params.set(`barrel_${idx}`, barrel.barrelId);
          if (barrel?.liters) params.set(`liters_${idx}`, barrel.liters);
        });
      }
      return `/lab/check-in?${params.toString()}`;
    }
    
    if (title?.toLowerCase().includes('delivery')) {
      // For delivery notifications, go to delivery tasks
      return '/delivery/tasks';
    }
    
    if (title?.toLowerCase().includes('drc') || title?.toLowerCase().includes('analysis')) {
      // For DRC/analysis notifications, go to DRC update
      const params = new URLSearchParams();
      if (meta?.sampleId) params.set('sampleId', meta.sampleId);
      return `/lab/drc-update?${params.toString()}`;
    }
    
    // Default fallback - go to lab dashboard
    return '/lab/dashboard';
  };

  // Format notification metadata in a user-friendly way
  const formatMetadata = (meta) => {
    if (!meta) return null;
    
    const friendlyLabels = {
      sampleId: 'Sample ID',
      customerName: 'Customer',
      calculatedAmount: 'Amount',
      marketRate: 'Market Rate',
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
    if (lower.includes('billing') || lower.includes('payment')) return '💰';
    if (lower.includes('drc') || lower.includes('test')) return '🧪';
    if (lower.includes('pickup') || lower.includes('scheduled')) return '📦';
    if (lower.includes('sample')) return '🔬';
    if (lower.includes('delivery')) return '🚚';
    return '📋';
  };

  return (
    <div className="lab-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Lab Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening in the lab today.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-pending">
          <div className="kpi-icon">⏳</div>
          <div className="kpi-content">
            <div className="kpi-label">Samples Pending</div>
            <div className="kpi-value">{summary?.pendingCount ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card kpi-completed">
          <div className="kpi-icon">✅</div>
          <div className="kpi-content">
            <div className="kpi-label">Analyzed Today</div>
            <div className="kpi-value">{summary?.doneToday ?? 0}</div>
          </div>
        </div>
        <div className="kpi-card kpi-average">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <div className="kpi-label">Avg DRC Today</div>
            <div className="kpi-value">{summary?.avgDrcToday ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link className="action-button action-primary" to="/lab/check-in">
            <span className="action-icon">🔬</span>
            <span className="action-text">Sample Check-In</span>
          </Link>
          <Link className="action-button action-secondary" to="/lab/drc-update">
            <span className="action-icon">📝</span>
            <span className="action-text">Update DRC</span>
          </Link>
          <Link className="action-button action-tertiary" to="/lab/queue">
            <span className="action-icon">📋</span>
            <span className="action-text">View Queue</span>
          </Link>
          <Link className="action-button action-info" to="/lab/reports">
            <span className="action-icon">📊</span>
            <span className="action-text">Reports</span>
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
                  {n.meta && formatMetadata(n.meta) && (
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
                    <button 
                      className="notif-action-btn notif-open-btn" 
                      onClick={() => {
                        const url = buildNotificationUrl(n);
                        navigate(url);
                      }}
                    >
                      Open
                    </button>
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

export default LabDashboard;
