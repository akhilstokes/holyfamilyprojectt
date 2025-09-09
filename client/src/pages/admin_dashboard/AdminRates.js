import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../admin_dashboard/AdminDashboard.css';

// Admin page to view latest rate and update new rate entries
const AdminRates = () => {
  const [latest, setLatest] = useState(null);
  const [form, setForm] = useState({ marketRate: '', companyRate: '', source: 'manual' });
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const load = async () => {
    try {
      setMsg('');
      const { data } = await axios.get('/api/rates/latest');
      setLatest(data);
    } catch (e) {
      setMsg('Failed to load latest rate');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setMsg('');
      await axios.post(
        '/api/rates/update',
        {
          marketRate: Number(form.marketRate),
          companyRate: Number(form.companyRate),
          source: form.source || 'manual',
        },
        config
      );
      setMsg('Rate updated successfully');
      setForm({ marketRate: '', companyRate: '', source: 'manual' });
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Failed to update rate');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 className="page-title">Admin • Live Rates</h2>

      {latest && (
        <div className="stats-cards-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="card-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="card-info">
              <h4>Current Market / Company</h4>
              <p>{latest.marketRate} / {latest.companyRate}</p>
              <small style={{ color: '#888' }}>
                Updated: {new Date(latest.createdAt || latest.updatedAt).toLocaleString()} • Source: {latest.source}
              </small>
            </div>
          </div>
        </div>
      )}

      <div className="admin-content">
        <h3>Update Rates</h3>
        {msg && <div className="success-message" style={{ marginBottom: 12 }}>{msg}</div>}
        <form onSubmit={submit} className="stock-form">
          <input
            type="number"
            placeholder="Market Rate"
            value={form.marketRate}
            onChange={(e) => setForm({ ...form, marketRate: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Company Buying Rate"
            value={form.companyRate}
            onChange={(e) => setForm({ ...form, companyRate: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Source (e.g., manual or URL)"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <button type="submit">Save Rate</button>
        </form>
      </div>
    </div>
  );
};

export default AdminRates;
