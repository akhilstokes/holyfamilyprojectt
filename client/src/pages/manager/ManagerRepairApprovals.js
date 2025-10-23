import React, { useEffect, useState } from 'react';

function ManagerRepairApprovals() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/repairs?status=awaiting-approval', {
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

  const act = async (id, action) => {
    try {
      const res = await fetch(`/api/repairs/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Action failed');
      setJobs(prev => prev.filter(j => j._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2>Manager: Repair Approvals</h2>
        <p className="text-muted">Approve or reject completed lumb removal/repair jobs.</p>
        {loading && <div>Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !jobs.length && <div className="text-muted">No jobs awaiting approval.</div>}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Barrel</th>
                <th>Type</th>
                <th>Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j._id}>
                  <td>{j._id}</td>
                  <td>{j.barrelId}</td>
                  <td>{j.type}</td>
                  <td>{new Date(j.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-success" onClick={() => act(j._id, 'approve')}>Approve</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => act(j._id, 'reject')}>Reject</button>
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

export default ManagerRepairApprovals;
