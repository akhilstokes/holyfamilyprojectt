import React, { useState, useEffect } from 'react';
import './LatexManagement.css';

const LatexManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        dateFrom: '',
        dateTo: ''
    });
    const [stats, setStats] = useState([]);
    const [modalData, setModalData] = useState({
        status: '',
        actualPayment: '',
        adminNotes: ''
    });

    useEffect(() => {
        fetchRequests();
    }, [filters]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);

            const response = await fetch(`/api/latex/admin/requests?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setRequests(data.requests || []);
                // Ensure stats is always an array
                if (data.stats && Array.isArray(data.stats)) {
                    setStats(data.stats);
                } else if (data.stats && typeof data.stats === 'object') {
                    // Convert object stats to array format if needed
                    const statsArray = Object.entries(data.stats).map(([key, value]) => ({
                        _id: key,
                        count: value.count || 0,
                        totalQuantity: value.totalQuantity || 0,
                        totalPayment: value.totalPayment || 0
                    }));
                    setStats(statsArray);
                } else {
                    setStats([]);
                }
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setStats([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const openModal = (request) => {
        setSelectedRequest(request);
        setModalData({
            status: request.status,
            actualPayment: request.actualPayment || request.estimatedPayment,
            adminNotes: request.adminNotes || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
        setModalData({
            status: '',
            actualPayment: '',
            adminNotes: ''
        });
    };

    const handleModalInputChange = (field, value) => {
        setModalData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateRequest = async () => {
        try {
            const response = await fetch(`/api/latex/admin/requests/${selectedRequest._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(modalData)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Request updated successfully!');
                closeModal();
                fetchRequests();
            } else {
                alert('Error updating request: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Error updating request. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#28a745';
            case 'rejected': return '#dc3545';
            case 'pending': return '#ffc107';
            case 'processing': return '#17a2b8';
            case 'completed': return '#6f42c1';
            default: return '#6c757d';
        }
    };

    const exportToExcel = () => {
        // Simple CSV export
        const csvContent = [
            ['Request ID', 'Customer', 'Quantity (kg)', 'DRC %', 'Quality', 'Status', 'Estimated Payment', 'Actual Payment', 'Submitted Date'],
            ...requests.map(req => [
                req._id,
                req.user.name,
                req.quantity,
                req.drcPercentage,
                req.quality,
                req.status,
                req.estimatedPayment,
                req.actualPayment || '',
                new Date(req.submittedAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `latex-requests-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="latex-management">
            <div className="management-header">
                <h2>
                    <i className="fas fa-seedling"></i>
                    Latex Request Management
                </h2>
                <p>Manage customer latex sell requests and approvals</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                {Array.isArray(stats) && stats.length > 0 ? (
                    stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">{stat._id || 'Total'}</span>
                                <span className="stat-count">{stat.count}</span>
                            </div>
                            <div className="stat-details">
                                <div className="stat-item">
                                    <span>Quantity:</span>
                                    <span>{stat.totalQuantity?.toFixed(2) || 0} kg</span>
                                </div>
                                <div className="stat-item">
                                    <span>Payment:</span>
                                    <span>₹{stat.totalPayment?.toFixed(2) || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">No Data</span>
                            <span className="stat-count">0</span>
                        </div>
                        <div className="stat-details">
                            <div className="stat-item">
                                <span>Quantity:</span>
                                <span>0 kg</span>
                            </div>
                            <div className="stat-item">
                                <span>Payment:</span>
                                <span>₹0</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="filters-section">
                <h3>Filters</h3>
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>From Date:</label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>To Date:</label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                        />
                    </div>
                    <div className="filter-actions">
                        <button onClick={exportToExcel} className="export-btn">
                            <i className="fas fa-download"></i>
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="requests-section">
                <h3>Latex Requests</h3>
                {loading ? (
                    <div className="loading">Loading requests...</div>
                ) : (
                    <div className="requests-table">
                        <div className="table-header">
                            <div className="table-cell">Request ID</div>
                            <div className="table-cell">Customer</div>
                            <div className="table-cell">Quantity</div>
                            <div className="table-cell">DRC %</div>
                            <div className="table-cell">Quality</div>
                            <div className="table-cell">Status</div>
                            <div className="table-cell">Payment</div>
                            <div className="table-cell">Date</div>
                            <div className="table-cell">Actions</div>
                        </div>
                        {requests.map((request) => (
                            <div key={request._id} className="table-row">
                                <div className="table-cell">
                                    <span className="request-id">#{request._id.slice(-8)}</span>
                                </div>
                                <div className="table-cell">
                                    <div className="customer-info">
                                        <span className="customer-name">{request.user.name}</span>
                                        <span className="customer-email">{request.user.email}</span>
                                    </div>
                                </div>
                                <div className="table-cell">{request.quantity} kg</div>
                                <div className="table-cell">{request.drcPercentage}%</div>
                                <div className="table-cell">{request.quality}</div>
                                <div className="table-cell">
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(request.status) }}
                                    >
                                        {request.status}
                                    </span>
                                </div>
                                <div className="table-cell">
                                    <div className="payment-info">
                                        <span className="estimated">₹{request.estimatedPayment}</span>
                                        {request.actualPayment && (
                                            <span className="actual">₹{request.actualPayment}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="table-cell">
                                    {new Date(request.submittedAt).toLocaleDateString()}
                                </div>
                                <div className="table-cell">
                                    <button 
                                        onClick={() => openModal(request)}
                                        className="action-btn"
                                    >
                                        <i className="fas fa-edit"></i>
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Manage Request #{selectedRequest._id.slice(-8)}</h3>
                            <button onClick={closeModal} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="request-details">
                                <div className="detail-group">
                                    <h4>Customer Information</h4>
                                    <p><strong>Name:</strong> {selectedRequest.user.name}</p>
                                    <p><strong>Email:</strong> {selectedRequest.user.email}</p>
                                    <p><strong>Phone:</strong> {selectedRequest.user.phone || 'N/A'}</p>
                                </div>

                                <div className="detail-group">
                                    <h4>Request Details</h4>
                                    <p><strong>Quantity:</strong> {selectedRequest.quantity} kg</p>
                                    <p><strong>DRC:</strong> {selectedRequest.drcPercentage}%</p>
                                    <p><strong>Quality:</strong> {selectedRequest.quality}</p>
                                    <p><strong>Location:</strong> {selectedRequest.location}</p>
                                    <p><strong>Estimated Payment:</strong> ₹{selectedRequest.estimatedPayment}</p>
                                </div>

                                {selectedRequest.notes && (
                                    <div className="detail-group">
                                        <h4>Customer Notes</h4>
                                        <p>{selectedRequest.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="modal-form">
                                <div className="form-group">
                                    <label>Status:</label>
                                    <select
                                        value={modalData.status}
                                        onChange={(e) => handleModalInputChange('status', e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Actual Payment (₹):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={modalData.actualPayment}
                                        onChange={(e) => handleModalInputChange('actualPayment', e.target.value)}
                                        placeholder="Enter actual payment amount"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Admin Notes:</label>
                                    <textarea
                                        value={modalData.adminNotes}
                                        onChange={(e) => handleModalInputChange('adminNotes', e.target.value)}
                                        placeholder="Add notes for the customer"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={closeModal} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleUpdateRequest} className="save-btn">
                                Update Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LatexManagement;



