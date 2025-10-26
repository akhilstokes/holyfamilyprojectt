import React, { useState, useEffect } from 'react';
import './AdminStatsCard.css';

const AdminStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/user-management/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-stats-card">
        <div className="stats-header">
          <h3>System Overview</h3>
        </div>
        <div className="loading">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-stats-card">
        <div className="stats-header">
          <h3>System Overview</h3>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { users, queues } = stats;

  return (
    <div className="admin-stats-card">
      <div className="stats-header">
        <h3>System Overview</h3>
        <button onClick={fetchAdminStats} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        {/* User Statistics */}
        <div className="stats-section">
          <h4>👥 Users by Role</h4>
          <div className="stats-list">
            {users.byRole.map((role, index) => (
              <div key={index} className="stat-item">
                <span className="stat-label">{role._id}:</span>
                <span className="stat-value">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-section">
          <h4>📊 User Status</h4>
          <div className="stats-list">
            {users.byStatus.map((status, index) => (
              <div key={index} className="stat-item">
                <span className="stat-label">{status._id}:</span>
                <span className="stat-value">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Queues */}
        <div className="stats-section">
          <h4>⏳ Pending Approvals</h4>
          <div className="stats-list">
            <div className="stat-item">
              <span className="stat-label">Bill Requests:</span>
              <span className="stat-value pending">{queues.pendingBills}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rate Updates:</span>
              <span className="stat-value pending">{queues.pendingRates}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Leave Requests:</span>
              <span className="stat-value pending">{queues.pendingLeaves}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Latex Requests:</span>
              <span className="stat-value pending">{queues.pendingLatex}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Barrel Disposals:</span>
              <span className="stat-value pending">{queues.disposalRequests}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unverified Attendance:</span>
              <span className="stat-value pending">{queues.unverifiedAttendance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCard;























