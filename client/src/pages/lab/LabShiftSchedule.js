import React, { useEffect, useState } from 'react';
import '../staff/StaffShiftSchedule.css';

const LabShiftSchedule = () => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const base = process.env.REACT_APP_API_URL || '';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchShiftSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      const url = `${base}/api/workers/lab/shift-schedule`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const ct = response.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await response.json() : null;
      if (response.ok) {
        setSchedule(data);
      } else {
        setError((data && data.message) || `Failed to load shift schedule (${response.status})`);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load shift schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShiftSchedule(); }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  const getWeekDates = (weekStart) => {
    const start = new Date(weekStart);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  if (loading) return (
    <div className="staff-shift-schedule">
      <div className="loading">Loading shift schedule...</div>
    </div>
  );
  if (error) return (
    <div className="staff-shift-schedule">
      <div className="header"><h2>My Lab Shift Schedule</h2></div>
      <div className="error" style={{ marginTop: 8 }}>{error}</div>
      <div className="no-schedule" style={{ marginTop: 12 }}>
        <h3>No schedule available</h3>
        <p>Ask your manager to create Lab Staff shifts in <code>/manager/shifts</code> with Target Group = Lab.</p>
        <button onClick={fetchShiftSchedule} className="retry-btn" style={{ marginTop: 8 }}>Retry</button>
      </div>
    </div>
  );

  // Normalize times with defaults
  const morningStart = (schedule && schedule.morningStart) || '09:00';
  const morningEnd = (schedule && schedule.morningEnd) || '17:00';
  const eveningStart = (schedule && schedule.eveningStart) || '17:00';
  const eveningEnd = (schedule && schedule.eveningEnd) || '17:00';
  const myAssignment = (schedule && schedule.myAssignment) || { shiftType: 'Morning', startTime: morningStart, endTime: morningEnd };

  return (
    <div className="staff-shift-schedule">
      <div className="header">
        <h2>My Lab Shift Schedule</h2>
        <button onClick={fetchShiftSchedule} className="refresh-btn"><i className="fas fa-sync-alt"></i> Refresh</button>
      </div>

      <div className="schedule-content">
          <div className="week-info">
            <h3>Week of {formatDate((schedule && schedule.weekStart) || new Date())}</h3>
            <div className="week-dates">
              {getWeekDates((schedule && schedule.weekStart) || new Date()).map((date, i) => (
                <div key={i} className={`day ${date.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                  <div className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="day-number">{date.getDate()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-assignment">
            <h3>My Shift Assignment</h3>
            <div className="assignment-card">
              <div className="shift-type">
                <i className={`fas ${myAssignment.shiftType === 'Morning' ? 'fa-sun' : 'fa-moon'}`}></i>
                <span className="shift-name">{myAssignment.shiftType} Shift</span>
              </div>
              <div className="shift-times">
                <div className="time-slot"><span className="time-label">Start Time:</span><span className="time-value">{myAssignment.startTime || morningStart}</span></div>
                <div className="time-slot"><span className="time-label">End Time:</span><span className="time-value">{myAssignment.endTime || morningEnd}</span></div>
              </div>
            </div>
          </div>

          <div className="all-shifts">
            <h3>All Shift Times This Week</h3>
            <div className="shifts-grid">
              <div className="shift-info">
                <div className="shift-header"><i className="fas fa-sun"></i><span>Morning Shift</span></div>
                <div className="shift-time">{morningStart} - {morningEnd}</div>
              </div>
              <div className="shift-info">
                <div className="shift-header"><i className="fas fa-moon"></i><span>Evening Shift</span></div>
                <div className="shift-time">{eveningStart} - {eveningEnd}</div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default LabShiftSchedule;
