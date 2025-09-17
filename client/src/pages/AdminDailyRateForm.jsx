// client/src/pages/AdminDailyRateForm.jsx
import React, { useState } from 'react';
import { addOrUpdateDaily } from '../services/dailyRateService';

const categories = ['RSS4', 'RSS5', 'ISNR20', 'LATEX60'];

export default function AdminDailyRateForm({ token }) {
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('LATEX60');
  const [inr, setInr] = useState('');
  const [usd, setUsd] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await addOrUpdateDaily({ effectiveDate, category, inr: Number(inr), usd: Number(usd) }, token);
      setMsg('Saved successfully.');
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to save.');
    }
  };

  return (
    <div>
      <h2>Add/Update Daily Rate (before 4 PM IST)</h2>
      <form onSubmit={submit}>
        <label>
          Date:
          <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
        </label>
        <label>
          Category:
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          INR:
          <input type="number" value={inr} onChange={(e) => setInr(e.target.value)} required />
        </label>
        <label>
          USD:
          <input type="number" value={usd} onChange={(e) => setUsd(e.target.value)} required />
        </label>
        <button type="submit">Save</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}