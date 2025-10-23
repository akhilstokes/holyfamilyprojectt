import React, { useEffect, useState } from 'react';
import { listPendingRates, editRate, verifyRate } from '../../services/rateService';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminRateVerification = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState({}); // id -> { companyRate, marketRate, effectiveDate, notes }
  const [live, setLive] = useState(null); // combined admin+rubber board view

  const load = async () => {
    setLoading(true); setError('');
    try {
      const list = await listPendingRates('latex60');
      setPending(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load pending rates');
    } finally {
      setLoading(false);
    }
  };

  const loadCombined = async () => {
    try {
      const { data } = await axios.get(`${API}/api/rates/latex/today`);
      setLive(data);
    } catch (_) { setLive(null); }
  };

  useEffect(() => { load(); loadCombined(); }, []);

  const startEdit = (r) => setEditing({
    id: r._id,
    companyRate: r.companyRate ?? '',
    marketRate: r.marketRate ?? '',
    effectiveDate: r.effectiveDate ? String(new Date(r.effectiveDate).toISOString().slice(0,10)) : '',
    notes: r.notes ?? ''
  });

  const saveEdit = async () => {
    if (!editing?.id) return;
    try {
      await editRate(editing.id, {
        companyRate: parseFloat(editing.companyRate),
        marketRate: parseFloat(editing.marketRate),
        effectiveDate: editing.effectiveDate,
        notes: editing.notes,
        product: 'latex60'
      });
      setEditing({});
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Failed to update');
    }
  };

  const doVerify = async (id) => {
    try {
      await verifyRate(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Failed to verify');
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Admin Rate Verification</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={loadCombined}>Refresh Live</button>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh Pending'}</button>
        </div>
      </div>

      {live && (
        <div className="dash-card" style={{ marginTop: 12 }}>
          <h4 style={{ marginTop: 0 }}>Combined View (Admin latest + Rubber Board)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Admin Latest</div>
              {live.admin ? (
                <div>
                  <div>Company: {fmt(live.admin.companyRate)}</div>
                  <div>Market: {fmt(live.admin.marketRate)}</div>
                  <div>Date: {new Date(live.admin.effectiveDate).toLocaleDateString('en-IN')}</div>
                </div>
              ) : <div>—</div>}
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Rubber Board</div>
              <div>Source: {live.market?.source || '—'}</div>
              <div>As on: {live.market?.asOnDate || '—'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Kottayam: {live.market?.markets?.Kottayam ?? '—'}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Kochi: {live.market?.markets?.Kochi ?? '—'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="dash-card" style={{ marginTop: 12 }}>
        <h4 style={{ marginTop: 0 }}>Pending Proposals</h4>
        {error && <div className="alert error">{error}</div>}
        {loading ? (
          <p>Loading…</p>
        ) : pending.length === 0 ? (
          <div className="no-data">No pending proposals</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Effective</th>
                  <th>Company</th>
                  <th>Market</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.effectiveDate).toLocaleDateString('en-IN')}</td>
                    <td>{fmt(r.companyRate)}</td>
                    <td>{fmt(r.marketRate)}</td>
                    <td>{r.notes || '—'}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary" onClick={() => startEdit(r)}>Edit</button>
                      <button className="btn" onClick={() => doVerify(r._id)}>Verify & Publish</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing?.id && (
        <div className="dash-card" style={{ marginTop: 12 }}>
          <h4 style={{ marginTop: 0 }}>Edit Proposal</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <label>
              <div>Effective Date</div>
              <input type="date" value={editing.effectiveDate} onChange={(e)=>setEditing(s=>({...s, effectiveDate: e.target.value}))} />
            </label>
            <label>
              <div>Company Rate</div>
              <input type="number" min={0} step={0.01} value={editing.companyRate} onChange={(e)=>setEditing(s=>({...s, companyRate: e.target.value}))} />
            </label>
            <label>
              <div>Market Rate</div>
              <input type="number" min={0} step={0.01} value={editing.marketRate} onChange={(e)=>setEditing(s=>({...s, marketRate: e.target.value}))} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <div>Notes</div>
              <textarea rows={3} value={editing.notes} onChange={(e)=>setEditing(s=>({...s, notes: e.target.value}))} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={saveEdit}>Save</button>
            <button className="btn-secondary" onClick={()=>setEditing({})}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRateVerification;
