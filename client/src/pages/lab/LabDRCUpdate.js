import React, { useEffect, useMemo, useState } from 'react';

const LabDRCUpdate = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selected, setSelected] = useState(null); // selected request object
  const [barrelCount, setBarrelCount] = useState(0);
  const [barrels, setBarrels] = useState([]); // [{drc, liters?}]
  const [manual, setManual] = useState({ barrelId: '', buyer: '', qty: '', drc: '', barrels: '' });
  const [history, setHistory] = useState([]);

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

  const loadQueue = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${base}/api/latex/pending-tests`, { headers });
      if (!res.ok) throw new Error(`Failed to load queue (${res.status})`);
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setQueue(items);
    } catch (e2) {
      setError(e2?.message || 'Failed to load');
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const manualValid = useMemo(() => {
    if (!manual.barrelId.trim()) return false;
    if (!manual.buyer.trim()) return false;
    const q = Number(manual.qty);
    if (!(q > 0)) return false;
    const d = Number(manual.drc);
    if (!(d >= 0 && d <= 100)) return false;
    if (manual.barrels !== '' && (!Number.isInteger(Number(manual.barrels)) || Number(manual.barrels) < 0)) return false;
    return true;
  }, [manual]);

  const submitManual = async (confirmAndSend=false) => {
    if (!manualValid) return;
    setMessage(''); setError('');
    try {
      if (confirmAndSend) {
        const ok = window.confirm('Create test record and send to Accounts?');
        if (!ok) return;
      }
      setSaving(true);
      const res = await fetch(`${base}/api/latex/manual-test`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          externalSampleId: manual.barrelId.trim(),
          buyerName: manual.buyer.trim(),
          quantityLiters: Number(manual.qty),
          drcPercentage: Number(manual.drc),
          barrelCount: manual.barrels === '' ? undefined : Number(manual.barrels)
        })
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      setMessage('Manual DRC test recorded');
      setManual({ barrelId: '', buyer: '', qty: '', drc: '', barrels: '' });
      await Promise.all([loadQueue(), loadHistory()]);
    } catch (e) {
      setError(e?.message || 'Failed to create manual test');
    } finally { setSaving(false); }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${base}/api/latex/reports/drc`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setHistory(items.slice(0, 50));
    } catch (_) {}
  };

  useEffect(() => { loadQueue(); loadHistory(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pre = params.get('customer');
      if (pre) setCustomerName(pre);
    } catch (_) {}
  }, []);

  const submitDRC = async (requestId, drc, barrelArray, extras = {}) => {
    setMessage(''); setError('');
    try {
      setSaving(true);
      const baseBody = barrelArray && barrelArray.length
        ? { barrels: barrelArray.map(b => ({ drc: Number(b.drc), liters: b.liters != null && b.liters !== '' ? Number(b.liters) : undefined })) }
        : { drcPercentage: Number(drc) };
      const body = {
        ...baseBody,
        ...(extras.overrideBuyerName !== undefined ? { overrideBuyerName: extras.overrideBuyerName } : {}),
        ...(extras.barrelCount !== undefined ? { barrelCount: extras.barrelCount } : {}),
      };
      const res = await fetch(`${base}/api/latex/test/${requestId}`, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setMessage(`DRC updated for ${requestId}`);
      await loadQueue();
    } catch (e2) {
      setError(e2?.message || 'Failed to update DRC');
    } finally {
      setSaving(false);
    }
  };

  const candidates = useMemo(() => {
    const term = customerName.trim().toLowerCase();
    if (!term) return [];
    return queue.filter(q => (q.user?.name || '').toLowerCase().includes(term)).slice(0, 10);
  }, [customerName, queue]);

  const onPick = (req) => {
    setSelected(req);
    setCustomerName(req.user?.name || '');
  };

  useEffect(() => {
    // reset barrel inputs when count changes
    const n = Number(barrelCount) || 0;
    setBarrels(prev => {
      const arr = [...prev];
      if (arr.length > n) return arr.slice(0, n);
      while (arr.length < n) arr.push({ drc: '', liters: '' });
      return arr;
    });
  }, [barrelCount]);

  return (
    <div className="dash-card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>DRC Test</h3>
      <p style={{ color: '#64748b' }}>Record Dry Rubber Content for samples currently under testing.</p>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Manual DRC Entry */}
      <div style={{ display: 'grid', gap: 8, marginBottom: 12, background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:6, padding:10 }}>
        <div style={{ fontWeight:600 }}>Manual Entry</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input placeholder="Barrel/Sample ID" value={manual.barrelId} onChange={e=>setManual(m=>({ ...m, barrelId: e.target.value }))} style={{ width: 180, borderColor: !manual.barrelId && '#dc3545' }} />
          <input placeholder="Buyer name" value={manual.buyer} onChange={e=>setManual(m=>({ ...m, buyer: e.target.value }))} style={{ width: 220, borderColor: !manual.buyer && '#dc3545' }} />
          <input type="number" step="any" min={0.01} placeholder="Qty (L)" value={manual.qty} onChange={e=>setManual(m=>({ ...m, qty: e.target.value }))} style={{ width: 140 }} />
          <input type="number" step="any" min={0} max={100} placeholder="DRC %" value={manual.drc} onChange={e=>setManual(m=>({ ...m, drc: e.target.value }))} style={{ width: 120 }} />
          <input type="number" step="1" min={0} placeholder="# Barrels (opt)" value={manual.barrels} onChange={e=>setManual(m=>({ ...m, barrels: e.target.value }))} style={{ width: 160 }} />
          <button className="btn" type="button" disabled={!manualValid || saving} onClick={()=>submitManual(false)}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn btn-success" type="button" disabled={!manualValid || saving} onClick={()=>submitManual(true)}>{saving ? 'Submitting...' : 'Complete & Send'}</button>
        </div>
      </div>


      {/* Customer selection + per-barrel entry */}
      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search Customer Name" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} style={{ width: 260 }} />
          <button type="button" className="btn" onClick={()=>setCustomerName(customerName)} disabled={loading}>Find</button>
          {selected && <span style={{ color: '#059669' }}>Selected: {selected._id}</span>}
        </div>
        {!!customerName && !selected && candidates.length > 0 && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}>
            {candidates.map((c) => (
              <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.user?.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Qty: {c.quantity ?? c.quantityLiters ?? '-'} • ID: {c._id}</div>
                </div>
                <button className="btn" type="button" onClick={()=>onPick(c)} disabled={saving}>Select</button>
              </div>
            ))}
          </div>
        )}
        {!!customerName && !selected && candidates.length === 0 && !loading && (
          <div style={{ color:'#6b7280' }}>No matching customers found.</div>
        )}

        {selected && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" min={0} placeholder="# Barrels" value={barrelCount} onChange={(e)=>setBarrelCount(e.target.value)} style={{ width: 140 }} />
              <span style={{ color: '#6b7280' }}>Enter DRC for each barrel{` (customer: ${selected.user?.name || '-'})`}</span>
            </div>
            {barrels.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ width: 70 }}>Barrel {i+1}</span>
                <input type="number" step="any" placeholder="DRC %" value={b.drc} onChange={(e)=>{
                  const v = e.target.value; setBarrels(arr=>{ const c=[...arr]; c[i]={...c[i], drc:v}; return c;});
                }} style={{ width: 120, borderColor: (!b.drc && b.drc !== 0) ? '#dc3545' : '' }} />
                <input type="number" step="any" placeholder="Liters (optional)" value={b.liters} onChange={(e)=>{
                  const v = e.target.value; setBarrels(arr=>{ const c=[...arr]; c[i]={...c[i], liters:v}; return c;});
                }} style={{ width: 160 }} />
              </div>
            ))}
            <div>
              <button className="btn" type="button" disabled={saving || !selected || barrels.length===0 || barrels.some(b=>!b.drc)}
                onClick={async ()=>{
                  await submitDRC(selected._id, null, barrels);
                  setSelected(null); setCustomerName(''); setBarrelCount(0); setBarrels([]);
                }}
              >{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 840 }}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Buyer</th>
                <th>Qty (L)</th>
                <th>DRC (%)</th>
                <th>Barrels</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.length ? queue.map((s, idx) => (
                <Row key={idx} s={s} onSubmit={submitDRC} saving={saving} />
              )) : (
                <tr><td colSpan={7} style={{ color: '#6b7280', textAlign:'center', padding:12 }}>No pending samples.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent DRC History */}
      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: '8px 0' }}>Recent DRC History</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 820 }}>
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
              {history.length ? history.map((r, i) => (
                <tr key={i}>
                  <td>{r.analyzedAt ? new Date(r.analyzedAt).toLocaleDateString() : '-'}</td>
                  <td>{r.sampleId || '-'}</td>
                  <td>{r.supplier || '-'}</td>
                  <td>{r.batch || '-'}</td>
                  <td>{r.quantityLiters ?? '-'}</td>
                  <td>{r.drc ?? '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ color: '#9aa' }}>No recent history</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
;

const Row = ({ s, onSubmit, saving }) => {
  const [drc, setDrc] = useState('');
  const [buyerName, setBuyerName] = useState(s.user?.name || s.user?.email || '');
  const [barrelCount, setBarrelCount] = useState(
    s.barrelCount != null ? String(s.barrelCount) : ''
  );
  const id = s._id || s.id;
  const buyer = s.user?.name || s.userName || s.buyerName || '-';
  const qty = s.quantity ?? s.quantityLiters ?? '-';
  const drcShown = s.drcPercentage != null ? Number(s.drcPercentage).toFixed(2) : '-';
  const barrels = s.barrelCount ?? s.meta?.barrels ?? s.barrels ?? '-';
  return (
    <tr>
      <td>{id}</td>
      <td>
        <input value={buyerName} onChange={(e)=>setBuyerName(e.target.value)} placeholder="Buyer name" />
      </td>
      <td>{qty}</td>
      <td>{drcShown}</td>
      <td>
        <input type="number" min="0" step="1" value={barrelCount}
          onChange={(e)=>setBarrelCount(e.target.value)} placeholder="#" style={{ width: 90 }} />
      </td>
      <td>{s.status || 'Testing'}</td>
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" step="any" placeholder="DRC %" value={drc} onChange={(e)=>setDrc(e.target.value)} style={{ width: 100, borderColor: !drc ? '#dc3545' : '' }} />
          <button className="btn" onClick={()=>onSubmit(id, drc, null, { overrideBuyerName: buyerName, barrelCount: barrelCount ? Number(barrelCount) : undefined })} disabled={saving || !drc}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn btn-success" onClick={async ()=>{
            if (!drc) { alert('Enter DRC%'); return; }
            if (!buyerName.trim()) { alert('Enter buyer name'); return; }
            const confirmSend = window.confirm('Mark test complete and send to Accounts?');
            if (!confirmSend) return;
            await onSubmit(id, drc, null, { overrideBuyerName: buyerName.trim(), barrelCount: barrelCount ? Number(barrelCount) : undefined });
          }} disabled={saving}>{saving ? 'Submitting...' : 'Complete & Send to Accounts'}</button>
        </div>
      </td>
    </tr>
  );
};

export default LabDRCUpdate;
