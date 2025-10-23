import React, { useEffect, useState } from 'react';
import { createTask, listMyTasks, updateStatus } from '../../services/deliveryService';

const AdminDeliveryTasks = () => {
  const [form, setForm] = useState({
    title: '',
    customerUserId: '',
    assignedTo: '',
    pickupAddress: '',
    dropAddress: '',
    scheduledAt: '',
    notes: ''
  });
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const list = await listMyTasks({ status: statusFilter || undefined });
      setTasks(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter]);

  const onSubmit = async (e) => {
    e.preventDefault(); setErr(''); setOk('');
    try {
      const payload = {
        title: form.title,
        customerUserId: form.customerUserId || undefined,
        assignedTo: form.assignedTo,
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        scheduledAt: form.scheduledAt || undefined,
        notes: form.notes || ''
      };
      await createTask(payload);
      setOk('Task created');
      setForm({ title:'', customerUserId:'', assignedTo:'', pickupAddress:'', dropAddress:'', scheduledAt:'', notes:'' });
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to create task');
    }
  };

  const statuses = ['pickup_scheduled','enroute_pickup','picked_up','enroute_drop','delivered','cancelled'];

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Delivery Task Management</h2>
      {err && <div className="alert error">{err}</div>}
      {ok && <div className="alert success">{ok}</div>}

      <div className="dash-card" style={{ marginBottom: 16 }}>
        <h4 style={{ marginTop: 0 }}>Create Task</h4>
        <form onSubmit={onSubmit} style={{ display:'grid', gap: 12, gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <label>
            <div>Title *</div>
            <input value={form.title} onChange={e=>setForm(s=>({...s, title: e.target.value}))} required />
          </label>
          <label>
            <div>Customer UserId (optional)</div>
            <input value={form.customerUserId} onChange={e=>setForm(s=>({...s, customerUserId: e.target.value}))} placeholder="ObjectId" />
          </label>
          <label>
            <div>Assign to (Delivery Staff UserId) *</div>
            <input value={form.assignedTo} onChange={e=>setForm(s=>({...s, assignedTo: e.target.value}))} required placeholder="ObjectId" />
          </label>
          <label>
            <div>Pickup Address *</div>
            <input value={form.pickupAddress} onChange={e=>setForm(s=>({...s, pickupAddress: e.target.value}))} required />
          </label>
          <label>
            <div>Drop Address *</div>
            <input value={form.dropAddress} onChange={e=>setForm(s=>({...s, dropAddress: e.target.value}))} required />
          </label>
          <label>
            <div>Scheduled At</div>
            <input type="datetime-local" value={form.scheduledAt} onChange={e=>setForm(s=>({...s, scheduledAt: e.target.value}))} />
          </label>
          <label style={{ gridColumn:'1 / -1' }}>
            <div>Notes</div>
            <textarea rows={2} value={form.notes} onChange={e=>setForm(s=>({...s, notes: e.target.value}))} />
          </label>
          <div style={{ gridColumn:'1 / -1' }}>
            <button className="btn" type="submit">Create Task</button>
          </div>
        </form>
      </div>

      <div className="dash-card">
        <div style={{ display:'flex', alignItems:'end', justifyContent:'space-between', gap: 12, flexWrap:'wrap' }}>
          <h4 style={{ margin: 0 }}>All Tasks</h4>
          <div style={{ display:'flex', gap: 8, alignItems:'end' }}>
            <label>
              <div>Status</div>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="">All</option>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <button className="btn-secondary" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : tasks.length === 0 ? (
          <div className="no-data">No tasks</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Title</th>
                  <th>Pickup</th>
                  <th>Drop</th>
                  <th>Assigned</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td>{t.scheduledAt ? new Date(t.scheduledAt).toLocaleString('en-IN') : '-'}</td>
                    <td>{t.title}</td>
                    <td>{t.pickupAddress}</td>
                    <td>{t.dropAddress}</td>
                    <td>{String(t.assignedTo)}</td>
                    <td>{t.status}</td>
                    <td>
                      <select value={t.status} onChange={async (e)=>{ await updateStatus(t._id, { status: e.target.value }); load(); }}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDeliveryTasks;
