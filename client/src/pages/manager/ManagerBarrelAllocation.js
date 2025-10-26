import React, { useEffect, useMemo, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const ManagerBarrelAllocation = () => {
  const [barrels, setBarrels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [prefill, setPrefill] = useState(null); // { barrelId, mfg, exp }
  const [sendDate, setSendDate] = useState(() => new Date().toISOString().slice(0,10));
  const [countStr, setCountStr] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);

  const load = async () => {
    setLoading(true); setErr(''); setMsg('');
    try {
      const [b, u] = await Promise.all([
        fetch(`${API}/api/barrels`, { headers: authHeaders() }),
        fetch(`${API}/api/user-management/staff?role=user&status=active&limit=500`, { headers: authHeaders() })
      ]);
      if (!b.ok) throw new Error(`Failed to load barrels (${b.status})`);
      const barrelsList = await b.json();
      const usersJson = u.ok ? await u.json() : { users: [] };
      const usersList = usersJson?.users || usersJson?.records || [];
      setBarrels(Array.isArray(barrelsList) ? barrelsList : []);
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (e) {
      setErr(e?.message || 'Failed to load data');
      setBarrels([]); setUsers([]);
    } finally { setLoading(false); }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API}/api/barrels/dispatch-history?limit=200`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load history (${res.status})`);
      const data = await res.json();
      const rows = Array.isArray(data?.records) ? data.records : [];
      const groups = new Map();
      for (const r of rows) {
        const user = r.recipient || '';
        const d = r.dispatchDate ? new Date(r.dispatchDate).toISOString().slice(0,10) : '';
        const key = `${user}|${d}`;
        if (!groups.has(key)) groups.set(key, { user, date: d, ids: [] });
        groups.get(key).ids.push(r.barrelId);
      }
      const grouped = Array.from(groups.values()).sort((a,b)=> (b.date> a.date?1:-1));
      setHistoryRows(grouped);
    } catch (e) {
      setErr(e?.message || 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // (moved below after availableEligible declaration)

  useEffect(() => {
    // Read URL params for preselect
    const sp = new URLSearchParams(window.location.search);
    const barrelId = sp.get('barrelId');
    const mfg = sp.get('mfg');
    const exp = sp.get('exp');
    if (barrelId) {
      setPrefill({ barrelId, mfg: mfg || '', exp: exp || '' });
      setSearch(barrelId);
    }
    load();
  }, []);

  const available = useMemo(() => barrels.filter(b => b.status !== 'disposed' && String(b.barrelId || '').toLowerCase().includes(search.toLowerCase())), [barrels, search]);
  const isEligible = (b) => {
    const assigned = b && b.assignedTo ? String(b.assignedTo) : '';
    const r = recipient ? String(recipient) : '';
    return !assigned || (assigned && r && assigned === r);
  };
  const availableEligible = useMemo(() => available.filter(isEligible), [available, recipient]);
  const availableSorted = useMemo(() => {
    const arr = [...available];
    arr.sort((a,b)=>{
      const ax = a.expiryDate ? new Date(a.expiryDate).getTime() : Number.POSITIVE_INFINITY;
      const bx = b.expiryDate ? new Date(b.expiryDate).getTime() : Number.POSITIVE_INFINITY;
      return ax - bx;
    });
    return arr.filter(isEligible);
  }, [available, recipient]);

  // When recipient changes, drop any selected barrels not eligible for this recipient
  useEffect(() => {
    if (!selected.length) return;
    const asSet = new Set(availableEligible.map(b => b.barrelId));
    const filtered = selected.filter(id => asSet.has(id));
    if (filtered.length !== selected.length) setSelected(filtered);
  }, [recipient, availableEligible, selected]);

  // Auto-select prefilled barrel once data is loaded
  useEffect(() => {
    if (!prefill || !prefill.barrelId || selected.length) return;
    const found = barrels.find(b => String(b.barrelId).toLowerCase() === String(prefill.barrelId).toLowerCase());
    if (found) setSelected([found.barrelId]);
  }, [barrels, prefill, selected.length]);

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelected(availableEligible.map(b => b.barrelId));
  const clearAll = () => setSelected([]);
  const pickByCount = () => {
    setErr(''); setMsg('');
    const n = Number(countStr);
    if (!Number.isFinite(n) || n < 1) { setErr('Enter a valid barrel count'); return; }
    const picks = availableSorted.slice(0, n).map(b=>b.barrelId);
    if (picks.length === 0) { setErr('No barrels available'); return; }
    setSelected(picks);
    setMsg(`Selected ${picks.length} barrel(s)`);
  };

  const dispatchNow = async () => {
    setErr(''); setMsg('');
    if (!recipient) { setErr('Select a recipient'); return; }
    if (selected.length === 0) { setErr('Select at least one barrel'); return; }
    if (!sendDate) { setErr('Select a sending date'); return; }
    // Confirm summary
    const recLabel = (users.find(u=>u._id===recipient)?.name) || 'user';
    const first = selected[0];
    const extra = selected.length > 1 ? ` and ${selected.length-1} more` : '';
    const ok = window.confirm(`Assign ${first}${extra} to ${recLabel} on ${sendDate}?`);
    if (!ok) return;
    setDispatching(true);
    try {
      const res = await fetch(`${API}/api/barrels/assign-batch`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ barrelIds: selected, userId: recipient, dispatchDate: sendDate })
      });
      if (!res.ok) {
        let msg = `Dispatch failed (${res.status})`;
        try { const j = await res.json(); if (j?.message) msg = j.message; else if (j?.error) msg = j.error; } catch (_) {}
        // Fallback to legacy endpoint: per-barrel dispatch
        let okCount = 0, failCount = 0;
        for (const id of selected) {
          try {
            const r2 = await fetch(`${API}/api/staff-barrels/dispatch`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({ barrelId: id, type: 'out', volumeDelta: 0, toLocation: 'dispatched', notes: `Manager dispatch to ${recipient} on ${sendDate}`, recipientUserId: recipient })
            });
            if (!r2.ok) { failCount++; continue; }
            okCount++;
          } catch (_) { failCount++; }
        }
        if (okCount > 0) {
          setMsg(`Assigned ${okCount} barrel(s) via fallback. ${failCount ? `Failed ${failCount}.` : ''}`);
          setSelected([]);
          await load();
          return;
        }
        throw new Error(msg);
      }
      const data = await res.json();
      setMsg(`Assigned ${data?.count || selected.length} barrel(s) to ${(data?.assignedTo?.name) || 'user'}`);
      setSelected([]);
      await load();
    } catch (e) {
      setErr(e?.message || 'Dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
        <h2 style={{ margin: 0 }}>Barrel Allocation</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
          <button onClick={()=>{ setShowHistory(true); loadHistory(); }}>History</button>
        </div>
      </div>
      {err && <div style={{ color:'tomato', marginTop:8 }}>{err}</div>}
      {msg && <div style={{ color:'seagreen', marginTop:8 }}>{msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12, marginTop:12 }}>
        <div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Recipient</div>
          <select value={recipient} onChange={e=>setRecipient(e.target.value)} style={{ width:'100%' }}>
            <option value="">Select user</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name || u.email || u.staffId || u._id}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Search Barrels</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ID" />
        </div>
        <div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Sending Date</div>
          <input type="date" value={sendDate} onChange={e=>setSendDate(e.target.value)} />
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
          <button type="button" onClick={selectAll}>Select All</button>
          <button type="button" onClick={clearAll}>Clear</button>
        </div>
        <div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Assign by Count</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input type="number" min="1" step="1" inputMode="numeric" value={countStr} onChange={e=>setCountStr(e.target.value.replace(/^-/,''))} placeholder="e.g. 3" style={{ width:120 }} onKeyDown={(evt)=>['e','E','+','-','.'].includes(evt.key) && evt.preventDefault()} />
            <button type="button" onClick={pickByCount}>Select</button>
          </div>
          <div style={{ fontSize:12, color:'#6b7280', marginTop:4 }}>Available: {available.length}</div>
        </div>
        {selected.length > 0 && (
          <div className="card" style={{ padding:12 }}>
            <div style={{ fontSize:12, color:'#6b7280' }}>Selected ({selected.length})</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(96px, 1fr))', gap:12, marginTop:8 }}>
              {selected.slice(0,6).map(id => (
                <div key={id} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:12, marginBottom:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{id}</div>
                  <img alt={`QR ${id}`} src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(id)}`} width={96} height={96} />
                </div>
              ))}
            </div>
            {selected.length > 6 && (
              <div style={{ fontSize:12, color:'#6b7280', marginTop:8 }}>+{selected.length - 6} more</div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 860 }}>
          <thead>
            <tr>
              <th></th>
              <th>Barrel</th>
              <th>Status</th>
              <th>Manufacture</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {available.map(b => (
              <tr key={b._id}>
                <td><input type="checkbox" checked={selected.includes(b.barrelId)} onChange={()=>toggle(b.barrelId)} disabled={!isEligible(b)} /></td>
                <td>{b.barrelId}</td>
                <td>{b.status}</td>
                <td>{b.manufactureDate ? new Date(b.manufactureDate).toISOString().slice(0,10) : '-'}</td>
                <td>{b.expiryDate ? new Date(b.expiryDate).toISOString().slice(0,10) : '-'}</td>
              </tr>
            ))}
            {available.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign:'center', color:'#6b7280' }}>No barrels found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display:'flex', justifyContent:'flex-end' }}>
        <button className="btn btn-primary" disabled={dispatching || !recipient || selected.length===0} onClick={dispatchNow}>
          {dispatching ? 'Assigning...' : `Assign ${selected.length || ''}`}
        </button>
      </div>

      {showHistory && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', width:'min(980px, 96%)', maxHeight:'84vh', borderRadius:8, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:12, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:600 }}>Barrel Dispatch History</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={loadHistory} disabled={historyLoading}>{historyLoading ? 'Loading...' : 'Refresh'}</button>
                <button onClick={()=> setShowHistory(false)}>Close</button>
              </div>
            </div>
            <div style={{ padding:12, overflow:'auto' }}>
              <table className="dashboard-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Count</th>
                    <th>Barrel IDs</th>
                    <th>Send Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((r, idx)=> (
                    <tr key={idx}>
                      <td>{r.user || '-'}</td>
                      <td>{r.ids?.length || 0}</td>
                      <td style={{ whiteSpace:'nowrap', maxWidth:480, overflow:'hidden', textOverflow:'ellipsis' }}>{(r.ids||[]).join(', ')}</td>
                      <td>{r.date || '-'}</td>
                    </tr>
                  ))}
                  {historyRows.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign:'center', color:'#6b7280' }}>{historyLoading ? 'Loading...' : 'No history found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerBarrelAllocation;
