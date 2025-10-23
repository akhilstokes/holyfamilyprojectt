import React, { useState } from 'react';
import { approveBarrelDisposal, approveBarrelPurchase, requestBarrelDisposal } from '../../services/adminService';

const BarrelAssignments = () => {
  const [barrelId, setBarrelId] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const run = async (fn) => {
    setErr(''); setMsg('');
    try { const res = await fn(barrelId); setMsg(res?.message || 'Success'); }
    catch (e) { setErr(e?.response?.data?.message || e?.message || 'Failed'); }
  };

  return (
    <div>
      <h2>Barrel Assignments</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder="Barrel ID" value={barrelId} onChange={(e) => setBarrelId(e.target.value)} />
        <button onClick={() => run(approveBarrelPurchase)}>Approve Purchase</button>
        <button onClick={() => run(requestBarrelDisposal)}>Request Disposal</button>
        <button onClick={() => run(approveBarrelDisposal)}>Approve Disposal</button>
      </div>
      {msg && <div style={{ color: 'limegreen' }}>{msg}</div>}
      {err && <div style={{ color: 'tomato' }}>{err}</div>}
      <p style={{ marginTop: 12, color: '#94a3b8' }}>Note: Movement create/list is available under staff and logistics endpoints.</p>
    </div>
  );
};

export default BarrelAssignments;
