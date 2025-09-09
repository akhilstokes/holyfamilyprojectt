import React, { useEffect, useState } from 'react';
import { EnquiryService } from '../../services/enquiryService';

export default function EnquiriesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await EnquiryService.adminList();
      setList(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    try {
      if (action === 'approve') await EnquiryService.approve(id);
      else await EnquiryService.reject(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Action failed');
    }
  };

  return (
    <div>
      <h2>Buyer Enquiries</h2>
      {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : list.length === 0 ? (
        <p className="muted">No enquiries found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Buyer</th>
              <th>Phone</th>
              <th>City</th>
              <th>Status</th>
              <th>Items</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>{e.profile?.name || e.user?.name}</td>
                <td>{e.profile?.phone}</td>
                <td>{e.location?.city}</td>
                <td>{e.status}</td>
                <td>
                  {e.items?.map((it) => (
                    <div key={it.productId}>{it.name} × {it.quantity}</div>
                  ))}
                </td>
                <td>
                  {e.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" onClick={() => act(e._id, 'approve')}>Approve</button>
                      <button className="btn-secondary" onClick={() => act(e._id, 'reject')}>Reject</button>
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}