import React, { useEffect, useMemo, useState } from 'react';

function useQuery() {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}

const BarrelHistory = () => {
  const token = localStorage.getItem('token');
  const q = useQuery();
  const [barrelId, setBarrelId] = useState(q.get('barrelId') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);

  const load = async (id) => {
    if (!id) return;
    setLoading(true); setError(''); setLogs([]);
    try {
      const res = await fetch(`/api/barrel-logistics/movement/${encodeURIComponent(id)}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load history');
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (barrelId) load(barrelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => { e.preventDefault(); load(barrelId); };

  return (
    <div className="card">
      <div className="card-body">
        <h2>Barrel History</h2>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <input placeholder="Barrel ID (e.g., BHFP01)" value={barrelId} onChange={(e)=>setBarrelId(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={!barrelId || loading}>Load</button>
        </form>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <div>Loading...</div>}
        {!loading && logs.length === 0 && !error && (
          <div className="text-muted">No history.</div>
        )}
        {logs.length > 0 && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Δ Volume</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id}>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
                    <td>{l.type}</td>
                    <td>{l.fromLocation || '-'}</td>
                    <td>{l.toLocation || '-'}</td>
                    <td>{l.volumeDelta ?? '-'}</td>
                    <td>{l.createdBy?.name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarrelHistory;
