
import React, { useEffect, useState } from 'react';

import React, { useCallback, useEffect, useState } from 'react';

import { 
  getAllStaffRecords, 
  deleteStaffRecord, 
  restoreStaffRecord, 
  permanentlyDeleteStaffRecord,
  updateStaffRecordStatus 
} from '../../services/staffRecordService';

const StaffRecordManagement = () => {
  const [staffRecords, setStaffRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('active');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');


  const loadStaffRecords = async () => {

  const loadStaffRecords = useCallback(async () => {

    setLoading(true);
    setError('');
    try {
      const response = await getAllStaffRecords({ 
        status: filter,
        includeDeleted: filter === 'deleted'
      });
      setStaffRecords(response.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load staff records');
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    loadStaffRecords();
  }, [filter]);

  }, [filter]);

  useEffect(() => {
    loadStaffRecords();
  }, [loadStaffRecords]);


  const handleDelete = async () => {
    if (!selectedRecord) return;
    
    try {
      setError('');
      await deleteStaffRecord(selectedRecord._id, deleteReason);
      setSuccess('Staff record deleted successfully. Login credentials preserved.');
      setShowDeleteModal(false);
      setSelectedRecord(null);
      setDeleteReason('');
      await loadStaffRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete staff record');
    }
  };

  const handleRestore = async (record) => {
    try {
      setError('');
      await restoreStaffRecord(record._id);
      setSuccess('Staff record restored successfully');
      await loadStaffRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to restore staff record');
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedRecord) return;
    
    try {
      setError('');
      await permanentlyDeleteStaffRecord(selectedRecord._id);
      setSuccess('Staff record permanently deleted');
      setShowPermanentDeleteModal(false);
      setSelectedRecord(null);
      await loadStaffRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to permanently delete staff record');
    }
  };

  const handleStatusToggle = async (record) => {
    try {
      setError('');
      const newStatus = !record.isActive;
      await updateStaffRecordStatus(record._id, newStatus, 'Status updated by admin');
      setSuccess(`Staff record ${newStatus ? 'activated' : 'deactivated'} successfully`);
      await loadStaffRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (record) => {
    if (record.isDeleted) {
      return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Deleted</span>;
    }
    if (record.isActive) {
      return <span style={{ color: '#28a745', fontWeight: 'bold' }}>Active</span>;
    }
    return <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Inactive</span>;
  };

  const getActionButtons = (record) => {
    if (record.isDeleted) {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-sm btn-success" 
            onClick={() => handleRestore(record)}
          >
            Restore
          </button>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={() => {
              setSelectedRecord(record);
              setShowPermanentDeleteModal(true);
            }}
          >
            Permanent Delete
          </button>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className={`btn btn-sm ${record.isActive ? 'btn-warning' : 'btn-success'}`}
          onClick={() => handleStatusToggle(record)}
        >
          {record.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button 
          className="btn btn-sm btn-danger" 
          onClick={() => {
            setSelectedRecord(record);
            setShowDeleteModal(true);
          }}
        >
          Delete Record
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Staff Record Management</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Manage staff records separately from login credentials. Deleting a staff record preserves the user's login access.
      </p>
      
      {error && <div style={{ color: 'tomato', marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ color: 'limegreen', marginBottom: 16 }}>{success}</div>}

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Filter by status:</label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Staff Records Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : staffRecords.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9aa' }}>No staff records found</td></tr>
            ) : (
              staffRecords.map(record => (
                <tr key={record._id}>
                  <td>{record.staffId}</td>
                  <td>{record.name}</td>
                  <td>{record.user?.email || '-'}</td>
                  <td>{getStatusBadge(record)}</td>
                  <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td>{getActionButtons(record)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Delete Staff Record</h3>
            <p style={{ marginBottom: '16px' }}>
              This will delete the staff record but preserve the login credentials. 
              The user will still be able to log in but won't have staff access.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label>Reason for deletion:</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion..."
                style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRecord(null);
                  setDeleteReason('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#dc3545' }}>⚠️ Permanent Delete</h3>
            <p style={{ marginBottom: '16px' }}>
              <strong>WARNING:</strong> This will permanently delete the staff record and cannot be undone. 
              The login credentials will still be preserved.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowPermanentDeleteModal(false);
                  setSelectedRecord(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handlePermanentDelete}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRecordManagement;




























