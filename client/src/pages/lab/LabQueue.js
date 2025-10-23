import React, { useEffect, useMemo, useState } from 'react';

const LabQueue = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [pending, setPending] = useState([]);
  const [doneToday, setDoneToday] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${base}/api/lab/samples/pending`, { headers }),
        fetch(`${base}/api/lab/samples/today`, { headers }),
      ]);
      const p = res1.ok ? await res1.json() : [];
      const d = res2.ok ? await res2.json() : [];
      setPending(Array.isArray(p) ? p : (Array.isArray(p?.items) ? p.items : []));
      setDoneToday(Array.isArray(d) ? d : (Array.isArray(d?.items) ? d.items : []));
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setPending([]); setDoneToday([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
      <div className="dash-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Queue / Worklist</h3>
        <p style={{ color: '#64748b' }}>Samples pending analysis</p>
        {error && <div className="error-message">{error}</div>}
        {loading ? <div>Loading...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Supplier</th>
                  <th>Batch</th>
                  <th>Qty (L)</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {pending.length ? pending.map((s, i) => (
                  <tr key={i}>
                    <td>{s.sampleId || '-'}</td>
                    <td>{s.supplier || '-'}</td>
                    <td>{s.batch || '-'}</td>
                    <td>{s.quantityLiters ?? '-'}</td>
                    <td>{s.receivedAt ? new Date(s.receivedAt).toLocaleString() : '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ color: '#9aa' }}>Queue is empty</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="dash-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Samples Analyzed Today</h3>
        {loading ? <div>Loading...</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>DRC %</th>
                  <th>Analyzed At</th>
                </tr>
              </thead>
              <tbody>
                {doneToday.length ? doneToday.map((s, i) => (
                  <tr key={i}>
                    <td>{s.sampleId || '-'}</td>
                    <td>{s.drc ?? '-'}</td>
                    <td>{s.analyzedAt ? new Date(s.analyzedAt).toLocaleString() : '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} style={{ color: '#9aa' }}>No samples analyzed yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabQueue;
