import React, { useCallback, useEffect, useMemo, useState } from 'react';

const iso = (d) => new Date(d).toISOString().slice(0, 10);

const ManagerAttendance = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const today = useMemo(() => iso(new Date()), []);

  const [filters, setFilters] = useState({ from: today, to: today, staffId: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', staffId: '', date: today, checkInAt: '', checkOutAt: '', notes: '', verified: true });
  const [summary, setSummary] = useState({ present: 0, byHour: [] });

  const authHeaders = useMemo(() => (
    token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  ), [token]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ from: filters.from, to: filters.to });
      if (filters.staffId) params.set('staffId', filters.staffId);
      const res = await fetch(`${base}/api/workers/attendance?${params.toString()}`, { headers: authHeaders });
      if (!res.ok) throw new Error(`Failed to load attendance (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
      setRows(list);
      // Build summary for quick view: total present and per-hour check-ins (best for single day)
      const present = list.filter((r) => r.checkInAt).length;
      const hourMap = new Map();
      list.forEach((r) => {
        if (!r.checkInAt) return;
        const d = new Date(r.checkInAt);
        const h = String(d.getHours()).padStart(2, '0');
        hourMap.set(h, (hourMap.get(h) || 0) + 1);
      });
      const byHour = Array.from(hourMap.entries())
        .sort(([a],[b]) => Number(a) - Number(b))
        .map(([hour, count]) => ({ hour, count }));
      setSummary({ present, byHour });
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
      setSummary({ present: 0, byHour: [] });
    } finally { setLoading(false); }
  }, [base, authHeaders, filters.from, filters.to, filters.staffId]);

  useEffect(() => { load(); }, [load]);

  const verify = async (attendanceId, verified) => {
    try {
      setError('');
      const res = await fetch(`${base}/api/workers/attendance/verify`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ attendanceId, verified })
      });
      if (!res.ok) throw new Error(`Verify failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || 'Verify failed');
    }
  };

  const openEdit = (row) => {
    const toTimeLocal = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    };
    const toYMD = (d) => new Date(d).toISOString().slice(0,10);
    setEditForm({
      id: row._id,
      staffId: row.staff?._id || row.staff,
      date: row.date ? toYMD(row.date) : today,
      checkInAt: row.checkInAt ? toTimeLocal(row.checkInAt) : '',
      checkOutAt: row.checkOutAt ? toTimeLocal(row.checkOutAt) : '',
      notes: row.notes || '',
      verified: !!row.verified
    });
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const body = {
        staffId: editForm.staffId,
        date: editForm.date,
        notes: editForm.notes,
        verified: !!editForm.verified
      };
      if (editForm.checkInAt) body.checkInAt = `${editForm.date}T${editForm.checkInAt}:00`;
      if (editForm.checkOutAt) body.checkOutAt = `${editForm.date}T${editForm.checkOutAt}:00`;
      const res = await fetch(`${base}/api/workers/attendance/admin-mark`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setEditOpen(false);
      await load();
    } catch (e2) {
      setError(e2?.message || 'Update failed');
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'from') {
      // If new "from" is after current "to", push "to" forward
      setFilters((s) => {
        const newFrom = value;
        const newTo = s.to < newFrom ? newFrom : s.to;
        return { ...s, from: newFrom, to: newTo };
      });
      setDateError('');
    } else if (name === 'to') {
      // Validate "to" is not before "from"
      setFilters((s) => {
        if (s.from && value < s.from) {
          setDateError('To date cannot be earlier than From date');
          return { ...s, to: s.from };
        }
        setDateError('');
        return { ...s, to: value };
      });
    } else {
      setFilters((s) => ({ ...s, [name]: value }));
    }
  };

  const onSearch = (e) => { e.preventDefault(); load(); };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Verify Attendance</h2>
        <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label>From <input type="date" name="from" value={filters.from} onChange={onChange} /></label>
          <label>To <input type="date" name="to" value={filters.to} min={filters.from} onChange={onChange} /></label>
          <input type="text" name="staffId" placeholder="Staff ID (optional)" value={filters.staffId} onChange={onChange} />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
        </form>
      </div>
      {dateError && (
        <div style={{ color:'tomato', marginTop: 6 }}>{dateError}</div>
      )}
      {/* Quick summary: how many staff marked attendance and when */}
      <div style={{ marginTop: 12, display:'flex', gap:16, flexWrap:'wrap' }}>
        <div className="dash-card" style={{ minWidth: 200 }}>
          <h4 style={{ margin: 0 }}>Checked-in (present)</h4>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.present}</div>
        </div>
        <div className="dash-card" style={{ minWidth: 260, flex: 1 }}>
          <h4 style={{ margin: 0 }}>Check-ins by Hour</h4>
          {summary.byHour.length === 0 ? (
            <div style={{ color:'#9aa' }}>No check-ins in selected range.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:8 }}>
              {summary.byHour.map(({ hour, count }) => (
                <div key={hour} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span>{hour}:00</span>
                  <b>{count}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Date</th>
              <th>Check In</th>
              <th>In Location</th>
              <th>Check Out</th>
              <th>Out Location</th>
              <th>Late</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const day = r.date ? new Date(r.date) : null;
              const inAt = r.checkInAt ? new Date(r.checkInAt) : null;
              const outAt = r.checkOutAt ? new Date(r.checkOutAt) : null;
              const loc = (p) => p && (p.latitude || p.longitude)
                ? `${Number(p.latitude).toFixed(5)}, ${Number(p.longitude).toFixed(5)}`
                : '-';
              return (
                <tr key={`${r._id || r.staff}-${r.date}`}>
                  <td>{r.staff?.name || r.staffName || '-'}</td>
                  <td>{day ? day.toLocaleDateString() : '-'}</td>
                  <td>{inAt ? inAt.toLocaleTimeString() : '-'}</td>
                  <td title={r.checkInLocation?.address || ''}>{loc(r.checkInLocation)}</td>
                  <td>{outAt ? outAt.toLocaleTimeString() : '-'}</td>
                  <td title={r.checkOutLocation?.address || ''}>{loc(r.checkOutLocation)}</td>
                  <td>{r.isLate ? 'Yes' : 'No'}</td>
                  <td>{r.verified ? 'Yes' : 'No'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-success" onClick={() => verify(r._id, true)}>Verify</button>
                      <button className="btn btn-sm btn-outline" onClick={() => verify(r._id, false)}>Unverify</button>
                  <button className="btn btn-sm" onClick={() => openEdit(r)}>Edit</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#9aa' }}>No records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {editOpen && (
        <div className="modal-backdrop" onClick={() => setEditOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e)=>e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Edit Attendance</h3>
              <button className="close" onClick={() => setEditOpen(false)}>×</button>
            </div>
            <form onSubmit={submitEdit} className="modal-body" style={{ display:'grid', gap:10 }}>
              <label>Date
                <input type="date" value={editForm.date} onChange={(e)=>setEditForm(s=>({ ...s, date: e.target.value }))} required />
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                <label>Check In
                  <input type="time" value={editForm.checkInAt} onChange={(e)=>setEditForm(s=>({ ...s, checkInAt: e.target.value }))} />
                </label>
                <label>Check Out
                  <input type="time" value={editForm.checkOutAt} onChange={(e)=>setEditForm(s=>({ ...s, checkOutAt: e.target.value }))} />
                </label>
              </div>
              <label>Notes
                <input type="text" placeholder="Optional notes" value={editForm.notes} onChange={(e)=>setEditForm(s=>({ ...s, notes: e.target.value }))} />
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8 }}>
                <input type="checkbox" checked={editForm.verified} onChange={(e)=>setEditForm(s=>({ ...s, verified: e.target.checked }))} /> Verified
              </label>
              <div className="modal-actions" style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button type="button" className="btn btn-outline" onClick={()=>setEditOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAttendance;
