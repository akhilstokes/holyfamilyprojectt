import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AccountantDashboard = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        // Check if user is authenticated before making the request
        if (!token) {
          console.log('No authentication token found, skipping notifications');
          setNotifs([]);
          setUnread(0);
          return;
        }

        const res = await fetch(`${base}/api/notifications?limit=10`, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
          setNotifs(list);
          setUnread(Number(data?.unread || (list.filter(n=>!n.read).length)));
        } else if (res.status === 401) {
          // Unauthorized - user needs to login
          console.log('User not authenticated, redirecting to login');
          navigate('/login');
          return;
        } else {
          setNotifs([]);
          setUnread(0);
        }
      } catch {
        setNotifs([]);
        setUnread(0);
      }
    };
    loadNotifs();
    const id = setInterval(loadNotifs, 30000);
    return () => clearInterval(id);
  }, [base, headers, token, navigate]);

  const markRead = async (id) => {
    try {
      const res = await fetch(`${base}/api/notifications/${id}/read`, { method: 'PATCH', headers });
      if (res.ok) {
        setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnread(u => Math.max(0, u - 1));
      }
    } catch {}
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Accountant Dashboard</h2>
        <div style={{ color: '#64748b' }}>Welcome, Accountant.</div>
      </div>

      <div className="dash-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn" to="/accountant/latex">Verify Latex Billing</Link>
          <Link className="btn" to="/accountant/wages">Auto Wages</Link>
          <Link className="btn" to="/accountant/stock">Stock Monitor</Link>
          <Link className="btn" to="/accountant/payments">Bill Payments</Link>
        </div>
      </div>

      <div className="dash-card" style={{ padding: 16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ marginTop: 0 }}>Notifications</h3>
          <span style={{ color:'#64748b', fontSize:12 }}>Unread: {unread}</span>
        </div>
        {notifs.length === 0 ? (
          <div style={{ color:'#94a3b8' }}>No notifications</div>
        ) : (
          <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gap:8 }}>
            {notifs.map(n => (
              <li key={n._id} style={{
                border:'1px solid #e2e8f0', borderRadius:8, padding:12, background: n.read ? '#fff' : '#f8fafc'
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:600 }}>{n.title || 'Update'}</div>
                    <div style={{ color:'#475569', fontSize:14 }}>{n.message}</div>
                    {n.meta && (
                      <div style={{ marginTop:6, display:'flex', gap:8, flexWrap:'wrap', color:'#64748b', fontSize:12 }}>
                        {Object.entries(n.meta).map(([k,v]) => (
                          <span key={k}><strong>{k}:</strong> {String(v)}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ color:'#94a3b8', fontSize:12, marginTop:6 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                    {n.link && (
                      <a className="btn" href={n.link} style={{ textDecoration:'none' }}>Open</a>
                    )}
                    {!n.read && (
                      <button className="btn-secondary" onClick={()=>markRead(n._id)}>Mark Read</button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;
