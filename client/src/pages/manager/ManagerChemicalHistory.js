import React, { useEffect, useMemo, useState } from 'react';
import { listChemicals, chemicalAlerts } from '../../services/adminService';

const downloadCSV = (rows, filename = 'chemicals.csv') => {
  const headers = ['name','unit','onHand','lotNo','quantity','unitCost','receivedAt','expiresAt'];
  const csv = [headers.join(',')].concat(
    rows.flatMap(r => (r.lots?.length ? r.lots : [{ lotNo: '', quantity: '', unitCost: '', receivedAt: '', expiresAt: '' }]).map(l =>
      [r.name, r.unit || '', r.onHand ?? '', l.lotNo || '', l.quantity ?? '', l.unitCost ?? '', l.receivedAt || '', l.expiresAt || ''].join(',')
    ))
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
};

const ManagerChemicalHistory = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [alerts, setAlerts] = useState({ low: [], expiring: [] });

  const filtered = useMemo(() => list.filter(c => !filter || c.name.toLowerCase().includes(filter.toLowerCase())), [list, filter]);

  const loadAll = async () => {
    setLoading(true); setError('');
    try {
      setList(await listChemicals());
      setAlerts(await chemicalAlerts());
    } catch (e) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Chemical Stock History</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <input placeholder="Filter by name" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button onClick={() => downloadCSV(filtered)}>Export CSV</button>
        <button onClick={loadAll} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      {error && <div style={{ color: 'tomato' }}>{error}</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {alerts?.low?.length > 0 && (
          <div style={{ background: '#fff8e1', padding: 8, border: '1px solid #ffe082' }}>
            <strong>Low stock:</strong> {alerts.low.map(l => `${l.name} (${l.onHand})`).join(', ')}
          </div>
        )}
        {alerts?.expiring?.length > 0 && (
          <div style={{ background: '#fce4ec', padding: 8, border: '1px solid #f48fb1' }}>
            <strong>Expiring soon:</strong> {alerts.expiring.map(l => `${l.name} lot ${l.lotNo}`).join(', ')}
          </div>
        )}
      </div>

      {loading ? 'Loading...' : (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table className="dashboard-table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>On Hand</th>
                <th>Lots</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.unit}</td>
                  <td>{c.onHand}</td>
                  <td>
                    {c.lots?.length ? c.lots.map(l => (
                      <div key={l.lotNo} style={{ display: 'flex', gap: 8 }}>
                        <span>#{l.lotNo}</span>
                        <span>Qty: {l.quantity}</span>
                        <span>Unit Cost: {l.unitCost}</span>
                        <span>Recv: {l.receivedAt ? new Date(l.receivedAt).toLocaleDateString() : '-'}</span>
                        <span>Exp: {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : '-'}</span>
                      </div>
                    )) : '—'}
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9aa' }}>No chemicals</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerChemicalHistory;
