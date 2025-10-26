import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LabDashboard = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const res = await fetch(`${base}/api/lab/summary`, { headers });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          setSummary(null);
        }
      } catch (e) {
        setError(e?.message || 'Failed to load');
        setSummary(null);
      }
    };
    load();
  }, [base, headers]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const res = await fetch(`${base}/api/notifications?limit=10`, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
          setNotifs(list);
          setUnread(Number(data?.unread || (list.filter(n=>!n.read).length)));
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
  }, [base, headers]);

  const markRead = async (id) => {
    try {
      const res = await fetch(`${base}/api/notifications/${id}/read`, { method: 'PATCH', headers });
      if (res.ok) {
        setNotifs(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnread(u => Math.max(0, u - 1));
      }
    } catch {}
  };

  const buildCheckInUrl = (meta) => {
    const params = new URLSearchParams();
    if (meta?.sampleId) params.set('sampleId', meta.sampleId);
    if (meta?.customer) params.set('customerName', meta.customer);
    if (meta?.barrelCount) params.set('barrelCount', meta.barrelCount);
    if (meta?.receivedAt) params.set('receivedAt', meta.receivedAt);
    // Add barrel IDs if available in meta
    if (meta?.barrels && Array.isArray(meta.barrels)) {
      meta.barrels.forEach((barrel, idx) => {
        if (barrel?.barrelId) params.set(`barrel_${idx}`, barrel.barrelId);
        if (barrel?.liters) params.set(`liters_${idx}`, barrel.liters);
      });
    }
    return `/lab/check-in?${params.toString()}`;
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0 }}>Lab Dashboard</h2>
        <div style={{ color: '#64748b' }}>Welcome, Lab Staff.</div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="dash-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>Samples Pending</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.pendingCount ?? '—'}</div>
        </div>
        <div className="dash-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>Analyzed Today</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.doneToday ?? '—'}</div>
        </div>
        <div className="dash-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>Avg DRC Today</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.avgDrcToday ?? '—'}</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="dash-card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn" to="/lab/check-in">Sample Check-In</Link>
          <Link className="btn" to="/lab/drc-update">Update DRC</Link>
          <Link className="btn" to="/lab/queue">View Queue</Link>
          <Link className="btn" to="/lab/reports">Reports</Link>
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
                      <button className="btn" onClick={() => {
                        const url = buildCheckInUrl(n.meta);
                        navigate(url);
                      }}>Open</button>
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

export default LabDashboard;
