import React, { useState } from 'react';

// Simple planner that creates a Google Maps Directions URL with waypoints.
// No external map SDK dependency; opens Google Maps in a new tab.
const RoutePlanner = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState(['']);
  const [mode, setMode] = useState('driving');

  const addStop = () => setStops([...stops, '']);
  const updateStop = (i, val) => setStops(stops.map((s, idx) => (idx === i ? val : s)));
  const removeStop = (i) => setStops(stops.filter((_, idx) => idx !== i));

  const openInGoogleMaps = () => {
    if (!origin || !destination) return;
    const base = 'https://www.google.com/maps/dir/?api=1';
    const params = new URLSearchParams();
    params.set('origin', origin);
    params.set('destination', destination);
    const wp = stops.filter(Boolean).join('|');
    if (wp) params.set('waypoints', wp);
    params.set('travelmode', mode);
    const url = `${base}&${params.toString()}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Route Planner (Google Maps)</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
        <input
          placeholder="Origin (address or lat,lng)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <input
          placeholder="Destination (address or lat,lng)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <div>
          <div style={{ marginBottom: 6 }}>Waypoints</div>
          {stops.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                placeholder={`Stop #${i + 1}`}
                value={s}
                onChange={(e) => updateStop(i, e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn" onClick={() => removeStop(i)} disabled={stops.length <= 1}>
                Remove
              </button>
            </div>
          ))}
          <button className="btn" onClick={addStop}>Add Stop</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label>Mode:</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="driving">Driving</option>
            <option value="walking">Walking</option>
            <option value="bicycling">Bicycling</option>
            <option value="transit">Transit</option>
          </select>
        </div>

        <button className="btn" onClick={openInGoogleMaps} disabled={!origin || !destination}>
          Open in Google Maps
        </button>
      </div>
    </div>
  );
};

export default RoutePlanner;
