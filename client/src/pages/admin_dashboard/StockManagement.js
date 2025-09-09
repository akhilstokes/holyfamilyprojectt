import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

// Updated to use current stock endpoints (no negative values; exact decimals)
const StockManagement = () => {
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
      const { data } = await axios.get('/api/stock', config);
      setCurrentStock(data.quantityInLiters);
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
      const { data } = await axios.put('/api/stock', { quantityChange: num }, config);
      setCurrentStock(data.quantityInLiters);
      setQuantityChange('');
      setMsg('Stock updated');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to update stock');
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  return (
    <div>
      <h2 className="page-title">Stock Management</h2>

      {/* Current Stock */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="card-icon green">
            <i className="fas fa-boxes"></i>
          </div>
          <div className="card-info">
            <h4>Current Stock (L)</h4>
            <p>{currentStock}</p>
          </div>
        </div>
      </div>

      {/* Update Stock (positive adds, negative subtracts; clamped at 0) */}
      <div className="admin-content" style={{ marginTop: '2rem' }}>
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
      </div>
    </div>
  );
};

export default StockManagement;
