import { useState, useEffect } from 'react';
import './ApproveRequests.css';

const ApproveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockRequests = [
        {
          id: 'REQ001',
          userId: 'USER001',
          userName: 'John Doe',
          userPhone: '+91 9876543210',
          requestDate: '2024-01-20T10:30:00Z',
          quantity: 2,
          deliveryAddress: {
            houseName: 'Green Villa',
            area: 'MG Road',
            pincode: '682001',
            location: 'https://maps.google.com/?q=10.0261,76.3125'
          },
          status: 'pending',
          notes: 'Urgent delivery required'
        },
        {
          id: 'REQ002',
          userId: 'USER002',
          userName: 'Jane Smith',
          userPhone: '+91 9876543211',
          requestDate: '2024-01-20T11:15:00Z',
          quantity: 1,
          deliveryAddress: {
            houseName: 'Blue House',
            area: 'Kakkanad',
            pincode: '682030',
            location: 'https://maps.google.com/?q=10.0150,76.3500'
          },
          status: 'pending',
          notes: ''
        },
        {
          id: 'REQ003',
          userId: 'USER003',
          userName: 'Mike Johnson',
          userPhone: '+91 9876543212',
          requestDate: '2024-01-19T14:20:00Z',
          quantity: 3,
          deliveryAddress: {
            houseName: 'Rose Apartment',
            area: 'Edapally',
            pincode: '682024',
            location: 'https://maps.google.com/?q=10.0200,76.3080'
          },
          status: 'approved',
          approvedDate: '2024-01-19T15:00:00Z',
          assignedBarrels: ['BRL20240119001', 'BRL20240119002', 'BRL20240119003']
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const confirmApproval = async (barrelAssignments) => {
    try {
      // Update request status
      const updatedRequests = requests.map(req => 
        req.id === selectedRequest.id 
          ? {
              ...req,
              status: 'approved',
              approvedDate: new Date().toISOString(),
              assignedBarrels: barrelAssignments
            }
          : req
      );
      
      setRequests(updatedRequests);
      setShowModal(false);
      setSelectedRequest(null);
      
      alert(`Request ${selectedRequest.id} approved successfully!`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request. Please try again.');
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

  if (loading) {
    return (
      <div className="approve-requests">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading user requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approve-requests">
      <div className="page-header">
        <h1>📋 Approve User Requests</h1>
        <p>Review and approve user barrel requests</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-buttons">
          <button 
            className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('pending')}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('approved')}
          >
            Approved ({requests.filter(r => r.status === 'approved').length})
          </button>
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All ({requests.length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-grid">
        {filteredRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="request-id">#{request.id}</div>
              <div className={`status-badge ${getStatusColor(request.status)}`}>
                {request.status.toUpperCase()}
              </div>
            </div>

            <div className="request-user">
              <h3>{request.userName}</h3>
              <p>{request.userPhone}</p>
            </div>

            <div className="request-details">
              <div className="detail-row">
                <span className="label">Quantity:</span>
                <span className="value">{request.quantity} barrels</span>
              </div>
              <div className="detail-row">
                <span className="label">Request Date:</span>
                <span className="value">{new Date(request.requestDate).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Delivery Address:</span>
                <div className="address">
                  <div>{request.deliveryAddress.houseName}</div>
                  <div>{request.deliveryAddress.area}</div>
                  <div>PIN: {request.deliveryAddress.pincode}</div>
                  <a 
                    href={request.deliveryAddress.location} 
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
                  <span className="label">Notes:</span>
                  <span className="value">{request.notes}</span>
                </div>
              )}
            </div>

            {request.status === 'approved' && request.assignedBarrels && (
              <div className="assigned-barrels">
                <h4>Assigned Barrels:</h4>
                <div className="barrel-list">
                  {request.assignedBarrels.map(barrelId => (
                    <span key={barrelId} className="barrel-id">{barrelId}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="request-actions">
              {request.status === 'pending' ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleApproveRequest(request)}
                >
                  <i className="fas fa-check"></i>
                  Approve Request
                </button>
              ) : (
                <div className="approved-info">
                  <i className="fas fa-check-circle"></i>
                  Approved on {new Date(request.approvedDate).toLocaleDateString()}
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
          <p>All user requests will appear here for approval.</p>
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
  const [availableBarrels] = useState([
    'BRL20240120001', 'BRL20240120002', 'BRL20240120003',
    'BRL20240120004', 'BRL20240120005', 'BRL20240120006'
  ]);
  const [selectedBarrels, setSelectedBarrels] = useState([]);

  const handleBarrelSelect = (barrelId) => {
    if (selectedBarrels.includes(barrelId)) {
      setSelectedBarrels(selectedBarrels.filter(id => id !== barrelId));
    } else if (selectedBarrels.length < request.quantity) {
      setSelectedBarrels([...selectedBarrels, barrelId]);
    }
  };

  const handleApprove = () => {
    if (selectedBarrels.length !== request.quantity) {
      alert(`Please select exactly ${request.quantity} barrels`);
      return;
    }
    onApprove(selectedBarrels);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Approve Request #{request.id}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="request-summary">
            <h3>{request.userName}</h3>
            <p>Requested: <strong>{request.quantity} barrels</strong></p>
            <p>Delivery: {request.deliveryAddress.houseName}, {request.deliveryAddress.area}</p>
          </div>

          <div className="barrel-selection">
            <h4>Select {request.quantity} Available Barrels:</h4>
            <div className="barrel-grid">
              {availableBarrels.map(barrelId => (
                <div
                  key={barrelId}
                  className={`barrel-option ${selectedBarrels.includes(barrelId) ? 'selected' : ''}`}
                  onClick={() => handleBarrelSelect(barrelId)}
                >
                  {barrelId}
                  {selectedBarrels.includes(barrelId) && (
                    <i className="fas fa-check"></i>
                  )}
                </div>
              ))}
            </div>
            <p className="selection-info">
              Selected: {selectedBarrels.length} / {request.quantity}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleApprove}
            disabled={selectedBarrels.length !== request.quantity}
          >
            <i className="fas fa-check"></i>
            Approve & Assign Barrels
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRequests;