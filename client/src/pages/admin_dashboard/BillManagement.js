import React, { useState, useEffect } from 'react';
import './BillManagement.css';

const BillManagement = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        dateFrom: '',
        dateTo: '',
        staff: ''
    });
    const [stats, setStats] = useState([]);
    const [staff, setStaff] = useState([]);
    const [modalData, setModalData] = useState({
        status: '',
        adminNotes: '',
        approvedAmount: ''
    });

    useEffect(() => {
        fetchBills();
        fetchStaff();
    }, [filters]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
            if (filters.staff) queryParams.append('staff', filters.staff);

            const response = await fetch(`/api/admin/bills?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setBills(data.bills || []);
                // Ensure stats is always an array
                if (data.stats && Array.isArray(data.stats)) {
                    setStats(data.stats);
                } else if (data.stats && typeof data.stats === 'object') {
                    // Convert object stats to array format if needed
                    const statsArray = Object.entries(data.stats).map(([key, value]) => ({
                        _id: key,
                        count: value.count || 0,
                        totalAmount: value.totalAmount || 0
                    }));
                    setStats(statsArray);
                } else {
                    setStats([]);
                }
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
            setStats([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await fetch('/api/admin/staff', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setStaff(data.staff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const openModal = (bill) => {
        setSelectedBill(bill);
        setModalData({
            status: bill.status,
            adminNotes: bill.adminNotes || '',
            approvedAmount: bill.approvedAmount || bill.requestedAmount
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedBill(null);
        setModalData({
            status: '',
            adminNotes: '',
            approvedAmount: ''
        });
    };

    const handleModalInputChange = (field, value) => {
        setModalData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateBill = async () => {
        try {
            const response = await fetch(`/api/admin/bills/${selectedBill._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(modalData)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Bill updated successfully!');
                closeModal();
                fetchBills();
            } else {
                alert('Error updating bill: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating bill:', error);
            alert('Error updating bill. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#28a745';
            case 'rejected': return '#dc3545';
            case 'pending': return '#ffc107';
            case 'processing': return '#17a2b8';
            default: return '#6c757d';
        }
    };

    const exportToExcel = () => {
        const csvContent = [
            ['Bill ID', 'Staff Member', 'Amount', 'Category', 'Status', 'Date', 'Description'],
            ...bills.map(bill => [
                bill._id,
                bill.staff.name,
                bill.requestedAmount,
                bill.category,
                bill.status,
                new Date(bill.createdAt).toLocaleDateString(),
                bill.description
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-requests-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        // Simple PDF generation using window.print()
        const printWindow = window.open('', '_blank');
        const billData = bills.map(bill => `
            <div style="border: 1px solid #ccc; margin: 10px 0; padding: 15px;">
                <h3>Bill #${bill._id.slice(-8)}</h3>
                <p><strong>Staff:</strong> ${bill.staff.name}</p>
                <p><strong>Amount:</strong> ₹${bill.requestedAmount}</p>
                <p><strong>Category:</strong> ${bill.category}</p>
                <p><strong>Status:</strong> ${bill.status}</p>
                <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
                <p><strong>Description:</strong> ${bill.description}</p>
            </div>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Bill Requests Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        .header { text-align: center; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Holy Family Polymers</h1>
                        <h2>Bill Requests Report</h2>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    </div>
                    ${billData}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="bill-management">
            <div className="management-header">
                <h2>
                    <i className="fas fa-file-invoice-dollar"></i>
                    Bill Request Management
                </h2>
                <p>Manage and approve bill requests from field staff</p>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">{stat._id || 'Total'}</span>
                            <span className="stat-count">{stat.count}</span>
                        </div>
                        <div className="stat-details">
                            <div className="stat-item">
                                <span>Total Amount:</span>
                                <span>₹{stat.totalAmount?.toFixed(2) || 0}</span>
                            </div>
                            <div className="stat-item">
                                <span>Avg Amount:</span>
                                <span>₹{stat.avgAmount?.toFixed(2) || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
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
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Staff Member:</label>
                        <select
                            value={filters.staff}
                            onChange={(e) => handleFilterChange('staff', e.target.value)}
                        >
                            <option value="">All Staff</option>
                            {staff.map(member => (
                                <option key={member._id} value={member._id}>
                                    {member.name}
                                </option>
                            ))}
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
                        <button onClick={exportToExcel} className="export-btn excel">
                            <i className="fas fa-file-excel"></i>
                            Export Excel
                        </button>
                        <button onClick={exportToPDF} className="export-btn pdf">
                            <i className="fas fa-file-pdf"></i>
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bills-section">
                <h3>Bill Requests</h3>
                {loading ? (
                    <div className="loading">Loading bills...</div>
                ) : (
                    <div className="bills-table">
                        <div className="table-header">
                            <div className="table-cell">Bill ID</div>
                            <div className="table-cell">Staff Member</div>
                            <div className="table-cell">Amount</div>
                            <div className="table-cell">Category</div>
                            <div className="table-cell">Status</div>
                            <div className="table-cell">Date</div>
                            <div className="table-cell">Actions</div>
                        </div>
                        {bills.map((bill) => (
                            <div key={bill._id} className="table-row">
                                <div className="table-cell">
                                    <span className="bill-id">#{bill._id.slice(-8)}</span>
                                </div>
                                <div className="table-cell">
                                    <div className="staff-info">
                                        <span className="staff-name">{bill.staff.name}</span>
                                        <span className="staff-email">{bill.staff.email}</span>
                                    </div>
                                </div>
                                <div className="table-cell">
                                    <div className="amount-info">
                                        <span className="requested">₹{bill.requestedAmount}</span>
                                        {bill.approvedAmount && (
                                            <span className="approved">₹{bill.approvedAmount}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="table-cell">{bill.category}</div>
                                <div className="table-cell">
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(bill.status) }}
                                    >
                                        {bill.status}
                                    </span>
                                </div>
                                <div className="table-cell">
                                    {new Date(bill.createdAt).toLocaleDateString()}
                                </div>
                                <div className="table-cell">
                                    <button 
                                        onClick={() => openModal(bill)}
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
            {showModal && selectedBill && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Manage Bill #{selectedBill._id.slice(-8)}</h3>
                            <button onClick={closeModal} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="bill-details">
                                <div className="detail-group">
                                    <h4>Staff Information</h4>
                                    <p><strong>Name:</strong> {selectedBill.staff.name}</p>
                                    <p><strong>Email:</strong> {selectedBill.staff.email}</p>
                                    <p><strong>Phone:</strong> {selectedBill.staff.phone || 'N/A'}</p>
                                </div>

                                <div className="detail-group">
                                    <h4>Bill Details</h4>
                                    <p><strong>Requested Amount:</strong> ₹{selectedBill.requestedAmount}</p>
                                    <p><strong>Category:</strong> {selectedBill.category}</p>
                                    <p><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Description:</strong> {selectedBill.description}</p>
                                </div>

                                {selectedBill.receipts && selectedBill.receipts.length > 0 && (
                                    <div className="detail-group">
                                        <h4>Receipts</h4>
                                        <div className="receipts-list">
                                            {selectedBill.receipts.map((receipt, index) => (
                                                <div key={index} className="receipt-item">
                                                    <span>{receipt.filename}</span>
                                                    <button className="download-receipt-btn">
                                                        <i className="fas fa-download"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Approved Amount (₹):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={modalData.approvedAmount}
                                        onChange={(e) => handleModalInputChange('approvedAmount', e.target.value)}
                                        placeholder="Enter approved amount"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Admin Notes:</label>
                                    <textarea
                                        value={modalData.adminNotes}
                                        onChange={(e) => handleModalInputChange('adminNotes', e.target.value)}
                                        placeholder="Add notes for the staff member"
                                        rows="4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={closeModal} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleUpdateBill} className="save-btn">
                                Update Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillManagement;



