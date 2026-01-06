import { useState, useEffect } from 'react';
import './BarrelInventory.css';

const BarrelInventory = () => {
  const [barrels, setBarrels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    batchName: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    delivered: 0
  });
  const [selectedBarrel, setSelectedBarrel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBarrels();
  }, []);

  const fetchBarrels = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockBarrels = [
        {
          id: 'BRL20240120001',
          batchName: 'Morning Batch',
          createdDate: '2024-01-20T08:00:00Z',
          status: 'AVAILABLE',
          assignedTo: null,
          deliveryStaff: null,
          deliveredDate: null,
          notes: 'Premium quality batch',
          qrCode: 'QR_BRL20240120001'
        },
        {
          id: 'BRL20240120002',
          batchName: 'Morning Batch',
          createdDate: '2024-01-20T08:00:00Z',
          status: 'ASSIGNED',
          assignedTo: {
            userId: 'USER001',
            userName: 'John Doe',
            requestId: 'REQ001'
          },
          deliveryStaff: {
            id: 'STAFF001',
            name: 'Ravi Kumar'
          },
          assignedDate: '2024-01-20T10:30:00Z',
          deliveredDate: null,
          notes: 'Premium quality batch',
          qrCode: 'QR_BRL20240120002'
        },
        {
          id: 'BRL20240119001',
          batchName: 'Evening Batch',
          createdDate: '2024-01-19T16:00:00Z',
          status: 'DELIVERED',
          assignedTo: {
            userId: 'USER003',
            userName: 'Mike Johnson',
            requestId: 'REQ003'
          },
          deliveryStaff: {
            id: 'STAFF002',
            name: 'Suresh Nair'
          },
          assignedDate: '2024-01-19T17:00:00Z',
          deliveredDate: '2024-01-20T09:30:00Z',
          notes: 'Standard batch',
          qrCode: 'QR_BRL20240119001'
        },
        {
          id: 'BRL20240119002',
          batchName: 'Evening Batch',
          createdDate: '2024-01-19T16:00:00Z',
          status: 'DELIVERED',
          assignedTo: {
            userId: 'USER003',
            userName: 'Mike Johnson',
            requestId: 'REQ003'
          },
          deliveryStaff: {
            id: 'STAFF002',
            name: 'Suresh Nair'
          },
          assignedDate: '2024-01-19T17:00:00Z',
          deliveredDate: '2024-01-20T09:30:00Z',
          notes: 'Standard batch',
          qrCode: 'QR_BRL20240119002'
        },
        {
          id: 'BRL20240120003',
          batchName: 'Afternoon Batch',
          createdDate: '2024-01-20T14:00:00Z',
          status: 'AVAILABLE',
          assignedTo: null,
          deliveryStaff: null,
          deliveredDate: null,
          notes: 'High grade batch',
          qrCode: 'QR_BRL20240120003'
        }
      ];
      
      setBarrels(mockBarrels);
      
      // Calculate stats
      const newStats = {
        total: mockBarrels.length,
        available: mockBarrels.filter(b => b.status === 'AVAILABLE').length,
        assigned: mockBarrels.filter(b => b.status === 'ASSIGNED').length,
        delivered: mockBarrels.filter(b => b.status === 'DELIVERED').length
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Error fetching barrels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBarrels = barrels.filter(barrel => {
    const matchesStatus = filters.status === 'all' || barrel.status === filters.status;
    const matchesSearch = barrel.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                         barrel.batchName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesBatch = filters.batchName === 'all' || barrel.batchName === filters.batchName;
    
    let matchesDate = true;
    if (filters.dateFrom) {
      matchesDate = matchesDate && new Date(barrel.createdDate) >= new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      matchesDate = matchesDate && new Date(barrel.createdDate) <= new Date(filters.dateTo);
    }
    
    return matchesStatus && matchesSearch && matchesBatch && matchesDate;
  });

  const uniqueBatches = [...new Set(barrels.map(barrel => barrel.batchName))];

  const handleViewBarrel = (barrel) => {
    setSelectedBarrel(barrel);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      AVAILABLE: 'status-available',
      ASSIGNED: 'status-assigned',
      DELIVERED: 'status-delivered'
    };
    return colors[status] || 'status-default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      AVAILABLE: 'fa-check-circle',
      ASSIGNED: 'fa-clock',
      DELIVERED: 'fa-shipping-fast'
    };
    return icons[status] || 'fa-circle';
  };

  const exportToCSV = () => {
    const csvData = filteredBarrels.map(barrel => ({
      'Barrel ID': barrel.id,
      'Batch Name': barrel.batchName,
      'Created Date': new Date(barrel.createdDate).toLocaleDateString(),
      'Status': barrel.status,
      'Assigned To': barrel.assignedTo?.userName || 'N/A',
      'Delivery Staff': barrel.deliveryStaff?.name || 'N/A',
      'Delivered Date': barrel.deliveredDate ? new Date(barrel.deliveredDate).toLocaleDateString() : 'N/A',
      'Notes': barrel.notes
    }));
    
    console.log('Exporting CSV:', csvData);
    alert(`Exporting ${csvData.length} barrels to CSV`);
  };

  if (loading) {
    return (
      <div className="barrel-inventory">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading barrel inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="barrel-inventory">
      <div className="page-header">
        <h1>📦 Barrel Inventory</h1>
        <p>Complete barrel tracking: AVAILABLE → ASSIGNED → DELIVERED</p>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <i className="fas fa-drum"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Barrels</p>
          </div>
        </div>
        
        <div className="stat-card stat-available">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.available}</h3>
            <p>Available</p>
          </div>
        </div>
        
        <div className="stat-card stat-assigned">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.assigned}</h3>
            <p>Assigned</p>
          </div>
        </div>
        
        <div className="stat-card stat-delivered">
          <div className="stat-icon">
            <i className="fas fa-shipping-fast"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.delivered}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Batch:</label>
            <select 
              value={filters.batchName} 
              onChange={(e) => setFilters({...filters, batchName: e.target.value})}
            >
              <option value="all">All Batches</option>
              {uniqueBatches.map(batch => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by ID or batch..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <div className="filter-group">
            <label>From Date:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>

          <div className="filter-group">
            <label>To Date:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setFilters({
              status: 'all',
              search: '',
              dateFrom: '',
              dateTo: '',
              batchName: 'all'
            })}
          >
            <i className="fas fa-undo"></i>
            Clear Filters
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            <i className="fas fa-download"></i>
            Export CSV ({filteredBarrels.length})
          </button>
        </div>
      </div>

      {/* Barrels Table */}
      <div className="barrels-table-container">
        <table className="barrels-table">
          <thead>
            <tr>
              <th>Barrel ID</th>
              <th>Batch</th>
              <th>Created</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Delivery Staff</th>
              <th>Timeline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBarrels.map(barrel => (
              <tr key={barrel.id}>
                <td>
                  <div className="barrel-id-cell">
                    <span className="barrel-id">{barrel.id}</span>
                    <span className="qr-code">QR: {barrel.qrCode}</span>
                  </div>
                </td>
                <td>
                  <span className="batch-name">{barrel.batchName}</span>
                </td>
                <td>
                  {new Date(barrel.createdDate).toLocaleDateString()}
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(barrel.status)}`}>
                    <i className={`fas ${getStatusIcon(barrel.status)}`}></i>
                    {barrel.status}
                  </span>
                </td>
                <td>
                  {barrel.assignedTo ? (
                    <div className="assigned-info">
                      <div className="user-name">{barrel.assignedTo.userName}</div>
                      <div className="request-id">#{barrel.assignedTo.requestId}</div>
                    </div>
                  ) : (
                    <span className="not-assigned">Not Assigned</span>
                  )}
                </td>
                <td>
                  {barrel.deliveryStaff ? (
                    <span className="staff-name">{barrel.deliveryStaff.name}</span>
                  ) : (
                    <span className="not-assigned">Not Assigned</span>
                  )}
                </td>
                <td>
                  <div className="timeline">
                    <div className="timeline-step completed">
                      <i className="fas fa-plus-circle"></i>
                      <span>Created</span>
                    </div>
                    {barrel.assignedDate && (
                      <div className="timeline-step completed">
                        <i className="fas fa-user-check"></i>
                        <span>Assigned</span>
                      </div>
                    )}
                    {barrel.deliveredDate && (
                      <div className="timeline-step completed">
                        <i className="fas fa-check-circle"></i>
                        <span>Delivered</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <button 
                    className="btn-icon btn-view"
                    onClick={() => handleViewBarrel(barrel)}
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBarrels.length === 0 && (
        <div className="no-barrels">
          <i className="fas fa-search"></i>
          <h3>No barrels found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* Barrel Details Modal */}
      {showModal && selectedBarrel && (
        <BarrelModal
          barrel={selectedBarrel}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

const BarrelModal = ({ barrel, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Barrel Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="barrel-details">
            <div className="detail-section">
              <h3>Basic Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Barrel ID:</label>
                  <span className="barrel-id">{barrel.id}</span>
                </div>
                <div className="detail-item">
                  <label>QR Code:</label>
                  <span>{barrel.qrCode}</span>
                </div>
                <div className="detail-item">
                  <label>Batch Name:</label>
                  <span>{barrel.batchName}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${getStatusColor(barrel.status)}`}>
                    {barrel.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Created Date:</label>
                  <span>{new Date(barrel.createdDate).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Notes:</label>
                  <span>{barrel.notes || 'No notes'}</span>
                </div>
              </div>
            </div>

            {barrel.assignedTo && (
              <div className="detail-section">
                <h3>Assignment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Assigned To:</label>
                    <span>{barrel.assignedTo.userName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Request ID:</label>
                    <span>#{barrel.assignedTo.requestId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Assigned Date:</label>
                    <span>{new Date(barrel.assignedDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {barrel.deliveryStaff && (
              <div className="detail-section">
                <h3>Delivery Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Delivery Staff:</label>
                    <span>{barrel.deliveryStaff.name}</span>
                  </div>
                  {barrel.deliveredDate && (
                    <div className="detail-item">
                      <label>Delivered Date:</label>
                      <span>{new Date(barrel.deliveredDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Status Timeline</h3>
              <div className="status-timeline">
                <div className="timeline-item completed">
                  <div className="timeline-icon">
                    <i className="fas fa-plus-circle"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>Created</h4>
                    <p>{new Date(barrel.createdDate).toLocaleString()}</p>
                  </div>
                </div>
                
                {barrel.assignedDate && (
                  <div className="timeline-item completed">
                    <div className="timeline-icon">
                      <i className="fas fa-user-check"></i>
                    </div>
                    <div className="timeline-content">
                      <h4>Assigned</h4>
                      <p>{new Date(barrel.assignedDate).toLocaleString()}</p>
                      <p>To: {barrel.assignedTo.userName}</p>
                    </div>
                  </div>
                )}
                
                {barrel.deliveredDate && (
                  <div className="timeline-item completed">
                    <div className="timeline-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="timeline-content">
                      <h4>Delivered</h4>
                      <p>{new Date(barrel.deliveredDate).toLocaleString()}</p>
                      <p>By: {barrel.deliveryStaff.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  function getStatusColor(status) {
    const colors = {
      AVAILABLE: 'status-available',
      ASSIGNED: 'status-assigned',
      DELIVERED: 'status-delivered'
    };
    return colors[status] || 'status-default';
  }
};

export default BarrelInventory;