import React, { useEffect, useState, useMemo } from 'react';

const LabCheckIn = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [form, setForm] = useState({ sampleId: '', customerName: '', batch: '', quantityLiters: '', receivedAt: '', notes: '', barrelCount: 0 });
  const [barrels, setBarrels] = useState([]); // [{barrelId, liters}]
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  useEffect(() => {
    const n = Number(form.barrelCount) || 0;
    setBarrels(prev => {
      const arr = [...prev];
      if (arr.length > n) return arr.slice(0, n);
      while (arr.length < n) arr.push({ barrelId: '', liters: '' });
      return arr;
    });
  }, [form.barrelCount]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError(''); setValidation({});
    const v = {};
    if (!form.sampleId?.trim()) v.sampleId = 'Required';
    const qty = Number(form.quantityLiters);
    if (!(qty > 0)) v.quantityLiters = 'Enter a positive quantity';
    const bc = Number(form.barrelCount) || 0;
    if (bc > 0) {
      barrels.forEach((b, i)=>{ if (!String(b.barrelId||'').trim()) v[`barrel_${i}`]='Barrel ID required'; });
    }
    if (Object.keys(v).length) { setValidation(v); return; }
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/lab/samples/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          barrelCount: Number(form.barrelCount) || 0,
          barrels: barrels.map(b => ({ barrelId: b.barrelId, liters: b.liters !== '' ? Number(b.liters) : undefined }))
        }),
      });
      if (!res.ok) throw new Error(`Check-in failed (${res.status})`);
      setMessage('Sample checked in successfully');
      setForm({ sampleId: '', customerName: '', batch: '', quantityLiters: '', receivedAt: '', notes: '', barrelCount: 0 });
      setBarrels([]);
    } catch (e2) {
      setError(e2?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!form.sampleId?.trim()) return false;
    if (!(Number(form.quantityLiters) > 0)) return false;
    const n = Number(form.barrelCount) || 0;
    if (n>0 && barrels.some(b=>!String(b.barrelId||'').trim())) return false;
    return true;
  }, [loading, form, barrels]);

  return (
    <div className="dash-card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Sample Check-In</h3>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <label>Barrel ID<input name="sampleId" placeholder="Enter Barrel/Sample ID" value={form.sampleId} onChange={onChange} style={{ borderColor: validation.sampleId? '#dc3545':'' }} /></label>
        <label>Customer Name<input name="customerName" placeholder="Buyer/Customer name" value={form.customerName} onChange={onChange} /></label>
        <label>Batch<input name="batch" placeholder="Batch/Reference" value={form.batch} onChange={onChange} /></label>
        <label>Quantity (Liters)<input type="number" step="any" min={0.01} name="quantityLiters" placeholder="e.g. 120" value={form.quantityLiters} onChange={onChange} style={{ borderColor: validation.quantityLiters? '#dc3545':'' }} /></label>
        <label>Received At<input type="datetime-local" name="receivedAt" value={form.receivedAt} onChange={onChange} /></label>
        <label style={{ gridColumn: '1 / -1' }}>Notes<textarea name="notes" placeholder="Optional notes" value={form.notes} onChange={onChange} rows={3} /></label>
        <div style={{ gridColumn: '1 / -1', display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ margin: 0 }}>No. of Barrels</label>
            <input type="number" min={0} name="barrelCount" value={form.barrelCount} onChange={onChange} style={{ width: 120 }} />
          </div>
          {barrels.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 80 }}>Barrel {i+1}</span>
              <input placeholder="Barrel ID" value={b.barrelId} onChange={(e)=>{
                const v = e.target.value; setBarrels(arr=>{ const c=[...arr]; c[i] = { ...c[i], barrelId: v }; return c; });
              }} style={{ width: 220, borderColor: validation[`barrel_${i}`]? '#dc3545':'' }} />
              <input type="number" step="any" min={0} placeholder="Liters (optional)" value={b.liters} onChange={(e)=>{
                const v = e.target.value; setBarrels(arr=>{ const c=[...arr]; c[i] = { ...c[i], liters: v }; return c; });
              }} style={{ width: 160 }} />
            </div>
          ))}
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <button className="btn primary" type="submit" disabled={!canSubmit}>{loading ? 'Saving...' : 'Check In'}</button>
        </div>
      </form>
    </div>
  );
};

export default LabCheckIn;
