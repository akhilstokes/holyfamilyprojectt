import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions, updateTransaction, publishTransaction } from '../../services/customerService';
import './userDashboardTheme.css';

const UserTransactions = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTransactions({ page, pageSize, from, to });
      setRows(res.rows);
      setTotal(res.total);
    } catch (e) {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, pageSize]);

  const beginEdit = (tx) => {
    const ok = window.confirm('Are you sure you want to edit this transaction?');
    if (!ok) return;
    setEditingId(tx.id || tx._id);
    setEditData({
      weightKg: tx.weightKg ?? tx.weight ?? '',
      drcPercent: tx.drcPercent ?? '',
      finalAmount: tx.finalAmount ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await updateTransaction(id, editData);
      // reflect changes locally to keep UX snappy
      setRows(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, ...editData } : r));
      setEditingId(null);
      setEditData({});
    } catch (e) {
      alert(e?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const doPublish = async (id) => {
    const ok = window.confirm('Publish changes? This will finalize the transaction.');
    if (!ok) return;
    setPublishing(true);
    try {
      await publishTransaction(id);
      // Optionally reload to ensure server state
      await load();
      alert('Published successfully');
    } catch (e) {
      alert(e?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <h2>Transactions & Bills</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'end', marginBottom: 12 }}>
        <label>
          From
          <input
            type="date"
            value={from}
            max={todayStr}
            onChange={e => {
              const v = e.target.value;
              if (to && to < v) setTo(v);
              setFrom(v);
            }}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            min={from}
            max={todayStr}
            onChange={e => {
              const v = e.target.value;
              setTo(from && v < from ? from : v);
            }}
          />
        </label>
        <button className="btn" onClick={() => { setPage(1); load(); }}>Filter</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="no-data">No transactions</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch</th>
                <th>Weight (kg)</th>
                <th>DRC (%)</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(tx => {
                const id = tx.id || tx._id;
                const isEditing = editingId === id;
                return (
                  <tr key={id}>
                    <td>{new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>{tx.batchId || '-'}</td>
                    <td>
                      {isEditing ? (
                        <input type="number" step="0.01" value={editData.weightKg}
                          onChange={e => setEditData(d => ({ ...d, weightKg: e.target.value }))} style={{ width: 110 }} />
                      ) : (
                        tx.weightKg ?? tx.weight ?? '-'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" step="0.01" value={editData.drcPercent}
                          onChange={e => setEditData(d => ({ ...d, drcPercent: e.target.value }))} style={{ width: 90 }} />
                      ) : (
                        tx.drcPercent ?? '-'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="number" step="0.01" value={editData.finalAmount}
                          onChange={e => setEditData(d => ({ ...d, finalAmount: e.target.value }))} style={{ width: 110 }} />
                      ) : (
                        tx.finalAmount ?? '-'
                      )}
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <Link className="btn-secondary" to={`/user/transactions/${id}`}>View</Link>
                      {!isEditing ? (
                        <button className="btn" onClick={() => beginEdit(tx)}>Edit</button>
                      ) : (
                        <>
                          <button className="btn" disabled={saving} onClick={() => saveEdit(id)}>{saving ? 'Saving...' : 'Save'}</button>
                          <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                          <button className="btn" disabled={publishing} onClick={() => doPublish(id)}>{publishing ? 'Publishing...' : 'Publish'}</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page}</span>
        <button className="btn-secondary" disabled={rows.length < pageSize || page * pageSize >= total} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default UserTransactions;
