// client/src/pages/UserLiveRate.jsx
import React, { useEffect, useState } from 'react';
import { getLatest } from '../services/dailyRateService';

const categories = ['RSS4', 'RSS5', 'ISNR20', 'LATEX60'];

export default function UserLiveRate() {
  const [category, setCategory] = useState('LATEX60');
  const [rate, setRate] = useState(null);
  useEffect(() => {
    getLatest(category)
      .then(({ data }) => setRate(data))
      .catch(() => setRate(null));
  }, [category]);

  return (
    <div>
      <h2>Live Rate (Admin-entered)</h2>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {rate ? (
        <div>
          <p>Date: {new Date(rate.effectiveDate).toLocaleDateString()}</p>
          <p>INR: {rate.inr}</p>
          <p>USD: {rate.usd}</p>
        </div>
      ) : (
        <p>No data</p>
      )}
    </div>
  );
}