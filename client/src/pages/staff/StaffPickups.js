import React, { useEffect, useMemo, useState } from 'react';
import { getTrips, updateStopStatus, uploadProof, notifyTripEvent } from '../../services/staffTripsService';

const today = () => new Date().toISOString().split('T')[0];

const displayCustomer = (c) => {
  if (c == null) return '-';
  if (typeof c === 'string' || typeof c === 'number') return String(c);
  if (typeof c === 'object') return c.name || c.email || c.phone || c._id || '-';
  return '-';
};

const StaffPickups = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);

  const dateParam = useMemo(() => today(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { trips } = await getTrips({ date: dateParam });
        const t = Array.isArray(trips) && trips.length ? trips[0] : null;
        setTrip(t);
        setStops(t?.stops || []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load trips');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateParam]);

  const updateLocal = (idx, key, val) => setStops((s) => s.map((row, i) => (i === idx ? { ...row, [key]: val } : row)));

  const saveRow = async (idx) => {
    if (!trip?._id) return;
    const s = stops[idx];
    try {
      await updateStopStatus(trip._id, s._id, {
        status: s.status,
        inventoryFileName: s.inventoryFileName,
        notes: s.notes,
        eta: s.eta,
      });
      await notifyTripEvent({ tripId: trip._id, stopId: s._id, status: s.status });
      // Optionally reload for consistency
      const { trips } = await getTrips({ date: dateParam });
      const t = Array.isArray(trips) && trips.length ? trips[0] : null;
      setTrip(t);
      setStops(t?.stops || []);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update stop');
    }
  };

  return (
    <div className="user-rate-history">
      <div className="header">
        <h1>🚚 Pickups & Drops (Today)</h1>
        <p>Mark pickup/drop status and set inventory file name</p>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : !trip ? (
        <div className="no-data">No trip found for today. Create a route plan first.</div>
      ) : (
        <>
          <div className="dash-card" style={{ marginBottom: 12 }}>
            <strong>Trip:</strong> {trip.routeName} &nbsp; | &nbsp; <strong>Date:</strong> {trip.date}
          </div>
          <div className="rates-table-container">
            <table className="rates-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>ETA</th>
                  <th>Barrels</th>
                  <th>Inventory File Name</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stops.map((s, idx) => (
                  <tr key={s._id}>
                    <td>{idx + 1}</td>
                    <td>{displayCustomer(s.customer)}</td>
                    <td>{s.type}</td>
                    <td>
                      <input type="time" value={s.eta || ''} onChange={(e) => updateLocal(idx, 'eta', e.target.value)} />
                    </td>
                    <td>{s.barrels}</td>
                    <td>
                      <input
                        type="text"
                        placeholder="e.g. INV_2025_09_25_A"
                        value={s.inventoryFileName || ''}
                        onChange={(e) => updateLocal(idx, 'inventoryFileName', e.target.value)}
                      />
                      <div style={{ marginTop: 6 }}>
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const { url } = await uploadProof(file);
                            updateLocal(idx, 'proofUrl', url);
                            await updateStopStatus(trip._id, s._id, { proofUrl: url });
                          } catch (err) {
                            alert('Upload failed');
                          }
                        }} />
                        {s.proofUrl && (
                          <div style={{ marginTop: 4 }}>
                            <a href={s.proofUrl} target="_blank" rel="noreferrer">View proof</a>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <select value={s.status} onChange={(e) => updateLocal(idx, 'status', e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="on_the_way">On the way</option>
                        <option value="picked">Picked Up</option>
                        <option value="dropped">Dropped</option>
                        <option value="skipped">Skipped</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Optional notes"
                        value={s.notes || ''}
                        onChange={(e) => updateLocal(idx, 'notes', e.target.value)}
                      />
                    </td>
                    <td>
                      <button className="btn primary" onClick={() => saveRow(idx)}>Save</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffPickups;
