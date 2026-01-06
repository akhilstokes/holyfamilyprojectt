import React, { useEffect, useMemo, useState } from 'react';
import { adminMarkAttendance, listAttendance } from '../../services/adminService';

const iso = (d) => new Date(d).toISOString().slice(0, 10);

const Attendance = () => {
  const today = useMemo(() => iso(new Date()), []);
  const weekAgo = useMemo(() => iso(new Date(Date.now() - 6 * 24 * 3600 * 1000)), []);

  const [filters, setFilters] = useState({ from: weekAgo, to: today, staffId: '' });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  // Admin mark modal state
  const [showMark, setShowMark] = useState(false);
  const [markForm, setMarkForm] = useState({ staffId: '', date: today, checkInAt: '', checkOutAt: '', isLate: false });

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const data = await listAttendance(filters);
      setRows(Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []));
    } catch (e) { setError(e?.response?.data?.message || e?.message || 'Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSearch = (e) => { e.preventDefault(); fetchData(); };

  const openMark = (staffId = '') => {
    setMarkForm({ staffId, date: today, checkInAt: '09:00', checkOutAt: '17:00', isLate: false });
    setShowMark(true);
  };

  const submitMark = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (!markForm.staffId || !markForm.date) throw new Error('staffId and date required');
      // Convert HH:mm to ISO datetime on that date
      const toISO = (hhmm) => hhmm ? new Date(`${markForm.date}T${hhmm}:00`).toISOString() : undefined;
      await adminMarkAttendance({
        staffId: markForm.staffId,
        date: markForm.date,
        checkInAt: toISO(markForm.checkInAt),
        checkOutAt: toISO(markForm.checkOutAt),
        isLate: !!markForm.isLate,
      });
      setShowMark(false);
      fetchData();
    } catch (e2) { setError(e2?.response?.data?.message || e2?.message || 'Failed to mark'); }
  };

  return (
    <div>
      <h2>Attendance</h2>

      <form onSubmit={onSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <label>From</label><br />
          <input type="date" name="from" value={filters.from} onChange={onChange} required />
        </div>
        <div>
          <label>To</label><br />
          <input type="date" name="to" value={filters.to} onChange={onChange} required />
        </div>
        <div>
          <label>Staff ID</label><br />
          <input type="text" name="staffId" value={filters.staffId} onChange={onChange} placeholder="Optional" />
        </div>
        <button type="submit" disabled={loading}>Search</button>
        <button type="button" onClick={() => openMark('')} title="Admin mark override">Admin Mark</button>
      </form>

      {error && <div style={{ color: 'tomato' }}>{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Staff</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Late</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.staffId || r.staff?._id || r.staff}-${r.date}`}>
                  <td>{r.staffName || r.staff?.name || r.staff?.email || String(r.staff || '-')}</td>
                  <td>{iso(r.date)}</td>
                  <td>{r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : '-'}</td>
                  <td>{r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : '-'}</td>
                  <td>{r.isLate ? 'Yes' : 'No'}</td>
                  <td>
                    <button type="button" onClick={() => openMark(r.staffId || r.staff?._id || '')}>Override</button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 12 }}>No records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showMark && (
        <div style={{ marginTop: 16, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
          <h3>Admin Mark Attendance</h3>
          <form onSubmit={submitMark} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <label>Staff ID</label><br />
              <input value={markForm.staffId} onChange={(e) => setMarkForm(s => ({ ...s, staffId: e.target.value }))} required />
            </div>
            <div>
              <label>Date</label><br />
              <input type="date" value={markForm.date} onChange={(e) => setMarkForm(s => ({ ...s, date: e.target.value }))} required />
            </div>
            <div>
              <label>Check-in</label><br />
              <input type="time" value={markForm.checkInAt} onChange={(e) => setMarkForm(s => ({ ...s, checkInAt: e.target.value }))} />
            </div>
            <div>
              <label>Check-out</label><br />
              <input type="time" value={markForm.checkOutAt} onChange={(e) => setMarkForm(s => ({ ...s, checkOutAt: e.target.value }))} />
            </div>
            <div>
              <label>Late?</label><br />
              <input type="checkbox" checked={!!markForm.isLate} onChange={(e) => setMarkForm(s => ({ ...s, isLate: e.target.checked }))} />
            </div>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setShowMark(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Attendance;
