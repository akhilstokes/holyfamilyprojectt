import React, { useState } from 'react';
import { createTrip } from '../../services/staffTripsService';

const StaffRoutePlan = () => {
  const [routeName, setRouteName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [stops, setStops] = useState([
    { customer: '', address: '', windowFrom: '', windowTo: '', type: 'pickup', barrels: 0, notes: '' },
  ]);

  const addStop = () => setStops((s) => [...s, { customer: '', address: '', windowFrom: '', windowTo: '', type: 'pickup', barrels: 0, notes: '' }]);
  const updateStop = (idx, key, val) => setStops((s) => s.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));
  const removeStop = (idx) => setStops((s) => s.filter((_, i) => i !== idx));

  const savePlan = async (e) => {
    e.preventDefault();
    try {
      const payload = { routeName, date, stops };
      await createTrip(payload);
      alert('Route plan saved.');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to save route plan');
    }
  };

  return (
    <div className="user-rate-history">
      <div className="header">
        <h1>🛣️ Route Plan</h1>
        <p>Create the daily pickup/drop route and schedule</p>
      </div>

      <form onSubmit={savePlan} className="dash-card" style={{ maxWidth: 980, margin: '0 auto' }}>
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Route Name</label>
            <input type="text" value={routeName} onChange={(e) => setRouteName(e.target.value)} required />
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3>Stops</h3>
          {stops.map((row, idx) => (
            <div key={idx} className="dash-card" style={{ padding: 12, marginBottom: 10 }}>
              <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label>Customer</label>
                  <input type="text" value={row.customer} onChange={(e) => updateStop(idx, 'customer', e.target.value)} />
                </div>
                <div>
                  <label>Type</label>
                  <select value={row.type} onChange={(e) => updateStop(idx, 'type', e.target.value)}>
                    <option value="pickup">Pickup</option>
                    <option value="drop">Drop</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <input type="text" value={row.address} onChange={(e) => updateStop(idx, 'address', e.target.value)} />
                </div>
                <div>
                  <label>Window From</label>
                  <input type="time" value={row.windowFrom} onChange={(e) => updateStop(idx, 'windowFrom', e.target.value)} />
                </div>
                <div>
                  <label>Window To</label>
                  <input type="time" value={row.windowTo} onChange={(e) => updateStop(idx, 'windowTo', e.target.value)} />
                </div>
                <div>
                  <label>Barrels</label>
                  <input type="number" min={0} value={row.barrels} onChange={(e) => updateStop(idx, 'barrels', Number(e.target.value))} />
                </div>
                <div>
                  <label>Notes</label>
                  <input type="text" value={row.notes} onChange={(e) => updateStop(idx, 'notes', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn" onClick={() => removeStop(idx)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" className="btn" onClick={addStop}>Add Stop</button>
          <button type="submit" className="btn primary">Save Plan</button>
        </div>
      </form>
    </div>
  );
};

export default StaffRoutePlan;
