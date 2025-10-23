import React, { useEffect, useState } from 'react';
import { listMyTasks, updateStatus } from '../../services/deliveryService';
import './DeliveryTheme.css';

const StatusBadge = ({ s }) => (
  <span className={`badge status-${String(s).replace(/_/g,'-')}`}>{s}</span>
);

const DeliveryDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setTasks(await listMyTasks()); } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const quickAction = async (t, next) => {
    await updateStatus(t._id, { status: next });
    await load();
  };

  return (
    <div>
      <h2>Delivery Dashboard</h2>
      {loading ? <p>Loading...</p> : tasks.length === 0 ? (
        <div className="no-data">No assigned tasks</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Title</th>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id}>
                  <td>{t.scheduledAt ? new Date(t.scheduledAt).toLocaleString('en-IN') : '-'}</td>
                  <td>{t.title}</td>
                  <td>{t.pickupAddress}</td>
                  <td>{t.dropAddress}</td>
                  <td><StatusBadge s={t.status} /></td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.status === 'pickup_scheduled' && (
                      <button className="btn-secondary" onClick={()=>quickAction(t,'enroute_pickup')}>Start Pickup</button>
                    )}
                    {t.status === 'enroute_pickup' && (
                      <button className="btn" onClick={()=>quickAction(t,'picked_up')}>Mark Picked</button>
                    )}
                    {t.status === 'picked_up' && (
                      <button className="btn-secondary" onClick={()=>quickAction(t,'enroute_drop')}>Start Drop</button>
                    )}
                    {t.status === 'enroute_drop' && (
                      <button className="btn" onClick={()=>quickAction(t,'delivered')}>Mark Delivered</button>
                    )}
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

export default DeliveryDashboard;
