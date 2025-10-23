import React, { useEffect, useMemo, useState } from 'react';

const LabReports = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`${base}/api/latex/reports/drc?${params.toString()}`, { headers });
      if (!res.ok) throw new Error(`Report failed (${res.status})`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []));
    } catch (e2) { setError(e2?.message || 'Failed to load report'); setRows([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { /* on mount, optionally auto-load today */ }, []);

  return (
    <div className="dash-card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Reports</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap', marginBottom: 12 }}>
        <label>From<input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} /></label>
        <label>To<input type="date" value={to} onChange={(e)=>setTo(e.target.value)} /></label>
        <button className="btn" onClick={run} disabled={loading}>{loading ? 'Loading...' : 'Run'}</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Sample ID</th>
              <th>Supplier</th>
              <th>Batch</th>
              <th>Qty (L)</th>
              <th>DRC %</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((r, i) => (
              <tr key={i}>
                <td>{r.analyzedAt ? new Date(r.analyzedAt).toLocaleDateString() : '-'}</td>
                <td>{r.sampleId || '-'}</td>
                <td>{r.supplier || '-'}</td>
                <td>{r.batch || '-'}</td>
                <td>{r.quantityLiters ?? '-'}</td>
                <td>{r.drc ?? '-'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ color: '#9aa' }}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabReports;
