import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const StaffInventory = () => {
  const [tab, setTab] = useState('latex'); // 'latex' | 'rubber' | 'chem'
  const [currentStock, setCurrentStock] = useState(0);
  const [quantityChange, setQuantityChange] = useState('');
  const [chems, setChems] = useState([]);
  const [rubberUnits, setRubberUnits] = useState(0);
  const [msg, setMsg] = useState('');

  const config = useMemo(
    () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
    []
  );

  const load = async () => {
    try {
      setMsg('');
      if (tab === 'latex') {
        const { data } = await axios.get('/api/stock', config);
        setCurrentStock(data.quantityInLiters);
      } else if (tab === 'rubber') {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${base}/api/stock/summary`, config);
        setRubberUnits(data.rubberBandUnits);
      } else if (tab === 'chem') {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${base}/api/chemicals`, config);
        setChems(data);
      }
    } catch {
      setMsg('Failed to load');
    }
  };

  useEffect(() => { load(); }, [tab]);

  const adjust = async (e) => {
    e.preventDefault();
    setMsg('');
    const num = Number(quantityChange);
    if (Number.isNaN(num)) { setMsg('Enter a valid number'); return; }
    try {
      const { data } = await axios.put('/api/stock', { quantityChange: num }, config);
      setCurrentStock(data.quantityInLiters);
      setQuantityChange('');
      setMsg('Updated');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="user-rate-history" id="inventory">
      <div className="header">
        <h1>Inventory</h1>
        <p>View current latex stock and chemicals</p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button className={`btn btn-${tab==='latex'?'primary':'outline-primary'}`} onClick={()=>setTab('latex')}>Latex</button>
        <button className={`btn btn-${tab==='rubber'?'primary':'outline-primary'}`} onClick={()=>setTab('rubber')} style={{ marginLeft: 8 }}>Rubber Bands</button>
        <button className={`btn btn-${tab==='chem'?'primary':'outline-primary'}`} onClick={()=>setTab('chem')} style={{ marginLeft: 8 }}>Chemicals</button>
      </div>

      {tab === 'latex' && (
        <div>
          <div className="stats-cards-grid">
            <div className="stat-card">
              <div className="card-info">
                <h4>Current Latex Stock (L)</h4>
                <p>{currentStock}</p>
              </div>
            </div>
          </div>
          <form onSubmit={adjust} className="stock-form" style={{ marginTop: 16 }}>
            <input
              type="number"
              value={quantityChange}
              onChange={(e)=>setQuantityChange(e.target.value)}
              placeholder="Quantity change (e.g., 10 or -5)"
              step="any"
              inputMode="decimal"
              data-allow-negative
              onWheel={(e)=>e.currentTarget.blur()}
              required
            />
            <button type="submit">Apply</button>
          </form>
          {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
        </div>
      )}

      {tab === 'rubber' && (
        <div className="stats-cards-grid">
          <div className="stat-card">
            <div className="card-info">
              <h4>Rubber Band Units</h4>
              <p>{rubberUnits}</p>
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#666' }}>Read-only for staff. Admin adjusts rubber units.</div>
        </div>
      )}

      {tab === 'chem' && (
        <div className="admin-content" style={{ marginTop: 8 }}>
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
      )}
    </div>
  );
};

export default StaffInventory;


