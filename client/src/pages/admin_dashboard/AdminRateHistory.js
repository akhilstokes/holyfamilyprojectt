import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminRateHistory.css';

const AdminRateHistory = () => {
  const [rates, setRates] = useState([]);
  const [rubberBoardRates, setRubberBoardRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [newRate, setNewRate] = useState({
    rateType: 'latex60',
    rateValue: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });
  const [editingRate, setEditingRate] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch data on component mount and date change
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Auto-fetch every 5 minutes if enabled
  useEffect(() => {
    let interval;
    if (autoFetchEnabled) {
      interval = setInterval(() => {
        fetchRubberBoardRates();
      }, 5 * 60 * 1000); // 5 minutes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoFetchEnabled]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch company rates and rubber board rates
      const [ratesRes, rubberBoardRes] = await Promise.all([
        axios.get(`/api/rates/history-range?from=${dateRange.from}&to=${dateRange.to}`, config),
        fetchRubberBoardRates()
      ]);
      
      setRates(ratesRes.data || []);
    } catch (error) {
      setError('Error fetching rates: ' + error.message);
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRubberBoardRates = async () => {
    try {
      const response = await axios.get('/api/rates/live/latex', config);
      const data = response.data;
      setRubberBoardRates(Array.isArray(data) ? data : [data].filter(Boolean));
      setLastFetchTime(new Date());
      return response;
    } catch (error) {
      console.error('Error fetching rubber board rates:', error);
      return { data: [] };
    }
  };

  const handleAddRate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/rates', newRate, config);
      setNewRate({ rateType: 'latex60', rateValue: '', effectiveDate: new Date().toISOString().split('T')[0] });
      setSuccess('Rate added successfully!');
      fetchData();
    } catch (error) {
      setError('Error adding rate: ' + (error.response?.data?.message || error.message));
      console.error('Error adding rate:', error);
    }
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setNewRate({
      rateType: rate.rateType || rate.product,
      rateValue: rate.rateValue || rate.rate,
      effectiveDate: rate.effectiveDate ? new Date(rate.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdateRate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`/api/rates/${editingRate._id}`, newRate, config);
      setEditingRate(null);
      setNewRate({ rateType: 'latex60', rateValue: '', effectiveDate: new Date().toISOString().split('T')[0] });
      setSuccess('Rate updated successfully!');
      fetchData();
    } catch (error) {
      setError('Error updating rate: ' + (error.response?.data?.message || error.message));
      console.error('Error updating rate:', error);
    }
  };

  const handleDeleteRate = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return;
    
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/rates/${rateId}`, config);
      setSuccess('Rate deleted successfully!');
      fetchData();
    } catch (error) {
      setError('Error deleting rate: ' + (error.response?.data?.message || error.message));
      console.error('Error deleting rate:', error);
    }
  };

  const handleAutoFetchToggle = () => {
    setAutoFetchEnabled(!autoFetchEnabled);
    if (!autoFetchEnabled) {
      fetchRubberBoardRates();
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
  const formatPrice = (price) => `₹${price?.toLocaleString('en-IN') || 'N/A'}`;
  const formatDateTime = (date) => new Date(date).toLocaleString('en-IN');

  return (
    <div className="admin-rate-history">
      <div className="header">
        <h1>📊 Rate History Management</h1>
        <p>Manage company rates and compare with official rubber board rates</p>
      </div>

      {/* Error and Success Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Auto-fetch Controls */}
      <div className="auto-fetch-controls">
        <div className="auto-fetch-toggle">
          <label>
            <input
              type="checkbox"
              checked={autoFetchEnabled}
              onChange={handleAutoFetchToggle}
            />
            Enable Auto-fetch (every 5 minutes)
          </label>
          {lastFetchTime && (
            <span className="last-fetch">
              Last fetched: {formatDateTime(lastFetchTime)}
            </span>
          )}
        </div>
        <button onClick={fetchRubberBoardRates} className="btn-fetch-now">
          🔄 Fetch Now
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <div className="filter-group">
          <label>From Date:</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>To Date:</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </div>
        <button onClick={fetchData} className="btn-refresh">🔄 Refresh</button>
      </div>

      {/* Add/Edit Rate */}
      <div className="add-rate-section">
        <h3>{editingRate ? '✏️ Edit Company Rate' : '➕ Add New Company Rate'}</h3>
        <form onSubmit={editingRate ? handleUpdateRate : handleAddRate} className="rate-form">
          <select
            value={newRate.rateType}
            onChange={(e) => setNewRate({ ...newRate, rateType: e.target.value })}
            required
          >
            <option value="latex60">Latex (60%)</option>
            <option value="latex50">Latex (50%)</option>
            <option value="rubber_sheet">Rubber Sheet</option>
            <option value="scrap">Scrap Rubber</option>
          </select>
          <input
            type="number"
            placeholder="Rate Value (₹)"
            value={newRate.rateValue}
            onChange={(e) => setNewRate({ ...newRate, rateValue: e.target.value })}
            step="0.01"
            min="0"
            required
          />
          <input
            type="date"
            value={newRate.effectiveDate}
            onChange={(e) => setNewRate({ ...newRate, effectiveDate: e.target.value })}
            required
          />
          <div className="form-actions">
            <button type="submit">
              {editingRate ? 'Update Rate' : 'Add Rate'}
            </button>
            {editingRate && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingRate(null);
                  setNewRate({ rateType: 'latex60', rateValue: '', effectiveDate: new Date().toISOString().split('T')[0] });
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Rubber Board Official Rates */}
      {rubberBoardRates.length > 0 && (
        <div className="rubber-board-section">
          <h3>🏛️ Official Rubber Board Rates</h3>
          <div className="rate-cards">
            {rubberBoardRates.map((rate, index) => (
              <div key={index} className="rate-card official">
                <div className="rate-header">
                  <span className="rate-type">{rate.product || 'Latex (60%)'}</span>
                  <span className="rate-source">Official</span>
                </div>
                <div className="rate-value">{formatPrice(rate.rate)}</div>
                <div className="rate-date">{formatDate(rate.effectiveDate || rate.date)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Rates */}
      <div className="company-rates-section">
        <h3>🏢 Company Rates</h3>
        {loading ? (
          <div className="loading">Loading rates...</div>
        ) : rates.length === 0 ? (
          <div className="no-data">No rates found for selected date range</div>
        ) : (
          <div className="rates-table-container">
            <table className="rates-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product Type</th>
                  <th>Company Rate</th>
                  <th>Updated By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate._id}>
                    <td>{formatDate(rate.effectiveDate)}</td>
                    <td className="product-type">{rate.product || rate.rateType}</td>
                    <td className="rate-value">{formatPrice(rate.rate || rate.rateValue)}</td>
                    <td>{rate.updatedBy?.name || 'Admin'}</td>
                    <td>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditRate(rate)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteRate(rate._id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rate Comparison Chart */}
      <div className="comparison-section">
        <h3>📈 Rate Comparison</h3>
        <div className="comparison-grid">
          <div className="comparison-card">
            <h4>Latest Official Rate</h4>
            <div className="comparison-value">
              {rubberBoardRates[0] ? formatPrice(rubberBoardRates[0].rate || rubberBoardRates[0].price) : 'N/A'}
            </div>
            <div className="comparison-date">
              {rubberBoardRates[0] ? formatDate(rubberBoardRates[0].effectiveDate || rubberBoardRates[0].date) : 'N/A'}
            </div>
          </div>
          <div className="comparison-card">
            <h4>Latest Company Rate</h4>
            <div className="comparison-value">
              {rates[0] ? formatPrice(rates[0].rate || rates[0].rateValue) : 'N/A'}
            </div>
            <div className="comparison-date">
              {rates[0] ? formatDate(rates[0].effectiveDate) : 'N/A'}
            </div>
          </div>
          <div className="comparison-card">
            <h4>Difference</h4>
            <div className="comparison-value">
              {rubberBoardRates[0] && rates[0] 
                ? formatPrice(Math.abs((rates[0].rate || rates[0].rateValue) - (rubberBoardRates[0].rate || rubberBoardRates[0].price)))
                : 'N/A'
              }
            </div>
            <div className="comparison-date">
              {rubberBoardRates[0] && rates[0] 
                ? ((rates[0].rate || rates[0].rateValue) > (rubberBoardRates[0].rate || rubberBoardRates[0].price) ? 'Company Higher' : 'Official Higher')
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRateHistory;




