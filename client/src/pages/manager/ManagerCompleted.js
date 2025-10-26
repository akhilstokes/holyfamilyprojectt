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
  const [issuesStaff, setIssuesStaff] = useState([]);
  const [issuesUsers, setIssuesUsers] = useState([]);

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

      let staffIssues = [];
      let userIssues = [];
      const tryJson = async (res) => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : res.text().then(() => ([]));
      };
      let r1 = await fetch(`${API}/api/requests/issues/pending?role=staff`, { headers: authHeaders() });
      if (!r1.ok) r1 = await fetch(`${API}/api/requests/issues?status=pending&role=staff`, { headers: authHeaders() });
      if (!r1.ok) r1 = await fetch(`${API}/api/requests/issues/admin/pending?role=staff`, { headers: authHeaders() });
      const j1 = await tryJson(r1);
      staffIssues = Array.isArray(j1?.data) ? j1.data : (Array.isArray(j1?.items) ? j1.items : (Array.isArray(j1) ? j1 : []));
      let r2 = await fetch(`${API}/api/requests/issues/pending?role=customer`, { headers: authHeaders() });
      if (!r2.ok) r2 = await fetch(`${API}/api/requests/issues?status=pending&role=customer`, { headers: authHeaders() });
      if (!r2.ok) r2 = await fetch(`${API}/api/requests/issues/admin/pending?role=customer`, { headers: authHeaders() });
      const j2 = await tryJson(r2);
      userIssues = Array.isArray(j2?.data) ? j2.data : (Array.isArray(j2?.items) ? j2.items : (Array.isArray(j2) ? j2 : []));
      setIssuesStaff(staffIssues);
      setIssuesUsers(userIssues);
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

  const resolveIssue = async (id, status) => {
    try {
      setError('');
      let res = await fetch(`${API}/api/requests/issues/${id}/resolve`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ resolved: status === 'resolved' }) });
      if (!res.ok) {
        res = await fetch(`${API}/api/requests/issues/${id}/status`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ status }) });
      }
      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? (await res.json())?.message : await res.text();
        throw new Error(errText || `Issue update failed (${res.status})`);
      }
      await load();
    } catch (e) {
      setError((e?.message || 'Failed to update complaint').replace(/<[^>]*>/g, ''));
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
    // Users tab placeholder (for future: user issues/requests)
    return (
      <div className="dash-card" style={{ display:'grid', gap:12 }}>
        <h3 style={{ margin:0 }}>Users</h3>
        <div className="no-data">User issues/requests view coming soon. Tell me which items to include.</div>
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
