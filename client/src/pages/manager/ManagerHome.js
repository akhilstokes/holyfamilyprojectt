import React, { useEffect, useState, useCallback } from 'react';

const ManagerHome = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({
    today: { present: 0, absent: 0, late: 0 },
    week: { present: 0, absences: 0 },
    pendingLeaves: 0,
  });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // These endpoints are placeholders; wire to real ones when available
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [resToday, resWeek, resLeaves] = await Promise.all([
        fetch(`${base}/api/attendance/summary/today`, { headers }),
        fetch(`${base}/api/attendance/summary/week`, { headers }),
        fetch(`${base}/api/leave/pending-count`, { headers }),
      ]);
      const safeJson = async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return null;
        return res.json();
      };
      const [jToday, jWeek, jLeaves] = await Promise.all([
        safeJson(resToday), safeJson(resWeek), safeJson(resLeaves)
      ]);
      setSummary({
        today: jToday || { present: 0, absent: 0, late: 0 },
        week: jWeek || { present: 0, absences: 0 },
        pendingLeaves: (jLeaves && jLeaves.count) || 0,
      });
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, base]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Manager Overview</h2>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
          <div className="dash-card">
            <h4 style={{ marginTop: 0 }}>Today Attendance</h4>
            <div>Present: <b>{summary.today.present}</b></div>
            <div>Absent: <b>{summary.today.absent}</b></div>
            <div>Late: <b>{summary.today.late}</b></div>
          </div>
          <div className="dash-card">
            <h4 style={{ marginTop: 0 }}>This Week</h4>
            <div>Present Entries: <b>{summary.week.present}</b></div>
            <div>Absences: <b>{summary.week.absences}</b></div>
          </div>
          <div className="dash-card">
            <h4 style={{ marginTop: 0 }}>Pending Approvals</h4>
            <div>Leave Requests: <b>{summary.pendingLeaves}</b></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerHome;
