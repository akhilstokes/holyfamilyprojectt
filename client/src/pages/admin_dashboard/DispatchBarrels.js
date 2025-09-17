import React, { useEffect, useState } from 'react';
import axios from 'axios';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const DispatchBarrels = () => {
  const [barrels, setBarrels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBarrels, setSelectedBarrels] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barrelsRes, usersRes] = await Promise.all([
          axios.get('/api/barrels', authHeaders()),
          axios.get('/api/users', authHeaders())
        ]);
        setBarrels(barrelsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (e) {
        setMessage(e?.response?.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, []);

  const toggleBarrel = (id) => {
    setSelectedBarrels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submitDispatch = async () => {
    if (!recipient || selectedBarrels.length === 0) { setMessage('Select recipient and at least one barrel'); return; }
    setLoading(true); setMessage('');
    try {
      await axios.post('/api/barrel-ops/dispatch', { barrelIds: selectedBarrels, recipientUserId: recipient, dispatchDate: date, note }, authHeaders());
      setSelectedBarrels([]); setNote('');
      setMessage('Dispatch recorded');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Dispatch failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page p-4">
      <h2>Dispatch Barrels</h2>
      {message ? <div className="alert">{message}</div> : null}
      <div className="controls" style={{ display:'flex', gap:12, alignItems:'center', margin:'12px 0' }}>
        <select value={recipient} onChange={e=>setRecipient(e.target.value)}>
          <option value="">Select recipient</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
        </select>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="text" placeholder="Note" value={note} onChange={e=>setNote(e.target.value)} />
        <button onClick={submitDispatch} disabled={loading}>Dispatch</button>
      </div>
      <div className="list">
        {barrels.filter(b=>b.status!== 'disposed').map(b => (
          <label key={b._id} style={{ display:'flex', gap:8, alignItems:'center', padding:'6px 0' }}>
            <input type="checkbox" checked={selectedBarrels.includes(b.barrelId)} onChange={()=>toggleBarrel(b.barrelId)} />
            <span>{b.barrelId}</span>
            <span style={{ color:'#666' }}>({b.status})</span>
            <span style={{ marginLeft:'auto', color:'#999' }}>{b.lastKnownLocation}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DispatchBarrels;


