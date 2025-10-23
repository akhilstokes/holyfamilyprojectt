import React, { useEffect, useMemo, useState } from 'react';

const AccountantAttendance = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const todayStr = new Date().toISOString().slice(0,10);
  const [date, setDate] = useState(todayStr);
  const [roleFilter, setRoleFilter] = useState('all'); // all | lab_staff | delivery_staff
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [historyRange, setHistoryRange] = useState({ from: todayStr, to: todayStr });
  const [history, setHistory] = useState([]);

  const loadToday = async () => {
    setLoading(true); setError('');
    try {
      // If date is today, use compact endpoint; else use range
      if (date === todayStr) {
        const res = await fetch(`${base}/api/attendance/today-all`, { headers });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        const items = Array.isArray(data?.attendance) ? data.attendance : [];
        setRows(items);
        setStats(data?.stats || null);
      } else {
        const res = await fetch(`${base}/api/attendance/all?fromDate=${date}&toDate=${date}&limit=500`, { headers });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const data = await res.json();
        const items = Array.isArray(data?.attendance) ? data.attendance : [];
        setRows(items);
        setStats(null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load'); setRows([]); setStats(null);
    } finally { setLoading(false); }
  };

  const actMark = async (staffId, type) => {
    setMessage(''); setError('');
    try {
      setSaving(true);
      const res = await fetch(`${base}/api/attendance/admin/mark`, {
        method: 'POST', headers, body: JSON.stringify({ staffId, type })
      });
      if (!res.ok) throw new Error(`Mark failed (${res.status})`);
      await loadToday();
      setMessage(`${type === 'check_in' ? 'Check-in' : 'Check-out'} saved`);
    } catch (e) {
      setError(e?.message || 'Failed to mark');
    } finally { setSaving(false); }
  };

  const loadHistory = async () => {
    setError('');
    try {
      const params = new URLSearchParams();
      if (historyRange.from) params.set('fromDate', historyRange.from);
      if (historyRange.to) params.set('toDate', historyRange.to);
      params.set('limit', '500');
      const res = await fetch(`${base}/api/attendance/all?${params.toString()}`, { headers });
      if (!res.ok) throw new Error(`History failed (${res.status})`);
      const data = await res.json();
      setHistory(Array.isArray(data?.attendance) ? data.attendance : []);
    } catch (e) { setError(e?.message || 'Failed to load history'); setHistory([]); }
  };

  useEffect(() => { loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredRows = useMemo(() => {
    let arr = rows;
    if (roleFilter !== 'all') arr = arr.filter(r => (r.staff?.role || '').toLowerCase() === roleFilter);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter(r => (r.staff?.name||'').toLowerCase().includes(t) || (r.staff?.email||'').toLowerCase().includes(t));
    }
    return arr;
  }, [rows, roleFilter, q]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Attendance Summary</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div style={{ display:'flex', gap:12, alignItems:'center', margin:'8px 0 12px' }}>
        <label style={{ display:'flex', gap:6, alignItems:'center' }}>Date<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></label>
        <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="lab_staff">Lab Staff</option>
          <option value="delivery_staff">Delivery Staff</option>
        </select>
        <input placeholder="Search name/email" value={q} onChange={(e)=>setQ(e.target.value)} style={{ width:260 }} />
        <button className="btn" type="button" onClick={()=>loadToday()} disabled={loading}>Refresh</button>
      </div>

      {stats && (
        <div style={{ display:'flex', gap:16, marginBottom:8, color:'#334155' }}>
          <span><b>Total</b>: {stats.totalStaff}</span>
          <span><b>Present</b>: {stats.presentToday}</span>
          <span><b>Absent</b>: {stats.absentToday}</span>
          <span><b>Late</b>: {stats.lateToday}</span>
        </div>
      )}

      <div style={{ overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Shift</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Late (min)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading...</td></tr>
            ) : filteredRows.length ? filteredRows.map((r, i) => {
              const name = r.staff?.name || r.staff?.email || '-';
              const role = r.staff?.role || '-';
              const shift = r.shift ? `${r.shift?.name||''} (${r.shift?.startTime||''}-${r.shift?.endTime||''})` : '-';
              const checkIn = r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-';
              const checkOut = r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-';
              const status = r.status || '-';
              const lateMin = (r.lateMinutes !== undefined && r.lateMinutes !== null)
                ? r.lateMinutes
                : (r.isLate ? 1 : 0);
              const disableIn = !!r.checkIn;
              const disableOut = !r.checkIn || !!r.checkOut;
              return (
                <tr key={i}>
                  <td>{name}</td>
                  <td>{role}</td>
                  <td>{shift}</td>
                  <td>{checkIn}</td>
                  <td>{checkOut}</td>
                  <td>
                    {status}
                    {status === 'late' && <span style={{ marginLeft:6, background:'#FEE2E2', color:'#B91C1C', padding:'2px 6px', borderRadius:4, fontSize:12 }}>Late</span>}
                  </td>
                  <td>{lateMin}</td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn" disabled={saving || disableIn} onClick={()=>actMark(r.staff?._id || r.staff?.id, 'check_in')}>{saving && !disableIn ? 'Saving...' : 'Check In'}</button>
                      <button className="btn" disabled={saving || disableOut} onClick={()=>actMark(r.staff?._id || r.staff?.id, 'check_out')}>{saving && !disableOut ? 'Saving...' : 'Check Out'}</button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={8} style={{ color:'#6b7280' }}>No records</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Attendance History</h3>
        <div style={{ display:'flex', gap:8, alignItems:'center', margin:'6px 0 10px' }}>
          <label>From <input type="date" value={historyRange.from} onChange={(e)=>setHistoryRange(r=>({ ...r, from: e.target.value }))} /></label>
          <label>To <input type="date" value={historyRange.to} onChange={(e)=>setHistoryRange(r=>({ ...r, to: e.target.value }))} /></label>
          <button className="btn" onClick={loadHistory}>Run</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="dashboard-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Late (min)</th>
              </tr>
            </thead>
            <tbody>
              {history.length ? history.map((r,i)=> (
                <tr key={i}>
                  <td>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                  <td>{r.staff?.name || r.staff?.email || '-'}</td>
                  <td>{r.staff?.role || '-'}</td>
                  <td>{r.shift ? `${r.shift?.name||''} (${r.shift?.startTime||''}-${r.shift?.endTime||''})` : '-'}</td>
                  <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}</td>
                  <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}</td>
                  <td>{r.status || '-'}</td>
                  <td>{r.lateMinutes || 0}</td>
                </tr>
              )) : (
                <tr><td colSpan={8} style={{ color:'#6b7280' }}>No history</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountantAttendance;
