import React, { useEffect, useState } from 'react';
import { getStockSummary, listStockItems, updateStockItem } from '../../services/accountantService';

export default function AccountantStockMonitor() {
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editRow, setEditRow] = useState(null); // {_id, quantityInLiters}
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const s = await getStockSummary();
      const i = await listStockItems();
      setSummary(s);
      setItems(i);
    } catch {
      setSummary(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Stock Monitor</h2>
      {loading ? <p>Loading...</p> : (
        <>
          {summary && (
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-title">Latex (L)</div>
                <div className="stat-value">{summary.latexLiters}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Rubber Bands (units)</div>
                <div className="stat-value">{summary.rubberBandUnits}</div>
              </div>
            </div>
          )}

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it._id}>
                    <td>{it.productName}</td>
                    <td>
                      {editRow?. _id === it._id ? (
                        <input type="number" step="any" min={0}
                          value={editRow.quantityInLiters}
                          onChange={(e)=>setEditRow(r=>({ ...r, quantityInLiters: e.target.value }))}
                          style={{ width: 140 }} />
                      ) : (
                        it.quantityInLiters
                      )}
                    </td>
                    <td>{it.lastUpdated ? new Date(it.lastUpdated).toLocaleString() : '-'}</td>
                    <td>
                      {editRow?. _id === it._id ? (
                        <div style={{ display:'flex', gap:8 }}>
                          <button className="btn" disabled={savingId===it._id}
                            onClick={async ()=>{
                              try {
                                setSavingId(it._id); setError(''); setMessage('');
                                const qty = Number(editRow.quantityInLiters);
                                if (!(qty>=0)) { setError('Enter a non-negative number'); return; }
                                await updateStockItem(it._id, { quantityInLiters: qty });
                                setMessage('Updated');
                                setEditRow(null);
                                await load();
                              } catch (e) { setError(e?.message||'Update failed'); }
                              finally { setSavingId(null); }
                            }}>{savingId===it._id?'Saving...':'Save'}</button>
                          <button className="btn" onClick={()=>setEditRow(null)} disabled={savingId===it._id}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn" onClick={()=>setEditRow({ _id: it._id, quantityInLiters: it.quantityInLiters })}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={load}>Refresh</button>
          </div>
          {message && <div className="success-message" style={{ marginTop: 8 }}>{message}</div>}
          {error && <div className="error-message" style={{ marginTop: 8 }}>{error}</div>}
        </>
      )}
    </div>
  );
}
