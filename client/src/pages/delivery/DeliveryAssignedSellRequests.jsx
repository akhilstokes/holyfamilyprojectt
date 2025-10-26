import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const DeliveryAssignedSellRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true); setError('');
   
    try {
      // Fetch delivery tasks and fallback sell-requests assignments in parallel
      const [tasksRes, assignedReqRes] = await Promise.all([
        fetch(`${API}/api/delivery/my`, { headers: authHeaders(), cache: 'no-cache' }).catch(() => null),
        fetch(`${API}/api/sell-requests/delivery/my-assigned`, { headers: authHeaders(), cache: 'no-cache' }).catch(() => null)
      ]);

      // Normalize delivery tasks
      let tasks = [];
      if (tasksRes && tasksRes.ok) {
        const data = await tasksRes.json();
        tasks = Array.isArray(data) ? data : [];
      }

      // Normalize assigned sell-requests
      let assigned = [];
      if (assignedReqRes && assignedReqRes.ok) {
        const data = await assignedReqRes.json();
        const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
        assigned = list.map(r => ({
          _id: `sr_${r._id}`,
          title: r._type ? `${r._type} Pickup` : (r.barrelCount != null ? `Sell Request Pickup (${r.barrelCount})` : 'Sell Request Pickup'),
          status: r.status || 'DELIVER_ASSIGNED',
          scheduledAt: r.assignedAt || r.updatedAt || r.createdAt,
          createdAt: r.createdAt
        }));
      }

      const merged = [...tasks, ...assigned];
      setRows(merged);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  // Auto-refresh every 10s
  useEffect(() => {
    const id = setInterval(() => { load(); }, 10000);
    return () => clearInterval(id);
  }, []);

  // Future: task status updates (enroute_pickup, picked_up, delivered)

  const fmt = (d) => {
    try { const dt = new Date(d); return isNaN(dt) ? '-' : dt.toLocaleString(); } catch { return '-'; }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
        <h2>My Assigned Tasks</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginBottom:8 }}>{error}</div>}
      <div style={{ overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 1000 }}>
          <thead>
            <tr>
              <th>Task</th>
              <th>Customer</th>
              <th>Barrels</th>
              <th>Status</th>
              <th>Scheduled</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id}>
                <td>{r.title || '-'}</td>
                <td>{r.customerUserId?.name || r.customerUserId?.email || '-'}</td>
                <td>{r?.meta?.barrelCount ?? (r.barrelCount ?? '-')}</td>
                <td>{r.status || 'pickup_scheduled'}</td>
                <td>{fmt(r.scheduledAt)}</td>
                <td>{fmt(r.createdAt)}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'#6b7280' }}>No assignments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryAssignedSellRequests;
