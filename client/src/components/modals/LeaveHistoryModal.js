import React, { useState, useEffect } from 'react';
import './LeaveHistoryModal.css';

const LeaveHistoryModal = ({ isOpen, onClose }) => {
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, approved, rejected, pending

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen) {
      fetchLeaveHistory();
    }
  }, [isOpen]);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/leave/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaveHistory(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load leave history');
        setLeaveHistory([]);
      }
    } catch (error) {
      console.error('Error fetching leave history:', error);
      setError('Failed to load leave history');
      setLeaveHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHistory = () => {
    if (filter === 'all') return leaveHistory;
    return leaveHistory.filter(leave => leave.status === filter);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'fa-check-circle';
      case 'rejected': return 'fa-times-circle';
      case 'pending': return 'fa-clock';
      default: return 'fa-question-circle';
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      sick: '#e74c3c',
      casual: '#3498db',
      annual: '#2ecc71',
      emergency: '#f39c12',
      maternity: '#e91e63',
      paternity: '#9b59b6'
    };
    return colors[type?.toLowerCase()] || '#95a5a6';
  };

  if (!isOpen) return null;

  const filteredHistory = getFilteredHistory();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="leave-history-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>
              <i className="fas fa-history"></i>
              Leave History
            </h2>
            <p>Complete history of all leave requests</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="history-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({leaveHistory.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({leaveHistory.filter(l => l.status === 'approved').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({leaveHistory.filter(l => l.status === 'rejected').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({leaveHistory.filter(l => l.status === 'pending').length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading leave history...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchLeaveHistory}>
                <i className="fas fa-redo"></i>
                Retry
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <h3>No leave records found</h3>
              <p>
                {filter === 'all' 
                  ? 'No leave history available'
                  : `No ${filter} leave requests found`
                }
              </p>
            </div>
          ) : (
            <div className="history-list">
              {filteredHistory.map((leave) => (
                <div key={leave._id} className={`history-item ${leave.status}`}>
                  <div className="item-header">
                    <div className="staff-info">
                      <div className="staff-avatar">
                        {(leave.staffName || leave.staff?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="staff-details">
                        <h4>{leave.staffName || leave.staff?.name || 'Unknown Staff'}</h4>
                        <span>{leave.staff?.email || leave.staff?.department || 'Staff Member'}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${leave.status}`}>
                      <i className={`fas ${getStatusIcon(leave.status)}`}></i>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </div>
                  </div>

                  <div className="item-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="label">Type:</span>
                        <div 
                          className="type-badge"
                          style={{ backgroundColor: getLeaveTypeColor(leave.leaveType) }}
                        >
                          {leave.leaveType || 'Leave'}
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        <span className="value">{leave.dayType === 'half' ? 'Half Day' : 'Full Day'}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="label">From:</span>
                        <span className="value">{formatDate(leave.startDate)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">To:</span>
                        <span className="value">{formatDate(leave.endDate)}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item full-width">
                        <span className="label">Reason:</span>
                        <span className="value">{leave.reason || 'No reason provided'}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <span className="label">Applied:</span>
                        <span className="value">{formatDate(leave.createdAt || leave.appliedDate)}</span>
                      </div>
                      {leave.processedAt && (
                        <div className="detail-item">
                          <span className="label">Processed:</span>
                          <span className="value">{formatDate(leave.processedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="close-btn-footer" onClick={onClose}>
            Close
          </button>
          <button className="refresh-btn-footer" onClick={fetchLeaveHistory}>
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistoryModal;