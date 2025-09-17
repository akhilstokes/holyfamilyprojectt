// client/src/pages/AdminRateHistory.jsx
import React, { useState } from 'react';
import { getHistory, exportCsv, exportPdf } from '../services/dailyRateService';

const categories = ['RSS4', 'RSS5', 'ISNR20', 'LATEX60'];

export default function AdminRateHistory({ token }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [rows, setRows] = useState([]);

  const search = async () => {
    const { data } = await getHistory({ from, to, category }, token);
    setRows(data);
  };

  const download = async (type) => {
    const api = type === 'csv' ? exportCsv : exportPdf;
    const { data } = await api({ from, to, category }, token);
    const blob = new Blob([data], { type: type === 'csv' ? 'text/csv' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-rates.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Rate History (Admin)</h2>
      <div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button onClick={search}>Search</button>
        <button onClick={() => download('csv')}>Export CSV</button>
        <button onClick={() => download('pdf')}>Export PDF</button>
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