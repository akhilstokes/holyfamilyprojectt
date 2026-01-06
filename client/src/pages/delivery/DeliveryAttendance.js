import React, { useEffect, useState } from 'react';
import { useConfirm } from '../../components/common/ConfirmDialog';
import './DeliveryTheme.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const DeliveryAttendance = () => {
  const confirm = useConfirm();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/staff-dashboard/attendance/history?limit=15`, { headers: authHeaders() });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
          setError('Attendance history is not available yet.');
          setHistory([]);
          return;
        }
        throw new Error(`Failed to load (${res.status})`);
      }
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setHistory(list);
    } catch (e) {
      const msg = (e?.message || 'Failed to load attendance').replace(/<[^>]*>/g, '');
      setError(msg);
      setHistory([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const mark = async (type) => {
    const ok = await confirm('Confirm', `Mark ${type === 'checkin' ? 'Check-In' : 'Check-Out'} now?`);
    if (!ok) return;
    try {
      setError('');
      const res = await fetch(`${API}/api/staff-dashboard/attendance/mark`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type }) });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
          setError('Attendance marking is not available yet.');
          return;
        }
        throw new Error(`Failed to mark (${res.status})`);
      }
      await load();
    } catch (e) { setError((e?.message || 'Failed to mark').replace(/<[^>]*>/g, '')); }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Attendance</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={() => mark('checkin')}>Check-In</button>
          <button className="btn" onClick={() => mark('checkout')}>Check-Out</button>
          <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Late</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r, idx) => (
              <tr key={r._id || idx}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : '-'}</td>
                <td>{r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : '-'}</td>
                <td>{r.isLate ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr><td colSpan={4} style={{ textAlign:'center', color:'#6b7280' }}>No records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryAttendance;
