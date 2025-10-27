import React, { useCallback, useEffect, useState } from 'react';

export default function StaffDashboard() {
  const [data, setData] = useState({ worker: null, attendance: null, route: null });
  const [shiftSchedule, setShiftSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/workers/field/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchShiftSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/workers/field/shift-schedule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setShiftSchedule(json);
      }
    } catch (e) {
      console.error('Failed to load shift schedule:', e);
    }
  }, [token]);

  useEffect(() => { 
    fetchDashboard(); 
    fetchShiftSchedule();
    
    // Refresh every 30 seconds instead of on every render
    const interval = setInterval(() => {
      fetchDashboard();
      fetchShiftSchedule();
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const action = async (type) => {
    try {
      const url = type === 'in' ? '/api/workers/field/attendance/check-in' : '/api/workers/field/attendance/check-out';
      const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Action failed');
      await fetchDashboard();
    } catch (e) {
      alert(e.message || 'Failed');
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>;

  const { worker, attendance, route } = data;

  return (
    <div style={{ padding: 16 }}>
      <h2>Staff Dashboard</h2>

      <section style={{ marginBottom: 16 }}>
        <h3>Profile</h3>
        {worker ? (
          <div>
            <div><strong>Name:</strong> {worker.name}</div>
            <div><strong>Daily Wage:</strong> ₹ {worker.dailyWage || 0}</div>
            <div><strong>Contact:</strong> {worker.contactNumber || '-'}</div>
            <div><strong>Origin:</strong> {worker.origin}</div>
          </div>
        ) : <div>No profile linked</div>}
      </section>

      <section style={{ marginBottom: 16 }}>
        <h3>Today's Shift</h3>
        {shiftSchedule?.myAssignment ? (
          <div style={{ 
            background: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '1px solid #2196f3',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <i className={`fas ${shiftSchedule.myAssignment.shiftType === 'Morning' ? 'fa-sun' : 'fa-moon'}`} 
                 style={{ marginRight: '8px', color: '#1976d2' }}></i>
              <strong style={{ color: '#1976d2' }}>{shiftSchedule.myAssignment.shiftType} Shift</strong>
            </div>
            <div><strong>Start:</strong> {shiftSchedule.myAssignment.startTime}</div>
            <div><strong>End:</strong> {shiftSchedule.myAssignment.endTime}</div>
          </div>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No shift assigned for this week</div>
        )}
        <div style={{ marginTop: '10px' }}>
          <a href="/staff/shift-schedule" style={{ 
            color: '#1976d2', 
            textDecoration: 'none', 
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <i className="fas fa-clock"></i> View Full Schedule
          </a>
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h3>Attendance (Today)</h3>
        <div>
          <div><strong>Check-in:</strong> {attendance?.checkInAt ? new Date(attendance.checkInAt).toLocaleTimeString() : '-'}</div>
          <div><strong>Check-out:</strong> {attendance?.checkOutAt ? new Date(attendance.checkOutAt).toLocaleTimeString() : '-'}</div>
          {attendance?.isLate && (
            <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Late arrival</div>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => action('in')} disabled={!!attendance?.checkInAt}>Check In</button>{' '}
          <button onClick={() => action('out')} disabled={!attendance?.checkInAt || !!attendance?.checkOutAt}>Check Out</button>
        </div>
      </section>

      <section>
        <h3>Today Route</h3>
        {route ? (
          <div>
            <div><strong>Status:</strong> {route.status}</div>
            <div><strong>Started:</strong> {route.startedAt ? new Date(route.startedAt).toLocaleTimeString() : '-'}</div>
            <div><strong>Completed:</strong> {route.completedAt ? new Date(route.completedAt).toLocaleTimeString() : '-'}</div>
          </div>
        ) : <div>No route assigned</div>}
      </section>
    </div>
  );
}