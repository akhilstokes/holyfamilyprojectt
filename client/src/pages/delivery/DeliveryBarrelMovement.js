import React, { useState } from 'react';
import './DeliveryTheme.css';

function DeliveryBarrelMovement() {
  const [barrelId, setBarrelId] = useState('');
  const [location, setLocation] = useState('field');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!barrelId) { setError('Barrel ID is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/barrels/${barrelId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ currentLocation: location })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update location');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card-body">
        <h2>Field: Barrel Movement</h2>
        <p className="text-muted">Scan or enter barrel ID to update current location between field and factory.</p>
        <form onSubmit={submit} className="form-grid">
          <div className="form-group">
            <label>Barrel ID (Mongo _id)</label>
            <input value={barrelId} onChange={e => setBarrelId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Current Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)}>
              <option value="field">Field</option>
              <option value="factory">Factory</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Location'}</button>
        </form>
        {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}
        {result && (
          <div className="alert alert-success" style={{ marginTop: 12 }}>
            <div><strong>Barrel:</strong> {result.barrelId}</div>
            <div><strong>Location:</strong> {result.currentLocation}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBarrelMovement;
