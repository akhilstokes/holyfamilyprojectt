import React, { useEffect, useMemo, useState } from 'react';
import { listAttendance } from '../../services/adminService';

const iso = (d) => new Date(d).toISOString().slice(0, 10);

const LiveCheckins = () => {
  const today = useMemo(() => iso(new Date()), []);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await listAttendance({ from: today, to: today, limit: 500 });
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
      const live = list.filter((r) => r.checkInAt && !r.checkOutAt);
      setRows(live);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Live Check-ins</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Staff ID</th>
              <th>Check In</th>
              <th>Late</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const checkInAt = r.checkInAt ? new Date(r.checkInAt) : null;
              const duration = checkInAt ? (Date.now() - checkInAt.getTime()) : 0;
              const fmt = (ms) => {
                const total = Math.floor(ms / 1000);
                const h = String(Math.floor(total / 3600)).padStart(2, '0');
                const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
                const s = String(total % 60).padStart(2, '0');
                return `${h}:${m}:${s}`;
              };
              return (
                <tr key={`${r.staff}-${r.date}`}>
                  <td>{r.staffName || '-'}</td>
                  <td>{r.staff || '-'}</td>
                  <td>{checkInAt ? checkInAt.toLocaleTimeString() : '-'}</td>
                  <td>{r.isLate ? 'Yes' : 'No'}</td>
                  <td>{checkInAt ? fmt(duration) : '-'}</td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9aa'}}>
                No one is currently checked in.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveCheckins;
