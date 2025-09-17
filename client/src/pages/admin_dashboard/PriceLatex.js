import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const PriceLatex = () => {
  const [intakes, setIntakes] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [specialRate, setSpecialRate] = useState('');
  const [message, setMessage] = useState('');

  // Stable callback so useEffect deps are correct
  const fetchIntakes = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/latex-intake?date=${date}`, authHeaders());
      setIntakes(data || []);
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to load intakes');
    }
  }, [date]);

  useEffect(() => { fetchIntakes(); }, [fetchIntakes]);

  const priceAll = async () => {
    try {
      await axios.post(`${API}/api/latex-pricing/price-batch`, { date, specialRatePerKgDRC: specialRate ? Number(specialRate) : undefined }, authHeaders());
      setMessage('Pricing completed');
      fetchIntakes();
    } catch (e) { setMessage(e?.response?.data?.message || 'Pricing failed'); }
  };

  const totalDry = intakes.reduce((s, it) => s + (it.netLatexKg||0) * ((it.computedDRC||0)/100), 0);

  return (
    <div className="page p-4">
      <h2>Price Latex</h2>
      {message ? <div className="alert">{message}</div> : null}
      <div style={{ display:'flex', gap:12, alignItems:'center', margin:'12px 0' }}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="number" step="0.01" min="0" inputMode="decimal" placeholder="Special Rate / kg DRC (optional)" value={specialRate} onChange={e=>setSpecialRate(e.target.value.replace(/^-/, ''))} onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()} onWheel={(e)=>e.currentTarget.blur()} />
        <button onClick={priceAll}>Apply Pricing</button>
        <div style={{ marginLeft:'auto', color:'#555' }}>Total Dry kg: <strong>{totalDry.toFixed(2)}</strong></div>
      </div>
      <div>
        {intakes.map(it => (
          <div key={it._id} style={{ display:'grid', gridTemplateColumns:'120px 1fr 1fr 1fr 1fr', gap:8, padding:'8px 0', borderBottom:'1px solid #eee' }}>
            <div>{it.barrel?.barrelId || '-'}</div>
            <div>Net: {it.netLatexKg?.toFixed(2)} kg</div>
            <div>DRC: {it.computedDRC?.toFixed(2)}%</div>
            <div>Dry: {(it.netLatexKg * (it.computedDRC/100)).toFixed(2)} kg</div>
            <div>{new Date(it.batchDate).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceLatex;


