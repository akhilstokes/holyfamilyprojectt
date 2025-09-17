// client/src/pages/UserRateHistory.jsx
import React, { useState } from 'react';
import { getHistory } from '../services/dailyRateService';

const categories = ['RSS4', 'RSS5', 'ISNR20', 'LATEX60'];

export default function UserRateHistory() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('LATEX60');
  const [rows, setRows] = useState([]);

  const search = async () => {
    const { data } = await getHistory({ from, to, category });
    setRows(data);
  };

  return (
    <div>
      <h2>Rate History</h2>
      <div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button onClick={search}>Search</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>INR</th>
            <th>USD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const d = new Date(r.effectiveDate);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            return (
              <tr key={r._id}>
                <td>{dateStr}</td>
                <td>{r.category}</td>
                <td>{r.inr}</td>
                <td>{r.usd}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}