import React, { useEffect, useState, useMemo } from 'react';

const AccountantAttendanceMark = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${base}/api/attendance/today-all`, { headers });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data = await res.json();
      setRows(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (e) { setError(e?.message || 'Failed to load'); setRows([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const mark = async (staffId, type) => {
    setMessage(''); setError('');
    try {
      setSaving(true);
      const res = await fetch(`${base}/api/attendance/admin/mark`, { method: 'POST', headers, body: JSON.stringify({ staffId, type }) });
      if (!res.ok) throw new Error(`Mark failed (${res.status})`);
      setMessage(`${type === 'check_in' ? 'Checked in' : 'Checked out'} successfully`);
      await load();
    } catch (e) { setError(e?.message || 'Failed to mark'); } finally { setSaving(false); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Accountant - Mark Attendance</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={load} disabled={loading}>Refresh</button>
      </div>

      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Loading...</td></tr>
            ) : rows.length ? rows.map((r, i) => (
              <tr key={i}>
                <td>{r.staff?.name || r.staff?.email || '-'}</td>
                <td>{r.staff?.role || '-'}</td>
                <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}</td>
                <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}</td>
                <td>{r.status || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" disabled={saving || !!r.checkIn} onClick={() => mark(r.staff?._id || r.staff?.id, 'check_in')}>Check In</button>
                    <button className="btn" disabled={saving || !r.checkIn || !!r.checkOut} onClick={() => mark(r.staff?._id || r.staff?.id, 'check_out')}>Check Out</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ color: '#6b7280' }}>No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantAttendanceMark;
