import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BarrelDistribution = () => {
  const [barrels, setBarrels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBarrels, setSelectedBarrels] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [b, u] = await Promise.all([
        axios.get(`${API}/api/admin/barrels`, { withCredentials: true }),
        axios.get(`${API}/api/admin/staff`, { withCredentials: true }),
      ]);
      setBarrels(b.data);
      setUsers(u.data);
    } catch (e) {
      setMessage('Failed to load data');
    }
  };

  useEffect(() => { load(); }, []);

  const toggleBarrel = (serial) => {
    setSelectedBarrels((prev) => prev.includes(serial) ? prev.filter(s => s !== serial) : [...prev, serial]);
  };

  const dispatch = async () => {
    setMessage('');
    if (!selectedUser || selectedBarrels.length === 0) { setMessage('Select user and barrels'); return; }
    try {
      await axios.post(`${API}/api/admin/barrels/dispatch`, { barrelIds: selectedBarrels, recipientUserId: selectedUser }, { withCredentials: true });
      setSelectedBarrels([]);
      await load();
      setMessage('Dispatched successfully');
    } catch (e) {
      setMessage('Failed to dispatch');
    }
  };

  const returnSelected = async () => {
    setMessage('');
    if (selectedBarrels.length === 0) { setMessage('Select barrels'); return; }
    try {
      await axios.post(`${API}/api/admin/barrels/return`, { barrelIds: selectedBarrels }, { withCredentials: true });
      setSelectedBarrels([]);
      await load();
      setMessage('Returned successfully');
    } catch (e) {
      setMessage('Failed to return');
    }
  };

  return (
    <div>
      <h3>Barrel Distribution</h3>
      {message && <div>{message}</div>}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">Dispatch to User</div>
        <div className="card-body">
          <div className="form-group">
            <label>User</label>
            <select className="form-control" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Select user</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={dispatch}>Dispatch Selected</button>{' '}
          <button className="btn btn-secondary" onClick={returnSelected}>Mark Returned</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">Barrels</div>
        <div className="card-body">
          <table className="table">
            <thead><tr><th></th><th>Serial</th><th>Status</th><th>Location</th></tr></thead>
            <tbody>
              {barrels.map(b => (
                <tr key={b._id}>
                  <td><input type="checkbox" checked={selectedBarrels.includes(b.barrelId)} onChange={() => toggleBarrel(b.barrelId)} /></td>
                  <td>{b.barrelId}</td>
                  <td>{b.status}</td>
                  <td>{b.lastKnownLocation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BarrelDistribution;


