import React, { useEffect, useRef, useState } from 'react';
import './DeliveryTheme.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const DeliveryLiveLocation = () => {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('Location sharing is off');
  const [last, setLast] = useState(null);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const postLocation = async (coords) => {
    try {
      const body = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        meta: { source: 'browser_geolocation' }
      };
      const res = await fetch(`${API}/api/delivery/location`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setStatus('Location updated');
      } else {
        const t = await res.text();
        setStatus(`Update failed (${res.status}) ${t.slice(0,60)}`);
      }
    } catch (e) {
      setStatus(e?.message || 'Failed to update');
    }
  };

  const start = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported in this browser');
      return;
    }
    setEnabled(true);
    setStatus('Requesting location permission...');

    // immediate fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLast(pos.coords);
        setStatus('Location acquired');
        postLocation(pos.coords);
      },
      (err) => setStatus(`Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // watch continuous changes
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLast(pos.coords);
          postLocation(pos.coords);
        },
        (err) => setStatus(`Watch error: ${err.message}`),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
      );
    } catch {}

    // fallback heartbeat every 30s using last known
    timerRef.current = setInterval(() => {
      if (last) postLocation(last);
    }, 30000);
  };

  const stop = () => {
    setEnabled(false);
    setStatus('Location sharing stopped');
    if (watchIdRef.current && navigator.geolocation) {
      try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div>
      <h2>Live Location</h2>
      <div className="dash-card" style={{ marginBottom: 12 }}>
        <p style={{ margin: 0, color: '#475569' }}>Share your current location with the manager during duty.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {!enabled ? (
            <button className="btn" onClick={start}>Start Sharing</button>
          ) : (
            <button className="btn-secondary" onClick={stop}>Stop Sharing</button>
          )}
          <div style={{ alignSelf: 'center', color: '#64748b' }}>{status}</div>
        </div>
      </div>

      <div className="dash-card">
        <h4 style={{ marginTop: 0 }}>Last Known</h4>
        {last ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>Latitude: <strong>{last.latitude.toFixed(6)}</strong></div>
            <div>Longitude: <strong>{last.longitude.toFixed(6)}</strong></div>
            <div>Accuracy: <strong>{last.accuracy?.toFixed?.(0)} m</strong></div>
            <div>
              <a className="btn btn-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${last.latitude},${last.longitude}`}>Open in Google Maps</a>
            </div>
          </div>
        ) : (
          <div className="no-data">No location yet</div>
        )}
      </div>
    </div>
  );
};

export default DeliveryLiveLocation;
