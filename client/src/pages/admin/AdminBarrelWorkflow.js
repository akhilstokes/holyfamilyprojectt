import React, { useEffect, useState } from 'react';

function AdminBarrelWorkflow() {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvals, setApprovals] = useState([]);
  const [damages, setDamages] = useState([]);
  const [notifications, setNotifications] = useState({ notifications: [], unread: 0 });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = { Authorization: token ? `Bearer ${token}` : undefined };
        const [repRes, dmgRes, notRes] = await Promise.all([
          fetch('/api/repairs?status=awaiting-approval', { headers }),
          fetch('/api/damages?status=open', { headers }),
          fetch('/api/notifications?limit=10', { headers }),
        ]);
        const [rep, dmg, noti] = await Promise.all([repRes.json(), dmgRes.json(), notRes.json()]);
        if (!repRes.ok) throw new Error(rep?.message || 'Failed to load approvals');
        if (!dmgRes.ok) throw new Error(dmg?.message || 'Failed to load damages');
        if (!notRes.ok) throw new Error(noti?.message || 'Failed to load notifications');
        setApprovals(rep || []);
        setDamages(dmg || []);
        setNotifications(noti || { notifications: [], unread: 0 });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token]);

  const approve = async (id) => {
    try {
      const res = await fetch(`/api/repairs/${id}/approve`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : undefined } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Approve failed');
      setApprovals(prev => prev.filter(j => j._id !== id));
    } catch (e) { alert(e.message); }
  };
  const reject = async (id) => {
    try {
      const res = await fetch(`/api/repairs/${id}/reject`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : undefined } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Reject failed');
      setApprovals(prev => prev.filter(j => j._id !== id));
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="container" style={{ padding: 16 }}>
      <h2>Admin: Barrel Workflow Overview</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 12 }}>
        <div className="card">
          <div className="card-body">
            <div className="h5">Open Damages</div>
            <div className="display-6">{damages.length}</div>
            <a href="/manager/faulty-barrels" className="btn btn-sm" style={{ marginTop: 8 }}>Review</a>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="h5">Awaiting Approvals</div>
            <div className="display-6">{approvals.length}</div>
            <a href="/manager/repair-approvals" className="btn btn-sm" style={{ marginTop: 8 }}>Approve</a>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="h5">Unread Notifications</div>
            <div className="display-6">{notifications.unread || 0}</div>
            <a href="/user/notifications" className="btn btn-sm" style={{ marginTop: 8 }}>Open Inbox</a>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h4>Latest Notifications</h4>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {(notifications.notifications || []).map(n => (
              <li key={n._id} style={{ marginBottom: 6 }}>
                <strong>{n.title}</strong> - {n.message}
                <span className="text-muted" style={{ marginLeft: 6 }}>({new Date(n.createdAt).toLocaleString()})</span>
              </li>
            ))}
            {(!notifications.notifications || notifications.notifications.length === 0) && (
              <li className="text-muted">No notifications.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <h4>Approvals Queue</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Barrel</th>
                  <th>Type</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map(j => (
                  <tr key={j._id}>
                    <td>{j._id}</td>
                    <td>{j.barrelId}</td>
                    <td>{j.type}</td>
                    <td>{new Date(j.updatedAt).toLocaleString()}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-sm btn-success" onClick={() => approve(j._id)}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => reject(j._id)}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {approvals.length === 0 && (
                  <tr><td colSpan="5" className="text-muted">No items.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBarrelWorkflow;
