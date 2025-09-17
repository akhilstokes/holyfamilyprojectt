import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StaffDispatchBarrels.css';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const StaffDispatchBarrels = () => {
  const [barrels, setBarrels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBarrels, setSelectedBarrels] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barrelsRes, usersRes] = await Promise.all([
          axios.get('/api/barrels', authHeaders()),
          axios.get('/api/users', authHeaders())
        ]);
        setBarrels(barrelsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (e) {
        setMessage(e?.response?.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, []);

  const toggleBarrel = (id) => {
    setSelectedBarrels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllBarrels = () => {
    const availableBarrels = barrels.filter(b => b.status !== 'disposed').map(b => b.barrelId);
    setSelectedBarrels(availableBarrels);
  };

  const clearSelection = () => {
    setSelectedBarrels([]);
  };

  const submitDispatch = async () => {
    if (!recipient || selectedBarrels.length === 0) { 
      setMessage('Please select recipient and at least one barrel'); 
      return; 
    }
    setLoading(true); 
    setMessage('');
    try {
      await axios.post('/api/staff-barrels/dispatch', { 
        barrelIds: selectedBarrels, 
        recipientUserId: recipient, 
        dispatchDate: date, 
        note 
      }, authHeaders());
      setSelectedBarrels([]); 
      setNote('');
      setMessage('Dispatch recorded successfully');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Dispatch failed');
    } finally { 
      setLoading(false); 
    }
  };

  const filteredBarrels = barrels.filter(barrel => 
    barrel.status !== 'disposed' && 
    barrel.barrelId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="staff-dispatch-barrels">
      <div className="page-header">
        <h1>Dispatch Barrels</h1>
        <p>Select barrels to dispatch to recipients</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="dispatch-form">
        <div className="form-section">
          <h3>Dispatch Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Recipient *</label>
              <select 
                value={recipient} 
                onChange={e=>setRecipient(e.target.value)}
                required
              >
                <option value="">Select recipient</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Dispatch Date *</label>
              <input 
                type="date" 
                value={date} 
                onChange={e=>setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Note</label>
            <textarea 
              placeholder="Enter dispatch note (optional)" 
              value={note} 
              onChange={e=>setNote(e.target.value)}
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Select Barrels</h3>
            <div className="selection-controls">
              <button 
                type="button" 
                className="btn btn-sm btn-outline-primary"
                onClick={selectAllBarrels}
              >
                Select All
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-secondary"
                onClick={clearSelection}
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="search-barrel">
            <input
              type="text"
              placeholder="Search barrels by ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="barrels-list">
            {filteredBarrels.length === 0 ? (
              <div className="no-barrels">
                <i className="fas fa-box-open"></i>
                <p>No barrels available for dispatch</p>
              </div>
            ) : (
              <div className="barrels-grid">
                {filteredBarrels.map(barrel => (
                  <div 
                    key={barrel._id} 
                    className={`barrel-item ${selectedBarrels.includes(barrel.barrelId) ? 'selected' : ''}`}
                    onClick={() => toggleBarrel(barrel.barrelId)}
                  >
                    <div className="barrel-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedBarrels.includes(barrel.barrelId)} 
                        onChange={() => toggleBarrel(barrel.barrelId)}
                      />
                    </div>
                    <div className="barrel-info">
                      <div className="barrel-id">{barrel.barrelId}</div>
                      <div className="barrel-status">
                        <span className={`status-badge ${barrel.status}`}>
                          {barrel.status}
                        </span>
                      </div>
                      <div className="barrel-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {barrel.lastKnownLocation || 'Unknown'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedBarrels.length > 0 && (
            <div className="selection-summary">
              <strong>{selectedBarrels.length} barrel(s) selected</strong>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            onClick={submitDispatch} 
            disabled={loading || !recipient || selectedBarrels.length === 0}
            className="btn btn-primary"
          >
            {loading ? 'Dispatching...' : `Dispatch ${selectedBarrels.length} Barrel(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDispatchBarrels;
