import React, { useEffect, useState } from 'react';
import LeaveHistoryModal from '../../components/modals/LeaveHistoryModal';
import './PendingLeaves.css';

const PendingLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/leave/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`${API_BASE}/api/leave/${endpoint}/${leaveId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchLeaves(); // Refresh the list
      } else {
        alert(`Failed to ${action} leave request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing leave:`, error);
      alert(`Failed to ${action} leave request`);
    }
  };

  const getFilteredLeaves = () => {
    if (filter === 'all') return leaves;
    return leaves.filter(leave => leave.status === filter);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      sick: 'fa-thermometer-half',
      casual: 'fa-coffee',
      annual: 'fa-calendar-check',
      emergency: 'fa-exclamation-triangle',
      maternity: 'fa-baby',
      paternity: 'fa-male'
    };
    return icons[type?.toLowerCase()] || 'fa-calendar-times';
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

  if (loading) {
    return (
      <div className="pending-leaves">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading leave requests...</p>
        </div>
      </div>
    );
  }

  const filteredLeaves = getFilteredLeaves();

  return (
    <div className="pending-leaves">
      {/* Header */}
      <div className="leaves-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-calendar-times"></i>
            Pending Leaves
          </h1>
          <p>Review leave requests</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchLeaves}>
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
          <button className="view-history-btn" onClick={() => setShowHistoryModal(true)}>
            <i className="fas fa-history"></i>
            View Leave History
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{leaves.filter(l => l.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <i className="fas fa-check"></i>
          </div>
          <div className="stat-content">
            <h3>{leaves.filter(l => l.status === 'approved').length}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">
            <i className="fas fa-times"></i>
          </div>
          <div className="stat-content">
            <h3>{leaves.filter(l => l.status === 'rejected').length}</h3>
            <p>Rejected</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{leaves.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Requests
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
        <div className="schedule-requests-btn">
          <button className="schedule-btn">
            <i className="fas fa-calendar-plus"></i>
            Schedule Requests
          </button>
        </div>
      </div>

      {/* Leave Table */}
      <div className="leaves-container">
        {filteredLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>No leave requests found</h3>
            <p>
              {filter === 'all' 
                ? 'There are no leave requests at the moment'
                : `No ${filter} leave requests found`
              }
            </p>
          </div>
        ) : (
          <div className="leaves-table-container">
            <table className="leaves-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Type</th>
                  <th>Day Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave._id} className={`leave-row ${leave.status}`}>
                    <td className="staff-cell">
                      <div className="staff-info">
                        <div className="staff-avatar">
                          {(leave.staffName || leave.staff?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="staff-details">
                          <div className="staff-name">{leave.staffName || leave.staff?.name || 'Unknown Staff'}</div>
                          <div className="staff-email">{leave.staff?.email || leave.staff?.department || 'Staff Member'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div 
                        className="type-badge"
                        style={{ backgroundColor: getLeaveTypeColor(leave.leaveType) }}
                      >
                        <i className={`fas ${getLeaveTypeIcon(leave.leaveType)}`}></i>
                        {leave.leaveType || 'Leave'}
                      </div>
                    </td>
                    <td>
                      <span className="day-type-badge">
                        {leave.dayType === 'half' ? 'Half' : 'Full'}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(leave.startDate)}</td>
                    <td className="date-cell">{formatDate(leave.endDate)}</td>
                    <td className="reason-cell">
                      <div className="reason-text" title={leave.reason || 'No reason provided'}>
                        {leave.reason || 'No reason provided'}
                      </div>
                    </td>
                    <td>
                      <div className={`status-badge ${leave.status}`}>
                        {leave.status === 'pending' && <i className="fas fa-clock"></i>}
                        {leave.status === 'approved' && <i className="fas fa-check"></i>}
                        {leave.status === 'rejected' && <i className="fas fa-times"></i>}
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </div>
                    </td>
                    <td className="actions-cell">
                      {leave.status === 'pending' ? (
                        <div className="action-buttons">
                          <button 
                            className="action-btn approve-btn"
                            onClick={() => handleLeaveAction(leave._id, 'approve')}
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          <button 
                            className="action-btn reject-btn"
                            onClick={() => handleLeaveAction(leave._id, 'reject')}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                          <button 
                            className="action-btn history-btn"
                            title="View History"
                            onClick={() => setShowHistoryModal(true)}
                          >
                            <i className="fas fa-history"></i>
                            History
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="action-btn history-btn"
                          title="View History"
                          onClick={() => setShowHistoryModal(true)}
                        >
                          <i className="fas fa-history"></i>
                          History
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave History Modal */}
      <LeaveHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};

export default PendingLeaves;
