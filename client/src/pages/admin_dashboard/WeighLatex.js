import React, { useState } from 'react';
import axios from 'axios';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const WeighLatex = () => {
  const [barrelId, setBarrelId] = useState('');
  const [batchDate, setBatchDate] = useState(() => new Date().toISOString().slice(0,10));
  const [grossKg, setGrossKg] = useState('');
  const [tareKg, setTareKg] = useState('');
  const [ammoniumKg, setAmmoniumKg] = useState('0');
  const [otherChemicalsKg, setOtherChemicalsKg] = useState('0');
  const [measuredDRC, setMeasuredDRC] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const net = Math.max(0, (parseFloat(grossKg)||0) - (parseFloat(tareKg)||0));
  const dryEst = Math.max(0, net - (parseFloat(ammoniumKg)||0) - (parseFloat(otherChemicalsKg)||0));
  const drc = measuredDRC ? parseFloat(measuredDRC) : (net>0 ? (dryEst/net*100) : 0);

  const submitIntake = async () => {
    if (!barrelId || !grossKg || !tareKg) { setMessage('Enter barrel, gross and tare'); return; }
    setLoading(true); setMessage('');
    try {
      await axios.post('/api/latex-intake', {
        barrelId, batchDate, grossKg: Number(grossKg), tareKg: Number(tareKg), ammoniumKg: Number(ammoniumKg||0), otherChemicalsKg: Number(otherChemicalsKg||0), measuredDRC: measuredDRC ? Number(measuredDRC) : undefined
      }, authHeaders());
      setBarrelId(''); setGrossKg(''); setTareKg(''); setAmmoniumKg('0'); setOtherChemicalsKg('0'); setMeasuredDRC('');
      setMessage('Intake recorded');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to record intake');
    } finally { setLoading(false); }
  };

  return (
    <div className="page p-4" style={{ maxWidth: 560 }}>
      <h2>Weigh Latex</h2>
      {message ? <div className="alert">{message}</div> : null}
      <div style={{ display:'grid', gap:12 }}>
        <input type="text" placeholder="Barrel ID" value={barrelId} onChange={e=>setBarrelId(e.target.value)} />
        <input type="date" value={batchDate} onChange={e=>setBatchDate(e.target.value)} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="Gross (kg)" value={grossKg} onChange={e=>setGrossKg(e.target.value.replace(/^-/, ''))} onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()} onWheel={(e)=>e.currentTarget.blur()} />
          <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="Tare (kg)" value={tareKg} onChange={e=>setTareKg(e.target.value.replace(/^-/, ''))} onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()} onWheel={(e)=>e.currentTarget.blur()} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="Ammonium (kg)" value={ammoniumKg} onChange={e=>setAmmoniumKg(e.target.value.replace(/^-/, ''))} onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()} onWheel={(e)=>e.currentTarget.blur()} />
          <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="Other Chemicals (kg)" value={otherChemicalsKg} onChange={e=>setOtherChemicalsKg(e.target.value.replace(/^-/, ''))} onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()} onWheel={(e)=>e.currentTarget.blur()} />
        </div>
        <input type="number" step="1" min="0" max="100" inputMode="numeric" placeholder="Measured DRC % (optional)" value={measuredDRC} onChange={e=>setMeasuredDRC(e.target.value.replace(/^-/, '').replace(/\..*$/, ''))} onKeyDown={(evt)=>['e','E','+','-','.'].includes(evt.key) && evt.preventDefault()} onWheel={(e)=>e.currentTarget.blur()} />
        <div style={{ display:'flex', gap:16, color:'#555' }}>
          <span>Net: <strong>{net.toFixed(2)} kg</strong></span>
          <span>Estimated DRC: <strong>{drc.toFixed(2)}%</strong></span>
          <span>Dry kg: <strong>{(net*(drc/100)).toFixed(2)}</strong></span>
        </div>
        <button onClick={submitIntake} disabled={loading}>Record Intake</button>
      </div>
    </div>
  );
};

export default WeighLatex;


