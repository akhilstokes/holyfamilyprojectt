import React, { useEffect, useMemo, useState } from 'react';
import { fetchLatexRequests, updateLatexRequestAdmin } from '../../services/accountantService';
import { useConfirm } from '../../components/common/ConfirmDialog';

const AccountantBillPayments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('VERIFIED'); // VERIFIED | paid | ACCOUNT_CALCULATED | TEST_COMPLETED | all
  const [q, setQ] = useState('');
  const todayStr = new Date().toISOString().slice(0,10);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateError, setDateError] = useState('');
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const list = await fetchLatexRequests({ status: status === 'all' ? undefined : status, limit: 200 });
      setRows(list);
    } catch (e) {
      setError('Failed to load payments');
    } finally { setLoading(false); }
  };

  useEffect(() => { load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const markPaid = async (id) => {
    const ok = await confirm('Confirm Payment', 'Mark this bill as paid?');
    if (!ok) return;
    try {
      await updateLatexRequestAdmin(id, { status: 'paid' });
      await load();
    } catch (e) {
      setError('Failed to mark paid');
    }
  };

  const filtered = useMemo(()=>{
    let arr = rows || [];
    // validate date range
    setDateError('');
    if (from && to) {
      const f = new Date(from);
      const t = new Date(to);
      if (t < f) {
        setDateError('To date cannot be earlier than From date.');
        return [];
      }
    }
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter(r => (r.user?.name||'').toLowerCase().includes(t) || (r.overrideBuyerName||'').toLowerCase().includes(t));
    }
    if (from) {
      const f = new Date(from);
      arr = arr.filter(r => new Date(r.verifiedAt || r.updatedAt || r.createdAt) >= f);
    }
    if (to) {
      const t2 = new Date(to + 'T23:59:59.999Z');
      arr = arr.filter(r => new Date(r.verifiedAt || r.updatedAt || r.createdAt) <= t2);
    }
    return arr;
  }, [rows, q, from, to]);

  const totalAmount = useMemo(()=> filtered.reduce((s, r)=> s + (Number(r.finalPayment || r.calculatedAmount) || 0), 0), [filtered]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Bill Payments</h2>
        <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:12, flexWrap:'wrap' }}>
        <label>Status
          <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{ marginLeft:6 }}>
            <option value="VERIFIED">Verified</option>
            <option value="paid">Paid</option>
            <option value="ACCOUNT_CALCULATED">Calculated</option>
            <option value="TEST_COMPLETED">Test Completed</option>
            <option value="all">All</option>
          </select>
        </label>
        <label>From <input type="date" value={from} max={to || undefined} onChange={(e)=>{
          const v = e.target.value;
          setFrom(v);
          if (to && v && new Date(to) < new Date(v)) setTo(v);
        }} /></label>
        <label>To <input type="date" value={to} min={from || undefined} onChange={(e)=>{
          const v = e.target.value;
          setTo(v);
        }} /></label>
        <input placeholder="Search buyer" value={q} onChange={(e)=>setQ(e.target.value)} style={{ width:220 }} />
        <div style={{ marginLeft:'auto', color:'#334155' }}>
          <b>Total</b>: {filtered.length} &nbsp; <b>Amount</b>: {totalAmount}
        </div>
      </div>
      {dateError && <div style={{ color:'tomato', marginTop:6 }}>{dateError}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 780 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer</th>
              <th>Qty (L)</th>
              <th>DRC%</th>
              <th>Rate</th>
              <th>Final Amount</th>
              <th>Invoice</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r._id}>
                <td>{new Date(r.verifiedAt || r.updatedAt || r.createdAt).toLocaleString()}</td>
                <td>{r.overrideBuyerName || r.user?.name || '-'}</td>
                <td>{r.quantity ?? '-'}</td>
                <td>{r.drcPercentage ?? '-'}</td>
                <td>{r.marketRate ?? '-'}</td>
                <td>{r.finalPayment ?? r.calculatedAmount ?? '-'}</td>
                <td>{r.invoiceNumber ? <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/latex/invoice/${r._id}`} target="_blank" rel="noreferrer">{r.invoiceNumber}</a> : '-'}</td>
                <td>
                  {r.status === 'VERIFIED' ? (
                    <button className="btn" onClick={() => markPaid(r._id)}>Mark Paid</button>
                  ) : (
                    <span style={{ color:'#6b7280' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={8} style={{ textAlign:'center', color:'#6b7280' }}>No verified bills.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantBillPayments;
