import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const RequestsIssues = () => {
  const [barrelRequests, setBarrelRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const [r, i] = await Promise.all([
        axios.get(`${API}/api/admin/requests/barrels`, { withCredentials: true, params }),
        axios.get(`${API}/api/admin/issues`, { withCredentials: true, params }),
      ]);
      setBarrelRequests(r.data);
      setIssues(i.data);
    } catch (e) {
      setMessage('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateRequest = async (id, status) => {
    setMessage('');
    try {
      await axios.put(`${API}/api/admin/requests/barrels/${id}`, { status }, { withCredentials: true });
      await load();
    } catch (e) {
      setMessage('Failed to update request');
    }
  };

  const updateIssue = async (id, status) => {
    setMessage('');
    try {
      await axios.put(`${API}/api/admin/issues/${id}`, { status }, { withCredentials: true });
      await load();
    } catch (e) {
      setMessage('Failed to update issue');
    }
  };

  return (
    <div>
      <h3>Requests & Issues</h3>
      {message && <div className="alert alert-danger">{message}</div>}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-body">
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <select className="form-control" style={{ maxWidth: 180 }} value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <input type="date" className="form-control" value={dateFrom} onChange={(e)=>{ setDateFrom(e.target.value); setPage(1); }} />
            <input type="date" className="form-control" value={dateTo} onChange={(e)=>{ setDateTo(e.target.value); setPage(1); }} />
            <button className="btn btn-outline-primary" onClick={()=>{ setPage(1); load(); }} disabled={loading}>Apply</button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">Barrel Requests</div>
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <table className="table table-striped">
                <thead><tr><th>User</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {barrelRequests.slice((page-1)*pageSize, page*pageSize).map(r => (
                    <tr key={r._id}>
                      <td>{r.user?.name}</td>
                      <td>{r.quantity}</td>
                      <td>{r.status}</td>
                      <td>
                        <button className="btn btn-sm btn-success" onClick={() => updateRequest(r._id, 'approved')}>Approve</button>{' '}
                        <button className="btn btn-sm btn-danger" onClick={() => updateRequest(r._id, 'rejected')}>Reject</button>{' '}
                        <button className="btn btn-sm btn-primary" onClick={() => updateRequest(r._id, 'fulfilled')}>Mark Fulfilled</button>
                      </td>
                    </tr>
                  ))}
                  {barrelRequests.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted">No barrel requests</td></tr>
                  )}
                </tbody>
              </table>
              {barrelRequests.length > pageSize && (
                <div className="d-flex justify-content-end" style={{ gap: 6 }}>
                  <button className="btn btn-sm btn-light" disabled={page===1} onClick={()=>setPage((p)=>p-1)}>Prev</button>
                  <span className="align-self-center">Page {page} / {Math.ceil(barrelRequests.length / pageSize)}</span>
                  <button className="btn btn-sm btn-light" disabled={page*pageSize>=barrelRequests.length} onClick={()=>setPage((p)=>p+1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">Issue Reports</div>
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <table className="table table-striped">
                <thead><tr><th>User</th><th>Category</th><th>Title</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {issues.slice((page-1)*pageSize, page*pageSize).map(it => (
                    <tr key={it._id}>
                      <td>{it.user?.name}</td>
                      <td>{it.category}</td>
                      <td>{it.title}</td>
                      <td>{it.status}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => updateIssue(it._id, 'in_progress')}>In Progress</button>{' '}
                        <button className="btn btn-sm btn-success" onClick={() => updateIssue(it._id, 'resolved')}>Resolve</button>{' '}
                        <button className="btn btn-sm btn-dark" onClick={() => updateIssue(it._id, 'closed')}>Close</button>
                      </td>
                    </tr>
                  ))}
                  {issues.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted">No issues reported</td></tr>
                  )}
                </tbody>
              </table>
              {issues.length > pageSize && (
                <div className="d-flex justify-content-end" style={{ gap: 6 }}>
                  <button className="btn btn-sm btn-light" disabled={page===1} onClick={()=>setPage((p)=>p-1)}>Prev</button>
                  <span className="align-self-center">Page {page} / {Math.ceil(issues.length / pageSize)}</span>
                  <button className="btn btn-sm btn-light" disabled={page*pageSize>=issues.length} onClick={()=>setPage((p)=>p+1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsIssues;


