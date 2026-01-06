import React, { useEffect, useState } from 'react';
import { useConfirm } from '../../components/common/ConfirmDialog';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const AccountantBarrelVerify = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirm = useConfirm();
  const [rate, setRate] = useState({}); // id -> marketRate


  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    barrelCount: '',
    totalVolumeKg: '',
    drcPct: ''
  });



  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/api/sell-requests/admin/all?status=TESTED`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
      setRows(list);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const calculate = async (id) => {
    const val = Number(rate[id]);
    if (!val || val <= 0) { alert('Enter valid market rate'); return; }
    const ok = await confirm('Calculate Amount', `Calculate using market rate ₹${val} per dry kg?`);
    if (!ok) return;
    try {
      setError('');
      const res = await fetch(`${API}/api/sell-requests/${id}/calculate`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ marketRate: val })
      });
      if (!res.ok) throw new Error(`Calculate failed (${res.status})`);
      await load();
    } catch (e) {
      setError(e?.message || 'Calculate failed');
    }
  };


  const handleDelete = async (id) => {
    if (!await confirm('Delete Intake', 'Are you sure you want to delete this intake?')) return;
    try {
      const res = await fetch(`${API}/api/sell-requests/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (res.ok) {
        setRows(rows.filter(r => r._id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch (e) { console.error(e); alert('Error deleting'); }
  };

  const openAdd = () => {
    setEditMode(false);
    setFormData({ name: '', phone: '', barrelCount: '', totalVolumeKg: '', drcPct: '' });
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditMode(true);
    setEditId(row._id);
    setFormData({
      name: row.overrideFarmerName || row.farmerId?.name || '',
      phone: row.farmerId?.phoneNumber || row.phone || '',
      barrelCount: row.barrelCount || '',
      totalVolumeKg: row.totalVolumeKg || '',
      drcPct: row.drcPct || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode
        ? `${API}/api/sell-requests/${editId}/update`
        : `${API}/api/sell-requests/admin/create`;

      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', phone: '', barrelCount: '', totalVolumeKg: '', drcPct: '' });
        load();
      } else {
        alert('Operation failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving data');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Delivery Intake / Verify</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={openAdd} style={{ background: '#2563eb', color: 'white' }}>+ Add Intake</button>
          <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
      <div style={{ color: '#6b7280', fontSize: 13, marginTop: 6 }}>

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Delivery Intake / Verify</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      <div style={{ color:'#6b7280', fontSize: 13, marginTop: 6 }}>

        Lab provides DRC% and barrel count. Enter market rate to calculate amount. After calculation, the manager will verify and generate invoice.
      </div>
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer</th>
              <th>Phone</th>
              <th>Barrels</th>
              <th>DRC%</th>
              <th>Total (Kg)</th>
              <th>Dry Kg</th>
              <th>Market Rate (₹/dry kg)</th>
              <th>Amount (₹)</th>
              <th>₹/Barrel</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const buyerName = r.overrideFarmerName || r.farmerId?.name || r.name || '-';
              const buyerPhone = r.farmerId?.phoneNumber || r.phone || '-';
              const drc = Number(r.drcPct || 0);
              const totalKg = Number(r.totalVolumeKg || 0);
              const dryKg = Math.round(totalKg * (drc / 100) * 100) / 100;
              const mr = rate[r._id] ?? (r.marketRate ?? '');

              const amount = r.amount ? Number(r.amount) : (mr ? Math.round((Number(mr) || 0) * dryKg) : null);

              const amount = r.amount ? Number(r.amount) : (mr ? Math.round((Number(mr)||0) * dryKg) : null);

              const perBarrel = r.barrelCount ? (amount ? (amount / Number(r.barrelCount)) : null) : null;
              return (
                <tr key={r._id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{buyerName}</td>
                  <td>{buyerPhone}</td>
                  <td>{r.barrelCount ?? '-'}</td>
                  <td>{drc ? `${drc}%` : '-'}</td>
                  <td>{totalKg || '-'}</td>
                  <td>{isNaN(dryKg) ? '-' : dryKg}</td>
                  <td>
                    <input type="number" step="any" min="0" value={mr}

                      onChange={(e) => setRate(prev => ({ ...prev, [r._id]: e.target.value }))}
                      style={{ width: 100 }} placeholder="Rate"

                      onChange={(e)=> setRate(prev => ({ ...prev, [r._id]: e.target.value }))}
                      style={{ width: 160 }} placeholder="e.g. 145"

                    />
                  </td>
                  <td>{amount != null && !isNaN(amount) ? amount : '-'}</td>
                  <td>{perBarrel != null && !isNaN(perBarrel) ? perBarrel.toFixed(2) : '-'}</td>

                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => calculate(r._id)} style={{ padding: '4px 8px', fontSize: 12 }}>Calc</button>
                    <button className="btn" onClick={() => openEdit(r)} style={{ padding: '4px 8px', fontSize: 12, background: '#64748b' }}>Edit</button>
                    <button className="btn" onClick={() => handleDelete(r._id)} style={{ padding: '4px 8px', fontSize: 12, background: '#ef4444' }}>Del</button>

                  <td>
                    <button className="btn" onClick={() => calculate(r._id)}>Calculate</button>

                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !loading && (

              <tr><td colSpan={11} style={{ textAlign: 'center', color: '#6b7280' }}>No pending intakes.</td></tr>

              <tr><td colSpan={7} style={{ textAlign:'center', color:'#6b7280' }}>No pending intakes.</td></tr>

            )}
          </tbody>
        </table>
      </div>


      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 400 }}>
            <h3>{editMode ? 'Edit Intake' : 'Add New Intake'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Buyer Name</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Phone (Optional)</label>
                <input className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Barrels</label>
                  <input className="form-input" type="number" required value={formData.barrelCount} onChange={e => setFormData({ ...formData, barrelCount: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Total Kg</label>
                  <input className="form-input" type="number" step="0.01" required value={formData.totalVolumeKg} onChange={e => setFormData({ ...formData, totalVolumeKg: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600 }}>DRC %</label>
                <input className="form-input" type="number" step="0.01" required value={formData.drcPct} onChange={e => setFormData({ ...formData, drcPct: e.target.value })} style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{editMode ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default AccountantBarrelVerify;
