import React, { useEffect, useState } from 'react';
import { getStockSummary, getStockLevel } from '../../services/adminService';

const YardStock = () => {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [summary, list] = await Promise.all([
        getStockSummary(),
        getStockLevel()
      ]);
      setData(summary?.data || summary);
      setItems(Array.isArray(list) ? list : (list?.items || []));
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin: 0 }}>Yard Stock</h2>
        <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}

      {data && (
        <div className="dash-card" style={{ marginTop: 12, padding: 12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
            <div>
              <div style={{ fontSize: 12, color:'#9aa' }}>Raw Latex (Liters)</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-strong)' }}>{data.latexLiters ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color:'#9aa' }}>Finished Goods Units</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-strong)' }}>{data.rubberBandUnits ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color:'#9aa' }}>Updated</div>
              <div>{data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Quantity (L)</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id || it.id || it.productName}>
                <td>{it.productName || it.name}</td>
                <td>{it.quantityInLiters ?? it.qty ?? '-'}</td>
                <td>{it.updatedAt ? new Date(it.updatedAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign:'center', color:'#9aa' }}>No items</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YardStock;
