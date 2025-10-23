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

const ChemicalStockHistory = () => {
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
    <div>
      <h2>Chemical Stock History</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <input placeholder="Filter by name" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button onClick={() => downloadCSV(filtered)}>Export CSV</button>
        <button onClick={loadAll} disabled={loading}>Refresh</button>
      </div>

      {error && <div style={{ color: 'tomato' }}>{error}</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {alerts?.low?.length > 0 && (
          <div role="alert" style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#111827',
            padding: 10,
            borderRadius: 6,
          }}>
            <strong style={{ color: '#92400E' }}>Low stock:</strong> {alerts.low.map(l => `${l.name} (${l.onHand})`).join(', ')}
          </div>
        )}
        {alerts?.expiring?.length > 0 && (
          <div role="alert" style={{
            background: '#FFE4E6',
            border: '1px solid #FDA4AF',
            color: '#111827',
            padding: 10,
            borderRadius: 6,
          }}>
            <strong style={{ color: '#9D174D' }}>Expiring soon:</strong> {alerts.expiring.map(l => `${l.name} lot ${l.lotNo}`).join(', ')}
          </div>
        )}
      </div>

      {loading ? 'Loading...' : (
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              {!filtered.length && <tr><td colSpan={4} style={{ textAlign: 'center' }}>No chemicals</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChemicalStockHistory;
