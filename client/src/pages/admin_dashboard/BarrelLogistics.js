import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './BarrelLogistics.css';

// Small utility for auth headers
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

// Simple reusable Modal
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const defaultForm = {
  barrelId: '',
  capacity: '',
  currentVolume: '',
  status: 'in-storage',
  lastKnownLocation: '',
  notes: '',
};

const PAGE_SIZES = [5, 10, 20, 50];

const BarrelLogistics = () => {
  const [barrels, setBarrels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBarrel, setSelectedBarrel] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  // UI helpers
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all barrels
  const fetchBarrels = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/barrels', authHeaders());
      setBarrels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch barrels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarrels();
  }, []);

  // Derived lists
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return barrels.filter((b) => {
      const matchesQuery = !q
        || b.barrelId?.toLowerCase().includes(q)
        || b.lastKnownLocation?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [barrels, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    // Reset to first page when filters change
    setPage(1);
  }, [query, statusFilter, pageSize]);

  // Helpers
  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 2500);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const resetForm = () => setFormData(defaultForm);

  const validateAdd = () => {
    const { barrelId, capacity } = formData;
    if (!barrelId || !capacity) return 'Barrel ID and capacity are required.';
    const cap = Number(capacity);
    if (Number.isNaN(cap) || cap <= 0) return 'Capacity must be a positive number.';
    return '';
  };

  const validateUpdate = () => {
    const { capacity, currentVolume } = formData;
    const cap = Number(capacity);
    const vol = Number(currentVolume);
    if (Number.isNaN(cap) || cap <= 0) return 'Capacity must be a positive number.';
    if (Number.isNaN(vol) || vol < 0) return 'Current volume must be zero or more.';
    if (vol > cap) return 'Current volume cannot exceed capacity.';
    return '';
  };

  // Handlers
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validateAdd();
    if (errMsg) return showError(errMsg);

    try {
      await axios.post(
        '/api/barrels',
        {
          barrelId: formData.barrelId.trim(),
          capacity: Number(formData.capacity),
          // Optional fields on creation
          currentVolume: formData.currentVolume ? Number(formData.currentVolume) : 0,
          status: formData.status,
          lastKnownLocation: formData.lastKnownLocation?.trim() || '',
          notes: formData.notes?.trim() || '',
        },
        authHeaders()
      );
      showSuccess('Barrel added successfully');
      setShowAddModal(false);
      resetForm();
      fetchBarrels();
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to add barrel');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validateUpdate();
    if (errMsg) return showError(errMsg);
    if (!selectedBarrel?._id) return showError('No barrel selected');

    try {
      await axios.put(
        `/api/barrels/${selectedBarrel._id}`,
        {
          // server updateBarrel expects: currentVolume, status, lastKnownLocation
          currentVolume: Number(formData.currentVolume),
          status: formData.status,
          lastKnownLocation: formData.lastKnownLocation?.trim() || '',
        },
        authHeaders()
      );
      showSuccess('Barrel updated successfully');
      setShowUpdateModal(false);
      setSelectedBarrel(null);
      resetForm();
      fetchBarrels();
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to update barrel');
    }
  };

  const fillPct = (b) => {
    if (!b?.capacity) return 0;
    const pct = Math.round((Number(b.currentVolume || 0) / Number(b.capacity)) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  if (loading) {
    return (
      <div className="barrel-logistics-container">
        <div className="loading-spinner">Loading barrels...</div>
      </div>
    );
  }

  return (
    <div className="barrel-logistics-container">
      <div className="page-header">
        <h1>Barrel Logistics Management</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
            Add New Barrel
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error ? <div className="alert alert-error" role="alert">{error}</div> : null}
      {success ? <div className="alert alert-success" role="status">{success}</div> : null}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search by Barrel ID or Location"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="input-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="in-use">In Use</option>
              <option value="in-storage">In Storage</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="input-group">
            <label htmlFor="pageSize" className="sr-only">Rows</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Barrels</h3>
          <p className="stat-number">{barrels.length}</p>
        </div>
        <div className="stat-card">
          <h3>In Use</h3>
          <p className="stat-number">{barrels.filter((b) => b.status === 'in-use').length}</p>
        </div>
        <div className="stat-card">
          <h3>In Storage</h3>
          <p className="stat-number">{barrels.filter((b) => b.status === 'in-storage').length}</p>
        </div>
        <div className="stat-card">
          <h3>Disposed</h3>
          <p className="stat-number">{barrels.filter((b) => b.status === 'disposed').length}</p>
        </div>
      </div>

      {/* Barrels Table */}
      <div className="barrels-table-container">
        <table className="barrels-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Barrel ID</th>
              <th>Capacity (L)</th>
              <th>Current Volume (L)</th>
              <th>Fill %</th>
              <th>Status</th>
              <th>Location</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((barrel, idx) => (
              <tr key={barrel._id}>
                <td>{pageStart + idx + 1}</td>
                <td className="barrel-id">{barrel.barrelId}</td>
                <td>{barrel.capacity}</td>
                <td>{barrel.currentVolume}</td>
                <td>
                  <div className="fill-indicator">
                    <div
                      className="fill-bar"
                      style={{
                        width: `${fillPct(barrel)}%`,
                        backgroundColor:
                          fillPct(barrel) > 80 ? '#e74c3c' : fillPct(barrel) > 60 ? '#f39c12' : '#27ae60',
                      }}
                    />
                    <span>{fillPct(barrel)}%</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-badge status-${barrel.status}`}
                  >
                    {barrel.status}
                  </span>
                </td>
                <td>{barrel.lastKnownLocation || 'N/A'}</td>
                <td>{new Date(barrel.updatedAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSelectedBarrel(barrel);
                      setFormData({
                        barrelId: barrel.barrelId,
                        capacity: barrel.capacity,
                        currentVolume: barrel.currentVolume ?? 0,
                        status: barrel.status,
                        lastKnownLocation: barrel.lastKnownLocation ?? '',
                        notes: barrel.notes ?? '',
                      });
                      setShowUpdateModal(true);
                    }}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginLeft: 8 }}
                    onClick={async () => {
                      // Fetch movement logs modal (quick view)
                      try {
                        const { data } = await axios.get(`/api/barrel-logistics/movement/${barrel.barrelId}`, authHeaders());
                        const lines = data.map((l) => `${new Date(l.createdAt).toLocaleString()} • ${l.type} ${l.volumeDelta ?? 0}L ${l.fromLocation ? `from ${l.fromLocation}` : ''} ${l.toLocation ? `to ${l.toLocation}` : ''}`);
                        alert(lines.join('\n') || 'No movements');
                      } catch (e) {
                        alert(e?.response?.data?.message || 'Failed to load movements');
                      }
                    }}
                  >
                    History
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ marginLeft: 8, background: '#0ea5e9', color: '#fff' }}
                    onClick={async () => {
                      const type = prompt('Movement type (in/out/move):', 'in');
                      if (!type) return;
                      let volumeDelta = 0, fromLocation = '', toLocation = '';
                      if (type === 'in' || type === 'out') {
                        const v = Number(prompt('Volume (L):', '0'));
                        if (Number.isNaN(v)) return alert('Invalid volume');
                        volumeDelta = v;
                      } else if (type === 'move') {
                        fromLocation = prompt('From location (optional):', barrel.lastKnownLocation || '') || '';
                        toLocation = prompt('To location:', barrel.lastKnownLocation || '') || '';
                      }
                      try {
                        await axios.post('/api/barrel-logistics/movement', { barrelId: barrel.barrelId, type, volumeDelta, fromLocation, toLocation }, authHeaders());
                        fetchBarrels();
                      } catch (e) {
                        alert(e?.response?.data?.message || 'Failed to log movement');
                      }
                    }}
                  >
                    Move
                  </button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '1rem' }}>
                  No barrels found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="page-indicator">
            Page {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add New Barrel" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label htmlFor="barrelId">Barrel ID</label>
              <input
                id="barrelId"
                type="text"
                value={formData.barrelId}
                onChange={(e) => setFormData((f) => ({ ...f, barrelId: e.target.value }))}
                placeholder="e.g., BRL-001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity (L)</label>
              <input
                id="capacity"
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData((f) => ({ ...f, capacity: e.target.value }))}
                placeholder="e.g., 200"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="in-storage">In Storage</option>
                <option value="in-use">In Use</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="lastKnownLocation">Location</label>
              <input
                id="lastKnownLocation"
                type="text"
                value={formData.lastKnownLocation}
                onChange={(e) => setFormData((f) => ({ ...f, lastKnownLocation: e.target.value }))}
                placeholder="e.g., Warehouse A"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes"
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="submit">Add Barrel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <Modal title={`Update Barrel: ${selectedBarrel?.barrelId || ''}`} onClose={() => setShowUpdateModal(false)}>
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-row-2">
              <div className="form-group">
                <label>Barrel ID</label>
                <input type="text" value={formData.barrelId} disabled />
              </div>
              <div className="form-group">
                <label>Capacity (L)</label>
                <input type="number" value={formData.capacity} disabled />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="currentVolume">Current Volume (L)</label>
                <input
                  id="currentVolume"
                  type="number"
                  min={0}
                  value={formData.currentVolume}
                  onChange={(e) => setFormData((f) => ({ ...f, currentVolume: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="statusUpdate">Status</label>
                <select
                  id="statusUpdate"
                  value={formData.status}
                  onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="in-storage">In Storage</option>
                  <option value="in-use">In Use</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="locationUpdate">Location</label>
              <input
                id="locationUpdate"
                type="text"
                value={formData.lastKnownLocation}
                onChange={(e) => setFormData((f) => ({ ...f, lastKnownLocation: e.target.value }))}
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BarrelLogistics;
