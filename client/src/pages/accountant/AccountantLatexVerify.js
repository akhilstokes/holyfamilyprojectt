import React, { useEffect, useState } from 'react';
import { fetchLatexRequests, updateLatexRequestAdmin, accountantCalculate } from '../../services/accountantService';
import { useConfirm } from '../../components/common/ConfirmDialog';

const statusColors = { pending: '#aa8800', approved: '#0b6e4f', rejected: '#b00020', paid: '#2a5bd7' };

export default function AccountantLatexVerify() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchLatexRequests({ page, limit: 20, status });
      setRows(list);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status]);

  const updateStatus = async (id, nextStatus) => {
    const ok = await confirm('Confirm action', `Are you sure to set status to ${nextStatus}?`);
    if (!ok) return;
    try {
      await updateLatexRequestAdmin(id, { status: nextStatus });
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update status';
      alert(msg);
    }
  };

  const doCalculate = async (r) => {
    const input = window.prompt('Enter market rate (₹ per kg):', String(r.marketRate || ''));
    if (!input) return;
    const rate = Number(input);
    if (Number.isNaN(rate) || rate <= 0) { alert('Invalid rate'); return; }
    const ok = await confirm('Confirm calculation', `Calculate amount using rate ₹${rate}/kg for request ${r._id}?`);
    if (!ok) return;
    await accountantCalculate(r._id, rate);
    await load();
  };

  return (
    <div>
      <h2>Verify Latex Billing</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
        <button className="btn" onClick={() => { setPage(1); load(); }}>Refresh</button>
      </div>

      {loading ? <p>Loading...</p> : (
        rows.length === 0 ? <div className="no-data">No requests</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>DRC%</th>
                  <th>Estimated</th>
                  <th>Calc Amount</th>
                  <th>Rate (₹/kg)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.submittedAt || r.createdAt).toLocaleString()}</td>
                    <td>{r.user?.name || '-'}</td>
                    <td>{r.quantity ?? '-'}</td>
                    <td>{r.drcPercentage ?? '-'}</td>
                    <td>{r.estimatedPayment ?? '-'}</td>
                    <td>{r.calculatedAmount ?? '-'}</td>
                    <td>{r.marketRate ?? '-'}</td>
                    <td><span style={{ color: statusColors[r.status] || '#333' }}>{r.status}</span></td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      {r.status === 'TEST_COMPLETED' && (
                        <button className="btn" onClick={() => doCalculate(r)}>Calculate</button>
                      )}
                      {r.status === 'pending' && (
                        <>
                          <button className="btn" onClick={() => updateStatus(r._id, 'approved')}>Approve</button>
                          <button className="btn-secondary" onClick={() => updateStatus(r._id, 'rejected')}>Reject</button>
                        </>
                      )}
                      {r.status === 'approved' && (
                        <button className="btn" onClick={() => updateStatus(r._id, 'paid')}>Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page}</span>
        <button className="btn-secondary" onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
