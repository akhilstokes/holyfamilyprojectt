import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { httpFetch } from '../../services/http';
import StockHistory from '../../components/common/StockHistory';
import StockTransactionForm from '../../components/common/StockTransactionForm';
import { formatDateTime, formatTableDateTime } from '../../utils/dateUtils';

const ManagerStock = () => {
  const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token]);

  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ productName: '', quantityInLiters: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await httpFetch(`/api/stock/summary?_t=${Date.now()}`, { headers, cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setSummary(data?.data || data);
      const res2 = await httpFetch(`/api/stock/items?_t=${Date.now()}`, { headers, cache: 'no-store' });
      if (res2.ok) { setItems(await res2.json()); }
    } catch (e) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [base, headers]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitTransaction = async (formData) => {
    try {
      const res = await httpFetch('/api/stock-history/create', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowTransactionForm(false);
        setSelectedProduct(null);
        await load();
        alert('Stock transaction recorded successfully!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || 'Failed to record transaction');
      }
    } catch (err) {
      console.error('Error recording transaction:', err);
      alert('Failed to record transaction. Please try again.');
    }
  };

  return (
    <div style={{ padding: 16, color: 'var(--text-default)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-strong)' }}>Stock Overview</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowTransactionForm(true)}>
            Record Transaction
          </button>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>
      {error && <div style={{ color:'var(--danger)', marginTop: 8 }}>{error}</div>}
      {summary && (
        <>
          <div className="dash-card" style={{ marginTop: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8, color: 'var(--text-strong)' }}>Yard: Raw Rubber</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
              <div>
                <div style={{ fontSize: 12, color:'var(--text-subtle)' }}>Current Quantity (Liters)</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-strong)' }}>{summary.latexLiters ?? '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color:'var(--text-subtle)' }}>Updated At</div>
                <div>{formatDateTime(summary.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div className="dash-card" style={{ marginTop: 12, padding: 12 }}>
            <h3 style={{ marginTop: 0, marginBottom: 8, color: 'var(--text-strong)' }}>Godown: Finished Goods (Rubber Bands)</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
              <div>
                <div style={{ fontSize: 12, color:'var(--text-subtle)' }}>Inventory (Units)</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-strong)' }}>{summary.rubberBandUnits ?? '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color:'var(--text-subtle)' }}>Updated At</div>
                <div>{formatDateTime(summary.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table className="dashboard-table" style={{ minWidth: 640, color: '#0f172a' }}>
              <thead>
                <tr>
                  {['Name','Quantity','Updated','Actions'].map(h => (
                    <th key={h} style={{ color: '#0f172a', opacity: 1, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it._id}>
                    <td style={{ color: '#0f172a' }}>{it.productName}</td>
                    <td style={{ color: '#0f172a' }}>{it.quantityInLiters}</td>
                    <td style={{ color: '#0f172a' }}>{formatTableDateTime(it.updatedAt)}</td>
                    <td style={{ color: '#0f172a' }}>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedProduct(it.productName)}>
                        View History
                      </button>
                      <button className="btn btn-sm" onClick={async ()=>{
                        try {
                          setError('');
                          const qty = prompt('Set quantity for ' + it.productName, it.quantityInLiters);
                          if (qty === null) return;
                          const numQty = Number(qty);
                          if (isNaN(numQty) || numQty < 0) {
                            setError('Quantity must be a non-negative number');
                            alert('Invalid quantity. Please enter a non-negative number.');
                            return;
                          }
                          const res = await httpFetch(`/api/stock/items/${it._id}`, {
                            method:'PUT',
                            headers,
                            body: JSON.stringify({ quantityInLiters: numQty })
                          });
                          if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.message || `Update failed (${res.status})`);
                          }
                          // Wait briefly to ensure database write completes
                          await new Promise(resolve => setTimeout(resolve, 200));
                          await load();
                          alert(`Successfully updated ${it.productName} to ${numQty}`);
                        } catch (err) {
                          const msg = err?.message || 'Network error while updating';
                          setError(msg);
                          alert('Failed to update: ' + msg);
                        }
                      }}>Set Qty</button>
                      <button className="btn btn-sm btn-outline" style={{ marginLeft: 8 }} onClick={async ()=>{
                        try {
                          setError('');
                          if (!window.confirm(`Delete ${it.productName}?`)) return;
                          const res = await httpFetch(`/api/stock/items/${it._id}`, { method:'DELETE', headers });
                          if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}));
                            throw new Error(errorData.message || `Delete failed (${res.status})`);
                          }
                          await new Promise(resolve => setTimeout(resolve, 200));
                          await load();
                          alert(`Successfully deleted ${it.productName}`);
                        } catch (err) {
                          const msg = err?.message || 'Network error while deleting';
                          setError(msg);
                          alert('Failed to delete: ' + msg);
                        }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'#6b7280' }}>No items</td></tr>}
              </tbody>
            </table>
          </div>

          <form className="dash-card" style={{ padding: 12, color: '#0f172a' }} onSubmit={async (e)=>{
            e.preventDefault(); setError('');
            try {
              const body = { productName: form.productName.trim(), quantityInLiters: Number(form.quantityInLiters || 0) };
              const res = await httpFetch('/api/stock/items', { method:'POST', headers, body: JSON.stringify(body) });
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `Create failed (${res.status})`);
              }
              setForm({ productName:'', quantityInLiters:'' });
              await load();
              alert('Item added successfully!');
            } catch (err) {
              const msg = err?.message || 'Network error while creating';
              setError(msg);
              alert('Failed to add item: ' + msg);
            }
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Add New Item</div>
            <div className="form-group">
              <label>Name</label>
              <input value={form.productName} onChange={e=>setForm({...form, productName:e.target.value})} className="form-control" required />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="0" step="0.01" value={form.quantityInLiters} onChange={e=>setForm({...form, quantityInLiters:e.target.value})} className="form-control" placeholder="0" />
            </div>
            <button className="btn" type="submit">Add Item</button>
          </form>

          {/* Stock History Section */}
          {selectedProduct && (
            <div style={{ marginTop: 40 }}>
              <StockHistory productName={selectedProduct} />
            </div>
          )}

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: 8, 
                maxWidth: 800, 
                width: '90%', 
                maxHeight: '90%', 
                overflow: 'auto' 
              }}>
                <div style={{ padding: 20 }}>
                  <StockTransactionForm 
                    onSubmit={handleSubmitTransaction}
                    onCancel={() => setShowTransactionForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ManagerStock;
