import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const LabSellTests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drcMap, setDrcMap] = useState({}); // id -> drc
  const [nameMap, setNameMap] = useState({}); // id -> farmer name (editable)
  const [barrelMap, setBarrelMap] = useState({}); // id -> #barrels (editable)
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      // Show requests awaiting DRC from lab-safe endpoint
      const res = await fetch(`${API}/api/sell-requests/lab/pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.records) ? data.records : [];
      setRows(list);
      const nm = {}; const bm = {}; const dm = {};
      list.forEach(r=>{
        nm[r._id] = r.farmerId?.name || r.farmerId?.email || '';
        bm[r._id] = r.barrelCount ?? '';
        dm[r._id] = r.drcPct ?? '';
      });
      setNameMap(nm); setBarrelMap(bm); setDrcMap(dm);
    } catch (e) {
      setError(e?.message || 'Failed to load'); setRows([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveDrc = async (id) => {
    const value = Number(drcMap[id]);
    if (Number.isNaN(value) || value < 0 || value > 100) { alert('Enter valid DRC% (0-100)'); return; }
    try {
      setSavingId(id);
      const res = await fetch(`${API}/api/sell-requests/${id}/drc-test`, { method:'PUT', headers: authHeaders(), body: JSON.stringify({ drcPct: value }) });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await load();
    } catch (e) { alert(e?.message || 'Failed to save'); }
    finally { setSavingId(null); }
  };

  const sendToAccounts = async (id) => {
    const farmerName = String(nameMap[id] || '').trim();
    const drcPct = Number(drcMap[id]);
    const barrelCount = Number(barrelMap[id]);
    if (!farmerName) { alert('Farmer name is required'); return; }
    if (!(drcPct >= 0 && drcPct <= 100)) { alert('Enter valid DRC% (0-100)'); return; }
    if (!Number.isInteger(barrelCount) || barrelCount <= 0) { alert('Enter positive whole number for # Barrels'); return; }
    try {
      setSavingId(id);
      const res = await fetch(`${API}/api/sell-requests/${id}/submit-for-accounts`, {
        method:'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ farmerName, drcPct, barrelCount })
      });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      await load();
    } catch (e) {
      alert(e?.message || 'Failed to submit to Accounts');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ padding:16 }}>
      <h2>Pending DRC Tests</h2>
      {error && <div style={{ color:'tomato' }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div style={{ overflowX:'auto' }}>
          <table className="dashboard-table" style={{ minWidth:980 }}>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Volume (Kg)</th>
                <th>Status</th>
                <th>DRC%</th>
                <th># Barrels</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r._id}>
                  <td>
                    <input value={nameMap[r._id] ?? ''} onChange={e=>setNameMap(s=>({ ...s, [r._id]: e.target.value }))} placeholder="Farmer name" />
                  </td>
                  <td>{r.totalVolumeKg ?? '-'}</td>
                  <td>{r.status}</td>
                  <td>
                    <input type="number" min="0" max="100" step="0.1" value={drcMap[r._id] ?? ''}
                      onChange={e=>setDrcMap(s=>({ ...s, [r._id]: e.target.value }))} placeholder="%" />
                  </td>
                  <td>
                    <input type="number" min="1" step="1" value={barrelMap[r._id] ?? ''}
                      onChange={e=>setBarrelMap(s=>({ ...s, [r._id]: e.target.value }))} placeholder="#" />
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>saveDrc(r._id)} disabled={savingId===r._id}>{savingId===r._id? 'Saving...':'Save'}</button>
                      <button type="button" onClick={()=>sendToAccounts(r._id)} disabled={savingId===r._id}>{savingId===r._id? 'Submitting...':'Send to Accounts'}</button>
                      <button type="button" onClick={()=>{
                        const nm = r.farmerId?.name || r.farmerId?.email || '';
                        const url = `/lab/update-drc?customer=${encodeURIComponent(nm)}`;
                        window.location.assign(url);
                      }}>Open in Update DRC</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={5} style={{ textAlign:'center', color:'#6b7280' }}>No pending tests.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LabSellTests;
