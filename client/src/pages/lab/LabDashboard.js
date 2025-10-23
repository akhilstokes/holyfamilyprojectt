import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const LabDashboard = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await fetch(`${base}/api/lab/summary`, { headers });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          setSummary(null);
        }
      } catch (e) {
        setError(e?.message || 'Failed to load');
        setSummary(null);
      }
    };
    load();
  }, [base, headers]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Lab Dashboard</h2>
        <div style={{ color: '#64748b' }}>Welcome, Lab Staff.</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="dash-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>Samples Pending</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.pendingCount ?? '—'}</div>
        </div>
        <div className="dash-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>Analyzed Today</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.doneToday ?? '—'}</div>
        </div>
        <div className="dash-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>Avg DRC Today</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.avgDrcToday ?? '—'}</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="dash-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn" to="/lab/check-in">Sample Check-In</Link>
          <Link className="btn" to="/lab/drc-update">Update DRC</Link>
          <Link className="btn" to="/lab/queue">View Queue</Link>
          <Link className="btn" to="/lab/reports">Reports</Link>
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
