import React, { useEffect, useMemo, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DeliveryLiveMap = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/delivery/locations?role=delivery_staff`, { headers: authHeaders(), credentials: 'include' });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed (${res.status}) ${t.slice(0,80)}`);
      }
      const data = await res.json();
      const list = Array.isArray(data?.items) ? data.items : [];
      setItems(list);
      if (!selected && list.length) setSelected(list[0]);
    } catch (e) { setError(e?.message || 'Failed to load locations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const center = useMemo(() => {
    const c = selected?.coords;
    if (c && typeof c.lat === 'number' && typeof c.lng === 'number') return c;
    const first = items[0]?.coords;
    return first || { lat: 9.5916, lng: 76.5222 }; // Kottayam approx
  }, [selected, items]);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:16 }}>
      {/* Sidebar list */}
      <aside style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0 }}>Live Staff</h3>
          <button onClick={load} disabled={loading} className="btn btn-sm">{loading ? '...' : 'Refresh'}</button>
        </div>
        {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
        <ul style={{ listStyle:'none', margin:0, padding:0, marginTop:8, display:'grid', gap:8 }}>
          {items.map((it) => (
            <li key={it._id} style={{ border:'1px solid #e5e7eb', borderRadius:10, padding:8, cursor:'pointer', background: selected?._id===it._id ? '#fef3c7' : '#fff' }} onClick={()=>setSelected(it)}>
              <div style={{ fontWeight:700 }}>{it.user?.name || it.user?.email || 'Unknown'}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{it.user?.role || 'staff'}</div>
              <div style={{ fontSize:12, color:'#475569', marginTop:4 }}>Lat {it.coords?.lat?.toFixed?.(5)} • Lng {it.coords?.lng?.toFixed?.(5)}</div>
              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                {it.coords && (
                  <a className="btn btn-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${it.coords.lat},${it.coords.lng}`}>Open Map</a>
                )}
                <span style={{ fontSize:12, alignSelf:'center', color:'#94a3b8' }}>{new Date(it.updatedAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
          {items.length === 0 && !loading && (
            <li style={{ color:'#64748b' }}>No active locations</li>
          )}
        </ul>
      </aside>

      {/* Map panel */}
      <section style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
        <h3 style={{ marginTop:0 }}>Map View</h3>
        <div style={{ position:'relative', width:'100%', height:480, borderRadius:12, overflow:'hidden', boxShadow:'0 12px 28px rgba(0,0,0,0.08)' }}>
          <iframe
            title="Live Staff Map"
            src={`https://www.google.com/maps?q=${center.lat},${center.lng}&z=13&output=embed`}
            loading="lazy"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:0 }}
          />
        </div>
        {selected && (
          <div style={{ marginTop:12, color:'#475569' }}>
            Focusing: <strong>{selected.user?.name || selected.user?.email || 'Unknown'}</strong> — {new Date(selected.updatedAt).toLocaleString()}
          </div>
        )}
      </section>
    </div>
  );
};

export default DeliveryLiveMap;
