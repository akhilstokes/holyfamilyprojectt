
import React, { useEffect, useState } from 'react';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const [attendanceData, setAttendanceData] = useState([]);
  const [staffComplaints, setStaffComplaints] = useState([]);
  const [userComplaints, setUserComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'staff') {
        // Fetch attendance data
        const attendanceResponse = await fetch(`${API_BASE}/api/attendance/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (attendanceResponse.ok) {
          const data = await attendanceResponse.json();
          setAttendanceData(Array.isArray(data) ? data : []);
        } else {
          setAttendanceData([]);
        }

        // Fetch staff complaints
        const complaintsResponse = await fetch(`${API_BASE}/api/complaints/staff`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (complaintsResponse.ok) {
          const data = await complaintsResponse.json();
          setStaffComplaints(Array.isArray(data) ? data : []);
        } else {
          setStaffComplaints([]);
        }
      } else {
        // Fetch user complaints
        const userComplaintsResponse = await fetch(`${API_BASE}/api/complaints/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (userComplaintsResponse.ok) {
          const data = await userComplaintsResponse.json();
          setUserComplaints(Array.isArray(data) ? data : []);
        } else {
          setUserComplaints([]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setAttendanceData([]);
      setStaffComplaints([]);
      setUserComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttendance = async (id, action) => {
    try {
      const response = await fetch(`${API_BASE}/api/attendance/${action}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        alert(`Failed to ${action} attendance`);
      }
    } catch (error) {
      console.error(`Error ${action}ing attendance:`, error);
      alert(`Failed to ${action} attendance`);
    }
  };

  const handleComplaintAction = async (id, action) => {
    try {
      const response = await fetch(`${API_BASE}/api/complaints/${action}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        alert(`Failed to ${action} complaint`);
      }
    } catch (error) {
      console.error(`Error ${action}ing complaint:`, error);
      alert(`Failed to ${action} complaint`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'lab_staff': '#3b82f6',
      'field_staff': '#10b981',
      'delivery_staff': '#f59e0b',
      'manager': '#8b5cf6',
      'accountant': '#ef4444',
      'admin': '#6b7280'
    };

    return (
      <span 
        className="role-badge"
        style={{ backgroundColor: roleColors[role] || '#6b7280' }}
      >
        {role?.replace('_', ' ').toUpperCase() || 'STAFF'}

import React, { useEffect, useState, useCallback } from 'react';
import ComplaintForm from '../../components/common/ComplaintForm';

const ComplaintManagement = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [actionForm, setActionForm] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    resolution: '',
    resolutionNotes: '',
    internalNotes: ''
  });

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.category !== 'all') params.append('category', filters.category);
      
      const queryString = params.toString();
      const url = `${base}/api/complaints/all${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load complaints');
      }
    } catch (err) {
      console.error('Error loading complaints:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [base, token, filters]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/complaints/stats`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [base, token]);

  useEffect(() => {
    if (token) {
      loadComplaints();
      loadStats();
    }
  }, [token, loadComplaints, loadStats]);

  const handleSubmitComplaint = async (formData) => {
    try {
      const res = await fetch(`${base}/api/complaints/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowForm(false);
        await loadComplaints();
        await loadStats();
        alert('Complaint submitted successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Failed to submit complaint');
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      alert('Failed to submit complaint. Please try again.');
    }
  };

  const handleUpdateComplaint = async (complaintId) => {
    try {
      const res = await fetch(`${base}/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(actionForm)
      });
      
      if (res.ok) {
        setSelectedComplaint(null);
        setActionForm({
          status: '',
          priority: '',
          assignedTo: '',
          resolution: '',
          resolutionNotes: '',
          internalNotes: ''
        });
        await loadComplaints();
        await loadStats();
        alert('Complaint updated successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Failed to update complaint');
      }
    } catch (err) {
      console.error('Error updating complaint:', err);
      alert('Failed to update complaint. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      open: '#ffc107',
      in_progress: '#17a2b8',
      resolved: '#28a745',
      closed: '#6c757d'
    };
    
    return (
      <span 
        style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          backgroundColor: statusColors[status] || '#6c757d',
          color: 'white',
          textTransform: 'capitalize'
        }}
      >
        {status?.replace('_', ' ')}

      </span>
    );
  };


  return (
    <div className="complaint-management">
      {/* Header */}
      <div className="page-header">
        <h1>
          <i className="fas fa-exclamation-triangle"></i>
          Complaints & Actions
        </h1>
        <p>Handle complaints</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button className="refresh-btn" onClick={fetchData}>
          <i className="fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'staff' && (
          <div className="staff-section">
            {/* Side by Side Layout */}
            <div className="side-layout">
              {/* Left Side - Attendance */}
              <div className="left-panel">
                <div className="section-card">
                  <h3>Attendance - Pending Verification</h3>
                  {loading ? (
                    <div className="loading-state">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="simple-table">
                        <thead>
                          <tr>
                            <th>Staff</th>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.length > 0 ? (
                            attendanceData.map((item) => (
                              <tr key={item._id}>
                                <td>{item.staffName || item.staff?.name || 'Unknown'}</td>
                                <td>{formatDate(item.date)}</td>
                                <td>{item.checkIn || '-'}</td>
                                <td>
                                  <div className="action-buttons">
                                    <button 
                                      className="verify-btn"
                                      onClick={() => handleVerifyAttendance(item._id, 'verify')}
                                    >
                                      Verify
                                    </button>
                                    <button 
                                      className="reject-btn"
                                      onClick={() => handleVerifyAttendance(item._id, 'reject')}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="no-data">No pending attendance records</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recently Verified Section */}
                <div className="section-card">
                  <h3>Attendance - Recently Verified</h3>
                  <div className="empty-state">
                    <p>No verified records</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Staff Complaints */}
              <div className="right-panel">
                <div className="section-card">
                  <h3>Staff Complaints</h3>
                  {loading ? (
                    <div className="loading-state">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Loading...</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="simple-table">
                        <thead>
                          <tr>
                            <th>Staff</th>
                            <th>Role</th>
                            <th>Complaint</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffComplaints.length > 0 ? (
                            staffComplaints.map((complaint) => (
                              <tr key={complaint._id}>
                                <td>{complaint.staffName || complaint.staff?.name || 'Unknown'}</td>
                                <td>{getRoleBadge(complaint.staff?.role || complaint.role)}</td>
                                <td className="complaint-text" title={complaint.description}>
                                  {complaint.title || complaint.description || 'No description'}
                                </td>
                                <td>{formatDate(complaint.createdAt || complaint.date)}</td>
                                <td>
                                  <div className="action-buttons">
                                    <button 
                                      className="resolve-btn"
                                      onClick={() => handleComplaintAction(complaint._id, 'resolve')}
                                    >
                                      Resolve
                                    </button>
                                    <button 
                                      className="reject-btn"
                                      onClick={() => handleComplaintAction(complaint._id, 'reject')}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="no-data">No staff complaints</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-card">
              <h3>User Complaints</h3>
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading...</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Complaint</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userComplaints.length > 0 ? (
                        userComplaints.map((complaint) => (
                          <tr key={complaint._id}>
                            <td>{complaint.userName || complaint.user?.name || 'Unknown'}</td>
                            <td>{complaint.user?.email || complaint.email || '-'}</td>
                            <td className="complaint-text" title={complaint.description}>
                              {complaint.title || complaint.description || 'No description'}
                            </td>
                            <td>{formatDate(complaint.createdAt || complaint.date)}</td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="resolve-btn"
                                  onClick={() => handleComplaintAction(complaint._id, 'resolve')}
                                >
                                  Resolve
                                </button>
                                <button 
                                  className="reject-btn"
                                  onClick={() => handleComplaintAction(complaint._id, 'reject')}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="no-data">No user complaints</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    
    return (
      <span 
        style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          backgroundColor: priorityColors[priority] || '#6c757d',
          color: 'white',
          textTransform: 'capitalize'
        }}
      >
        {priority}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Complaint Management</h2>
        <div style={{ color: 'crimson', marginTop: 8 }}>
          Please log in to access complaint management.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Complaint Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Submit New Complaint
        </button>
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 4 }}>{error}</div>}

      {/* Stats Cards */}
      {stats.overall && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 16, 
          marginBottom: 20 
        }}>
          <div style={{ padding: 16, backgroundColor: '#e3f2fd', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>
              {stats.overall.total}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Total Complaints</div>
          </div>
          <div style={{ padding: 16, backgroundColor: '#fff3e0', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f57c00' }}>
              {stats.overall.open}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Open</div>
          </div>
          <div style={{ padding: 16, backgroundColor: '#e8f5e8', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2e7d32' }}>
              {stats.overall.resolved}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Resolved</div>
          </div>
          <div style={{ padding: 16, backgroundColor: '#ffebee', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#c62828' }}>
              {stats.overall.urgent}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>Urgent</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        marginBottom: 20, 
        padding: 16, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8,
        border: '1px solid #dee2e6'
      }}>
        <h5 style={{ marginBottom: 16 }}>Filters</h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Status</label>
            <select
              className="form-control"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Priority</label>
            <select
              className="form-control"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Category</label>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              <option value="workplace">Workplace</option>
              <option value="equipment">Equipment</option>
              <option value="safety">Safety</option>
              <option value="hr">HR</option>
              <option value="management">Management</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaint Form Modal */}
      {showForm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: 8, 
            maxWidth: 600, 
            width: '90%', 
            maxHeight: '90%', 
            overflow: 'auto' 
          }}>
            <div style={{ padding: 20 }}>
              <ComplaintForm 
                onSubmit={handleSubmitComplaint}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {selectedComplaint && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: 8, 
            maxWidth: 600, 
            width: '90%', 
            maxHeight: '90%', 
            overflow: 'auto' 
          }}>
            <div style={{ padding: 20 }}>
              <h4 style={{ marginBottom: 20 }}>Take Action on Complaint</h4>
              <div style={{ marginBottom: 16 }}>
                <strong>Title:</strong> {selectedComplaint.title}
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Description:</strong> {selectedComplaint.description}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Status</label>
                  <select
                    className="form-control"
                    value={actionForm.status}
                    onChange={(e) => setActionForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">Select Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Priority</label>
                  <select
                    className="form-control"
                    value={actionForm.priority}
                    onChange={(e) => setActionForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="">Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Resolution</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={actionForm.resolution}
                  onChange={(e) => setActionForm(prev => ({ ...prev, resolution: e.target.value }))}
                  placeholder="Describe the resolution..."
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Internal Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={actionForm.internalNotes}
                  onChange={(e) => setActionForm(prev => ({ ...prev, internalNotes: e.target.value }))}
                  placeholder="Internal notes (visible only to managers)..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleUpdateComplaint(selectedComplaint._id)}
                >
                  Update Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div>Loading complaints...</div>
          </div>
        ) : (
          <table className="table table-striped table-hover" style={{ minWidth: 1000 }}>
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported By</th>
                <th>Reported At</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint, index) => (
                <tr key={complaint._id || index}>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {complaint.title}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{complaint.category}</td>
                  <td>{getPriorityBadge(complaint.priority)}</td>
                  <td>{getStatusBadge(complaint.status)}</td>
                  <td>{complaint.reportedByName}</td>
                  <td>{formatDate(complaint.reportedAt)}</td>
                  <td>{complaint.assignedToName || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      Take Action
                    </button>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        )}
      </div>
    </div>
  );
};

export default ComplaintManagement;










