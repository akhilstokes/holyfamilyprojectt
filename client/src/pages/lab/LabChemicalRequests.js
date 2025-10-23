import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const LabChemicalRequests = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({ chemicalName: '', quantity: '', purpose: '', priority: 'normal' });
  const [catalog, setCatalog] = useState([]); // [{name, unit}]
  const [useCustom, setUseCustom] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/chem-requests/my`, { headers: authHeaders() });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
          // Friendly: no records yet
          setList([]);
          setInfo('');
          return;
        }
        if (res.status === 500) {
          setError('Unable to load requests right now (server error). Please try again later.');
          setList([]);
          return;
        }
        throw new Error(`Failed to load (${res.status}) ${String(text).slice(0,80)}`);
      }
      const data = await res.json();
      setList(Array.isArray(data?.records) ? data.records : []);
    } catch (e) {
      const raw = (e?.message || 'Failed to load').replace(/<[^>]*>/g, '');
      const msg = /\(500\)/.test(raw) ? 'Unable to load requests right now (server error). Please try again later.' : raw;
      setError(msg); setList([]);
    } finally { setLoading(false); }
  };

  const loadCatalog = async () => {
    try {
      const res = await fetch(`${API}/api/chem-requests/catalog`, { headers: authHeaders() });
      if (!res.ok) return; // silently ignore if unavailable
      const data = await res.json();
      setCatalog(Array.isArray(data?.records) ? data.records : []);
    } catch (_) { /* ignore */ }
  };

  useEffect(() => { load(); loadCatalog(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setInfo('');
    const q = Number(form.quantity);
    if (!form.chemicalName.trim() || !Number.isInteger(q) || q <= 0) { setError('Chemical name and positive whole number quantity required'); return; }
    try {
      const payload = {
        chemicalName: form.chemicalName.trim(),
        quantity: q,
        purpose: form.purpose || undefined,
        priority: form.priority || 'normal'
      };
      const res = await fetch(`${API}/api/chem-requests`, { method:'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      setForm({ chemicalName:'', quantity:'', purpose:'', priority:'normal' });
      setInfo('Request submitted');
      await load();
    } catch (e) { setError(e?.message || 'Failed to submit'); }
  };

  return (
    <div style={{ padding:16 }}>
      <h2>Chemical Requests</h2>
      {error && <div style={{ color:'tomato', marginBottom:8 }}>{error}</div>}
      {info && <div style={{ color:'#0a7', marginBottom:8 }}>{info}</div>}

      <form onSubmit={submit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:800 }}>
        <div>
          <label>Chemical</label>
          {catalog.length > 0 && !useCustom ? (
            <div style={{ display:'flex', gap:8 }}>
              <select value={form.chemicalName} onChange={e=>setForm(s=>({ ...s, chemicalName:e.target.value }))} required>
                <option value="">Select chemical</option>
                {catalog.map(c => (
                  <option key={c.name} value={c.name}>{c.name} {c.unit ? `(${c.unit})` : ''}</option>
                ))}
              </select>
              <button type="button" onClick={()=>{ setUseCustom(true); setForm(s=>({ ...s, chemicalName:'' })); }} title="Enter custom name">Custom</button>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
              <input value={form.chemicalName} onChange={e=>setForm(s=>({ ...s, chemicalName:e.target.value }))} placeholder="e.g., Ammonia" required />
              {catalog.length > 0 && (
                <button type="button" onClick={()=>setUseCustom(false)} title="Choose from list">Select</button>
              )}
            </div>
          )}
        </div>
        <div>
          <label>Quantity</label>
          <input type="number" min="1" step="1" value={form.quantity} onChange={e=>setForm(s=>({ ...s, quantity:e.target.value }))} required />
        </div>
        <div style={{ gridColumn:'1 / -1' }}>
          <label>Purpose</label>
          <textarea rows={2} value={form.purpose} onChange={e=>setForm(s=>({ ...s, purpose:e.target.value }))} placeholder="Optional"></textarea>
        </div>
        <div>
          <label>Priority</label>
          <select value={form.priority} onChange={e=>setForm(s=>({ ...s, priority:e.target.value }))}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div style={{ gridColumn:'1 / -1' }}>
          <button className="btn" type="submit">Submit</button>
        </div>
      </form>

      <div style={{ marginTop:16, overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth:820 }}>
          <thead>
            <tr>
              <th>Chemical</th>
              <th>Qty</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Purpose</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r._id}>
                <td>{r.chemicalName}</td>
                <td>{r.quantity}</td>
                <td style={{ textTransform:'capitalize' }}>{r.priority}</td>
                <td>{r.status}</td>
                <td title={r.purpose}>{r.purpose || '-'}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {list.length===0 && !loading && (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'#6b7280' }}>No requests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabChemicalRequests;
