import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const AdminChemicalRequests = () => {
  const [verified, setVerified] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const loadVerified = async () => {
    try {
      const res = await fetch(`${API}/api/chem-requests/admin/verified`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load verified (${res.status})`);
      const data = await res.json();
      setVerified(Array.isArray(data?.records) ? data.records : []);
    } catch (e) { setError(e?.message || 'Failed to load verified'); setVerified([]); }
  };

  const loadHistory = async () => {
    setLoading(true); setError('');
    try {
      const qs = filter ? `?status=${encodeURIComponent(filter)}` : '';
      const res = await fetch(`${API}/api/chem-requests/admin/history${qs}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const data = await res.json();
      setHistory(Array.isArray(data?.records) ? data.records : []);
    } catch (e) { setError(e?.message || 'Failed to load history'); setHistory([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadVerified(); loadHistory(); }, []);

  const sendForPurchase = async (id) => {
    try {
      const note = window.prompt('Admin note (optional)') || '';
      const res = await fetch(`${API}/api/chem-requests/${id}/send-for-purchase`, { method:'PUT', headers: authHeaders(), body: JSON.stringify({ note }) });
      if (!res.ok) throw new Error(`Send for purchase failed (${res.status})`);
      await loadVerified();
      await loadHistory();
    } catch (e) { setError(e?.message || 'Failed to send for purchase'); }
  };

  const complete = async (id) => {
    try {
      const note = window.prompt('Completion note (optional)') || '';
      const res = await fetch(`${API}/api/chem-requests/${id}/complete`, { method:'PUT', headers: authHeaders(), body: JSON.stringify({ note }) });
      if (!res.ok) throw new Error(`Complete failed (${res.status})`);
      await loadHistory();
    } catch (e) { setError(e?.message || 'Failed to complete'); }
  };

  return (
    <div style={{ padding:16 }}>
      <h2>Admin: Chemical Requests</h2>
      {error && <div style={{ color:'tomato' }}>{error}</div>}

      <section style={{ marginTop: 12 }}>
        <h3>Verified (Awaiting Purchase Instruction)</h3>
        <div style={{ overflowX:'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Chemical</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Requested By</th>
                <th>Purpose</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {verified.map(r => (
                <tr key={r._id}>
                  <td>{r.chemicalName}</td>
                  <td>{r.quantity}</td>
                  <td style={{ textTransform:'capitalize' }}>{r.priority}</td>
                  <td>{r.requestedBy?.name || r.requestedBy?.email || '-'}</td>
                  <td title={r.purpose}>{r.purpose || '-'}</td>
                  <td>{new Date(r.updatedAt).toLocaleString()}</td>
                  <td><button onClick={()=>sendForPurchase(r._id)}>Send for Purchase</button></td>
                </tr>
              ))}
              {verified.length===0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'#6b7280' }}>No verified items.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>History</h3>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }}>
          <label>Filter</label>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="MANAGER_VERIFIED">MANAGER_VERIFIED</option>
            <option value="SENT_FOR_PURCHASE">SENT_FOR_PURCHASE</option>
            <option value="PURCHASE_IN_PROGRESS">PURCHASE_IN_PROGRESS</option>
            <option value="PURCHASED">PURCHASED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="REJECTED_BY_MANAGER">REJECTED_BY_MANAGER</option>
          </select>
          <button onClick={loadHistory} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 1100 }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Chemical</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Requested By</th>
                <th>Purpose</th>
                <th>Purchase</th>
                <th>Updated</th>
                <th>Complete</th>
              </tr>
            </thead>
            <tbody>
              {history.map(r => (
                <tr key={r._id}>
                  <td>{r.status}</td>
                  <td>{r.chemicalName}</td>
                  <td>{r.quantity}</td>
                  <td style={{ textTransform:'capitalize' }}>{r.priority}</td>
                  <td>{r.requestedBy?.name || r.requestedBy?.email || '-'}</td>
                  <td title={r.purpose}>{r.purpose || '-'}</td>
                  <td>{r.purchaseInfo ? `${r.purchaseInfo.invoiceNo || ''} / ${r.purchaseInfo.supplier || ''} / ${r.purchaseInfo.quantity || ''}` : '-'}</td>
                  <td>{new Date(r.updatedAt).toLocaleString()}</td>
                  <td>{r.status !== 'COMPLETED' ? <button onClick={()=>complete(r._id)}>Complete</button> : '-'}</td>
                </tr>
              ))}
              {history.length===0 && !loading && (
                <tr><td colSpan={9} style={{ textAlign:'center', color:'#6b7280' }}>No records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminChemicalRequests;
