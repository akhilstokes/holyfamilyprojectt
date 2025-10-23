import React, { useCallback, useEffect, useMemo, useState } from 'react';

const ManagerLeaveHistory = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateError, setDateError] = useState('');

  const show = (v) => {
    if (v == null) return '-';
    if (typeof v === 'object') return v.name || v.email || v._id || '-';
    return String(v);
  };

  const safeDate = (d) => {
    if (!d) return '-';
    try { const dt = new Date(d); return Number.isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('en-IN'); } catch { return '-'; }
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const qs = new URLSearchParams({
        status: status || '',
        from: from || '',
        to: to || ''
      });
      const endpoints = [
        `${base}/api/leave/history?${qs}`,
        `${base}/api/leave/admin/all?${qs}`,
        `${base}/api/leave/all?${qs}`,
        `${base}/api/leave/manager/history?${qs}`
      ];

      let list = [];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) continue;
          const data = await res.json();
          const items = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.records) ? data.records : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])));
          if (items.length) { list = items; break; }
        } catch {}
      }
      setRows(list);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [base, headers, status, from, to]);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(r => {
    const okStatus = status ? String(r.status || '').toLowerCase() === String(status).toLowerCase() : true;
    const who = [
      r.staffName,
      r.staff?.name,
      r.staff?.fullName,
      r.staff?.email,
      r.staff?.staffId,
      r.staffId,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const okQ = q ? who.includes(q.toLowerCase()) : true;
    const ts = new Date(r.startDate || r.fromDate || r.from).getTime();
    const te = new Date(r.endDate || r.toDate || r.to).getTime();
    const fOk = from ? (ts >= new Date(from).getTime()) : true;
    const tOk = to ? (te <= new Date(to).getTime()) : true;
    return okStatus && okQ && fOk && tOk;
  });

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0 }}>Staff Leave History</h2>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}

      <div style={{ display:'flex', gap:12, alignItems:'end', flexWrap:'wrap', marginTop: 12 }}>
        <label style={{ display:'grid' }}>
          <span>Search (name/email)</span>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g. John" />
        </label>
        <label style={{ display:'grid' }}>
          <span>Status</span>
          <select value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <label style={{ display:'grid' }}>
          <span>From</span>
          <input 
            type="date" 
            value={from} 
            onChange={(e)=>{ 
              const v = e.target.value; 
              // If current 'to' is before new 'from', push 'to' to new 'from'
              if (to && to < v) {
                setTo(v);
              }
              setFrom(v); 
              setDateError('');
            }} 
          />
        </label>
        <label style={{ display:'grid' }}>
          <span>To</span>
          <input 
            type="date" 
            value={to} 
            min={from}
            onChange={(e)=>{ 
              const v = e.target.value; 
              if (from && v < from) {
                setDateError('To date cannot be earlier than From date');
                // keep min valid; snap to from
                setTo(from);
                return;
              }
              setDateError('');
              setTo(v); 
            }} 
          />
        </label>
        <button className="btn" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
      </div>
      {dateError && (
        <div style={{ color:'tomato', marginTop: 6 }}>{dateError}</div>
      )}

      <div className="dash-card" style={{ marginTop: 12, overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Staff ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l._id || `${l.staffId}-${l.startDate}-${l.endDate}`}>
                <td>{l.staff?.name || l.staff?.email || l.staffName || '-'}</td>
                <td>{l.staff?.staffId || l.staffId || '-'}</td>
                <td>{l.leaveType || l.type || '-'}</td>
                <td>{l.status || '-'}</td>
                <td>{safeDate(l.startDate || l.fromDate || l.from)}</td>
                <td>{safeDate(l.endDate || l.toDate || l.to)}</td>
                <td title={l.reason}>{l.reason || '-'}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'#6b7280' }}>No leave records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerLeaveHistory;
