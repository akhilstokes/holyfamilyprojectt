import React, { useState, useEffect } from 'react';
import { useConfirm } from '../../components/common/ConfirmDialog';
import './DeliveryTheme.css';
import BarrelQRScanner from '../../components/workflows/BarrelQRScanner';

const DeliveryBarrelIntake = ({ readOnly = false }) => {
  const [form, setForm] = useState({ name: '', phone: '', barrelCount: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState([]);
  const confirm = useConfirm();

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onBarrelScanned = (b) => {
    setScanned((prev) => (prev.some(x => x.barrelId === b.barrelId) ? prev : [...prev, b]));
  };

  const removeScanned = (id) => setScanned(prev => prev.filter(x => x.barrelId !== id));
  const clearScanned = () => setScanned([]);

  useEffect(() => {
    setForm(f => ({ ...f, barrelCount: scanned.length ? String(scanned.length) : '' }));
  }, [scanned]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (readOnly) return;
    if (!form.name || !form.phone || !form.barrelCount) {
      setError('Please fill Name, Phone and Barrel Count');
      return;
    }
    const ok = await confirm('Confirm Intake', `Record intake for ${form.name} with ${form.barrelCount} barrel(s)?`);
    if (!ok) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
      // Use the correct barrel intake endpoint
      const payload = { ...form, barrelCount: Number(scanned.length || form.barrelCount) || 0, barrelIds: scanned.map(s => s.barrelId) };
      const res = await fetch(`${apiBase}/api/delivery/barrels/intake`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Submit failed (${res.status})`);
      setMessage('Intake recorded');
      setForm({ name: '', phone: '', barrelCount: '', notes: '' });
      setScanned([]);
    } catch (e2) {
      setError(e2?.message || 'Failed to record intake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Delivery Barrel Intake</h2>
      {readOnly && <div style={{ marginBottom: 8, color: '#94a3b8' }}>Read-only view (for Accountant review). Data will appear once backend intake endpoints are enabled.</div>}
      {message && <div style={{ color: '#16a34a', marginBottom: 8 }}>{message}</div>}
      {error && <div style={{ color: 'tomato', marginBottom: 8 }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <BarrelQRScanner onBarrelScanned={onBarrelScanned} />
        {scanned.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Scanned Barrels: {scanned.length}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {scanned.map(s => (
                <div key={s.barrelId} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{s.barrelId}</span>
                  {!readOnly && <button type="button" className="btn btn--sm" onClick={() => removeScanned(s.barrelId)}>Remove</button>}
                </div>
              ))}
            </div>
            {!readOnly && (
              <div style={{ marginTop: 8 }}>
                <button type="button" className="btn" onClick={clearScanned}>Clear All</button>
              </div>
            )}
          </div>
        )}
      </div>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 640 }}>
          <div>
            <label>Name</label>
            <input name="name" value={form.name} onChange={onChange} disabled={readOnly || loading} />
          </div>
          <div>
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} disabled={readOnly || loading} />
          </div>
          <div>
            <label>Number of Barrels</label>
            <input name="barrelCount" type="number" min="0" value={form.barrelCount} onChange={onChange} readOnly disabled={readOnly || loading} />
          </div>
          <div>
            <label>Notes</label>
            <input name="notes" value={form.notes} onChange={onChange} disabled={readOnly || loading} />
          </div>
        </div>
        {!readOnly && (
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Intake'}</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DeliveryBarrelIntake;
