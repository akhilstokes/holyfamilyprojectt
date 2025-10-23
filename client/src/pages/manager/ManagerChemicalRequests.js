import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const ManagerChemicalRequests = () => {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // History state
  const [history, setHistory] = useState([]);
  const [histError, setHistError] = useState('');
  const [histLoading, setHistLoading] = useState(false);
  const [histFilter, setHistFilter] = useState(''); // empty => all

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/chem-requests/manager/pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setPending(Array.isArray(data?.records) ? data.records : []);
    } catch (e) {
      setError(e?.message || 'Failed to load'); setPending([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const verify = async (id) => {
    try {
      const note = window.prompt('Manager note (optional)') || '';
      const res = await fetch(`${API}/api/chem-requests/${id}/verify`, { method:'PUT', headers: authHeaders(), body: JSON.stringify({ note }) });
      if (!res.ok) throw new Error(`Verify failed (${res.status})`);
      await load();
      await loadHistory();
    } catch (e) { setError(e?.message || 'Verify failed'); }
  };

  const reject = async (id) => {
    try {
      const note = window.prompt('Rejection reason (optional)') || '';
      const res = await fetch(`${API}/api/chem-requests/${id}/reject`, { method:'PUT', headers: authHeaders(), body: JSON.stringify({ note }) });
      if (!res.ok) throw new Error(`Reject failed (${res.status})`);
      await load();
      await loadHistory();
    } catch (e) { setError(e?.message || 'Reject failed'); }
  };

  // History loader (manager has access via adminOrManager)
  const loadHistory = async () => {
    setHistLoading(true); setHistError('');
    try {
      const qs = histFilter ? `?status=${encodeURIComponent(histFilter)}` : '';
      const res = await fetch(`${API}/api/chem-requests/admin/history${qs}` , { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const data = await res.json();
      setHistory(Array.isArray(data?.records) ? data.records : []);
    } catch (e) { setHistError(e?.message || 'Failed to load history'); setHistory([]); }
    finally { setHistLoading(false); }
  };

  useEffect(() => { loadHistory(); }, [histFilter]);

  return (
    <div style={{ padding:16 }}>
      <h2>Manager: Chemical Requests</h2>
      {error && <div style={{ color:'tomato' }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div style={{ overflowX:'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Chemical</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Requested By</th>
                <th>Created</th>
                <th>Verify</th>
                <th>Reject</th>
              </tr>
            </thead>
            <tbody>
              {pending.map(r => (
                <tr key={r._id}>
                  <td>{r.chemicalName}</td>
                  <td>{r.quantity}</td>
                  <td style={{ textTransform:'capitalize' }}>{r.priority}</td>
                  <td>{r.requestedBy?.name || r.requestedBy?.email || '-'}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td><button onClick={()=>verify(r._id)}>Verify</button></td>
                  <td><button onClick={()=>reject(r._id)}>Reject</button></td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'#6b7280' }}>No pending requests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h3>Chemical History</h3>
        {histError && <div style={{ color:'tomato' }}>{histError}</div>}
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
          <label>Status:</label>
          <select value={histFilter} onChange={(e)=> setHistFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="MANAGER_VERIFIED">MANAGER_VERIFIED</option>
            <option value="SENT_FOR_PURCHASE">SENT_FOR_PURCHASE</option>
            <option value="PURCHASE_IN_PROGRESS">PURCHASE_IN_PROGRESS</option>
            <option value="PURCHASED">PURCHASED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED_BY_MANAGER">REJECTED_BY_MANAGER</option>
          </select>
          <button onClick={loadHistory}>Refresh</button>
        </div>
        {histLoading ? <div>Loading history...</div> : (
          <div style={{ overflowX:'auto' }}>
            <table className="dashboard-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>Chemical</th>
                  <th>Qty</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Requested By</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {history.map(r => (
                  <tr key={r._id}>
                    <td>{r.chemicalName}</td>
                    <td>{r.quantity}</td>
                    <td style={{ textTransform:'capitalize' }}>{r.priority}</td>
                    <td>{r.status}</td>
                    <td>{r.requestedBy?.name || r.requestedBy?.email || '-'}</td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                    <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign:'center', color:'#6b7280' }}>No history records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerChemicalRequests;
