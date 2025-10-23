import React, { useState } from 'react';

function LabBarrelWeights() {
  const [barrelId, setBarrelId] = useState('');
  const [baseWeight, setBaseWeight] = useState('');
  const [emptyWeight, setEmptyWeight] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!barrelId) { setError('Barrel ID is required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/barrels/${barrelId}/weights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          baseWeight: baseWeight ? Number(baseWeight) : undefined,
          emptyWeight: emptyWeight ? Number(emptyWeight) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update weights');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card-body">
        <h2>Lab: Barrel Weights & Lumb Detection</h2>
        <p className="text-muted">Enter base and empty weights. If lumb &gt; 20%, the system will flag and notify Manager/Admin.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Barrel ID (Mongo _id)</label>
            <input value={barrelId} onChange={e => setBarrelId(e.target.value)} placeholder="e.g. 670f..." required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Base Weight (kg)</label>
              <input type="number" value={baseWeight} onChange={e => setBaseWeight(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Empty Weight (kg)</label>
              <input type="number" value={emptyWeight} onChange={e => setEmptyWeight(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save & Evaluate'}</button>
        </form>
        {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}
        {result && (
          <div className="alert alert-success" style={{ marginTop: 12 }}>
            <div><strong>Barrel:</strong> {result.barrelId}</div>
            <div><strong>Lumb %:</strong> {result.lumbPercent ?? 0}%</div>
            <div><strong>Condition:</strong> {result.condition || 'ok'}</div>
            <div><strong>Damage Type:</strong> {result.damageType || 'none'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LabBarrelWeights;
