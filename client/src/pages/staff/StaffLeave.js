import React, { useEffect, useState } from 'react';

const StaffLeave = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({ leaveType: 'casual', dayType: 'full', startDate: '', endDate: '', reason: '' });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/leave/my-leaves`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLeaves(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const apply = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`${base}/api/leave/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ leaveType: 'casual', dayType: 'full', startDate: '', endDate: '', reason: '' });
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id) => {
    await fetch(`${base}/api/leave/cancel/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Leave Management</h2>
      <form onSubmit={apply} style={{ maxWidth: 640, marginTop: 12 }}>
        <div className="form-row" style={{ display:'flex', gap:12 }}>
          <div className="form-group" style={{ flex:1 }}>
            <label>Leave Type</label>
            <select className="form-control" value={form.leaveType} onChange={(e)=>setForm({ ...form, leaveType: e.target.value })}>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
            </select>
          </div>
          <div className="form-group" style={{ flex:1 }}>
            <label>Day Type</label>
            <select className="form-control" value={form.dayType} onChange={(e)=>setForm({ ...form, dayType: e.target.value })}>
              <option value="full">Full Day</option>
              <option value="half">Half Day</option>
            </select>
          </div>
          <div className="form-group" style={{ flex:1 }}>
            <label>Start Date</label>
            <input type="date" className="form-control" value={form.startDate} onChange={(e)=>setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex:1 }}>
            <label>End Date</label>
            <input type="date" className="form-control" value={form.endDate} onChange={(e)=>setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Reason</label>
          <textarea className="form-control" value={form.reason} onChange={(e)=>setForm({ ...form, reason: e.target.value })} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>Apply</button>
      </form>

      <div style={{ marginTop: 24 }}>
        <h4>My Leave Requests</h4>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Day Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id}>
                  <td>{l.leaveType}</td>
                  <td>{l.startDate ? new Date(l.startDate).toLocaleDateString() : '-'}</td>
                  <td>{l.endDate ? new Date(l.endDate).toLocaleDateString() : '-'}</td>
                  <td>{l.dayType || 'full'}</td>
                  <td>{l.status}</td>
                  <td>
                    {l.status === 'pending' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>cancel(l._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && <tr><td colSpan={5}>No leave requests</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffLeave;


