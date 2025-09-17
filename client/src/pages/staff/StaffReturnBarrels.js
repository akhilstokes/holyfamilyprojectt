import React, { useState } from 'react';
import axios from 'axios';
import './StaffReturnBarrels.css';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const StaffReturnBarrels = () => {
  const [barrelId, setBarrelId] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReturn = async () => {
    if (!barrelId) { 
      setMessage('Please enter barrel ID'); 
      return; 
    }
    setLoading(true); 
    setMessage('');
    try {
      await axios.post('/api/staff-barrels/return', { 
        barrelId, 
        returnDate: date, 
        isReturnedEmpty: isEmpty, 
        note 
      }, authHeaders());
      setBarrelId(''); 
      setIsEmpty(false); 
      setNote('');
      setMessage('Return recorded successfully');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Return failed');
    } finally { 
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setBarrelId('');
    setIsEmpty(false);
    setNote('');
    setMessage('');
  };

  return (
    <div className="staff-return-barrels">
      <div className="page-header">
        <h1>Return Barrels</h1>
        <p>Record barrel returns and their condition</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="return-form">
        <div className="form-section">
          <h3>Return Information</h3>
          <div className="form-group">
            <label>Barrel ID *</label>
            <input 
              type="text" 
              placeholder="Enter barrel ID" 
              value={barrelId} 
              onChange={e=>setBarrelId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Return Date *</label>
            <input 
              type="date" 
              value={date} 
              onChange={e=>setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={isEmpty} 
                onChange={e=>setIsEmpty(e.target.checked)}
              />
              <span className="checkmark"></span>
              Returned Empty
            </label>
            <small>Check if the barrel is returned empty</small>
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea 
              placeholder="Enter return note (optional)" 
              value={note} 
              onChange={e=>setNote(e.target.value)}
              rows="4"
            />
          </div>
        </div>

        <div className="return-summary">
          <h3>Return Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Barrel ID:</span>
              <span className="summary-value">{barrelId || 'Not specified'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Return Date:</span>
              <span className="summary-value">{date}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Condition:</span>
              <span className={`summary-value ${isEmpty ? 'empty' : 'filled'}`}>
                {isEmpty ? 'Empty' : 'Filled'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Note:</span>
              <span className="summary-value">{note || 'No note'}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={resetForm}
            disabled={loading}
          >
            Reset Form
          </button>
          <button 
            onClick={submitReturn} 
            disabled={loading || !barrelId}
            className="btn btn-primary"
          >
            {loading ? 'Recording...' : 'Record Return'}
          </button>
        </div>
      </div>

      <div className="help-section">
        <h3>Return Guidelines</h3>
        <div className="guidelines">
          <div className="guideline-item">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Empty Barrels:</strong> Check the "Returned Empty" option if the barrel contains no latex or materials.
            </div>
          </div>
          <div className="guideline-item">
            <i className="fas fa-calendar"></i>
            <div>
              <strong>Return Date:</strong> Use the actual date when the barrel was returned to the facility.
            </div>
          </div>
          <div className="guideline-item">
            <i className="fas fa-sticky-note"></i>
            <div>
              <strong>Notes:</strong> Add any relevant information about the barrel's condition or return circumstances.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReturnBarrels;
