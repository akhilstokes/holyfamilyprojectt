import React, { useEffect, useMemo, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const ManagerCompleted = () => {
  const [tab, setTab] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [attendance, setAttendance] = useState({ pending: [], verified: [] });
  const [leaves, setLeaves] = useState({ pending: [], recent: [] });
  const [userComplaints, setUserComplaints] = useState([]);
  const [userRequests, setUserRequests] = useState([]);

  const tabs = useMemo(() => ([
    { id: 'staff', label: 'Staff' },
    { id: 'users', label: 'Users' }
  ]), []);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [attPending, attVerified, leavesPending] = await Promise.all([
        fetch(`${API}/api/manager-dashboard/attendance/verification?verified=false`, { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(r)),
        fetch(`${API}/api/manager-dashboard/attendance/verification?verified=true`, { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(r)),
        fetch(`${API}/api/leave/pending`, { headers: authHeaders() }).then(r => r.ok ? r.json() : Promise.reject(r))
      ]);

      setAttendance({
        pending: Array.isArray(attPending?.data) ? attPending.data : (Array.isArray(attPending) ? attPending : []),
        verified: Array.isArray(attVerified?.data) ? attVerified.data : (Array.isArray(attVerified) ? attVerified : [])
      });

      setLeaves({
        pending: Array.isArray(leavesPending?.data) ? leavesPending.data : (Array.isArray(leavesPending) ? leavesPending : []),
        recent: []
      });


      // Load user complaints
      try {
        const complaintsRes = await fetch(`${API}/api/complaints/all`, { headers: authHeaders() });
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setUserComplaints(Array.isArray(complaintsData) ? complaintsData : (Array.isArray(complaintsData?.data) ? complaintsData.data : []));
        }
      } catch (e) {
        console.error('Failed to load user complaints:', e);
        setUserComplaints([]);
      }

      // Load user requests (latex requests, barrel requests, etc.)
      try {
        const requestsRes = await fetch(`${API}/api/latex/admin/requests`, { headers: authHeaders() });
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setUserRequests(Array.isArray(requestsData) ? requestsData : (Array.isArray(requestsData?.data) ? requestsData.data : []));
        }
      } catch (e) {
        console.error('Failed to load user requests:', e);
        setUserRequests([]);
      }
    } catch (e) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const verifyAttendance = async (attendanceId, verified) => {
    try {
      setError('');
      // Attempt 1: POST with JSON body (current implementation)
      let res = await fetch(`${API}/api/manager-dashboard/attendance/verify`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ attendanceId, verified })
      });
      // If first attempt fails with 404/405, try path param POST variant.
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(`${API}/api/manager-dashboard/attendance/verify/${attendanceId}`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ verified })
        });
      }
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? (await res.json())?.message : await res.text();
        throw new Error(errText || `Verify failed (${res.status})`);
      }
      await load();
    } catch (e) {
      setError((e?.message || 'Failed to update attendance').replace(/<[^>]*>/g, ''));
    }
  };

  const approveLeave = async (id) => {
    try {
      await fetch(`${API}/api/leave/approve/${id}`, { method: 'POST', headers: authHeaders() }).then(r => { if (!r.ok) throw new Error('approve failed'); });
      await load();
    } catch { alert('Failed to approve leave'); }
  };

  const rejectLeave = async (id) => {
    try {
      await fetch(`${API}/api/leave/reject/${id}`, { method: 'POST', headers: authHeaders() }).then(r => { if (!r.ok) throw new Error('reject failed'); });
      await load();
    } catch { alert('Failed to reject leave'); }
  };


  const updateComplaint = async (id, status, resolution = '') => {
    try {
      setError('');
      const res = await fetch(`${API}/api/complaints/${id}`, { 
        method: 'PUT', 
        headers: authHeaders(), 
        body: JSON.stringify({ status, resolution }) 
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? (await res.json())?.message : await res.text();
        throw new Error(errText || `Complaint update failed (${res.status})`);
      }
      await load();
    } catch (e) {
      setError((e?.message || 'Failed to update complaint').replace(/<[^>]*>/g, ''));
    }
  };

  const updateRequest = async (id, status, notes = '') => {
    try {
      setError('');
      const res = await fetch(`${API}/api/latex/admin/requests/${id}`, { 
        method: 'PUT', 
        headers: authHeaders(), 
        body: JSON.stringify({ status, notes }) 
      });
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? (await res.json())?.message : await res.text();
        throw new Error(errText || `Request update failed (${res.status})`);
      }
      await load();
    } catch (e) {
      setError((e?.message || 'Failed to update request').replace(/<[^>]*>/g, ''));
    }
  };

  const section = () => {
    if (tab === 'staff') {
      return (
        <div className="dash-card" style={{ display:'grid', gap:16 }}>
          <h3 style={{ margin:0 }}>Staff</h3>
          <div>
            <h4 style={{ margin:'8px 0' }}>Attendance - Pending Verification</h4>
            {attendance.pending.length === 0 ? <div className="no-data">No pending records</div> : (
              <table className="dashboard-table">
                <thead>
                  <tr><th>Staff</th><th>Date</th><th>Check-In</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {attendance.pending.map(a => (
                    <tr key={a._id}>
                      <td>{a.staff?.name || '-'}</td>
                      <td>{a.date ? new Date(a.date).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString('en-IN') : '-'}</td>
                      <td>
                        <button onClick={() => verifyAttendance(a._id, true)}>Verify</button>
                        <button onClick={() => verifyAttendance(a._id, false)} style={{ marginLeft:8 }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h4 style={{ margin:'8px 0' }}>Attendance - Recently Verified</h4>
            {attendance.verified.length === 0 ? <div className="no-data">No verified records</div> : (
              <table className="dashboard-table">
                <thead>
                  <tr><th>Staff</th><th>Date</th><th>Verified At</th></tr>
                </thead>
                <tbody>
                  {attendance.verified.slice(0,20).map(a => (
                    <tr key={a._id}>
                      <td>{a.staff?.name || '-'}</td>
                      <td>{a.date ? new Date(a.date).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{a.verifiedAt ? new Date(a.verifiedAt).toLocaleString('en-IN') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h4 style={{ margin:'8px 0' }}>Leaves - Pending</h4>
            {leaves.pending.length === 0 ? <div className="no-data">No pending leaves</div> : (
              <table className="dashboard-table">
                <thead>
                  <tr><th>Staff</th><th>Dates</th><th>Reason</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {leaves.pending.map(l => (
                    <tr key={l._id}>
                      <td>{l.staff?.name || '-'}</td>
                      <td>{l.startDate ? new Date(l.startDate).toLocaleDateString('en-IN') : '-'} → {l.endDate ? new Date(l.endDate).toLocaleDateString('en-IN') : '-'}</td>
                      <td>{l.reason || '-'}</td>
                      <td>
                        <button onClick={() => approveLeave(l._id)}>Approve</button>
                        <button onClick={() => rejectLeave(l._id)} style={{ marginLeft:8 }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }
    // Users tab - Display user complaints and requests
    return (
      <div className="dash-card" style={{ display:'grid', gap:16 }}>
        <h3 style={{ margin:0 }}>Users</h3>
        
        {/* User Complaints Section */}
        <div>
          <h4 style={{ margin:'8px 0' }}>User Complaints</h4>
          {userComplaints.length === 0 ? <div className="no-data">No user complaints</div> : (
            <table className="dashboard-table">
              <thead>
                <tr><th>User</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Reported</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {userComplaints.slice(0, 10).map(complaint => (
                  <tr key={complaint._id}>
                    <td>{complaint.reportedByName || '-'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {complaint.title || '-'}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{complaint.category || '-'}</td>
                    <td>
                      <span className={`badge ${complaint.priority === 'urgent' ? 'badge-danger' : 
                        complaint.priority === 'high' ? 'badge-warning' : 
                        complaint.priority === 'medium' ? 'badge-info' : 'badge-secondary'}`}>
                        {complaint.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${complaint.status === 'resolved' ? 'badge-success' : 
                        complaint.status === 'in_progress' ? 'badge-info' : 
                        complaint.status === 'closed' ? 'badge-secondary' : 'badge-warning'}`}>
                        {complaint.status?.toUpperCase() || 'OPEN'}
                      </span>
                    </td>
                    <td>{complaint.reportedAt ? new Date(complaint.reportedAt).toLocaleDateString('en-IN') : '-'}</td>
                    <td>
                      {complaint.status === 'open' && (
                        <>
                          <button onClick={() => updateComplaint(complaint._id, 'in_progress')} style={{ marginRight: 4 }}>Start</button>
                          <button onClick={() => updateComplaint(complaint._id, 'resolved')}>Resolve</button>
                        </>
                      )}
                      {complaint.status === 'in_progress' && (
                        <button onClick={() => updateComplaint(complaint._id, 'resolved')}>Resolve</button>
                      )}
                      {complaint.status === 'resolved' && (
                        <button onClick={() => updateComplaint(complaint._id, 'closed')}>Close</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* User Requests Section */}
        <div>
          <h4 style={{ margin:'8px 0' }}>User Requests</h4>
          {userRequests.length === 0 ? <div className="no-data">No user requests</div> : (
            <table className="dashboard-table">
              <thead>
                <tr><th>User</th><th>Type</th><th>Quantity</th><th>Amount</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {userRequests.slice(0, 10).map(request => (
                  <tr key={request._id}>
                    <td>{request.user?.name || '-'}</td>
                    <td>Latex Sell</td>
                    <td>{request.quantity ? `${request.quantity}kg` : '-'}</td>
                    <td>{request.estimatedPayment ? `₹${request.estimatedPayment.toLocaleString()}` : '-'}</td>
                    <td>
                      <span className={`badge ${request.status === 'approved' ? 'badge-success' : 
                        request.status === 'processing' ? 'badge-info' : 
                        request.status === 'paid' ? 'badge-success' : 
                        request.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {request.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td>{request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                    <td>
                      {request.status === 'pending' && (
                        <>
                          <button onClick={() => updateRequest(request._id, 'approved')} style={{ marginRight: 4 }}>Approve</button>
                          <button onClick={() => updateRequest(request._id, 'rejected')}>Reject</button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button onClick={() => updateRequest(request._id, 'processing')}>Process</button>
                      )}
                      {request.status === 'processing' && (
                        <button onClick={() => updateRequest(request._id, 'paid')}>Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Complaint & action</h2>
      {error && <div className="alert error">{error}</div>}

      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {tabs.map(t => (
          <button key={t.id} className={`btn-secondary ${tab===t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      {section()}
    </div>
  );
};

export default ManagerCompleted;
