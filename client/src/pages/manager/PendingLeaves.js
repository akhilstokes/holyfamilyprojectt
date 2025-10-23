import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PendingLeaves.css';
import LeaveHistoryModal from '../../components/common/LeaveHistoryModal';

const PendingLeaves = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const navigate = useNavigate();

  // Tab management
  const [activeTab, setActiveTab] = useState('leaves'); // 'leaves' or 'schedules'
  
  // Leave requests state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Schedule requests state
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseForm, setResponseForm] = useState({
    action: '', // 'approve' or 'reject'
    response: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Leave History Modal state
  const [showLeaveHistoryModal, setShowLeaveHistoryModal] = useState(false);
  const [selectedStaffForHistory, setSelectedStaffForHistory] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true); setError('');
    try {
      // Endpoint must be implemented on backend
      const res = await fetch(`${base}/api/leave/pending`, { headers });
      if (!res.ok) throw new Error(`Failed to load pending leaves (${res.status})`);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error('Unexpected response for pending leaves');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (Array.isArray(data?.records) ? data.records : []));
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Load schedule requests
  const loadScheduleRequests = useCallback(async () => {
    try {
      setScheduleLoading(true);
      setScheduleError('');
      
      const response = await fetch(`${base}/api/schedules/change-requests/pending`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setScheduleRequests(data);
      } else {
        const errorData = await response.json();
        setScheduleError(errorData.message || 'Failed to load schedule requests');
      }
    } catch (error) {
      console.error('Error fetching schedule requests:', error);
      setScheduleError('Failed to load schedule requests');
    } finally {
      setScheduleLoading(false);
    }
  }, [base, headers]);

  useEffect(() => { 
    load(); 
    loadScheduleRequests();
  }, [load, loadScheduleRequests]);

  const act = async (row, action) => {
    try {
      const staffName = row?.staffName || row?.staff?.name || row?.staff?.email || 'this staff member';
      const start = row?.startDate ? new Date(row.startDate).toLocaleDateString() : '';
      const end = row?.endDate ? new Date(row.endDate).toLocaleDateString() : '';

      if (action === 'approve') {
        const ok = window.confirm(`Approve leave for ${staffName}\nFrom: ${start}  To: ${end}?`);
        if (!ok) return;
      } else {
        const reason = window.prompt(`Enter rejection reason for ${staffName} (optional):`, '') || '';
        const ok = window.confirm(`Reject leave for ${staffName}?`);
        if (!ok) return;
        const url = `${base}/api/leave/reject/${row._id}`;
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ reason }) });
        if (!res.ok) throw new Error(`${action} failed (${res.status})`);
        await load();
        return;
      }

      const url = `${base}/api/leave/approve/${row._id}`;
      const res = await fetch(url, { method: 'POST', headers });
      if (!res.ok) throw new Error(`${action} failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || `${action} failed`);
    }
  };

  // Schedule request handlers
  const handleScheduleApproveReject = (request, action) => {
    setSelectedRequest(request);
    setResponseForm({
      action,
      response: ''
    });
    setShowResponseModal(true);
  };

  const submitScheduleResponse = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = responseForm.action === 'approve' ? 'approve' : 'reject';
      const response = await fetch(`${base}/api/schedules/change-requests/${selectedRequest._id}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          response: responseForm.response
        })
      });

      if (response.ok) {
        const message = responseForm.action === 'approve' 
          ? 'Schedule request approved successfully!' 
          : 'Schedule request rejected successfully!';
        alert(message);
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseForm({ action: '', response: '' });
        loadScheduleRequests(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Failed to ${responseForm.action} request`);
      }
    } catch (error) {
      console.error(`Error ${responseForm.action}ing request:`, error);
      alert(`Failed to ${responseForm.action} request`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="pending-leaves-container">
      <div className="header">
        <h2>Staff Requests</h2>
        <button 
          onClick={() => {
            if (activeTab === 'leaves') load();
            else loadScheduleRequests();
          }} 
          disabled={loading || scheduleLoading}
          className="refresh-btn"
        >
          {(loading || scheduleLoading) ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Quick link under header to view full Leave History */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 8, gap: 8 }}>
        <button 
          className="btn-secondary" 
          onClick={() => navigate('/manager/leave-history')}
        >
          Full Leave History
        </button>
        <button 
          className="btn-primary" 
          onClick={() => {
            setSelectedStaffForHistory(null);
            setShowLeaveHistoryModal(true);
          }}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 View Leave History
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <i className="fas fa-calendar-times"></i>
          Leave Requests
          {rows.length > 0 && <span className="badge">{rows.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          <i className="fas fa-calendar-alt"></i>
          Schedule Requests
          {scheduleRequests.length > 0 && <span className="badge">{scheduleRequests.length}</span>}
        </button>
      </div>

      {/* Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <div className="tab-content">
          {error && <div className="error-message">{error}</div>}
          <div className="table-container">
            <table className="dashboard-table">
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
                {rows.map((r) => {
                  const start = r.startDate ? new Date(r.startDate) : null;
                  const end = r.endDate ? new Date(r.endDate) : null;
                  return (
                    <tr key={r._id}>
                      <td>{r.staffName || r.staff?.name || r.staff?.email || '-'}</td>
                      <td>{r.leaveType}</td>
                      <td>{r.dayType || 'full'}</td>
                      <td>{start ? start.toLocaleDateString() : '-'}</td>
                      <td>{end ? end.toLocaleDateString() : '-'}</td>
                      <td className="reason-cell" title={r.reason}>{r.reason || '-'}</td>
                      <td>
                        <span className={`status-badge ${r.status}`}>{r.status}</span>
                      </td>
                      <td>
                        {r.status === 'pending' ? (
                          <div className="action-buttons">
                            <button className="btn btn-approve" onClick={() => act(r, 'approve')}>Approve</button>
                            <button className="btn btn-reject" onClick={() => act(r, 'reject')}>Reject</button>
                            <button 
                              className="btn btn-info" 
                              onClick={() => {
                                setSelectedStaffForHistory(r.staff?._id || r.staffId);
                                setShowLeaveHistoryModal(true);
                              }}
                              style={{ marginLeft: 4, fontSize: 12 }}
                              title="View staff leave history"
                            >
                              History
                            </button>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!loading && rows.length === 0 && (
                  <tr><td colSpan={8} className="no-data">No pending leave requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Requests Tab */}
      {activeTab === 'schedules' && (
        <div className="tab-content">
          {scheduleError && <div className="error-message">{scheduleError}</div>}
          {scheduleLoading ? (
            <div className="loading">Loading schedule requests...</div>
          ) : (
            <div className="schedule-requests-list">
              {scheduleRequests.length === 0 ? (
                <div className="no-requests">
                  <div className="no-requests-icon">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <h3>No pending schedule requests</h3>
                  <p>There are no pending schedule change requests at the moment.</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {scheduleRequests.map((request) => (
                    <div key={request._id} className="request-card">
                      <div className="request-header">
                        <div className="staff-info">
                          <div className="staff-name">
                            <i className="fas fa-user"></i>
                            {request.staff?.name || 'Unknown Staff'}
                          </div>
                          <div className="staff-id">
                            ID: {request.staff?.staffId || request.staff?.email}
                          </div>
                        </div>
                        <div 
                          className="request-status"
                          style={{ color: getStatusColor(request.status) }}
                        >
                          <i className="fas fa-clock"></i>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                      </div>

                      <div className="request-details">
                        <div className="request-date">
                          <strong>Requested Date:</strong> {formatDate(request.requestDate)}
                        </div>
                        
                        <div className="shift-change">
                          <div className="shift-from">
                            <span className="label">From:</span>
                            <span className="shift-value current">{request.currentShift} Shift</span>
                          </div>
                          <i className="fas fa-arrow-right shift-arrow"></i>
                          <div className="shift-to">
                            <span className="label">To:</span>
                            <span className="shift-value requested">
                              {request.requestedShift === 'Off' ? 'Day Off' : `${request.requestedShift} Shift`}
                            </span>
                          </div>
                        </div>

                        <div className="request-reason">
                          <strong>Reason:</strong>
                          <p>{request.reason}</p>
                        </div>

                        <div className="request-timestamps">
                          <small>
                            <i className="fas fa-clock"></i>
                            Submitted: {formatDate(request.createdAt)}
                          </small>
                        </div>
                      </div>

                      <div className="request-actions">
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleScheduleApproveReject(request, 'approve')}
                        >
                          <i className="fas fa-check"></i>
                          Approve
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleScheduleApproveReject(request, 'reject')}
                        >
                          <i className="fas fa-times"></i>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Response Modal for Schedule Requests */}
      {showResponseModal && (
        <div className="modal-overlay">
          <div className="response-modal">
            <div className="modal-header">
              <h3>
                {responseForm.action === 'approve' ? 'Approve' : 'Reject'} Schedule Request
              </h3>
              <button 
                onClick={() => {
                  setShowResponseModal(false);
                  setSelectedRequest(null);
                  setResponseForm({ action: '', response: '' });
                }}
                className="close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="request-summary">
                <h4>Request Details:</h4>
                <p><strong>Staff:</strong> {selectedRequest?.staff?.name}</p>
                <p><strong>Date:</strong> {formatDate(selectedRequest?.requestDate)}</p>
                <p><strong>Change:</strong> {selectedRequest?.currentShift} → {selectedRequest?.requestedShift}</p>
                <p><strong>Reason:</strong> {selectedRequest?.reason}</p>
              </div>

              <form onSubmit={submitScheduleResponse}>
                <div className="form-group">
                  <label>
                    {responseForm.action === 'approve' ? 'Approval Comments (Optional):' : 'Rejection Reason (Required):'}
                  </label>
                  <textarea
                    value={responseForm.response}
                    onChange={(e) => setResponseForm({...responseForm, response: e.target.value})}
                    placeholder={
                      responseForm.action === 'approve' 
                        ? 'Add any comments about the approval...' 
                        : 'Please provide a reason for rejection...'
                    }
                    rows="3"
                    required={responseForm.action === 'reject'}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowResponseModal(false);
                      setSelectedRequest(null);
                      setResponseForm({ action: '', response: '' });
                    }}
                    className="btn btn-cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className={`btn ${responseForm.action === 'approve' ? 'btn-approve' : 'btn-reject'}`}
                  >
                    {submitting ? 'Processing...' : 
                     responseForm.action === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leave History Modal */}
      <LeaveHistoryModal 
        isOpen={showLeaveHistoryModal} 
        onClose={() => {
          setShowLeaveHistoryModal(false);
          setSelectedStaffForHistory(null);
        }}
        staffId={selectedStaffForHistory}
      />
    </div>
  );
};

export default PendingLeaves;
