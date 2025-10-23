import React, { useEffect, useMemo, useState } from 'react';
import { listSchedules, upsertSchedule, updateScheduleAssignments, getScheduleByWeek } from '../../services/adminService';

// Helpers
const iso = (d) => new Date(d).toISOString().slice(0, 10);
const sundayOf = (d) => {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const WorkerSchedule = () => {
  const today = useMemo(() => new Date(), []);

  const [weekStart, setWeekStart] = useState(iso(sundayOf(today)));
  
  // Get minimum allowed date (current week start)
  const minDate = useMemo(() => {
    const currentWeekStart = sundayOf(today);
    return iso(currentWeekStart);
  }, [today]);
  const [form, setForm] = useState({
    morningStart: '09:00',
    morningEnd: '17:00',
    eveningStart: '13:00',
    eveningEnd: '21:00',
  });
  const [assignments, setAssignments] = useState([]); // { staff, shiftType }
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await listSchedules({});
      setList(Array.isArray(items) ? items : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const loadWeek = async () => {
    setError('');
    try {
      const data = await getScheduleByWeek(weekStart);
      if (data) {
        setForm({
          morningStart: data.morningStart || '09:00',
          morningEnd: data.morningEnd || '17:00',
          eveningStart: data.eveningStart || '13:00',
          eveningEnd: data.eveningEnd || '21:00',
        });
        setAssignments(
          Array.isArray(data.assignments)
            ? data.assignments.map((a) => ({ staff: a.staff, shiftType: a.shiftType }))
            : []
        );
      } else {
        setAssignments([]);
      }
    } catch {
      setAssignments([]);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  const onUpsert = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await upsertSchedule({ weekStart, ...form, assignments });
      await fetchList();
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'Failed to save');
    }
  };

  const onAssignmentsSave = async () => {
    try {
      const current = await getScheduleByWeek(weekStart);
      if (!current?._id) throw new Error('Create the schedule first');
      await updateScheduleAssignments(current._id, assignments);
      await fetchList();
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'Failed to update assignments');
    }
  };

  const addAssignment = () => setAssignments((a) => [...a, { staff: '', shiftType: 'Morning' }]);
  const updateAssignment = (idx, key, val) =>
    setAssignments((a) => a.map((x, i) => (i === idx ? { ...x, [key]: val } : x)));
  const removeAssignment = (idx) => setAssignments((a) => a.filter((_, i) => i !== idx));

  return (
    <div>
      <h2>Worker Schedule</h2>

      <form
        onSubmit={onUpsert}
        style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <div>
          <label>Week Start (Sunday)</label>
          <br />
          <input 
            type="date" 
            value={weekStart} 
            min={minDate}
            onChange={(e) => setWeekStart(e.target.value)} 
            required 
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Only current week and future weeks are allowed
          </div>
        </div>
        <div>
          <label>Morning Start</label>
          <br />
          <input
            type="time"
            value={form.morningStart}
            onChange={(e) => setForm((s) => ({ ...s, morningStart: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Morning End</label>
          <br />
          <input
            type="time"
            value={form.morningEnd}
            onChange={(e) => setForm((s) => ({ ...s, morningEnd: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Evening Start</label>
          <br />
          <input
            type="time"
            value={form.eveningStart}
            onChange={(e) => setForm((s) => ({ ...s, eveningStart: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Evening End</label>
          <br />
          <input
            type="time"
            value={form.eveningEnd}
            onChange={(e) => setForm((s) => ({ ...s, eveningEnd: e.target.value }))}
            required
          />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button type="submit">Save Schedule</button>
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        <h3>Assignments</h3>
        <button type="button" onClick={addAssignment}>
          Add
        </button>
        <div style={{ marginTop: 8 }}>
          {assignments.map((a, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input
                placeholder="Staff ID"
                value={a.staff}
                onChange={(e) => updateAssignment(idx, 'staff', e.target.value)}
              />
              <select value={a.shiftType} onChange={(e) => updateAssignment(idx, 'shiftType', e.target.value)}>
                <option>Morning</option>
                <option>Evening</option>
              </select>
              <button onClick={() => removeAssignment(idx)} type="button">
                Remove
              </button>
            </div>
          ))}
          {!assignments.length && <div style={{ color: '#888' }}>No assignments</div>}
        </div>
        <button type="button" onClick={onAssignmentsSave}>
          Save Assignments
        </button>
      </div>

      {error && <div style={{ color: 'tomato', marginTop: 12 }}>{error}</div>}

      <div style={{ marginTop: 24 }}>
        <h3>Recent Weeks</h3>
        {loading ? (
          'Loading...'
        ) : (
          <ul>
            {list.map((s) => (
              <li key={s._id}>
                {iso(s.weekStart)} — M: {s.morningStart}-{s.morningEnd}, E: {s.eveningStart}-{s.eveningEnd} — Assignments: {s.assignments?.length || 0}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WorkerSchedule;
