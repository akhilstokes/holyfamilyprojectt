import React, { useEffect, useState } from 'react';

function LabRepairJobs() {
  const [barrelId, setBarrelId] = useState('');
  const [type, setType] = useState('lumb-removal');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/repairs?status=in-progress', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load');
      setJobs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const open = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/repairs/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ barrelId, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to open job');
      setBarrelId('');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const log = async (id) => {
    const step = prompt('Step name');
    const note = prompt('Note (optional)') || '';
    if (!step) return;
    try {
      const res = await fetch(`/api/repairs/${id}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ step, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to log');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const complete = async (id) => {
    if (!window.confirm('Mark job complete and send for approval?')) return;
    try {
      const res = await fetch(`/api/repairs/${id}/complete`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to complete');
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2>Lab: Lumb Removal & Repair Jobs</h2>
        <p className="text-muted">Open jobs, append logs, and complete for manager approval.</p>
        <form onSubmit={open} className="form-grid" style={{ marginBottom: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Barrel ID (Mongo _id)</label>
              <input value={barrelId} onChange={e => setBarrelId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="lumb-removal">Lumb Removal</option>
                <option value="repair">Repair</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary">Open Job</button>
        </form>

        {loading && <div>Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Barrel</th>
                <th>Type</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j._id}>
                  <td>{j._id}</td>
                  <td>{j.barrelId}</td>
                  <td>{j.type}</td>
                  <td>{j.status}</td>
                  <td>{new Date(j.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm" onClick={() => log(j._id)}>Log</button>
                      <button className="btn btn-sm btn-success" onClick={() => complete(j._id)}>Complete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LabRepairJobs;
