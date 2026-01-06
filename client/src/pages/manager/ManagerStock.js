import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { httpFetch } from '../../services/http';
import StockHistory from '../../components/common/StockHistory';

import { formatDateTime, formatTableDateTime } from '../../utils/dateUtils';

import StockTransactionForm from '../../components/common/StockTransactionForm';


const ManagerStock = () => {
  const base = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token]);

  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({ productName: '', quantity: '', unit: 'litre' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

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

  return (
    <div style={{ padding: 16, color: 'var(--text-default)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: 'var(--text-strong)' }}>Stock Overview</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-success" 
            onClick={() => setShowAddItemForm(true)}
            style={{ 
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              padding: '10px 20px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <i className="fas fa-box" style={{ marginRight: '8px' }}></i>
            ADD ITEM
          </button>
          <button 
            className="btn btn-outline-secondary" 
            onClick={load} 
            disabled={loading}
            style={{ padding: '10px 16px' }}
          >
            <i className="fas fa-sync-alt" style={{ marginRight: '8px' }}></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}
      
      {summary && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
            <div className="dash-card" style={{ padding: 20, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <i className="fas fa-tint"></i>
                </div>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>Yard: Raw Rubber</h3>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {summary.latexLiters ?? '—'}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Current Quantity (Liters)
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                Updated: {formatDateTime(summary.updatedAt)}
              </div>
            </div>

            <div className="dash-card" style={{ padding: 20, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <i className="fas fa-boxes"></i>
                </div>
                <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>Godown: Finished Goods</h3>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {summary.rubberBandUnits ?? '—'}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Inventory (Units)
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                Updated: {formatDateTime(summary.updatedAt)}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '2px solid #e2e8f0', 
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: '700' }}>
                  <i className="fas fa-warehouse" style={{ marginRight: '10px', color: '#3b82f6' }}></i>
                  Stock Items
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                  Manage your inventory items and quantities
                </p>
              </div>
              <div style={{ 
                backgroundColor: '#e0f2fe', 
                color: '#0369a1', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: '600' 
              }}>
                {items.length} Items
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: 0,
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ 
                      color: '#475569', 
                      fontWeight: '700', 
                      padding: '16px 20px',
                      textAlign: 'left',
                      borderBottom: '2px solid #e2e8f0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '25%'
                    }}>
                      <i className="fas fa-tag" style={{ marginRight: '6px', color: '#64748b' }}></i>
                      Product Name
                    </th>
                    <th style={{ 
                      color: '#475569', 
                      fontWeight: '700', 
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '2px solid #e2e8f0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '15%'
                    }}>
                      <i className="fas fa-balance-scale" style={{ marginRight: '6px', color: '#64748b' }}></i>
                      Quantity
                    </th>
                    <th style={{ 
                      color: '#475569', 
                      fontWeight: '700', 
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '2px solid #e2e8f0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '12%'
                    }}>
                      <i className="fas fa-ruler" style={{ marginRight: '6px', color: '#64748b' }}></i>
                      Unit
                    </th>
                    <th style={{ 
                      color: '#475569', 
                      fontWeight: '700', 
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '2px solid #e2e8f0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '18%'
                    }}>
                      <i className="fas fa-clock" style={{ marginRight: '6px', color: '#64748b' }}></i>
                      Last Updated
                    </th>
                    <th style={{ 
                      color: '#475569', 
                      fontWeight: '700', 
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '2px solid #e2e8f0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '30%'
                    }}>
                      <i className="fas fa-cogs" style={{ marginRight: '6px', color: '#64748b' }}></i>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, index) => (
                    <tr key={it._id} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      transition: 'all 0.2s ease',
                      ':hover': { backgroundColor: '#f8fafc' }
                    }}>
                      <td style={{ 
                        color: '#1e293b', 
                        padding: '18px 20px', 
                        fontWeight: '600',
                        fontSize: '15px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            marginRight: '12px'
                          }}></div>
                          {it.productName}
                        </div>
                      </td>
                      <td style={{ 
                        color: '#1e293b', 
                        padding: '18px 20px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        <span style={{
                          backgroundColor: '#f0f9ff',
                          color: '#0369a1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #bae6fd'
                        }}>
                          {it.quantity || it.quantityInLiters}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '18px 20px',
                        textAlign: 'center'
                      }}>
                        <span style={{ 
                          backgroundColor: it.unit === 'kg' ? '#fef3c7' : '#dbeafe', 
                          color: it.unit === 'kg' ? '#92400e' : '#1e40af',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          border: it.unit === 'kg' ? '1px solid #fbbf24' : '1px solid #60a5fa'
                        }}>
                          {it.unit || 'litre'}
                        </span>
                      </td>
                      <td style={{ 
                        color: '#64748b', 
                        padding: '18px 20px',
                        textAlign: 'center',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: '500' }}>
                            {formatTableDateTime(it.updatedAt)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          justifyContent: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <button 
                            className="btn btn-sm"
                            onClick={() => setSelectedProduct(it.productName)}
                            style={{ 
                              fontSize: '11px', 
                              padding: '6px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-history" style={{ fontSize: '10px' }}></i>
                            History
                          </button>
                          <button 
                            className="btn btn-sm"
                            onClick={async ()=>{
                              try {
                                setError('');
                                const currentQty = it.quantity || it.quantityInLiters;
                                const qty = prompt('Set quantity for ' + it.productName, currentQty);
                                if (qty === null) return;
                                const numQty = Number(qty);
                                if (isNaN(numQty) || numQty < 0) {
                                  setError('Quantity must be a non-negative number');
                                  alert('Invalid quantity. Please enter a non-negative number.');
                                  return;
                                }
                                const updateBody = it.unit ? 
                                  { quantity: numQty, unit: it.unit } : 
                                  { quantityInLiters: numQty };
                                const res = await httpFetch(`/api/stock/items/${it._id}`, {
                                  method:'PUT',
                                  headers,
                                  body: JSON.stringify(updateBody)
                                });
                                if (!res.ok) {
                                  const errorData = await res.json().catch(() => ({}));
                                  throw new Error(errorData.message || `Update failed (${res.status})`);
                                }
                                await new Promise(resolve => setTimeout(resolve, 200));
                                await load();
                                alert(`Successfully updated ${it.productName} to ${numQty} ${it.unit || 'litre'}`);
                              } catch (err) {
                                const msg = err?.message || 'Network error while updating';
                                setError(msg);
                                alert('Failed to update: ' + msg);
                              }
                            }}
                            style={{ 
                              fontSize: '11px', 
                              padding: '6px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-edit" style={{ fontSize: '10px' }}></i>
                            Edit Qty
                          </button>
                          <button 
                            className="btn btn-sm"
                            onClick={async ()=>{
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
                            }}
                            style={{ 
                              fontSize: '11px', 
                              padding: '6px 12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '10px' }}></i>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ 
                        textAlign:'center', 
                        color:'#94a3b8', 
                        padding: '60px 20px', 
                        fontStyle: 'italic',
                        fontSize: '16px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <i className="fas fa-box-open" style={{ fontSize: '48px', color: '#cbd5e1' }}></i>
                          <span>No stock items found</span>
                          <small style={{ color: '#cbd5e1', fontSize: '14px' }}>
                            Click "ADD ITEM" to add your first product
                          </small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>



          {/* Stock History Section */}
          {selectedProduct && (
            <div style={{ marginTop: 24 }}>

  }, [headers]);

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
                <div>{summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : '-'}</div>
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
                <div>{summary.updatedAt ? new Date(summary.updatedAt).toLocaleString() : '-'}</div>
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
                    <td style={{ color: '#0f172a' }}>{it.updatedAt ? new Date(it.updatedAt).toLocaleString() : '-'}</td>
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


          {/* Add Item Modal */}
          {showAddItemForm && (

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

                borderRadius: 12, 
                maxWidth: 600, 
                width: '95%', 
                maxHeight: '90%', 
                overflow: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                <div style={{ padding: 24 }}>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '20px', fontWeight: '600' }}>
                      <i className="fas fa-box" style={{ marginRight: '10px', color: '#10b981' }}></i>
                      Add New Stock Item
                    </h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      Add a new product to your inventory system
                    </p>
                  </div>

                  <form onSubmit={async (e)=>{
                    e.preventDefault(); setError('');
                    try {
                      const body = { 
                        productName: form.productName.trim(), 
                        quantity: Number(form.quantity || 0),
                        unit: form.unit
                      };
                      const res = await httpFetch('/api/stock/items', { 
                        method:'POST', 
                        headers, 
                        body: JSON.stringify(body) 
                      });
                      if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.message || `Create failed (${res.status})`);
                      }
                      setForm({ productName:'', quantity:'', unit: 'litre' });
                      setShowAddItemForm(false);
                      await load();
                      alert('Item added successfully!');
                    } catch (err) {
                      const msg = err?.message || 'Network error while creating';
                      setError(msg);
                      alert('Failed to add item: ' + msg);
                    }
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          Product Name *
                        </label>
                        <input 
                          value={form.productName} 
                          onChange={e=>setForm({...form, productName:e.target.value})} 
                          className="form-control" 
                          required 
                          placeholder="Enter product name (e.g., Raw Latex, Rubber Bands)"
                          style={{ 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          Initial Quantity
                        </label>
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          value={form.quantity} 
                          onChange={e=>setForm({...form, quantity:e.target.value})} 
                          className="form-control" 
                          placeholder="Enter initial quantity (optional)"
                          style={{ 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '600', 
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          Unit *
                        </label>
                        <select 
                          value={form.unit} 
                          onChange={e=>setForm({...form, unit:e.target.value})} 
                          className="form-control" 
                          required
                          style={{ 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            border: '2px solid #e5e7eb',
                            fontSize: '14px',
                            width: '100%',
                            boxSizing: 'border-box',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="litre">Litre</option>
                          <option value="kg">Kilogram (kg)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <small style={{ color: '#6b7280', fontSize: '12px', display: 'block' }}>
                        Leave quantity empty or enter 0 if you want to add quantity later through transactions
                      </small>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      justifyContent: 'flex-end',
                      marginTop: '24px'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddItemForm(false);
                          setForm({ productName:'', quantity:'', unit: 'litre' });
                        }}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{ 
                          padding: '10px 24px', 
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className="fas fa-plus"></i>
                        Add Item
                      </button>
                    </div>
                  </form>

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
