import React, { useEffect, useMemo, useState } from 'react';
import { listMyTasks } from '../../services/deliveryService';
import './DeliveryTheme.css';

const DeliveryRoutePlan = () => {
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));

  useEffect(() => {
    (async () => {
      try { setTasks(await listMyTasks()); } catch { setTasks([]); }
    })();
  }, []);

  const dayList = useMemo(() => {
    if (!date) return tasks;
    const d0 = new Date(date);
    return tasks
      .filter(t => t.scheduledAt ? new Date(t.scheduledAt).toDateString() === d0.toDateString() : true)
      .sort((a,b)=>{
        const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
        return ta - tb;
      });
  }, [tasks, date]);

  // Build Google Maps links
  const mapLink = (origin, destination) => {
    const o = encodeURIComponent(origin || '');
    const d = encodeURIComponent(destination || '');
    return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}`;
  };

  // Totals summary (count per status)
  const summary = useMemo(() => {
    const counts = dayList.reduce((acc, t)=>{ acc[t.status||'unknown']=(acc[t.status||'unknown']||0)+1; return acc; },{});
    return counts;
  }, [dayList]);

  return (
    <div>
      <h2>Route Plan</h2>
      <div style={{ display:'flex', gap: 8, alignItems:'end', marginBottom: 12 }}>
        <label>
          Date
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </label>
      </div>

      {/* Kottayam District Map */}
      <div className="dash-card" style={{ marginBottom: 12 }}>
        <h4 style={{ marginTop: 0, marginBottom: 8 }}>Kottayam District Map</h4>
        <div className="map-embed">
          <iframe
            title="Kottayam District Map"
            src="https://www.google.com/maps?q=Kottayam%20district%2C%20Kerala&z=10&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      {dayList.length === 0 ? (
        <div className="no-data">No tasks for selected date</div>
      ) : (
        <>
          <div className="dash-card" style={{ marginBottom: 12 }}>
            <h4 style={{ marginTop: 0 }}>Day Summary</h4>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {Object.entries(summary).map(([k,v])=> (
                <div key={k} className="badge" style={{ background:'#eef2ff', color:'#1e3a8a' }}>{k}: {v}</div>
              ))}
            </div>
          </div>

          <div className="dash-card">
            <ol style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              {dayList.map((t,i) => (
                <li key={t._id}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, alignItems:'start' }}>
                    <div>
                      <div style={{ fontWeight:600 }}>{t.title}</div>
                      <div style={{ fontSize:12, color:'#64748b' }}>{t.scheduledAt ? new Date(t.scheduledAt).toLocaleString('en-IN') : '—'}</div>
                      <div style={{ marginTop:6 }}>
                        <a className="btn btn-sm" target="_blank" rel="noreferrer" href={mapLink(t.pickupAddress, t.dropAddress)}>Open in Google Maps</a>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div>Pickup: {t.pickupAddress}</div>
                      <div>Drop: {t.dropAddress}</div>
                      <div style={{ fontSize:12, color:'#64748b' }}>Status: {t.status}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryRoutePlan;
