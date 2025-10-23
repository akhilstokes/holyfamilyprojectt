import React, { useEffect, useState } from 'react';

const ManagerHangerSpace = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [threshold, setThreshold] = useState(0.75); // 75%

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [resSpaces, resCap] = await Promise.all([
        fetch(`${base}/api/hanger-spaces`, { headers }),
        fetch(`${base}/api/capacity`, { headers })
      ]);
      if (!resSpaces.ok) throw new Error(`Failed to load spaces (${resSpaces.status})`);
      const data = await resSpaces.json();
      setRows(Array.isArray(data) ? data : (Array.isArray(data?.records) ? data.records : []));
      if (resCap.ok) {
        const cap = await resCap.json();
        setCapacity(cap);
      } else {
        setCapacity(null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [load]);

  const mark = async (id, status) => {
    try {
      setError('');
      const ok = window.confirm(`Are you sure you want to mark this slot as ${status}?`);
      if (!ok) return;
      const res = await fetch(`${base}/api/hanger-spaces/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      await load();
    } catch (e) { setError(e?.message || 'Update failed'); }
  };

  const updateProduct = async (id, currentStatus, product, prevProduct = '') => {
    try {
      setError('');
      const labelPrev = prevProduct || '-';
      const labelNext = product || '-';
      const ok = window.confirm(`Change product from "${labelPrev}" to "${labelNext}"?`);
      if (!ok) return;
      const body = { status: currentStatus || 'vacant', product: product || '' };
      const res = await fetch(`${base}/api/hanger-spaces/${id}/status`, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Failed to set product (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to set product');
    }
  };

  return (
    <div style={{ padding: 16, color: '#0f172a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Hanger Space</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
      {capacity && (
        <div className="dash-card" style={{ marginTop: 12, padding: 12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Capacity Utilization</div>
              {(() => {
                const used = capacity?.godown?.usedPallets || 0;
                const total = capacity?.godown?.totalPallets || 0;
                const pct = total > 0 ? used / total : 0;
                const pctLabel = `${Math.round(pct * 100)}% Full`;
                const critical = pct >= threshold;
                return (
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                      <div style={{ minWidth: 180, height: 10, background:'#e5e7eb', borderRadius: 4, overflow:'hidden' }}>
                        <div style={{ width: `${Math.min(100, Math.round(pct * 100))}%`, height:'100%', background: critical ? '#ef4444' : '#10b981' }} />
                      </div>
                      <div style={{ fontWeight: 700 }}>{pctLabel}</div>
                    </div>
                    <div style={{ color:'#64748b', marginTop: 4 }}>Used {used} / {total} pallets</div>
                    {critical && (
                      <div style={{ marginTop: 8, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', padding:8, borderRadius:6 }}>
                        Alert: Capacity is approaching a critical limit.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div>
              <label style={{ fontSize: 12, color:'#64748b' }}>Alert Threshold (%)
                <input type="number" min={1} max={100} value={Math.round(threshold*100)} onChange={(e)=>{
                  const v = Math.min(100, Math.max(1, Number(e.target.value)||75));
                  setThreshold(v/100);
                }} style={{ marginLeft: 8, width: 80 }} />
              </label>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 720, color: '#0f172a' }}>
          <thead>
            <tr>
              {['Block','Row','Col','Status','Product','Actions'].map(h => (
                <th key={h} style={{ color: '#0f172a', opacity: 1, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td style={{ color: '#0f172a' }}>{r.block}</td>
                <td style={{ color: '#0f172a' }}>{r.row}</td>
                <td style={{ color: '#0f172a' }}>{r.col}</td>
                <td style={{ color: '#0f172a' }}>{r.status}</td>
                <td style={{ color: '#0f172a' }}>
                  <select 
                    value={r.product || ''}
                    onChange={(e)=>updateProduct(r._id, r.status, e.target.value, r.product || '')}
                    style={{ padding: 6, border: '1px solid #e5e7eb', borderRadius: 6 }}
                  >
                    <option value="">Select item</option>
                    <option value="Barrel">1) Barrel</option>
                    <option value="Empty Barrel">2) Empty Barrel</option>
                    <option value="Rubber Band">3) Rubber Band</option>
                  </select>
                </td>
                <td style={{ color: '#0f172a' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-success" disabled={r.status === 'occupied'} onClick={() => mark(r._id, 'occupied')}>Mark Occupied</button>
                    <button className="btn btn-sm btn-outline" disabled={r.status === 'vacant'} onClick={() => mark(r._id, 'vacant')}>Mark Vacant</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No slots.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerHangerSpace;


