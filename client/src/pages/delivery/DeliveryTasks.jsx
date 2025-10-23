import React, { useEffect, useState, useCallback } from 'react';
import { listMyTasks, updateStatus } from '../../services/deliveryService';
import './DeliveryTheme.css';

const DeliveryTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await listMyTasks({ status: filter || undefined })); } catch { setTasks([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const statuses = ['pickup_scheduled','enroute_pickup','picked_up','enroute_drop','delivered','cancelled'];

  return (
    <div>
      <h2>My Tasks</h2>
      <div style={{ display:'flex', gap:8, alignItems:'end', marginBottom: 12 }}>
        <label>
          Status
          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button className="btn-secondary" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh'}</button>
      </div>

      {loading ? <p>Loading...</p> : tasks.length === 0 ? (
        <div className="no-data">No tasks found{filter ? ` for status "${filter}"` : ''}.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>When</th>
                <th>Title</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={t._id}>
                  <td>{i+1}</td>
                  <td>{t.scheduledAt ? new Date(t.scheduledAt).toLocaleString('en-IN') : '-'}</td>
                  <td>{t.title}</td>
                  <td>{t.pickupAddress}</td>
                  <td>{t.dropAddress}</td>
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
  );
};

export default DeliveryTasks;
