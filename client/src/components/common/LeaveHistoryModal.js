import React, { useEffect, useState } from 'react';

const LeaveHistoryModal = ({ isOpen, onClose, staffId = null }) => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      loadHistory();
    }
  }, [isOpen, staffId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      // If staffId is provided, load that staff's history (for managers)
      // Otherwise load own history (for staff)
      const url = staffId 
        ? `${base}/api/leave/staff/${staffId}/history`
        : `${base}/api/leave/my-leaves`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.leaves) ? data.leaves : []);
        setLeaves(arr);
      } else {
        const msg = res.status === 403 ? 'Not authorized to view this history' : 'Failed to load leave history';
        setError(msg);
        setLeaves([]);
      }
    } catch (err) {
      console.error('Error loading leave history:', err);
      setError('Failed to load leave history');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#28a745',
      rejected: '#dc3545'
    };
    
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: '600',
        backgroundColor: colors[status] || '#6c757d',
        color: 'white',
        textTransform: 'capitalize'
      }}>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px' }}>Leave History</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ 
          padding: '24px', 
          overflowY: 'auto',
          flex: 1
        }}>
          {error && (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              padding: '12px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Loading leave history...</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td style={{ textTransform: 'capitalize' }}>{leave.leaveType || '-'}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td style={{ 
                        maxWidth: '250px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {leave.reason || '-'}
                      </td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        No leave records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="btn btn-primary"
            onClick={loadHistory}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistoryModal;
