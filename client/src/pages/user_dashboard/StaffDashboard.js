import React, { useEffect, useState, useCallback, useRef } from 'react';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const [data, setData] = useState({ worker: null, attendance: null, route: null });
  const [shiftSchedule, setShiftSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const hasLoadedRef = useRef(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/api/workers/field/dashboard`, {
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
  }, [token, apiBase]);

  const fetchShiftSchedule = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/workers/field/shift-schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setShiftSchedule(json);
      }
    } catch (e) {
      console.error('Failed to load shift schedule:', e);
    }
  }, [token, apiBase]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    let isActive = true;
    (async () => {
      if (!isActive) return;
      await fetchDashboard();
      if (!isActive) return;
      await fetchShiftSchedule();
    })();
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  if (loading) return <div className="loading-state">⏳ Loading your dashboard...</div>;
  if (error) return <div className="error-state">❌ {error}</div>;

  const { worker, attendance, route } = data;

  return (
    <div className="staff-dashboard">
      <div className="staff-dashboard-header">
        <h2>👋 Welcome Back, {worker?.name || 'Staff Member'}!</h2>
        <p>Here's your dashboard overview for today</p>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon profile">
              <i className="fas fa-user"></i>
            </div>
            <h3>Profile</h3>
          </div>
          <div className="card-body">
            {worker ? (
              <>
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{worker.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Daily Wage</span>
                  <span className="info-value">₹ {worker.dailyWage || 0}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{worker.contactNumber || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Origin</span>
                  <span className="info-value">{worker.origin || '-'}</span>
                </div>
              </>
            ) : (
              <div className="no-data">No profile linked</div>
            )}
          </div>
        </div>

        {/* Shift Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon shift">
              <i className="fas fa-clock"></i>
            </div>
            <h3>Today's Shift</h3>
          </div>
          <div className="card-body">
            {shiftSchedule?.myAssignment ? (
              <>
                <div className="shift-badge">
                  <i className={`fas ${shiftSchedule.myAssignment.shiftType === 'Morning' ? 'fa-sun' : 'fa-moon'}`}></i>
                  {shiftSchedule.myAssignment.shiftType} Shift
                </div>
                <div className="info-row">
                  <span className="info-label">Start Time</span>
                  <span className="info-value">{shiftSchedule.myAssignment.startTime}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">End Time</span>
                  <span className="info-value">{shiftSchedule.myAssignment.endTime}</span>
                </div>
                <a href="/staff/shift-schedule" className="view-schedule-link">
                  <i className="fas fa-calendar-alt"></i>
                  View Full Schedule
                </a>
              </>
            ) : (
              <div className="no-data">No shift assigned for this week</div>
            )}
          </div>
        </div>

        {/* Attendance Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon attendance">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <h3>Attendance (Today)</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Check-in</span>
              <span className="info-value">{attendance?.checkInAt ? new Date(attendance.checkInAt).toLocaleTimeString() : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Check-out</span>
              <span className="info-value">{attendance?.checkOutAt ? new Date(attendance.checkOutAt).toLocaleTimeString() : '-'}</span>
            </div>
            {attendance?.isLate && (
              <div className="late-badge">
                <i className="fas fa-exclamation-triangle"></i>
                Late arrival
              </div>
            )}
            <div className="attendance-actions">
              <button className="btn-check-in" onClick={() => action('in')} disabled={!!attendance?.checkInAt}>
                <i className="fas fa-sign-in-alt"></i>
                Check In
              </button>
              <button className="btn-check-out" onClick={() => action('out')} disabled={!attendance?.checkInAt || !!attendance?.checkOutAt}>
                <i className="fas fa-sign-out-alt"></i>
                Check Out
              </button>
            </div>
          </div>
        </div>

        {/* Route Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <div className="card-icon route">
              <i className="fas fa-route"></i>
            </div>
            <h3>Today's Route</h3>
          </div>
          <div className="card-body">
            {route ? (
              <>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className={`status-badge ${route.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {route.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Started</span>
                  <span className="info-value">{route.startedAt ? new Date(route.startedAt).toLocaleTimeString() : '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Completed</span>
                  <span className="info-value">{route.completedAt ? new Date(route.completedAt).toLocaleTimeString() : '-'}</span>
                </div>
              </>
            ) : (
              <div className="no-data">No route assigned</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}