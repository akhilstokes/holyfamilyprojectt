import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

// Updated to use current stock endpoints (no negative values; exact decimals)
const StockManagement = () => {
  const [tab, setTab] = useState('latex'); // 'latex' | 'rubber' | 'chem'
  const [chems, setChems] = useState([]);
  const [chemForm, setChemForm] = useState({ name: '', unit: 'L', minThreshold: '', reorderPoint: '', safetyStock: '' });
  const [lotForm, setLotForm] = useState({ name: '', lotNo: '', quantity: '', unitCost: '', expiresAt: '' });
  const [currentStock, setCurrentStock] = useState(0);
  const [quantityChange, setQuantityChange] = useState('');
  const [msg, setMsg] = useState('');

  const config = useMemo(
    () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    []
  );

  const loadStock = async () => {
    try {
      setMsg('');
      if (tab === 'latex') {
        const { data } = await axios.get('/api/stock', config);
        setCurrentStock(data.quantityInLiters);
      } else {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        if (tab === 'rubber') {
          const { data } = await axios.get(`${base}/api/stock/item/Rubber%20Bands`, config);
          setCurrentStock(data.quantityInLiters);
        } else {
          const { data } = await axios.get(`${base}/api/chemicals`, config);
          setChems(data);
        }
      }
    } catch (e) {
      setMsg('Failed to load stock');
    }
  };

  const updateStock = async (e) => {
    e.preventDefault();
    setMsg('');
    const num = Number(quantityChange);
    if (Number.isNaN(num)) {
      setMsg('Enter a valid number');
      return;
    }
    try {
      if (tab === 'latex') {
        const { data } = await axios.put('/api/stock', { quantityChange: num }, config);
        setCurrentStock(data.quantityInLiters);
      } else {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.put(`${base}/api/stock/item/Rubber%20Bands`, { quantityChange: num }, config);
        setCurrentStock(data.quantityInLiters);
      }
      setQuantityChange('');
      setMsg('Stock updated');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to update stock');
    }
  };

  useEffect(() => {
    loadStock();
  }, [tab]);

  return (
    <div>
      <h2 className="page-title">Stock Management</h2>

      <div className="btn-group" role="group" aria-label="stock-tabs" style={{ marginBottom: '1rem' }}>
        <button className={`btn btn-${tab==='latex'?'primary':'outline-primary'}`} onClick={()=>setTab('latex')}>Latex</button>
        <button className={`btn btn-${tab==='rubber'?'primary':'outline-primary'}`} onClick={()=>setTab('rubber')} style={{ marginLeft: 8 }}>Rubber Bands</button>
        <button className={`btn btn-${tab==='chem'?'primary':'outline-primary'}`} onClick={()=>setTab('chem')} style={{ marginLeft: 8 }}>Chemicals</button>
      </div>

      {/* Current Stock */}
      {tab !== 'chem' && (<div className="stats-cards-grid">
        <div className="stat-card">
          <div className="card-icon green">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="card-info">
            <h4>Current Stock ({tab==='latex' ? 'L' : 'units'})</h4>
            <p>{currentStock}</p>
          </div>
        </div>
      </div>)}

      {/* Update Stock (positive adds, negative subtracts; clamped at 0) */}
      {tab !== 'chem' && (<div className="admin-content" style={{ marginTop: '2rem' }}>
        <h3>Adjust Stock</h3>
        {msg && <div className="success-message" style={{ marginBottom: 12 }}>{msg}</div>}
        <form onSubmit={updateStock} className="stock-form">
          <input
            type="number"
            placeholder="Quantity change (e.g., 10 or -5)"
            value={quantityChange}
            onChange={(e) => setQuantityChange(e.target.value)}
            required
          />
          <button type="submit">Apply</button>
        </form>
      </div>)}

      {tab === 'chem' && (
        <div className="admin-content" style={{ marginTop: '1rem' }}>
          <h3>Chemicals</h3>
          <div className="row">
            <div className="col-md-7">
              <div className="table-responsive">
                <table className="table table-striped table-sm">
                  <thead>
                    <tr><th>Name</th><th>On Hand</th><th>Unit</th><th>Lots</th></tr>
                  </thead>
                  <tbody>
                    {chems.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{c.onHand}</td>
                        <td>{c.unit}</td>
                        <td>{c.lots?.length || 0}</td>
                      </tr>
                    ))}
                    {chems.length===0 && <tr><td colSpan={4}>No chemicals</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-md-5">
              <h5>Add/Update Chemical</h5>
              <form onSubmit={async (e)=>{e.preventDefault(); const base=process.env.REACT_APP_API_URL||'http://localhost:5000'; await axios.post(`${base}/api/chemicals`, { ...chemForm, minThreshold:Number(chemForm.minThreshold||0), reorderPoint:Number(chemForm.reorderPoint||0), safetyStock:Number(chemForm.safetyStock||0) }, config); setChemForm({ name:'', unit:'L', minThreshold:'', reorderPoint:'', safetyStock:'' }); loadStock(); }}>
                <input className="form-control" placeholder="Name" value={chemForm.name} onChange={(e)=>setChemForm({...chemForm, name:e.target.value})} style={{ marginBottom: 6 }}/>
                <select className="form-control" value={chemForm.unit} onChange={(e)=>setChemForm({...chemForm, unit:e.target.value})} style={{ marginBottom: 6 }}>
                  <option value="L">L</option>
                  <option value="kg">kg</option>
                </select>
                <div className="row">
                  <div className="col-4"><input className="form-control" placeholder="Min" value={chemForm.minThreshold} onChange={(e)=>setChemForm({...chemForm, minThreshold:e.target.value})}/></div>
                  <div className="col-4"><input className="form-control" placeholder="Reorder" value={chemForm.reorderPoint} onChange={(e)=>setChemForm({...chemForm, reorderPoint:e.target.value})}/></div>
                  <div className="col-4"><input className="form-control" placeholder="Safety" value={chemForm.safetyStock} onChange={(e)=>setChemForm({...chemForm, safetyStock:e.target.value})}/></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 8 }} type="submit">Save</button>
              </form>

              <h5 style={{ marginTop: 16 }}>Add Lot</h5>
              <form onSubmit={async (e)=>{e.preventDefault(); const base=process.env.REACT_APP_API_URL||'http://localhost:5000'; await axios.post(`${base}/api/chemicals/${encodeURIComponent(lotForm.name)}/lots`, { ...lotForm, quantity:Number(lotForm.quantity||0), unitCost:Number(lotForm.unitCost||0) }, config); setLotForm({ name:'', lotNo:'', quantity:'', unitCost:'', expiresAt:'' }); loadStock(); }}>
                <input className="form-control" placeholder="Chemical Name" value={lotForm.name} onChange={(e)=>setLotForm({...lotForm, name:e.target.value})} style={{ marginBottom: 6 }}/>
                <input className="form-control" placeholder="Lot No" value={lotForm.lotNo} onChange={(e)=>setLotForm({...lotForm, lotNo:e.target.value})} style={{ marginBottom: 6 }}/>
                <div className="row">
                  <div className="col-4"><input className="form-control" placeholder="Qty" value={lotForm.quantity} onChange={(e)=>setLotForm({...lotForm, quantity:e.target.value})}/></div>
                  <div className="col-4"><input className="form-control" placeholder="Unit Cost" value={lotForm.unitCost} onChange={(e)=>setLotForm({...lotForm, unitCost:e.target.value})}/></div>
                  <div className="col-4"><input className="form-control" type="date" value={lotForm.expiresAt} onChange={(e)=>setLotForm({...lotForm, expiresAt:e.target.value})}/></div>
                </div>
                <button className="btn btn-success" style={{ marginTop: 8 }} type="submit">Add Lot</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
