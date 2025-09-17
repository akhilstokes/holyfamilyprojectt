import React, { useEffect, useMemo, useState } from 'react';
import { listBarrelScrapes } from '../../services/storeService';

const WorkHistoryPage = () => {
  const [scrapes, setScrapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const avgYield = useMemo(() => {
    if (!scrapes.length) return null;
    const ys = scrapes.map(s => Number(s.yieldPercent || 0));
    return Math.round((ys.reduce((a, b) => a + b, 0) / ys.length) * 100) / 100;
  }, [scrapes]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await listBarrelScrapes();
        setScrapes(list);
      } catch (e) {
        setMessage('Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h3>Work History</h3>
      {avgYield != null && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-body">Average Yield: <strong>{avgYield}%</strong></div>
        </div>
      )}
      <div className="card">
        <div className="card-header">Scrape Entries</div>
        <div className="card-body">
          {loading ? 'Loading...' : (
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Barrel</th><th>Total (kg)</th><th>Lump (kg)</th><th>Yield %</th></tr>
              </thead>
              <tbody>
                {scrapes.map(s => (
                  <tr key={s._id}>
                    <td>{new Date(s.createdAt).toLocaleString()}</td>
                    <td>{s.barrelId}</td>
                    <td>{s.totalWeightKg}</td>
                    <td>{s.lumpRubberKg}</td>
                    <td>{s.yieldPercent != null ? Math.round(s.yieldPercent * 100) / 100 : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {message && <div>{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default WorkHistoryPage;


