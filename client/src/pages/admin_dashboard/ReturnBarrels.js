import React, { useEffect, useState } from 'react';
import axios from 'axios';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const ReturnBarrels = () => {
  const [barrelId, setBarrelId] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReturn = async () => {
    if (!barrelId) { setMessage('Enter barrel ID'); return; }
    setLoading(true); setMessage('');
    try {
      await axios.post('/api/barrel-ops/return', { barrelId, returnDate: date, isReturnedEmpty: isEmpty, note }, authHeaders());
      setBarrelId(''); setIsEmpty(false); setNote('');
      setMessage('Return recorded');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Return failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page p-4">
      <h2>Return Barrels</h2>
      {message ? <div className="alert">{message}</div> : null}
      <div style={{ display:'grid', gap:12, maxWidth:420 }}>
        <input type="text" placeholder="Barrel ID" value={barrelId} onChange={e=>setBarrelId(e.target.value)} />
        <label style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input type="checkbox" checked={isEmpty} onChange={e=>setIsEmpty(e.target.checked)} />
          Returned Empty
        </label>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="text" placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} />
        <button onClick={submitReturn} disabled={loading}>Record Return</button>
      </div>
    </div>
  );
};

export default ReturnBarrels;


