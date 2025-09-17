import React, { useEffect, useMemo, useState } from 'react';

const StaffAttendance = () => {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');

  const load = async () => {
    try {
      setLoading(true);
      const [resToday, resHist] = await Promise.all([
        fetch(`${base}/api/workers/field/today`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/api/workers/field/attendance/history?limit=30`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Safely parse JSON only when content-type is JSON
      const safeJson = async (res) => {
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Unexpected response (status ${res.status}). Not JSON. First 60 chars: ${text.slice(0,60)}`);
        }
        return res.json();
      };

      const jsonToday = await safeJson(resToday);
      const jsonHist = await safeJson(resHist);
      setToday(jsonToday || null);
      setHistory(Array.isArray(jsonHist) ? jsonHist : []);
    } catch (e) {
      // Show a friendly message in UI instead of crashing
      setToday({ error: e.message });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const checkIn = async () => {
    await fetch(`${base}/api/workers/field/attendance/check-in`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    await load();
  };
  const checkOut = async () => {
    await fetch(`${base}/api/workers/field/attendance/check-out`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  const checkedIn = !!today?.attendance?.checkInAt;
  const checkedOut = !!today?.attendance?.checkOutAt;
  const isLate = !!today?.attendance?.isLate;

  // Timer for ongoing session
  const elapsed = useMemo(() => {
    if (!checkedIn || checkedOut) return null;
    const start = new Date(today.attendance.checkInAt).getTime();
    return start;
  }, [today, checkedIn, checkedOut]);

  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    if (!elapsed) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [elapsed]);

  const formatDuration = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Attendance</h2>
      {today?.error && (
        <div style={{ marginTop: 8, color: 'crimson' }}>
          {today.error}
        </div>
      )}
      <div style={{ marginTop: 12 }}>
        {!checkedIn && (
          <button className="btn btn-primary" onClick={checkIn}>Check In</button>
        )}
        {checkedIn && !checkedOut && (
          <>
            <button className="btn btn-success" onClick={checkOut}>Check Out</button>
            <div style={{ marginTop: 8, fontWeight: 600 }}>
              Session Time: {formatDuration(tick - new Date(today.attendance.checkInAt).getTime())}
            </div>
          </>
        )}
        {checkedIn && checkedOut && (
          <div className="alert alert-info" style={{ marginTop: 8 }}>You have completed attendance today.</div>
        )}
        {checkedIn && (
          <div style={{ marginTop: 8 }}>
            <span className="badge badge-success" style={{ marginRight: 8 }}>Marked</span>
            {isLate && <span className="badge badge-danger">Late</span>}
          </div>
        )}
      </div>

      <h3 style={{ marginTop: 24 }}>History (last 30 days)</h3>
      <table className="dashboard-table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Late</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {history.map((rec) => {
            const checkInAt = rec.checkInAt ? new Date(rec.checkInAt) : null;
            const checkOutAt = rec.checkOutAt ? new Date(rec.checkOutAt) : null;
            const duration = checkInAt && checkOutAt ? formatDuration(checkOutAt - checkInAt) : '-';
            const day = new Date(rec.date);
            return (
              <tr key={rec._id}>
                <td>{day.toLocaleDateString()}</td>
                <td>{checkInAt ? checkInAt.toLocaleTimeString() : '-'}</td>
                <td>{checkOutAt ? checkOutAt.toLocaleTimeString() : '-'}</td>
                <td>{rec.isLate ? 'Yes' : 'No'}</td>
                <td>{duration}</td>
              </tr>
            );
          })}
          {history.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>No records</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StaffAttendance;

