import React, { useEffect, useState } from 'react';
import { useConfirm } from '../../components/common/ConfirmDialog';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const AccountantBarrelVerify = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const [price, setPrice] = useState({}); // id -> price

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/sell-requests/admin/all?status=REQUESTED`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
      setRows(list);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    const val = Number(price[id]);
    if (!val || val <= 0) { alert('Enter valid price per barrel'); return; }
    const ok = await confirm('Approve Intake', `Approve with price ₹${val}/barrel?`);
    if (!ok) return;
    try {
      setError('');
      const res = await fetch(`${API}/api/sell-requests/${id}/approve`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ pricePerBarrel: val })
      });
      if (!res.ok) throw new Error(`Approve failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || 'Approve failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Delivery Intake / Verify</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Barrels</th>
              <th>Notes</th>
              <th>Price/Barrel (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.barrelCount}</td>
                <td>{r.notes || '-'}</td>
                <td>
                  <input type="number" step="any" min="0" value={price[r._id] ?? ''} onChange={(e)=> setPrice(prev => ({ ...prev, [r._id]: e.target.value }))} style={{ width: 120 }} />
                </td>
                <td>
                  <button className="btn" onClick={() => approve(r._id)}>Approve</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'#6b7280' }}>No pending intakes.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantBarrelVerify;
