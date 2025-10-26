import React, { useEffect, useMemo, useState, useCallback } from 'react';

const iso = (d) => new Date(d).toISOString().slice(0,10);

const weekStartOf = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return iso(d);
};

const ManagerShifts = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token]);
  const today = useMemo(() => iso(new Date()), []);
  const [weekStart, setWeekStart] = useState(weekStartOf(today));
  const [form, setForm] = useState({ morningStart: '09:00', morningEnd: '13:00', eveningStart: '13:30', eveningEnd: '18:00', what: 'collection' });
  const [assignments, setAssignments] = useState([]); // [{ staff, shiftType }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repeatCount, setRepeatCount] = useState(1); // weeks to repeat
  const [conflicts, setConflicts] = useState([]);
  const [group, setGroup] = useState('field'); // 'field' | 'delivery' | 'lab' | 'accountant' | 'company'
  const [staffOptions, setStaffOptions] = useState([]); // [{value:_id,label:'Name (staffId/email)'}]
  // Day override state
  const [overrides, setOverrides] = useState([]); // [{date, staff, shiftType}]
  const [ov, setOv] = useState({ date: '', staff: '', shiftType: 'Morning' });
  // Inline assign state
  const [assigningIdx, setAssigningIdx] = useState(-1);
  const [infoMsg, setInfoMsg] = useState('');
  // Helpers
  const onlyDigits = (v) => String(v || '').replace(/\D+/g, '');
  const noSpaces = (v) => String(v || '').replace(/\s+/g, '');
  const isTimeLt = (a, b) => {
    if (!a || !b) return false;
    // a and b in HH:MM
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return ah * 60 + am < bh * 60 + bm;
  };

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${base}/api/schedules/by-week?weekStart=${weekStart}&group=${encodeURIComponent(group)}`, { headers });
      if (res.status === 404) { setAssignments([]); return; }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      setForm({ morningStart: data.morningStart, morningEnd: data.morningEnd, eveningStart: data.eveningStart, eveningEnd: data.eveningEnd, what: data.what || 'collection' });
      setAssignments(Array.isArray(data.assignments) ? data.assignments.map(a => ({ staff: a.staff, shiftType: a.shiftType })) : []);
      setOverrides(Array.isArray(data.overrides) ? data.overrides : []);
    } catch (e) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [base, headers, weekStart, group]);

  // Load schedule when week or group changes.
  useEffect(() => { load(); }, [load]);

  // Map UI group to backend user role for listing
  const roleForGroup = (g) => {
    switch (g) {
      case 'field': return 'field_staff';
      case 'delivery': return 'delivery_staff';
      case 'lab': return 'lab_staff';
      case 'accountant': return 'accountant';
      case 'company': return 'staff'; // company staff
      default: return '';
    }
  };

  // Load staff list for selected group
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const role = roleForGroup(group);
        if (!role) { setStaffOptions([]); return; }
        const res = await fetch(`${base}/api/user-management/staff?role=${encodeURIComponent(role)}&status=active&limit=500`, { headers });
        if (!res.ok) { setStaffOptions([]); return; }
        const data = await res.json();
        const users = data?.users || data?.records || [];
        const opts = users.map(u => ({ value: u._id, label: `${u.name || u.email || u.staffId || u._id}${u.staffId ? ` (${u.staffId})` : ''}` }));
        setStaffOptions(opts);
      } catch (_) { setStaffOptions([]); }
    };
    loadStaff();
  }, [base, headers, group]);

  // When switching to Lab group, default to a single 09:00–17:00 shift
  useEffect(() => {
    if (group === 'lab') {
      setForm((prev) => ({
        ...prev,
        morningStart: '09:00',
        morningEnd: '17:00',
        // Set evening to a no-op window
        eveningStart: '17:00',
        eveningEnd: '17:00'
      }));
    }
  }, [group]);

  // Basic conflict detection & validation: duplicate staff or empty IDs, no spaces in IDs, time ranges, repeatCount
  useEffect(() => {
    const issues = [];
    const seen = new Map();
    assignments.forEach((a, idx) => {
      const staff = noSpaces((a.staff || '').trim());
      if (!staff) issues.push({ type: 'empty', message: `Row ${idx + 1}: Staff ID is required` });
      if (staff && /\s/.test(a.staff)) {
        issues.push({ type: 'space', message: `Row ${idx + 1}: Staff ID must not contain spaces` });
      }
      if (staff) {
        const key = `${staff}`;
        seen.set(key, (seen.get(key) || 0) + 1);
      }
      if (!a.shiftType || (a.shiftType !== 'Morning' && a.shiftType !== 'Evening')) {
        issues.push({ type: 'shift', message: `Row ${idx + 1}: Invalid shift type` });
      }
    });
    for (const [staff, count] of seen.entries()) {
      if (count > 1) issues.push({ type: 'duplicate', message: `Staff ${staff} appears ${count} times` });
    }
    // Time validations
    if (!isTimeLt(form.morningStart, form.morningEnd)) {
      issues.push({ type: 'time', message: 'Morning End must be after Morning Start' });
    }
    if (!isTimeLt(form.eveningStart, form.eveningEnd)) {
      issues.push({ type: 'time', message: 'Evening End must be after Evening Start' });
    }
    // For lab single shift, evening equals morning end/start is allowed but not required here
    // Repeat count validation (1-12), digits only, no spaces
    const rc = Number(onlyDigits(repeatCount));
    if (!rc || rc < 1 || rc > 12) {
      issues.push({ type: 'repeat', message: 'Repeat weeks must be a number between 1 and 12' });
    }
    setConflicts(issues);
  }, [assignments, form, repeatCount]);

  const save = async (e) => {
    e.preventDefault();
    try {
      setError(''); setLoading(true);
      if (conflicts.length) {
        throw new Error('Please resolve conflicts before saving');
      }
      const upsertOne = async (ws) => {
        const normalizedGroup = group === 'lab' ? 'lab' : 'field';
        const body = { weekStart: ws, ...form, assignments, group: normalizedGroup };
        const res = await fetch(`${base}/api/schedules?group=${encodeURIComponent(normalizedGroup)}`, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) {
          let msg = `Save failed for ${ws} (${res.status})`;
          try { const j = await res.json(); if (j?.message) msg = j.message; } catch (_) {}
          throw new Error(msg);
        }
      };
      // Repeat for N weeks (including current)
      const n = Math.max(1, Number(repeatCount) || 1);
      const baseDate = new Date(weekStart);
      for (let i = 0; i < n; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i * 7);
        await upsertOne(iso(d));
      }
      await load();
    } catch (e2) { setError(e2?.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  const onForm = (e) => {
    const { name, value } = e.target;
    // prevent spaces in time fields
    const v = name.includes('Start') || name.includes('End') ? value.replace(/\s+/g, '') : value;
    setForm((s) => ({ ...s, [name]: v }));
  };

  const addAssignment = () => setAssignments((s) => [...s, { staff: '', shiftType: 'Morning' }]);
  const setAssignment = (i, key, value) => setAssignments((s) => s.map((it, idx) => idx === i ? { ...it, [key]: key === 'staff' ? noSpaces(value) : value } : it));
  const removeAssignment = (i) => setAssignments((s) => s.filter((_, idx) => idx !== i));

  const assignNow = async (i) => {
    try {
      setInfoMsg('');
      const row = assignments[i];
      if (!row || !row.staff) { setError('Select a staff before assigning'); return; }
      if (!row.shiftType || (row.shiftType !== 'Morning' && row.shiftType !== 'Evening')) { setError('Select a valid shift'); return; }
      // basic time validation
      if (!isTimeLt(form.morningStart, form.morningEnd)) { setError('Morning time range invalid'); return; }
      if (!isTimeLt(form.eveningStart, form.eveningEnd)) { setError('Evening time range invalid'); return; }
      const timeWindow = row.shiftType === 'Morning' ? `${form.morningStart} - ${form.morningEnd}` : `${form.eveningStart} - ${form.eveningEnd}`;
      const label = staffOptions.find(o=>o.value===row.staff)?.label || row.staff;
      if (!window.confirm(`Assign ${label} to ${row.shiftType} (${timeWindow}) for week starting ${weekStart}?`)) return;
      setAssigningIdx(i);
      const normalizedGroup = group === 'lab' ? 'lab' : 'field';
      const body = { weekStart, ...form, assignments: [{ staff: row.staff, shiftType: row.shiftType }], group: normalizedGroup };
      const res = await fetch(`${base}/api/schedules?group=${encodeURIComponent(normalizedGroup)}`, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) {
        let msg = `Assign failed (${res.status})`;
        try { const j = await res.json(); if (j?.message) msg = j.message; } catch (_) {}
        throw new Error(msg);
      }
      setInfoMsg(`Assigned ${label} to ${row.shiftType} (${timeWindow}) successfully.`);
      await load();
    } catch (e) {
      setError(e?.message || 'Assign failed');
    } finally {
      setAssigningIdx(-1);
    }
  };

  // Helpers for override date boundaries (must be in the current week)
  const weekStartDate = useMemo(() => new Date(weekStart), [weekStart]);
  const weekEndDate = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate()+6); return d; }, [weekStart]);
  const clampToWeek = (val) => {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    const start = new Date(weekStartDate); const end = new Date(weekEndDate);
    if (d < start) return iso(start);
    if (d > end) return iso(end);
    return iso(d);
  };

  const addDayOverride = async () => {
    try {
      setError('');
      if (!ov.date || !ov.staff) throw new Error('Select date and staff');
      const body = { weekStart, group, date: ov.date, staff: ov.staff, shiftType: ov.shiftType };
      const res = await fetch(`${base}/api/schedules/overrides`, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Failed to add override (${res.status})`);
      const data = await res.json();
      setOverrides(Array.isArray(data?.overrides) ? data.overrides : []);
      // keep inputs for quick repeats
    } catch (e) { setError(e?.message || 'Failed to add override'); }
  };

  const removeDayOverride = async (o) => {
    try {
      const body = { weekStart, group, date: o.date, staff: o.staff };
      const res = await fetch(`${base}/api/schedules/overrides`, { method: 'DELETE', headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`Failed to remove override (${res.status})`);
      const data = await res.json();
      setOverrides(Array.isArray(data?.overrides) ? data.overrides : overrides.filter(x => !(String(x.staff)===String(o.staff) && iso(x.date)===iso(o.date))));
    } catch (e) { setError(e?.message || 'Failed to remove override'); }
  };

  const preventInvalidNumberKey = (e) => {
    const invalid = ['e','E','+','-','.',',',' '];
    if (invalid.includes(e.key)) e.preventDefault();
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin: 0 }}>Shift Planning</h2>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Week of</span>
            <input type="date" value={weekStart} onChange={(e)=>setWeekStart(weekStartOf(e.target.value))} style={{ width:'100%' }} />
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Target Group</span>
            <select value={group} onChange={(e)=>setGroup(e.target.value)}>
              <option value="field">Field Staff</option>
              <option value="delivery">Delivery Staff</option>
              <option value="lab">Lab Staff</option>
              <option value="accountant">Accountant</option>
              <option value="company">Company Staff</option>
            </select>
          </label>
        </div>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}

      <form onSubmit={save} style={{ display:'grid', gap:12, marginTop: 12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, alignItems:'end' }}>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Morning Start</span>
            <input type="time" name="morningStart" value={form.morningStart} onChange={onForm} required style={{ width:'100%' }} />
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Morning End</span>
            <input type="time" name="morningEnd" value={form.morningEnd} onChange={onForm} required style={{ width:'100%' }} />
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Evening Start</span>
            <input type="time" name="eveningStart" value={form.eveningStart} onChange={onForm} required style={{ width:'100%' }} />
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Evening End</span>
            <input type="time" name="eveningEnd" value={form.eveningEnd} onChange={onForm} required style={{ width:'100%' }} />
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Repeat weeks</span>
            <select value={repeatCount} onChange={(e)=> setRepeatCount(onlyDigits(e.target.value))} style={{ width:'100%' }}>
              {[1,2,3,4,6,8,12].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Task</span>
            <select name="what" value={form.what} onChange={onForm}>
              <option value="collection">Collection</option>
              <option value="empty_barrel_pickup">Empty Barrel Pickup</option>
              <option value="production_support">Production Support</option>
              <option value="rubber_band_packing">Rubber Band Packing</option>
              <option value="admin_back_office">Admin / Back Office</option>
            </select>
          </label>
          {group === 'lab' && (
            <div style={{ display:'flex', alignItems:'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setForm({ morningStart:'09:00', morningEnd:'17:00', eveningStart:'17:00', eveningEnd:'17:00' })}>
                Apply Lab Standard (09:00–17:00)
              </button>
            </div>
          )}
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ margin: 0 }}>Assignments</h3>
            <button type="button" className="btn" onClick={addAssignment}>Add</button>
          </div>
          <div style={{ marginTop: 8, overflowX:'auto' }}>
            <table className="dashboard-table" style={{ minWidth: 680 }}>
              <thead><tr><th>#</th><th>Staff ID</th><th>Shift</th><th>Actions</th></tr></thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr key={i}>
                    <td>{i+1}</td>
                    <td>
                      {staffOptions.length > 0 ? (
                        <select value={a.staff} onChange={(e)=> setAssignment(i,'staff', e.target.value)}>
                          <option value="">Select staff</option>
                          {staffOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="User ObjectId or Staff ID (no spaces)"
                          value={a.staff}
                          onChange={(e)=>setAssignment(i,'staff', e.target.value)}
                          onKeyDown={(e)=>{ if (e.key === ' ') e.preventDefault(); }}
                        />
                      )}
                      {/* Selected staff display */}
                      {!!a.staff && (
                        <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>
                          {staffOptions.find(o=>o.value===a.staff)?.label || a.staff}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <select value={a.shiftType} onChange={(e)=>setAssignment(i,'shiftType', e.target.value)}>
                          <option>Morning</option>
                          <option>Evening</option>
                        </select>
                        <span style={{ fontSize:12, color:'#64748b' }}>
                          {a.shiftType === 'Evening' ? `${form.eveningStart} - ${form.eveningEnd}` : `${form.morningStart} - ${form.morningEnd}`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        <button type="button" className="btn btn-primary" disabled={assigningIdx===i || loading} onClick={()=>assignNow(i)}>
                          {assigningIdx===i ? 'Assigning...' : 'Assign Now'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={()=>removeAssignment(i)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign:'center', color:'#9aa' }}>No assignments</td></tr>
                )}
              </tbody>
            </table>
            {infoMsg && <div className="alert success" style={{ marginTop:8 }}>{infoMsg}</div>}
            {conflicts.length > 0 && (
              <div style={{ marginTop: 8, color: '#b45309', background:'#fff7ed', border:'1px solid #fed7aa', padding:8, borderRadius:6 }}>
                <b>Conflicts detected</b>
                <ul style={{ margin: '6px 0 0 16px' }}>
                  {conflicts.map((c, idx) => (
                    <li key={idx}>{c.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
          <div style={{ fontSize:12, color:'#64748b' }}>Tip: Save will upsert the selected week. Use "Repeat weeks" to copy this plan forward. Target Group controls whether assignments apply to Field or Lab staff.</div>
          <button type="submit" className="btn btn-primary" disabled={loading || conflicts.length > 0}>{loading ? 'Saving...' : `Save${Number(repeatCount) > 1 ? ` +${Number(repeatCount)-1} weeks` : ''}`}</button>
        </div>
      </form>

      {/* Simple visual weekly calendar */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Weekly Calendar</h3>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Assignments repeat each day for the week.</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>Shift</th>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
            </thead>
            <tbody>
              {['Morning','Evening'].map((shift) => {
                const list = assignments.filter(a => a.shiftType === shift);
                const times = shift === 'Morning' ? `${form.morningStart} - ${form.morningEnd}` : `${form.eveningStart} - ${form.eveningEnd}`;
                const cell = (
                  <div>
                    <div style={{ fontWeight:600 }}>{times}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                      {list.length ? list.map((a, idx) => {
                        const opt = staffOptions.find(o => o.value === a.staff);
                        const label = opt ? opt.label : a.staff;
                        return (
                          <span key={idx} className="badge" style={{ background:'#eef2ff', color:'#3730a3', border:'1px solid #c7d2fe' }}>{label}</span>
                        );
                      }) : <span style={{ color:'#9aa' }}>No assignments</span>}
                    </div>
                  </div>
                );
                return (
                  <tr key={shift}>
                    <td style={{ whiteSpace:'nowrap' }}>{shift}</td>
                    <td>{cell}</td>
                    <td>{cell}</td>
                    <td>{cell}</td>
                    <td>{cell}</td>
                    <td>{cell}</td>
                    <td>{cell}</td>
                    <td>{cell}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day Overrides */}
      <div className="dash-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Day Overrides</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12 }}>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Date</span>
            <input type="date" value={ov.date} min={iso(weekStartDate)} max={iso(weekEndDate)} onChange={(e)=> setOv(s=>({ ...s, date: clampToWeek(e.target.value) }))} />
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Staff</span>
            <select value={ov.staff} onChange={(e)=> setOv(s=>({ ...s, staff: e.target.value }))}>
              <option value="">Select staff</option>
              {staffOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <span>Shift</span>
            <select value={ov.shiftType} onChange={(e)=> setOv(s=>({ ...s, shiftType: e.target.value }))}>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </label>
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button type="button" className="btn btn-primary" onClick={addDayOverride}>Add Override</button>
          </div>
        </div>

        <div style={{ marginTop: 12, overflowX: 'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Staff</th>
                <th>Shift</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(overrides || []).map((o, idx) => {
                const d = iso(o.date);
                const opt = staffOptions.find(x => x.value === (o.staff?._id || o.staff));
                const label = opt ? opt.label : (o.staff?.name || o.staff?.email || String(o.staff));
                return (
                  <tr key={`${d}-${o.staff}-${idx}`}>
                    <td>{d}</td>
                    <td>{label}</td>
                    <td>{o.shiftType}</td>
                    <td><button className="btn btn-outline" onClick={()=> removeDayOverride(o)}>Remove</button></td>
                  </tr>
                );
              })}
              {(!overrides || overrides.length===0) && (
                <tr><td colSpan={4} style={{ textAlign:'center', color:'#9aa' }}>No overrides</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ManagerShifts;


