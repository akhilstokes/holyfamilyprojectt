import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const ManagerBarrelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [requestedIds, setRequestedIds] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('barrelRequestsToAdmin');
    return saved ? JSON.parse(saved) : [];
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/requests/barrels/manager/all`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load requests (${res.status})`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load barrel requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      const res = await fetch(`${API}/api/requests/barrels/${id}/approve`, {
        method: 'PUT',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error(`Failed to approve (${res.status})`);
      setSuccess(`Request approved successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to approve request');
    }
  };

  const reject = async (id) => {
    const reason = window.prompt('Rejection reason (optional):');
    try {
      const res = await fetch(`${API}/api/requests/barrels/${id}/reject`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ reason: reason || 'Rejected by manager' })
      });
      if (!res.ok) throw new Error(`Failed to reject (${res.status})`);
      setSuccess(`Request rejected.`);
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to reject request');
    }
  };

  const requestBarrelsFromAdmin = async (barrelRequestId, quantity, userName, userEmail) => {
    try {
      const res = await fetch(`${API}/api/barrel-creation-requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          userBarrelRequestId: barrelRequestId,
          quantity,
          notes: `Request to create ${quantity} barrel(s) for ${userName || userEmail || 'user'}`
        })
      });
      if (!res.ok) throw new Error(`Failed to request barrels (${res.status})`);
      setSuccess(`Barrel creation request sent to Admin! (${quantity} barrels)`);
      setTimeout(() => setSuccess(''), 4000);
      // Mark this request as sent to admin and save to localStorage
      setRequestedIds(prev => {
        const updated = [...prev, barrelRequestId];
        localStorage.setItem('barrelRequestsToAdmin', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      setError(e?.message || 'Failed to send request to admin');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status?.toLowerCase() === filter;
  });

  return (
    <div style={{ padding: 16 }}>
      <h2>Barrel Requests</h2>
      <p style={{ color: '#64748b' }}>View and manage barrel requests from users</p>

      {error && <div style={{ background: '#fee', color: '#c00', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ background: '#efe', color: '#070', padding: 12, borderRadius: 8, marginBottom: 16 }}>{success}</div>}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button 
          className={filter === 'pending' ? 'btn' : 'btn-secondary'} 
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter(r => r.status?.toLowerCase() === 'pending').length})
        </button>
        <button 
          className={filter === 'approved' ? 'btn' : 'btn-secondary'} 
          onClick={() => setFilter('approved')}
        >
          Approved ({requests.filter(r => r.status?.toLowerCase() === 'approved').length})
        </button>
        <button 
          className={filter === 'rejected' ? 'btn' : 'btn-secondary'} 
          onClick={() => setFilter('rejected')}
        >
          Rejected ({requests.filter(r => r.status?.toLowerCase() === 'rejected').length})
        </button>
        <button 
          className={filter === 'all' ? 'btn' : 'btn-secondary'} 
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>
          No {filter !== 'all' ? filter : ''} barrel requests found
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Quantity</th>
                <th>Notes</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(r => (
                <tr key={r._id}>
                  <td>{r.user?.name || r.user?.email || 'Unknown User'}</td>
                  <td style={{ fontWeight: 700, fontSize: 18 }}>{r.quantity || 1}</td>
                  <td>{r.notes || '-'}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    <span 
                      className={`badge status-${r.status?.toLowerCase() || 'pending'}`}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: 
                          r.status?.toLowerCase() === 'approved' ? '#d4edda' :
                          r.status?.toLowerCase() === 'rejected' ? '#f8d7da' :
                          '#fff3cd',
                        color:
                          r.status?.toLowerCase() === 'approved' ? '#155724' :
                          r.status?.toLowerCase() === 'rejected' ? '#721c24' :
                          '#856404'
                      }}
                    >
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    {r.status?.toLowerCase() === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className="btn" 
                          style={{ background: '#28a745', color: 'white', padding: '6px 12px', fontSize: 13 }}
                          onClick={() => approve(r._id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ background: '#dc3545', color: 'white', padding: '6px 12px', fontSize: 13 }}
                          onClick={() => reject(r._id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status?.toLowerCase() === 'approved' && (
                      requestedIds.includes(r._id) ? (
                        <button 
                          className="btn" 
                          style={{ background: '#10b981', color: 'white', padding: '6px 12px', fontSize: 13, cursor: 'not-allowed' }}
                          disabled
                          title="Already requested from Admin"
                        >
                          ✓ Requested from Admin
                        </button>
                      ) : (
                        <button 
                          className="btn" 
                          style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', fontSize: 13 }}
                          onClick={() => requestBarrelsFromAdmin(r._id, r.quantity, r.user?.name, r.user?.email)}
                          title="Request Admin to create barrels"
                        >
                          📦 Request Barrels from Admin
                        </button>
                      )
                    )}
                    {r.status?.toLowerCase() === 'rejected' && (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerBarrelRequests;

