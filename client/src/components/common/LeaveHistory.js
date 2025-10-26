import React, { useEffect, useState, useCallback } from 'react';

const LeaveHistory = ({ staffType = 'staff' }) => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  // All hooks must be called before any conditional returns
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [filterForm, setFilterForm] = useState({
    fromDate: '',
    toDate: '',
    status: 'all',
    leaveType: 'all'
  });
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Check server connection
  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch(`${base}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      setConnectionStatus(res.ok ? 'connected' : 'error');
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  }, [base]);

  const loadLeaveHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterForm.fromDate) params.append('fromDate', filterForm.fromDate);
      if (filterForm.toDate) params.append('toDate', filterForm.toDate);
      if (filterForm.status !== 'all') params.append('status', filterForm.status);
      if (filterForm.leaveType !== 'all') params.append('leaveType', filterForm.leaveType);
      
      const queryString = params.toString();
      const url = `${base}/api/leave/my-leaves${queryString ? `?${queryString}` : ''}`;
      
      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const leaveData = Array.isArray(data) ? data : [];
        setLeaves(leaveData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || `Failed to load leave history (${res.status})`);
        setLeaves([]);
      }
    } catch (err) {
      console.error('Error loading leave history:', err);
      setError('Failed to load leave history. Please check your connection and try again.');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [base, token, filterForm.fromDate, filterForm.toDate, filterForm.status, filterForm.leaveType]);

  // useEffect hook must be called before any conditional returns
  useEffect(() => { 
    if (token) {
      checkConnection();
      loadLeaveHistory(); 
    }
  }, [token, checkConnection, loadLeaveHistory]);

  // Since we're using server-side filtering, filteredLeaves is the same as leaves
  useEffect(() => {
    setFilteredLeaves(leaves);
  }, [leaves]);

  const clearFilters = () => {
    setFilterForm({
      fromDate: '',
      toDate: '',
      status: 'all',
      leaveType: 'all'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
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
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-GB', {
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

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return '-';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch {
      return '-';
    }
  };

  // Check if user is authenticated after all hooks
  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Leave History</h3>
        <div style={{ color: 'crimson', marginTop: 8 }}>
          Please log in to access leave history.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Leave History</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: connectionStatus === 'connected' ? '#28a745' : 
                             connectionStatus === 'disconnected' ? '#dc3545' : '#ffc107' 
            }}></div>
            <span style={{ fontSize: 12, color: '#666' }}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => loadLeaveHistory()} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 4 }}>{error}</div>}

      {/* Filters Section */}
      {showFilters && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}>
          <h5 style={{ marginBottom: 16 }}>Filter Leave History</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>From Date</label>
              <input
                type="date"
                className="form-control"
                value={filterForm.fromDate}
                onChange={(e) => setFilterForm(prev => ({ ...prev, fromDate: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>To Date</label>
              <input
                type="date"
                className="form-control"
                value={filterForm.toDate}
                onChange={(e) => setFilterForm(prev => ({ ...prev, toDate: e.target.value }))}
                min={filterForm.fromDate || undefined}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Status</label>
              <select
                className="form-control"
                value={filterForm.status}
                onChange={(e) => setFilterForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Leave Type</label>
              <select
                className="form-control"
                value={filterForm.leaveType}
                onChange={(e) => setFilterForm(prev => ({ ...prev, leaveType: e.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 16, 
        marginBottom: 20 
      }}>
        <div style={{ padding: 16, backgroundColor: '#e3f2fd', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>
            {filteredLeaves.length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Total Requests</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#fff3e0', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f57c00' }}>
            {filteredLeaves.filter(l => l.status === 'pending').length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Pending</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#e8f5e8', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2e7d32' }}>
            {filteredLeaves.filter(l => l.status === 'approved').length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Approved</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#ffebee', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#c62828' }}>
            {filteredLeaves.filter(l => l.status === 'rejected').length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Rejected</div>
        </div>
      </div>

      {/* Leave History Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div>Loading leave history...</div>
          </div>
        ) : (
          <table className="table table-striped table-hover" style={{ minWidth: 800 }}>
            <thead className="table-dark">
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Day Type</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave, index) => (
                <tr key={leave._id || index}>
                  <td style={{ textTransform: 'capitalize' }}>{leave.leaveType || '-'}</td>
                  <td>{formatDate(leave.startDate)}</td>
                  <td>{formatDate(leave.endDate)}</td>
                  <td>{calculateDays(leave.startDate, leave.endDate)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{leave.dayType || 'Full'}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {leave.reason || '-'}
                  </td>
                  <td>{formatDateTime(leave.appliedAt)}</td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                    {leaves.length === 0 ? 'No leave requests found.' : 'No leave requests match the current filters.'}
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

export default LeaveHistory;





