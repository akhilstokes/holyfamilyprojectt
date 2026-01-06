import { useState, useEffect } from 'react';
import './ApproveSellRequests.css';

const ApproveSellRequests = () => {
  const [sellRequests, setSellRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSellRequests();
  }, []);

  const fetchSellRequests = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockRequests = [
        {
          id: 'SELL001',
          userId: 'USER001',
          userName: 'John Doe',
          userPhone: '+91 9876543210',
          requestDate: '2024-01-20T14:30:00Z',
          quantity: 3,
          currentStock: 5,
          pickupAddress: {
            houseName: 'Green Villa',
            area: 'MG Road',
            pincode: '682001',
            location: 'https://maps.google.com/?q=10.0261,76.3125',
            fullAddress: 'Green Villa, MG Road, Kochi, Kerala 682001'
          },
          status: 'pending',
          notes: 'Urgent sale required for financial needs',
          priority: 'high',
          estimatedValue: 18750.00
        },
        {
          id: 'SELL002',
          userId: 'USER002',
          userName: 'Jane Smith',
          userPhone: '+91 9876543211',
          requestDate: '2024-01-20T11:15:00Z',
          quantity: 2,
          currentStock: 4,
          pickupAddress: {
            houseName: 'Blue House',
            area: 'Kakkanad',
            pincode: '682030',
            location: 'https://maps.google.com/?q=10.0150,76.3500',
            fullAddress: 'Blue House, Kakkanad, Kochi, Kerala 682030'
          },
          status: 'pending',
          notes: '',
          priority: 'medium',
          estimatedValue: 12500.00
        },
        {
          id: 'SELL003',
          userId: 'USER003',
          userName: 'Mike Johnson',
          userPhone: '+91 9876543212',
          requestDate: '2024-01-19T16:20:00Z',
          quantity: 1,
          currentStock: 2,
          pickupAddress: {
            houseName: 'Rose Apartment',
            area: 'Edapally',
            pincode: '682024',
            location: 'https://maps.google.com/?q=10.0200,76.3080',
            fullAddress: 'Rose Apartment, Edapally, Kochi, Kerala 682024'
          },
          status: 'approved',
          approvedDate: '2024-01-19T17:00:00Z',
          notes: 'Regular customer',
          priority: 'low',
          estimatedValue: 6250.00
        }
      ];
      setSellRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = sellRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const confirmApproval = async (approvalData) => {
    try {
      // Update request status
      const updatedRequests = sellRequests.map(req => 
        req.id === selectedRequest.id 
          ? {
              ...req,
              status: 'approved',
              approvedDate: new Date().toISOString(),
              managerNotes: approvalData.notes,
              assignedPickupStaff: approvalData.pickupStaff
            }
          : req
      );
      
      setSellRequests(updatedRequests);
      setShowModal(false);
      setSelectedRequest(null);
      
      alert(`Sell request ${selectedRequest.id} approved successfully!`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      const updatedRequests = sellRequests.map(req => 
        req.id === requestId 
          ? {
              ...req,
              status: 'rejected',
              rejectedDate: new Date().toISOString(),
              rejectionReason: reason
            }
          : req
      );
      
      setSellRequests(updatedRequests);
      alert(`Request ${requestId} has been rejected.`);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return colors[status] || 'status-default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    return colors[priority] || 'priority-default';
  };

  if (loading) {
    return (
      <div className="approve-sell-requests">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading sell requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approve-sell-requests">
      <div className="page-header">
        <h1>🤝 Approve Sell Requests</h1>
        <p>Review and approve user barrel selling requests</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button 
            className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('pending')}
          >
            Pending ({sellRequests.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('approved')}
          >
            Approved ({sellRequests.filter(r => r.status === 'approved').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({sellRequests.filter(r => r.status === 'rejected').length})
          </button>
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All ({sellRequests.length})
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="requests-grid">
        {filteredRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="request-info">
                <div className="request-id">#{request.id}</div>
                <div className={`priority-badge ${getPriorityColor(request.priority)}`}>
                  {request.priority.toUpperCase()}
                </div>
              </div>
              <div className={`status-badge ${getStatusColor(request.status)}`}>
                {request.status.toUpperCase()}
              </div>
            </div>

            <div className="request-user">
              <h3>{request.userName}</h3>
              <p>{request.userPhone}</p>
              <div className="user-stock">
                Current Stock: <strong>{request.currentStock} barrels</strong>
              </div>
            </div>

            <div className="request-details">
              <div className="detail-row">
                <span className="label">Selling Quantity:</span>
                <span className="value highlight">{request.quantity} barrels</span>
              </div>
              <div className="detail-row">
                <span className="label">Estimated Value:</span>
                <span className="value price">₹{request.estimatedValue.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Request Date:</span>
                <span className="value">{new Date(request.requestDate).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Pickup Address:</span>
                <div className="address">
                  <div>{request.pickupAddress.fullAddress}</div>
                  <a 
                    href={request.pickupAddress.location} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="location-link"
                  >
                    📍 View on Map
                  </a>
                </div>
              </div>
              {request.notes && (
                <div className="detail-row">
                  <span className="label">User Notes:</span>
                  <span className="value">{request.notes}</span>
                </div>
              )}
            </div>

            {request.status === 'approved' && (
              <div className="approval-info">
                <h4>✅ Approved</h4>
                <p>Approved on: {new Date(request.approvedDate).toLocaleString()}</p>
                {request.managerNotes && (
                  <p>Manager Notes: {request.managerNotes}</p>
                )}
              </div>
            )}

            {request.status === 'rejected' && (
              <div className="rejection-info">
                <h4>❌ Rejected</h4>
                <p>Rejected on: {new Date(request.rejectedDate).toLocaleString()}</p>
                <p>Reason: {request.rejectionReason}</p>
              </div>
            )}

            <div className="request-actions">
              {request.status === 'pending' ? (
                <div className="action-buttons">
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if (reason) handleRejectRequest(request.id, reason);
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Reject
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApproveRequest(request)}
                  >
                    <i className="fas fa-check"></i>
                    Approve Request
                  </button>
                </div>
              ) : (
                <div className="status-info">
                  <i className={`fas ${request.status === 'approved' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  Request {request.status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="no-requests">
          <i className="fas fa-inbox"></i>
          <h3>No {filter === 'all' ? '' : filter} requests found</h3>
          <p>All sell requests will appear here for approval.</p>
        </div>
      )}

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          onClose={() => setShowModal(false)}
          onApprove={confirmApproval}
        />
      )}
    </div>
  );
};

const ApprovalModal = ({ request, onClose, onApprove }) => {
  const [formData, setFormData] = useState({
    notes: '',
    pickupStaff: '',
    urgency: 'normal'
  });

  const [availableStaff] = useState([
    { id: 'STAFF001', name: 'Ravi Kumar', phone: '+91 9876543220', status: 'available' },
    { id: 'STAFF002', name: 'Suresh Nair', phone: '+91 9876543221', status: 'available' },
    { id: 'STAFF003', name: 'Anil Menon', phone: '+91 9876543222', status: 'busy' }
  ]);

  const handleApprove = () => {
    if (!formData.pickupStaff) {
      alert('Please assign pickup staff');
      return;
    }
    onApprove(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Approve Sell Request #{request.id}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="request-summary">
            <h3>{request.userName}</h3>
            <p><strong>Selling:</strong> {request.quantity} barrels</p>
            <p><strong>Estimated Value:</strong> ₹{request.estimatedValue.toLocaleString()}</p>
            <p><strong>Pickup:</strong> {request.pickupAddress.fullAddress}</p>
          </div>

          <div className="approval-form">
            <div className="form-group">
              <label>Assign Pickup Staff *</label>
              <select
                value={formData.pickupStaff}
                onChange={(e) => setFormData({...formData, pickupStaff: e.target.value})}
                required
              >
                <option value="">Select pickup staff</option>
                {availableStaff.filter(staff => staff.status === 'available').map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Pickup Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
              >
                <option value="normal">Normal (2-3 days)</option>
                <option value="urgent">Urgent (1 day)</option>
                <option value="emergency">Emergency (Same day)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Manager Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any notes for this approval..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-success" 
            onClick={handleApprove}
          >
            <i className="fas fa-check"></i>
            Approve & Assign Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveSellRequests;