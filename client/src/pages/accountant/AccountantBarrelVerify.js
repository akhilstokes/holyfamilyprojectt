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
  const [rate, setRate] = useState({}); // id -> marketRate

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/sell-requests/admin/all?status=TESTED`, { headers: authHeaders() });
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

  const calculate = async (id) => {
    const val = Number(rate[id]);
    if (!val || val <= 0) { alert('Enter valid market rate'); return; }
    const ok = await confirm('Calculate Amount', `Calculate using market rate ₹${val} per dry kg?`);
    if (!ok) return;
    try {
      setError('');
      const res = await fetch(`${API}/api/sell-requests/${id}/calculate`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ marketRate: val })
      });
      if (!res.ok) throw new Error(`Calculate failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || 'Calculate failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Delivery Intake / Verify</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ color:'#6b7280', fontSize: 13, marginTop: 6 }}>
        Lab provides DRC% and barrel count. Enter market rate to calculate amount. After calculation, the manager will verify and generate invoice.
      </div>
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer</th>
              <th>Phone</th>
              <th>Barrels</th>
              <th>DRC%</th>
              <th>Total (Kg)</th>
              <th>Dry Kg</th>
              <th>Market Rate (₹/dry kg)</th>
              <th>Amount (₹)</th>
              <th>₹/Barrel</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const buyerName = r.overrideFarmerName || r.farmerId?.name || r.name || '-';
              const buyerPhone = r.farmerId?.phoneNumber || r.phone || '-';
              const drc = Number(r.drcPct || 0);
              const totalKg = Number(r.totalVolumeKg || 0);
              const dryKg = Math.round(totalKg * (drc / 100) * 100) / 100;
              const mr = rate[r._id] ?? (r.marketRate ?? '');
              const amount = r.amount ? Number(r.amount) : (mr ? Math.round((Number(mr)||0) * dryKg) : null);
              const perBarrel = r.barrelCount ? (amount ? (amount / Number(r.barrelCount)) : null) : null;
              return (
                <tr key={r._id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{buyerName}</td>
                  <td>{buyerPhone}</td>
                  <td>{r.barrelCount ?? '-'}</td>
                  <td>{drc ? `${drc}%` : '-'}</td>
                  <td>{totalKg || '-'}</td>
                  <td>{isNaN(dryKg) ? '-' : dryKg}</td>
                  <td>
                    <input type="number" step="any" min="0" value={mr}
                      onChange={(e)=> setRate(prev => ({ ...prev, [r._id]: e.target.value }))}
                      style={{ width: 160 }} placeholder="e.g. 145"
                    />
                  </td>
                  <td>{amount != null && !isNaN(amount) ? amount : '-'}</td>
                  <td>{perBarrel != null && !isNaN(perBarrel) ? perBarrel.toFixed(2) : '-'}</td>
                  <td>
                    <button className="btn" onClick={() => calculate(r._id)}>Calculate</button>
                  </td>
                </tr>
              );
            })}
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
