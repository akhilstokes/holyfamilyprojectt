import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const LabourSalaryDetails = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const load = async () => {
      if (!user?._id || !token) return;
      setLoading(true); setError('');
      try {
        const res = await fetch(`${API}/api/salary/history/${user._id}?year=${year}&limit=12`, { headers: authHeaders(token) });
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const data = await res.json();
        setHistory(Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
      } catch (e) {
        setError(e?.message || 'Failed to load');
      } finally { setLoading(false); }
    };
    load();
  }, [user?._id, token, year]);

  const rows = history.map(h => ({
    id: h._id,
    month: h.month,
    year: h.year,
    dailyEarnings: h.dailyEarningsTotal ?? h.overtime ?? 0,
    credited: h.netSalary ?? h.netPay ?? 0,
    advance: h.advanceTotal ?? h.advance ?? 0,
    balance: (h.netSalary ?? h.netPay ?? 0) - (h.advanceTotal ?? h.advance ?? 0),
    status: h.status,
    updatedAt: h.updatedAt,
  }));

  return (
    <div style={{ padding: 16 }}>
      <h2>Labour Salary Details</h2>
      {error && <div style={{ color: 'tomato', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Loading...</div>}

      <div style={{ overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 820 }}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Daily Earnings</th>
              <th>Credited</th>
              <th>Advance</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.month}</td>
                <td>{r.year}</td>
                <td>{r.dailyEarnings}</td>
                <td>{r.credited}</td>
                <td>{r.advance}</td>
                <td>{r.balance}</td>
                <td><span className={`badge status-${(r.status || 'draft').toLowerCase()}`}>{r.status || 'draft'}</span></td>
                <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#6b7280' }}>No salary data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabourSalaryDetails;
