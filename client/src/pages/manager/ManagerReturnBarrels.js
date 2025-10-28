import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ManagerReturnBarrels.css';

const ManagerReturnBarrels = () => {
  const { user } = useAuth();
  const [returnedBarrels, setReturnedBarrels] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [reassignData, setReassignData] = useState({
    reassignTo: '',
    reassignReason: ''
  });

  useEffect(() => {
    fetchReturnedBarrels();
    fetchUsers();
  }, []);

  const fetchReturnedBarrels = async () => {
    try {
      const response = await fetch('/api/barrels/returned', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReturnedBarrels(data.returnedBarrels);
      }
    } catch (error) {
      console.error('Error fetching returned barrels:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter to show only active staff users
        const staffUsers = data.filter(user => 
          user.role === 'staff' && user.status === 'active'
        );
        setUsers(staffUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleReassign = async () => {
    if (!selectedReturn || !reassignData.reassignTo) {
      setMessage('Please select a user to reassign barrels to');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/barrels/reassign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          returnId: selectedReturn._id,
          reassignTo: reassignData.reassignTo,
          reassignReason: reassignData.reassignReason
        })
      });

      if (response.ok) {
        setMessage('Barrels reassigned successfully!');
        setSelectedReturn(null);
        setReassignData({ reassignTo: '', reassignReason: '' });
        fetchReturnedBarrels(); // Refresh the list
      } else {
        throw new Error('Failed to reassign barrels');
      }
    } catch (error) {
      setMessage('Error reassigning barrels');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'returned': 'status-returned',
      'reassigned': 'status-reassigned',
      'completed': 'status-completed'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="manager-return-barrels-container">
      <div className="page-header">
        <h1>Returned Barrels Management</h1>
        <p>Manage and reassign returned barrels to staff members</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="returned-barrels-list">
        <h3>Returned Barrels ({returnedBarrels.length})</h3>
        
        {returnedBarrels.length === 0 ? (
          <div className="no-returns">
            <p>No returned barrels at the moment</p>
          </div>
        ) : (
          <div className="returns-grid">
            {returnedBarrels.map((returnItem) => (
              <div key={returnItem._id} className="return-item">
                <div className="return-header">
                  <h4>Return #{returnItem._id.slice(-6)}</h4>
                  {getStatusBadge(returnItem.status)}
                </div>
                
                <div className="return-details">
                  <div className="detail-row">
                    <span className="label">Returned By:</span>
                    <span className="value">{returnItem.returnedBy?.name || 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Returned At:</span>
                    <span className="value">{formatDate(returnItem.returnedAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Barrel Count:</span>
                    <span className="value">{returnItem.barrels.length}</span>
                  </div>
                  
                  {returnItem.status === 'reassigned' && (
                    <>
                      <div className="detail-row">
                        <span className="label">Reassigned To:</span>
                        <span className="value">{returnItem.reassignedTo?.name || 'Unknown'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Reassigned At:</span>
                        <span className="value">{formatDate(returnItem.reassignedAt)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="barrels-list">
                  <h5>Barrel IDs:</h5>
                  <div className="barrel-ids">
                    {returnItem.barrels.map((barrel, index) => (
                      <span key={index} className="barrel-id">
                        {barrel.barrelId}
                      </span>
                    ))}
                  </div>
                </div>

                {returnItem.status === 'returned' && (
                  <div className="actions">
                    <button 
                      className="reassign-btn"
                      onClick={() => setSelectedReturn(returnItem)}
                    >
                      Reassign Barrels
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      {selectedReturn && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Reassign Barrels</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedReturn(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="reassign-info">
                <p><strong>Return ID:</strong> #{selectedReturn._id.slice(-6)}</p>
                <p><strong>Barrel Count:</strong> {selectedReturn.barrels.length}</p>
                <p><strong>Returned By:</strong> {selectedReturn.returnedBy?.name}</p>
              </div>

              <div className="form-group">
                <label htmlFor="reassignTo">Reassign To:</label>
                <select
                  id="reassignTo"
                  value={reassignData.reassignTo}
                  onChange={(e) => setReassignData(prev => ({
                    ...prev,
                    reassignTo: e.target.value
                  }))}
                >
                  <option value="">Select a staff member</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reassignReason">Reason (Optional):</label>
                <textarea
                  id="reassignReason"
                  value={reassignData.reassignReason}
                  onChange={(e) => setReassignData(prev => ({
                    ...prev,
                    reassignReason: e.target.value
                  }))}
                  placeholder="Enter reason for reassignment..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedReturn(null)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={handleReassign}
                disabled={loading || !reassignData.reassignTo}
              >
                {loading ? 'Reassigning...' : 'Reassign Barrels'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReturnBarrels;
