
import React, { useState, useEffect, useMemo } from 'react';
import { FiClock, FiSearch, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import './AccountantAttendance.css';

const AccountantAttendance = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [attendance, setAttendance] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAttendance();
    fetchStaff();
  }, [dateFilter, statusFilter]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/users?role=staff,delivery_staff,lab`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStaff(data.users || data || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const from = dateFilter;
      const to = dateFilter;

      const response = await fetch(`${base}/api/workers/attendance?from=${from}&to=${to}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    let filtered = attendance;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.staff?.name?.toLowerCase().includes(term) ||
        record.staff?.email?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    return filtered;
  }, [attendance, searchTerm, statusFilter]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'present': return 'badge-present';
      case 'absent': return 'badge-absent';
      case 'half-day': return 'badge-half-day';
      case 'leave': return 'badge-leave';
      default: return 'badge-absent';
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="header-title">
          <h1>Attendance Management</h1>
          <p className="header-subtitle">View and manage staff attendance records</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-info">
            <p className="label">Total Staff</p>
            <p className="value">{staff.length}</p>
          </div>
          <div className="summary-icon icon-blue">
            <FiClock />
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-info">
            <p className="label">Present</p>
            <p className="value text-green">
              {attendance.filter(a => a.status === 'present').length}
            </p>
          </div>
          <div className="summary-icon icon-green">
            <FiCheckCircle />
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-info">
            <p className="label">Absent</p>
            <p className="value text-red">
              {attendance.filter(a => a.status === 'absent').length}
            </p>
          </div>
          <div className="summary-icon icon-red">
            <FiXCircle />
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-info">
            <p className="label">On Leave</p>
            <p className="value text-blue">
              {attendance.filter(a => a.status === 'leave').length}
            </p>
          </div>
          <div className="summary-icon icon-purple">
            <FiCalendar />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <div className="search-wrapper">
          <label htmlFor="attendance-search" className="sr-only">Search attendance</label>
          <FiSearch className="search-icon" />
          <input
            id="attendance-search"
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="filter-date"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
          <option value="leave">On Leave</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Staff</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No attendance records found for this date
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-name">{record.staff?.name || 'Unknown'}</div>
                        <div className="user-email">{record.staff?.email || '-'}</div>
                      </div>
                    </td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{formatTime(record.checkInAt)}</td>
                    <td>{formatTime(record.checkOutAt)}</td>
                    <td>{record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                        {record.status || 'absent'}
                      </span>
                    </td>
                    <td>
                      {record.verified ? (
                        <span className="status-badge badge-verified">Verified</span>
                      ) : (
                        <span className="status-badge badge-pending">Pending</span>
                      )}
                    </td>
                  </tr>
                ))

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
                  <th>Marked By</th>
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
                      <td>{r.markedBy ? (r.markedBy.name || r.markedBy.email) : '-'}</td>
                      <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button
                        className="btn"
                        disabled={saving || disableIn}
                        onClick={() => actMark(r.staff?._id || r.staff?.id, 'check_in')}
                        title="Create check-in for staff"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                      >
                        <span>{saving && !disableIn ? 'Saving...' : 'Create Check-in'}</span>
                      </button>
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
                <th>Marked By</th>
                <th>Marked At</th>
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
                  <td>{r.markedBy ? (r.markedBy.name || r.markedBy.email) : '-'}</td>
                  <td>{r.markedAt ? new Date(r.markedAt).toLocaleString() : '-'}</td>
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




