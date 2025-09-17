import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Admin Weekly Shift Management (Sunday-based week)
// - Set Morning/Evening times for a week
// - Assign staff to Morning/Evening for that week
// - View assignments and current times

const defaultTimes = {
  morningStart: '09:00',
  morningEnd: '13:00',
  eveningStart: '14:00',
  eveningEnd: '18:00',
};

function toSunday(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  // Return YYYY-MM-DD for input and API
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

const ManageShifts = () => {
  const token = localStorage.getItem('token');
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [weekStartInput, setWeekStartInput] = useState(() => {
    // Initialize to this week's Sunday
    return toSunday(new Date().toISOString().slice(0, 10));
  });
  const [times, setTimes] = useState(defaultTimes);
  const [schedule, setSchedule] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [assign, setAssign] = useState({ staffId: '', shiftType: 'Morning' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadStaff = async () => {
    const { data } = await axios.get('/api/admin/staff', config);
    setStaffList(data || []);
    if (!assign.staffId && Array.isArray(data) && data.length > 0) {
      setAssign(a => ({ ...a, staffId: data[0]._id }));
    }
  };

  const loadSchedule = async () => {
    setError('');
    setMessage('');
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/weekly-schedule', {
        ...config,
        params: { weekStart: weekStartInput },
      });
      if (data) {
        setSchedule(data);
        setTimes({
          morningStart: data.morningStart,
          morningEnd: data.morningEnd,
          eveningStart: data.eveningStart,
          eveningEnd: data.eveningEnd,
        });
      } else {
        setSchedule(null);
        setTimes(defaultTimes);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartInput]);

  const onTimesChange = (e) => {
    setTimes({ ...times, [e.target.name]: e.target.value });
  };

  const saveTimes = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axios.post('/api/admin/weekly-schedule', {
        weekStart: weekStartInput,
        morningStart: times.morningStart,
        morningEnd: times.morningEnd,
        eveningStart: times.eveningStart,
        eveningEnd: times.eveningEnd,
      }, config);
      setMessage('Weekly times saved');
      await loadSchedule();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save weekly times');
    }
  };

  const assignStaff = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!assign.staffId) { setError('Select a staff'); return; }
      await axios.post('/api/admin/weekly-schedule/assign', {
        weekStart: weekStartInput,
        staffId: assign.staffId,
        shiftType: assign.shiftType,
      }, config);
      setMessage('Staff assigned');
      await loadSchedule();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign');
    }
  };

  return (
    <div>
      <h2>Weekly Shift Management</h2>
      <p style={{ color: '#555' }}>
        Week start is Sunday. Set weekly Morning/Evening times and assign staff to a shift for the week.
      </p>

      {/* Week selector */}
      <div className="form-container" style={{ maxWidth: 720 }}>
        <div className="input-group">
          <label>Pick any date of the week</label>
          <input
            type="date"
            value={weekStartInput}
            onChange={(e) => setWeekStartInput(toSunday(e.target.value))}
            className="form-input"
          />
          <small>Normalized to Sunday: {weekStartInput}</small>
        </div>
      </div>

      {/* Weekly times */}
      <div className="form-container" style={{ maxWidth: 720, marginTop: 16 }}>
        <h3>Set Weekly Times</h3>
        {error && <div className="error-message">{error}</div>}
        {message && <div style={{ color: 'green' }}>{message}</div>}
        <form onSubmit={saveTimes}>
          <div className="input-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Morning Start</label>
              <input type="time" name="morningStart" value={times.morningStart} onChange={onTimesChange} className="form-input" />
            </div>
            <div>
              <label>Morning End</label>
              <input type="time" name="morningEnd" value={times.morningEnd} onChange={onTimesChange} className="form-input" />
            </div>
            <div>
              <label>Evening Start</label>
              <input type="time" name="eveningStart" value={times.eveningStart} onChange={onTimesChange} className="form-input" />
            </div>
            <div>
              <label>Evening End</label>
              <input type="time" name="eveningEnd" value={times.eveningEnd} onChange={onTimesChange} className="form-input" />
            </div>
          </div>
          <button className="form-button" type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {loading ? 'Saving...' : 'Save Weekly Times'}
          </button>
        </form>
      </div>

      {/* Assign staff */}
      <div className="form-container" style={{ maxWidth: 720, marginTop: 24 }}>
        <h3>Assign Staff to Week</h3>
        <form onSubmit={assignStaff}>
          <div className="input-group">
            <label>Staff</label>
            <select
              value={assign.staffId}
              onChange={(e) => setAssign({ ...assign, staffId: e.target.value })}
              className="form-input"
            >
              {staffList.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Shift Type</label>
            <select
              value={assign.shiftType}
              onChange={(e) => setAssign({ ...assign, shiftType: e.target.value })}
              className="form-input"
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
          <button className="form-button" type="submit">Assign</button>
        </form>
      </div>

      {/* Current schedule */}
      <div style={{ marginTop: 24 }}>
        <h3>Current Week Schedule</h3>
        {!schedule && <div style={{ color: '#888' }}>No schedule for this week yet.</div>}
        {schedule && (
          <>
            <div style={{ marginBottom: 8 }}>
              <strong>Times:</strong>
              <div>Morning: {schedule.morningStart} - {schedule.morningEnd}</div>
              <div>Evening: {schedule.eveningStart} - {schedule.eveningEnd}</div>
            </div>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Shift</th>
                </tr>
              </thead>
              <tbody>
                {(schedule.assignments || []).map(a => (
                  <tr key={String(a.staff?._id || a.staff)}>
                    <td>{a.staff?.name || a.staff}</td>
                    <td>{a.shiftType}</td>
                  </tr>
                ))}
                {(schedule.assignments || []).length === 0 && (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: '#888' }}>No assignments yet</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageShifts;