import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listMyTasks, updateStatus } from '../../services/deliveryService';
import './DeliveryTheme.css';

const DeliveryTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await listMyTasks({ status: filter || undefined })); } catch { setTasks([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const statuses = ['pickup_scheduled','enroute_pickup','picked_up','enroute_drop','delivered','cancelled'];

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const deliverToLab = async (task) => {
    try {
      // Follow allowed transitions in order to avoid 400 from the server
      const order = ['pickup_scheduled','enroute_pickup','picked_up','enroute_drop','delivered'];
      const idx = Math.max(order.indexOf(task.status), 0);
      for (let i = idx + 1; i < order.length; i++) {
        await updateStatus(task._id, { status: order[i] });
      }
      // If linked to a Sell Request, mark delivered to lab there too
      const sellReqId = task?.meta?.sellRequestId;
      if (sellReqId) {
        try {
          await fetch(`${API}/api/sell-requests/${sellReqId}/deliver-to-lab`, { method: 'PUT', headers: authHeaders() });
        } catch { /* ignore */ }
      }
      // Open Lab Check-In with prefilled params
      const customer = task?.customerUserId?.name || task?.customerUserId?.email || '';
      const count = task?.meta?.barrelCount ?? '';
      const receivedAt = new Date().toISOString().slice(0,16); // yyyy-MM-ddTHH:mm for datetime-local
      const sampleId = sellReqId || task?._id; // prefer sell request id if present
      const qs = new URLSearchParams({ sampleId: String(sampleId), customerName: String(customer), barrelCount: String(count), receivedAt });
      const checkInUrl = `/lab/check-in?${qs.toString()}`;
      const role = String(user?.role || '').toLowerCase().replace(/\s+/g,'_');
      if (role !== 'lab') {
        alert('Only Lab Staff can complete Sample Check-In. You will be asked to log in as Lab to continue.');
      }
      navigate(checkInUrl);
    } catch (e) {
      alert(e?.message || 'Failed to update status');
    } finally {
      await load();
    }
  };

  const openLabCheckIn = (task) => {
    console.log('Opening Lab Check-In for task:', task);
    console.log('Task meta:', task?.meta);
    console.log('Task customerUserId:', task?.customerUserId);
    
    // Extract values with fallbacks
    const customer = task?.customerUserId?.name || task?.customerUserId?.email || task?.customerName || 'Unknown Customer';
    const count = task?.meta?.barrelCount || task?.barrelCount || '1';
    const receivedAt = new Date().toISOString().slice(0,16);
    const sampleId = task?.meta?.sellRequestId || task?._id || `TASK-${Date.now()}`;
    
    console.log('Extracted values:', { customer, count, receivedAt, sampleId });
    
    const qs = new URLSearchParams();
    qs.set('sampleId', String(sampleId));
    qs.set('customerName', String(customer));
    qs.set('barrelCount', String(count));
    qs.set('receivedAt', receivedAt);
    
    const barrelIds = Array.isArray(task?.meta?.barrels) ? task.meta.barrels : [];
    barrelIds.forEach(id => { if (id) qs.append('barrels', String(id)); });
    
    const checkInUrl = `/lab/check-in?${qs.toString()}`;
    console.log('Final URL:', checkInUrl);
    console.log('URLSearchParams:', qs.toString());
    
    const role = String(user?.role || '').toLowerCase().replace(/\s+/g,'_');
    if (role !== 'lab') {
      alert('Only Lab Staff can complete Sample Check-In. You will be asked to log in as Lab to continue.');
    }
    navigate(checkInUrl);
  };

  const setBarrelIds = async (task) => {
    const existing = Array.isArray(task?.meta?.barrels) ? task.meta.barrels.join(',') : '';
    const input = window.prompt('Enter Barrel IDs (comma separated):', existing);
    if (input == null) return;
    const ids = input
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    try {
      await updateStatus(task._id, { meta: { barrels: ids } });
      await load();
    } catch (e) {
      alert(e?.message || 'Failed to save barrel IDs');
    }
  };

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
                <th>Customer</th>
                <th>Barrels</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Status</th>
                <th>Update</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={t._id}>
                  <td>{i+1}</td>
                  <td>{t.scheduledAt ? new Date(t.scheduledAt).toLocaleString('en-IN') : '-'}</td>
                  <td>{t.title}</td>
                  <td>{t.customerUserId?.name || t.customerUserId?.email || '-'}</td>
                  <td>{t?.meta?.barrelCount ?? '-'}</td>
                  <td>{t.pickupAddress}</td>
                  <td>{t.dropAddress}</td>
                  <td>{t.status}</td>
                  <td>
                    <select value={t.status} onChange={async (e)=>{
                      try { await updateStatus(t._id, { status: e.target.value }); }
                      catch (err) { alert(err?.message || 'Failed to update status. Follow allowed sequence.'); }
                      load();
                    }}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ display:'flex', gap:8 }}>
                    {t.status !== 'delivered' && (
                      <button className="btn-secondary" onClick={()=>deliverToLab(t)}>Delivered to Lab</button>
                    )}
                    <button className="btn-secondary" onClick={()=>setBarrelIds(t)}>Set Barrel IDs</button>
                    <button className="btn-secondary" onClick={()=>openLabCheckIn(t)}>Open Lab Check-In</button>
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
