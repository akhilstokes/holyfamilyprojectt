import React, { useCallback, useEffect, useMemo, useState } from 'react';

const LabAttendance = () => {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [resToday, resHist] = await Promise.all([
        fetch(`${base}/api/workers/lab/today`, { headers }),
        fetch(`${base}/api/workers/lab/attendance/history?limit=30`, { headers })
      ]);
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
      setToday({ error: e.message });
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [base, headers]);

  useEffect(() => { load(); }, [load]);

  const checkIn = async () => {
    try {
      const res = await fetch(`${base}/api/workers/lab/attendance/check-in`, { method: 'POST', headers });
      if (!res.ok) throw new Error(`Check-in failed (${res.status})`);
      setToday((prev) => ({ ...(prev || {}), attendance: { ...((prev && prev.attendance) || {}), checkInAt: new Date().toISOString() } }));
    } catch (e) {
      setToday((prev) => ({ ...(prev || {}), error: e.message }));
    } finally { await load(); }
  };

  const checkOut = async () => {
    try {
      const res = await fetch(`${base}/api/workers/lab/attendance/check-out`, { method: 'POST', headers });
      if (!res.ok) throw new Error(`Check-out failed (${res.status})`);
      setToday((prev) => ({ ...(prev || {}), attendance: { ...((prev && prev.attendance) || {}), checkOutAt: new Date().toISOString() } }));
    } catch (e) {
      setToday((prev) => ({ ...(prev || {}), error: e.message }));
    } finally { await load(); }
  };

  const checkedIn = !!today?.attendance?.checkInAt;
  const checkedOut = !!today?.attendance?.checkOutAt;
  const isLate = !!today?.attendance?.isLate;

  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    if (!(checkedIn && !checkedOut)) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [checkedIn, checkedOut]);

  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const buildTodayTime = (hhmm) => {
    const [h,m] = hhmm.split(':').map(Number);
    const d = new Date(); d.setHours(h||0, m||0, 0, 0); return d;
  };
  const ciStart = buildTodayTime('09:00');
  const ciEnd = buildTodayTime('09:05');
  const coStart = buildTodayTime('17:00');
  const coEnd = buildTodayTime('17:05');
  const now = new Date(nowTick);
  const within = (s,e)=> now >= s && now <= e;
  const fmt = (d)=> d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const sec = (ms)=> Math.max(0, Math.floor(ms/1000));
  const fmtDur = (totalSec)=> {
    const h = Math.floor(totalSec/3600).toString().padStart(2,'0');
    const m = Math.floor((totalSec%3600)/60).toString().padStart(2,'0');
    const s = Math.floor(totalSec%60).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
  };

  const ciState = within(ciStart, ciEnd) ? 'open' : (now < ciStart ? 'upcoming' : 'closed');
  const coState = within(coStart, coEnd) ? 'open' : (now < coStart ? 'upcoming' : 'closed');
  const ciCountdown = ciState==='open' ? sec((ciEnd-now)) : ciState==='upcoming' ? sec((ciStart-now)) : 0;
  const coCountdown = coState==='open' ? sec((coEnd-now)) : coState==='upcoming' ? sec((coStart-now)) : 0;

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
      <h2>Lab Attendance</h2>
      {today?.error && <div style={{ marginTop: 8, color: 'crimson' }}>{today.error}</div>}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:6 }}>
        <div style={{ color:'#111827', background:'#EEF2FF', padding:'8px 10px', borderRadius:6 }}>
          <div style={{ fontWeight:700 }}>Check-in</div>
          <div>{fmt(ciStart)}–{fmt(ciEnd)} {ciState==='open' && <span style={{ color:'#059669', marginLeft:6 }}>(Open {fmtDur(ciCountdown)})</span>} {ciState==='upcoming' && <span style={{ color:'#2563eb', marginLeft:6 }}>(Opens in {fmtDur(ciCountdown)})</span>} {ciState==='closed' && <span style={{ color:'#6b7280', marginLeft:6 }}>(Closed)</span>}</div>
        </div>
        <div style={{ color:'#111827', background:'#FDE68A', padding:'8px 10px', borderRadius:6 }}>
          <div style={{ fontWeight:700 }}>Check-out</div>
          <div>{fmt(coStart)}–{fmt(coEnd)} {coState==='open' && <span style={{ color:'#059669', marginLeft:6 }}>(Open {fmtDur(coCountdown)})</span>} {coState==='upcoming' && <span style={{ color:'#2563eb', marginLeft:6 }}>(Opens in {fmtDur(coCountdown)})</span>} {coState==='closed' && <span style={{ color:'#6b7280', marginLeft:6 }}>(Closed)</span>}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {!checkedIn && (
          <button className="btn btn-primary" onClick={checkIn} disabled={ciState!=='open'} title={ciState==='open' ? '' : (ciState==='upcoming' ? `Opens at ${fmt(ciStart)}` : `Closed at ${fmt(ciEnd)}`)}>
            {ciState==='open' ? 'Check In' : 'Check In (disabled)'}
          </button>
        )}
        {checkedIn && !checkedOut && (
          <>
            <button className="btn btn-success" onClick={checkOut} disabled={coState!=='open'} title={coState==='open' ? '' : (coState==='upcoming' ? `Opens at ${fmt(coStart)}` : `Closed at ${fmt(coEnd)}`)}>
              {coState==='open' ? 'Check Out' : 'Check Out (disabled)'}
            </button>
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
            <tr><td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding:16 }}>No records yet. Your entries will appear here after you Check In and Check Out.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LabAttendance;
