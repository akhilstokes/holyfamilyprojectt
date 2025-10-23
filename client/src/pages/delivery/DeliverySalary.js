import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const DeliverySalary = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseList = async (res) => {
    const ct = res.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');
    const body = isJson ? await res.json() : { error: await res.text() };
    const list = Array.isArray(body?.data) ? body.data
              : Array.isArray(body?.payslips) ? body.payslips
              : Array.isArray(body) ? body
              : [];
    return { list, body };
  };

  const load = async () => {
    if (!user?._id) return;
    setLoading(true); setError(''); setRows([]);
    try {
      // Try primary endpoint
      let res = await fetch(`${API}/api/salary/history/${user._id}`, { headers: authHeaders(), credentials: 'include' });
      if (!res.ok) {
        // Fallback 1: unified wages payslips with userId + group
        res = await fetch(`${API}/api/wages/payslips?userId=${encodeURIComponent(user._id)}&group=delivery`, { headers: authHeaders(), credentials: 'include' });
      }
      if (!res.ok) {
        // Fallback 2: wages payslips by token + group
        res = await fetch(`${API}/api/wages/payslips?group=delivery`, { headers: authHeaders(), credentials: 'include' });
      }
      if (!res.ok) {
        // Fallback 3: wages payslips by role key
        res = await fetch(`${API}/api/wages/payslips?role=delivery_staff`, { headers: authHeaders(), credentials: 'include' });
      }
      if (!res.ok) {
        // Fallback 4: salary history by query param staffId
        res = await fetch(`${API}/api/salary/history?staffId=${encodeURIComponent(user._id)}`, { headers: authHeaders(), credentials: 'include' });
      }
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
          // Endpoint not available yet – show a concise hint and return empty list
          setError('Salary history is not available yet.');
          setRows([]);
          return;
        }
        throw new Error(`Failed to load (${res.status})`);
      }
      const { list } = await parseList(res);
      setRows(list);
    } catch (e) {
      // Remove any potential HTML from error text
      const msg = (e?.message || 'Failed to load salary').replace(/<[^>]*>/g, '');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?._id]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>My Salary</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 780 }}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Status</th>
              <th>Approved At</th>
              <th>Paid At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r._id || idx}>
                <td>{r.month ?? r.period?.month ?? '-'}</td>
                <td>{r.year ?? r.period?.year ?? '-'}</td>
                <td>{r.grossAmount ?? r.grossSalary ?? r.amount?.gross ?? '-'}</td>
                <td>{r.totalDeductions ?? r.deductions ?? r.amount?.deductions ?? '-'}</td>
                <td>{r.netPay ?? r.amount?.net ?? '-'}</td>
                <td>{r.status || r.state || '-'}</td>
                <td>{r.approvedAt ? new Date(r.approvedAt).toLocaleString() : (r.approved_at ? new Date(r.approved_at).toLocaleString() : '-')}</td>
                <td>{r.paidAt ? new Date(r.paidAt).toLocaleString() : (r.paid_at ? new Date(r.paid_at).toLocaleString() : '-')}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'#6b7280' }}>No salary records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliverySalary;
