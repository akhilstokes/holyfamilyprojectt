import React, { useEffect, useState, useCallback } from 'react';

const AttendanceHistory = ({ staffType = 'staff' }) => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  // All hooks must be called before any conditional returns
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [filterForm, setFilterForm] = useState({
    fromDate: '',
    toDate: '',
    status: 'all'
  });
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  
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

  const loadAttendanceHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterForm.fromDate) params.append('fromDate', filterForm.fromDate);
      if (filterForm.toDate) params.append('toDate', filterForm.toDate);
      if (filterForm.status !== 'all') params.append('status', filterForm.status);
      params.append('page', pagination.current);
      params.append('limit', '20');
      
      const queryString = params.toString();
      const url = `${base}/api/attendance/history${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendance || []);
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load attendance history');
      }
    } catch (err) {
      console.error('Error loading attendance history:', err);
      setError('Failed to load attendance history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [base, token, filterForm]);

  // useEffect hook must be called before any conditional returns
  useEffect(() => { 
    if (token) {
      checkConnection();
      loadAttendanceHistory(); 
    }
  }, [token, checkConnection, loadAttendanceHistory]);

  // Since we're using server-side filtering, filteredAttendance is the same as attendance
  useEffect(() => {
    setFilteredAttendance(attendance);
  }, [attendance]);

  const clearFilters = () => {
    setFilterForm({
      fromDate: '',
      toDate: '',
      status: 'all'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      present: '#28a745',
      absent: '#dc3545',
      late: '#ffc107',
      half_day: '#17a2b8'
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

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      return new Date(timeString).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end - start;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    } catch {
      return '-';
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  // Check if user is authenticated after all hooks
  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Attendance History</h3>
        <div style={{ color: 'crimson', marginTop: 8 }}>
          Please log in to access attendance history.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Attendance History</h3>
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
            onClick={() => loadAttendanceHistory()} 
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
          <h5 style={{ marginBottom: 16 }}>Filter Attendance History</h5>
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
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
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
            {filteredAttendance.length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Total Days</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#e8f5e8', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2e7d32' }}>
            {filteredAttendance.filter(a => a.status === 'present').length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Present</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#ffebee', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#c62828' }}>
            {filteredAttendance.filter(a => a.status === 'absent').length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Absent</div>
        </div>
        <div style={{ padding: 16, backgroundColor: '#fff3e0', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f57c00' }}>
            {filteredAttendance.filter(a => a.status === 'late').length}
          </div>
          <div style={{ fontSize: 14, color: '#666' }}>Late</div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div>Loading attendance history...</div>
          </div>
        ) : (
          <table className="table table-striped table-hover" style={{ minWidth: 800 }}>
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
                <th>Location</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record, index) => (
                <tr key={record._id || index}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatTime(record.checkIn)}</td>
                  <td>{formatTime(record.checkOut)}</td>
                  <td>{calculateWorkingHours(record.checkIn, record.checkOut)}</td>
                  <td>{getStatusBadge(record.status)}</td>
                  <td>{record.location || '-'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={pagination.current <= 1}
          >
            Previous
          </button>
          <span style={{ padding: '0 16px' }}>
            Page {pagination.current} of {pagination.pages} ({pagination.total} total)
          </span>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={pagination.current >= pagination.pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;