import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useConfirm } from '../../components/common/ConfirmDialog';

const ManagerLatexBilling = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${base}/api/latex/admin/requests`, { headers });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
      setRows(list);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally { setLoading(false); }
  }, [base, headers]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    try {
      setError('');
      const ok = await confirm('Confirm action', `Are you sure to set status to ${status}?`);
      if (!ok) return;
      const res = await fetch(`${base}/api/latex/admin/requests/${id}`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(`${status} failed (${res.status})`);
      await load();
    } catch (e) { setError(e?.message || `${status} failed`); }
  };

  const verify = async (id) => {
    const ok = await confirm('Verify & Invoice', 'Verify this calculation and generate invoice?');
    if (!ok) return;
    try {
      setError('');
      const res = await fetch(`${base}/api/latex/admin/verify/${id}`, { method: 'PUT', headers });
      if (!res.ok) throw new Error(`Verify failed (${res.status})`);
      await load();
    } catch (e) { setError(e?.message || 'Verify failed'); }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0 }}>Latex Billing Requests</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 820, color: '#0f172a' }}>
          <thead>
            <tr>
              {['Buyer','Qty','DRC%','Est. Pay','Calc Amount','Rate (₹/kg)','Status','Actions'].map((h)=>(
                <th key={h} style={{ color: '#0f172a', opacity: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id}>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.user?.name || r.user?.email || r.user?._id || '-'}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.quantity}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.drcPercentage}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.estimatedPayment}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.calculatedAmount ?? '-'}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.marketRate ?? '-'}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>{r.status}</td>
                <td style={{ color:'#0f172a', opacity:1 }}>
                  {r.status === 'ACCOUNT_CALCULATED' ? (
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-sm btn-success" onClick={()=>verify(r._id)}>Verify & Invoice</button>
                    </div>
                  ) : r.status === 'VERIFIED' ? (
                    r.invoiceNumber ? (
                      <a className="btn btn-sm" href={`${base}/api/latex/invoice/${r._id}`} target="_blank" rel="noreferrer">Invoice {r.invoiceNumber}</a>
                    ) : <span>Verified</span>
                  ) : r.status === 'pending' ? (
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-sm btn-success" onClick={()=>act(r._id, 'approved')}>Approve</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>act(r._id, 'rejected')}>Reject</button>
                    </div>
                  ) : <span>-</span>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'#6b7280' }}>No requests.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerLatexBilling;


