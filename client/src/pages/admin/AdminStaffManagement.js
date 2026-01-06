import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiRefreshCw, FiSearch, FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';
import './AdminStaffManagement.css';

const AdminStaffManagement = () => {
    const [loading, setLoading] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Status');

    // Staff invitation form state
    const [inviteForm, setInviteForm] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Field Staff',
        staffId: '',
        address: ''
    });

    // Staff overview data
    const [staffOverview] = useState({
        totalStaff: 21,
        fieldStaff: 14,
        labStaff: 0,
        deliveryStaff: 5,
        accountant: 0,
        manager: 2,
        active: 0,
        pending: 0,
        approved: 2
    });

    // Sample staff data
    const [staffList, setStaffList] = useState([
        {
            id: 'HFP01',
            name: 'John Doe',
            email: 'john@holyfamily.com',
            phone: '+91 9876543210',
            role: 'Field Staff',
            status: 'Active',
            joinDate: '2024-01-15'
        },
        {
            id: 'HFP02',
            name: 'Jane Smith',
            email: 'jane@holyfamily.com',
            phone: '+91 9876543211',
            role: 'Lab Staff',
            status: 'Active',
            joinDate: '2024-02-01'
        },
        {
            id: 'HFP03',
            name: 'Mike Johnson',
            email: 'mike@holyfamily.com',
            phone: '+91 9876543212',
            role: 'Delivery Staff',
            status: 'Pending',
            joinDate: '2024-03-10'
        }
    ]);

    // Available roles
    const [roles] = useState([
        'Field Staff',
        'Lab Staff',
        'Delivery Staff',
        'Accountant',
        'Manager'
    ]);

    useEffect(() => {
        generateStaffId();
    }, [inviteForm.role]);

    const generateStaffId = () => {
        const rolePrefix = {
            'Field Staff': 'FS',
            'Lab Staff': 'LS',
            'Delivery Staff': 'DS',
            'Accountant': 'AC',
            'Manager': 'MG'
        };
        
        const prefix = rolePrefix[inviteForm.role] || 'ST';
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const staffId = `HFP${prefix}${randomNum}`;
        
        setInviteForm(prev => ({
            ...prev,
            staffId: staffId
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInviteForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendInvitation = async () => {
        try {
            // Validate required fields
            if (!inviteForm.name || !inviteForm.email || !inviteForm.phone) {
                setError('Please fill all required fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inviteForm.email)) {
                setError('Please enter a valid email address');
                return;
            }

            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                const newStaff = {
                    id: inviteForm.staffId,
                    name: inviteForm.name,
                    email: inviteForm.email,
                    phone: inviteForm.phone,
                    role: inviteForm.role,
                    status: 'Pending',
                    joinDate: new Date().toISOString().split('T')[0]
                };

                setStaffList(prev => [newStaff, ...prev]);
                
                // Reset form
                setInviteForm({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'Field Staff',
                    staffId: '',
                    address: ''
                });
                
                setShowInviteModal(false);
                setLoading(false);
                setSuccess('Staff invitation sent successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }, 1500);

        } catch (err) {
            setError('Failed to send invitation');
            setLoading(false);
        }
    };

    // Filter staff based on search and filters
    const filteredStaff = staffList.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            staff.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || staff.role === roleFilter;
        const matchesStatus = statusFilter === 'All Status' || staff.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="admin-staff-management">
            {/* Header */}
            <div className="staff-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <FiUsers /> Staff Management
                    </h1>
                    <p className="page-description">
                        View and manage all staff with their IDs
                    </p>
                </div>
                <div className="header-right">
                    <button className="staff-records-btn">
                        Staff Records
                    </button>
                    <button 
                        className="refresh-btn"
                        onClick={() => window.location.reload()}
                    >
                        <FiRefreshCw /> REFRESH
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <div className="alert-success">{success}</div>}
            {error && <div className="alert-error">{error}</div>}

            {/* Staff Overview Cards */}
            <div className="staff-overview">
                <h2>Staff Overview</h2>
                <div className="overview-grid">
                    <div className="overview-card total">
                        <div className="card-header">Total Staff</div>
                        <div className="card-number">{staffOverview.totalStaff}</div>
                    </div>
                    <div className="overview-card field">
                        <div className="card-header">Field Staff</div>
                        <div className="card-number">{staffOverview.fieldStaff}</div>
                    </div>
                    <div className="overview-card lab">
                        <div className="card-header">Lab Staff</div>
                        <div className="card-number">{staffOverview.labStaff}</div>
                    </div>
                    <div className="overview-card delivery">
                        <div className="card-header">Delivery Staff</div>
                        <div className="card-number">{staffOverview.deliveryStaff}</div>
                    </div>
                    <div className="overview-card accountant">
                        <div className="card-header">Accountant</div>
                        <div className="card-number">{staffOverview.accountant}</div>
                    </div>
                    <div className="overview-card manager">
                        <div className="card-header">Manager</div>
                        <div className="card-number">{staffOverview.manager}</div>
                    </div>
                    <div className="overview-card active">
                        <div className="card-header">Active</div>
                        <div className="card-number">{staffOverview.active}</div>
                    </div>
                    <div className="overview-card pending">
                        <div className="card-header">Pending</div>
                        <div className="card-number">{staffOverview.pending}</div>
                    </div>
                    <div className="overview-card approved">
                        <div className="card-header">Approved</div>
                        <div className="card-number">{staffOverview.approved}</div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Section */}
            <div className="filter-section">
                <div className="section-header">
                    <h3>Filter & Search Staff</h3>
                    <button 
                        className="add-staff-btn"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <FiPlus /> Add Staff
                    </button>
                </div>
                
                <div className="filter-controls">
                    <div className="search-group">
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name, email, staff ID, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="filter-group">
                        <select
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All Roles">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All Status">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    
                    <div className="filter-options">
                        <label className="checkbox-label">
                            <input type="checkbox" />
                            <span className="checkbox-custom"></span>
                            Show Staff IDs Only
                        </label>
                    </div>
                </div>
                
                <div className="results-info">
                    Showing {filteredStaff.length} of {staffList.length} staff members
                </div>
            </div>

            {/* Staff List Table */}
            <div className="staff-table-container">
                <table className="staff-table">
                    <thead>
                        <tr>
                            <th>Staff ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map(staff => (
                            <tr key={staff.id}>
                                <td className="staff-id">{staff.id}</td>
                                <td>{staff.name}</td>
                                <td>{staff.email}</td>
                                <td>{staff.phone}</td>
                                <td>
                                    <span className={`role-badge ${staff.role.toLowerCase().replace(' ', '-')}`}>
                                        {staff.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${staff.status.toLowerCase()}`}>
                                        {staff.status}
                                    </span>
                                </td>
                                <td>{new Date(staff.joinDate).toLocaleDateString()}</td>
                                <td>
                                    <button className="action-btn edit">Edit</button>
                                    <button className="action-btn delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Send Staff Invitation Modal */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="invite-modal">
                        <div className="invite-modal-header">
                            <div className="modal-title">
                                <FiMail className="modal-icon" />
                                <h2>Send Staff Invitation</h2>
                            </div>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowInviteModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="invite-modal-content">
                            <p className="modal-description">
                                Fill in the staff details below to send an invitation email
                            </p>

                            <div className="invite-form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        value={inviteForm.name}
                                        onChange={handleInputChange}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        value={inviteForm.email}
                                        onChange={handleInputChange}
                                        placeholder="staff@example.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Phone Number <span className="required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        value={inviteForm.phone}
                                        onChange={handleInputChange}
                                        placeholder="+919876543210 or +919876543210"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Role <span className="required">*</span>
                                    </label>
                                    <select
                                        name="role"
                                        className="form-select"
                                        value={inviteForm.role}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {roles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Staff ID (HFP01) <span className="required">*</span>
                                    </label>
                                    <div className="staff-id-group">
                                        <input
                                            type="text"
                                            name="staffId"
                                            className="form-input"
                                            value={inviteForm.staffId}
                                            readOnly
                                        />
                                        <button 
                                            type="button"
                                            className="generate-btn"
                                            onClick={generateStaffId}
                                        >
                                            Gen
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <label className="form-label">
                                        Address <span className="required">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        className="form-textarea"
                                        value={inviteForm.address}
                                        onChange={handleInputChange}
                                        placeholder="Complete address with city, state, postal code"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="invite-modal-footer">
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => setShowInviteModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="send-invitation-btn"
                                onClick={handleSendInvitation}
                                disabled={loading}
                            >
                                {loading ? 'SENDING...' : 'SEND INVITATION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaffManagement;