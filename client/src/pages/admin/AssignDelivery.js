import { useState, useEffect } from 'react';
import './AssignDelivery.css';

const AssignDelivery = () => {
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApprovedRequests();
    fetchDeliveryStaff();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRequests = [
        {
          id: 'REQ001',
          userId: 'USER001',
          userName: 'John Doe',
          userPhone: '+91 9876543210',
          requestDate: '2024-01-20T10:30:00Z',
          approvedDate: '2024-01-20T11:00:00Z',
          quantity: 2,
          assignedBarrels: ['BRL20240120001', 'BRL20240120002'],
          deliveryAddress: {
            houseName: 'Green Villa',
            area: 'MG Road',
            pincode: '682001',
            location: 'https://maps.google.com/?q=10.0261,76.3125',
            fullAddress: 'Green Villa, MG Road, Kochi, Kerala 682001'
          },
          deliveryStaff: null,
          deliveryStatus: 'pending_assignment',
          priority: 'high',
          notes: 'Urgent delivery required'
        },
        {
          id: 'REQ002',
          userId: 'USER002',
          userName: 'Jane Smith',
          userPhone: '+91 9876543211',
          requestDate: '2024-01-20T11:15:00Z',
          approvedDate: '2024-01-20T11:30:00Z',
          quantity: 1,
          assignedBarrels: ['BRL20240120003'],
          deliveryAddress: {
            houseName: 'Blue House',
            area: 'Kakkanad',
            pincode: '682030',
            location: 'https://maps.google.com/?q=10.0150,76.3500',
            fullAddress: 'Blue House, Kakkanad, Kochi, Kerala 682030'
          },
          deliveryStaff: {
            id: 'STAFF001',
            name: 'Ravi Kumar',
            phone: '+91 9876543220'
          },
          deliveryStatus: 'assigned',
          assignedDate: '2024-01-20T12:00:00Z',
          priority: 'medium',
          notes: ''
        },
        {
          id: 'REQ003',
          userId: 'USER003',
          userName: 'Mike Johnson',
          userPhone: '+91 9876543212',
          requestDate: '2024-01-19T14:20:00Z',
          approvedDate: '2024-01-19T15:00:00Z',
          quantity: 3,
          assignedBarrels: ['BRL20240119001', 'BRL20240119002', 'BRL20240119003'],
          deliveryAddress: {
            houseName: 'Rose Apartment',
            area: 'Edapally',
            pincode: '682024',
            location: 'https://maps.google.com/?q=10.0200,76.3080',
            fullAddress: 'Rose Apartment, Edapally, Kochi, Kerala 682024'
          },
          deliveryStaff: {
            id: 'STAFF002',
            name: 'Suresh Nair',
            phone: '+91 9876543221'
          },
          deliveryStatus: 'delivered',
          assignedDate: '2024-01-19T16:00:00Z',
          deliveredDate: '2024-01-20T09:30:00Z',
          priority: 'low',
          notes: ''
        }
      ];
      setApprovedRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching approved requests:', error);
    }
  };

  const fetchDeliveryStaff = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStaff = [
        {
          id: 'STAFF001',
          name: 'Ravi Kumar',
          phone: '+91 9876543220',
          vehicleNumber: 'KL-07-AB-1234',
          status: 'available',
          currentDeliveries: 1,
          maxDeliveries: 5,
          rating: 4.8,
          totalDeliveries: 156,
          location: 'Kochi Central'
        },
        {
          id: 'STAFF002',
          name: 'Suresh Nair',
          phone: '+91 9876543221',
          vehicleNumber: 'KL-07-CD-5678',
          status: 'busy',
          currentDeliveries: 3,
          maxDeliveries: 4,
          rating: 4.6,
          totalDeliveries: 203,
          location: 'Edapally'
        },
        {
          id: 'STAFF003',
          name: 'Anil Menon',
          phone: '+91 9876543222',
          vehicleNumber: 'KL-07-EF-9012',
          status: 'available',
          currentDeliveries: 0,
          maxDeliveries: 6,
          rating: 4.9,
          totalDeliveries: 89,
          location: 'Kakkanad'
        },
        {
          id: 'STAFF004',
          name: 'Rajesh Pillai',
          phone: '+91 9876543223',
          vehicleNumber: 'KL-07-GH-3456',
          status: 'offline',
          currentDeliveries: 0,
          maxDeliveries: 5,
          rating: 4.5,
          totalDeliveries: 134,
          location: 'Offline'
        }
      ];
      setDeliveryStaff(mockStaff);
    } catch (error) {
      console.error('Error fetching delivery staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const confirmAssignment = async (staffId) => {
    try {
      const selectedStaff = deliveryStaff.find(staff => staff.id === staffId);
      
      // Update request with assigned staff
      const updatedRequests = approvedRequests.map(req => 
        req.id === selectedRequest.id 
          ? {
              ...req,
              deliveryStaff: selectedStaff,
              deliveryStatus: 'assigned',
              assignedDate: new Date().toISOString()
            }
          : req
      );
      
      // Update staff current deliveries
      const updatedStaff = deliveryStaff.map(staff =>
        staff.id === staffId
          ? {
              ...staff,
              currentDeliveries: staff.currentDeliveries + 1,
              status: staff.currentDeliveries + 1 >= staff.maxDeliveries ? 'busy' : 'available'
            }
          : staff
      );
      
      setApprovedRequests(updatedRequests);
      setDeliveryStaff(updatedStaff);
      setShowModal(false);
      setSelectedRequest(null);
      
      alert(`Delivery staff ${selectedStaff.name} assigned successfully!`);
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Error assigning delivery staff. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_assignment: 'status-pending',
      assigned: 'status-assigned',
      delivered: 'status-delivered'
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

  const getStaffStatusColor = (status) => {
    const colors = {
      available: 'staff-available',
      busy: 'staff-busy',
      offline: 'staff-offline'
    };
    return colors[status] || 'staff-default';
  };

  if (loading) {
    return (
      <div className="assign-delivery">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading delivery assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-delivery">
      <div className="page-header">
        <h1>🚚 Assign Delivery Staff</h1>
        <p>Assign delivery staff to approved barrel requests</p>
      </div>

      <div className="dashboard-grid">
        {/* Staff Overview */}
        <div className="staff-overview">
          <h2>Delivery Staff Status</h2>
          <div className="staff-cards">
            {deliveryStaff.map(staff => (
              <div key={staff.id} className="staff-card">
                <div className="staff-header">
                  <h3>{staff.name}</h3>
                  <span className={`staff-status ${getStaffStatusColor(staff.status)}`}>
                    {staff.status.toUpperCase()}
                  </span>
                </div>
                <div className="staff-details">
                  <p><i className="fas fa-phone"></i> {staff.phone}</p>
                  <p><i className="fas fa-car"></i> {staff.vehicleNumber}</p>
                  <p><i className="fas fa-map-marker-alt"></i> {staff.location}</p>
                </div>
                <div className="staff-stats">
                  <div className="stat">
                    <span className="stat-value">{staff.currentDeliveries}/{staff.maxDeliveries}</span>
                    <span className="stat-label">Current Load</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">⭐ {staff.rating}</span>
                    <span className="stat-label">Rating</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{staff.totalDeliveries}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Assignments */}
        <div className="delivery-assignments">
          <h2>Delivery Assignments</h2>
          <div className="assignments-list">
            {approvedRequests.map(request => (
              <div key={request.id} className="assignment-card">
                <div className="assignment-header">
                  <div className="request-info">
                    <span className="request-id">#{request.id}</span>
                    <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                  <span className={`status-badge ${getStatusColor(request.deliveryStatus)}`}>
                    {request.deliveryStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="assignment-body">
                  <div className="customer-info">
                    <h3>{request.userName}</h3>
                    <p>{request.userPhone}</p>
                    <p className="quantity">{request.quantity} barrels</p>
                  </div>

                  <div className="delivery-address">
                    <h4>Delivery Address:</h4>
                    <p>{request.deliveryAddress.fullAddress}</p>
                    <a 
                      href={request.deliveryAddress.location} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="location-link"
                    >
                      📍 View on Map
                    </a>
                  </div>

                  <div className="barrel-info">
                    <h4>Assigned Barrels:</h4>
                    <div className="barrel-list">
                      {request.assignedBarrels.map(barrelId => (
                        <span key={barrelId} className="barrel-id">{barrelId}</span>
                      ))}
                    </div>
                  </div>

                  {request.deliveryStaff ? (
                    <div className="assigned-staff">
                      <h4>Assigned Staff:</h4>
                      <div className="staff-info">
                        <p><strong>{request.deliveryStaff.name}</strong></p>
                        <p>{request.deliveryStaff.phone}</p>
                        <p>Assigned: {new Date(request.assignedDate).toLocaleString()}</p>
                        {request.deliveredDate && (
                          <p>Delivered: {new Date(request.deliveredDate).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="assignment-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleAssignStaff(request)}
                      >
                        <i className="fas fa-user-plus"></i>
                        Assign Delivery Staff
                      </button>
                    </div>
                  )}

                  {request.notes && (
                    <div className="request-notes">
                      <h4>Notes:</h4>
                      <p>{request.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showModal && selectedRequest && (
        <AssignmentModal
          request={selectedRequest}
          staff={deliveryStaff.filter(s => s.status === 'available')}
          onClose={() => setShowModal(false)}
          onAssign={confirmAssignment}
        />
      )}
    </div>
  );
};

const AssignmentModal = ({ request, staff, onClose, onAssign }) => {
  const [selectedStaff, setSelectedStaff] = useState('');

  const handleAssign = () => {
    if (!selectedStaff) {
      alert('Please select a delivery staff member');
      return;
    }
    onAssign(selectedStaff);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Assign Delivery Staff</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="request-summary">
            <h3>Request #{request.id}</h3>
            <p><strong>Customer:</strong> {request.userName}</p>
            <p><strong>Quantity:</strong> {request.quantity} barrels</p>
            <p><strong>Address:</strong> {request.deliveryAddress.fullAddress}</p>
            <p><strong>Priority:</strong> {request.priority.toUpperCase()}</p>
          </div>

          <div className="staff-selection">
            <h4>Select Available Staff:</h4>
            <div className="staff-options">
              {staff.length === 0 ? (
                <p className="no-staff">No available delivery staff at the moment.</p>
              ) : (
                staff.map(staffMember => (
                  <div
                    key={staffMember.id}
                    className={`staff-option ${selectedStaff === staffMember.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(staffMember.id)}
                  >
                    <div className="staff-option-header">
                      <h4>{staffMember.name}</h4>
                      <span className="rating">⭐ {staffMember.rating}</span>
                    </div>
                    <div className="staff-option-details">
                      <p><i className="fas fa-phone"></i> {staffMember.phone}</p>
                      <p><i className="fas fa-car"></i> {staffMember.vehicleNumber}</p>
                      <p><i className="fas fa-map-marker-alt"></i> {staffMember.location}</p>
                      <p><i className="fas fa-tasks"></i> {staffMember.currentDeliveries}/{staffMember.maxDeliveries} deliveries</p>
                    </div>
                    {selectedStaff === staffMember.id && (
                      <i className="fas fa-check selection-check"></i>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAssign}
            disabled={!selectedStaff || staff.length === 0}
          >
            <i className="fas fa-user-plus"></i>
            Assign Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDelivery;