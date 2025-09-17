import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        search: ''
    });
    
    const [activityFilters, setActivityFilters] = useState({
        action: '',
        dateFrom: '',
        dateTo: ''
    });
    
    const [stats, setStats] = useState([]);
    const [activityStats, setActivityStats] = useState([]);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        phoneNumber: '',
    });
    const [bulkAction, setBulkAction] = useState({
        action: '',
        reason: ''
    });

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else {
            fetchActivities();
        }
    }, [activeTab, filters, activityFilters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.role) queryParams.append('role', filters.role);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.search) queryParams.append('search', filters.search);

            const response = await fetch(`/api/user-management?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setUsers(data.users);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (activityFilters.action) queryParams.append('action', activityFilters.action);
            if (activityFilters.dateFrom) queryParams.append('dateFrom', activityFilters.dateFrom);
            if (activityFilters.dateTo) queryParams.append('dateTo', activityFilters.dateTo);

            const response = await fetch(`/api/user-management/activity-logs?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setActivities(data.activities);
                setActivityStats(data.activityStats);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
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

    const handleActivityFilterChange = (field, value) => {
        setActivityFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user._id));
        }
    };

    const handleAddUser = async () => {
        try {
            const response = await fetch('/api/user-management/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newUser)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('User added successfully!');
                setShowAddModal(false);
                setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'user',
                    phoneNumber: ''
                });
                fetchUsers();
            } else {
                alert('Error adding user: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Error adding user. Please try again.');
        }
    };

    const handleUserStatusUpdate = async (userId, status, reason = '') => {
        try {
            const response = await fetch(`/api/user-management/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status, reason })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(`User status updated to ${status}!`);
                fetchUsers();
            } else {
                alert('Error updating user status: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error updating user status. Please try again.');
        }
    };

    const handleUserRoleUpdate = async (userId, role) => {
        try {
            const response = await fetch(`/api/user-management/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(`User role updated to ${role}!`);
                fetchUsers();
            } else {
                alert('Error updating user role: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Error updating user role. Please try again.');
        }
    };

    const handleBulkAction = async () => {
        if (selectedUsers.length === 0) {
            alert('Please select users first');
            return;
        }

        try {
            const response = await fetch('/api/user-management/bulk-actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                    action: bulkAction.action,
                    reason: bulkAction.reason
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(`Bulk ${bulkAction.action} action completed successfully!`);
                setShowBulkModal(false);
                setSelectedUsers([]);
                setBulkAction({ action: '', reason: '' });
                fetchUsers();
            } else {
                alert('Error performing bulk action: ' + data.message);
            }
        } catch (error) {
            console.error('Error performing bulk action:', error);
            alert('Error performing bulk action. Please try again.');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/api/user-management/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    alert('User deleted successfully!');
                    fetchUsers();
                } else {
                    alert('Error deleting user: ' + data.message);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user. Please try again.');
            }
        }
    };

    const viewUserDetails = async (userId) => {
        try {
            const response = await fetch(`/api/user-management/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setSelectedUser(data.user);
                setShowUserDetails(true);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#28a745';
            case 'suspended': return '#dc3545';
            case 'pending': return '#ffc107';
            case 'deleted': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#6f42c1';
            case 'staff': return '#17a2b8';
            case 'customer': return '#28a745';
            default: return '#6c757d';
        }
    };

    const exportUsers = () => {
        const csvContent = [
            ['Name', 'Email', 'Role', 'Status', 'Phone', 'Created Date'],
            ...users.map(user => [
                user.name,
                user.email,
                user.role,
                user.status,
                user.phone || 'N/A',
                new Date(user.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="user-management">
            <div className="management-header">
                <h2>
                    <i className="fas fa-users-cog"></i>
                    User Management
                </h2>
                <p>Manage users, roles, and view activity logs</p>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button 
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <i className="fas fa-users"></i>
                    Users ({users.length})
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activities')}
                >
                    <i className="fas fa-history"></i>
                    Activity Logs ({activities.length})
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <>
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
                                        <span>Active:</span>
                                        <span>{stat.active || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Suspended:</span>
                                        <span>{stat.suspended || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters and Actions */}
                    <div className="filters-section">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Role:</label>
                                <select
                                    value={filters.role}
                                    onChange={(e) => handleFilterChange('role', e.target.value)}
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Status:</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Search:</label>
                                <input
                                    type="text"
                                    placeholder="Search by name or email"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </div>
                            <div className="filter-actions">
                                <button onClick={() => setShowAddModal(true)} className="add-btn">
                                    <i className="fas fa-plus"></i>
                                    Add User
                                </button>
                                <button onClick={exportUsers} className="export-btn">
                                    <i className="fas fa-download"></i>
                                    Export
                                </button>
                                {selectedUsers.length > 0 && (
                                    <button onClick={() => setShowBulkModal(true)} className="bulk-btn">
                                        <i className="fas fa-tasks"></i>
                                        Bulk Actions ({selectedUsers.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="users-section">
                        {loading ? (
                            <div className="loading">Loading users...</div>
                        ) : (
                            <div className="users-table">
                                <div className="table-header">
                                    <div className="table-cell checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </div>
                                    <div className="table-cell">Name</div>
                                    <div className="table-cell">Email</div>
                                    <div className="table-cell">Role</div>
                                    <div className="table-cell">Status</div>
                                    <div className="table-cell">Phone</div>
                                    <div className="table-cell">Created</div>
                                    <div className="table-cell">Actions</div>
                                </div>
                                {users.map((user) => (
                                    <div key={user._id} className="table-row">
                                        <div className="table-cell checkbox-cell">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user._id)}
                                                onChange={() => handleUserSelect(user._id)}
                                            />
                                        </div>
                                        <div className="table-cell">
                                            <div className="user-info">
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </div>
                                        <div className="table-cell">{user.email}</div>
                                        <div className="table-cell">
                                            <span 
                                                className="role-badge"
                                                style={{ backgroundColor: getRoleColor(user.role) }}
                                            >
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="table-cell">
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(user.status) }}
                                            >
                                                {user.status}
                                            </span>
                                        </div>
                                        <div className="table-cell">{user.phone || 'N/A'}</div>
                                        <div className="table-cell">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="table-cell">
                                            <div className="action-buttons">
                                                <button 
                                                    onClick={() => viewUserDetails(user._id)}
                                                    className="action-btn view"
                                                    title="View Details"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {user.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleUserStatusUpdate(user._id, 'active')}
                                                        className="action-btn approve"
                                                        title="Approve"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                )}
                                                {user.status === 'active' && (
                                                    <button 
                                                        onClick={() => handleUserStatusUpdate(user._id, 'suspended')}
                                                        className="action-btn suspend"
                                                        title="Suspend"
                                                    >
                                                        <i className="fas fa-pause"></i>
                                                    </button>
                                                )}
                                                {user.status === 'suspended' && (
                                                    <button 
                                                        onClick={() => handleUserStatusUpdate(user._id, 'active')}
                                                        className="action-btn activate"
                                                        title="Activate"
                                                    >
                                                        <i className="fas fa-play"></i>
                                                    </button>
                                                )}
                                                {user.role !== 'admin' && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="action-btn delete"
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
                <>
                    {/* Activity Statistics */}
                    <div className="activity-stats">
                        <h3>Activity Statistics</h3>
                        <div className="stats-grid">
                            {activityStats.map((stat, index) => (
                                <div key={index} className="stat-card">
                                    <div className="stat-header">
                                        <span className="stat-label">{stat._id}</span>
                                        <span className="stat-count">{stat.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Activity Filters */}
                    <div className="filters-section">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label>Action:</label>
                                <select
                                    value={activityFilters.action}
                                    onChange={(e) => handleActivityFilterChange('action', e.target.value)}
                                >
                                    <option value="">All Actions</option>
                                    <option value="login">Login</option>
                                    <option value="logout">Logout</option>
                                    <option value="register">Register</option>
                                    <option value="add_user">Add User</option>
                                    <option value="suspend_user">Suspend User</option>
                                    <option value="change_role">Change Role</option>
                                    <option value="view_dashboard">View Dashboard</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>From Date:</label>
                                <input
                                    type="date"
                                    value={activityFilters.dateFrom}
                                    onChange={(e) => handleActivityFilterChange('dateFrom', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>To Date:</label>
                                <input
                                    type="date"
                                    value={activityFilters.dateTo}
                                    onChange={(e) => handleActivityFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Activities Table */}
                    <div className="activities-section">
                        {loading ? (
                            <div className="loading">Loading activities...</div>
                        ) : (
                            <div className="activities-table">
                                <div className="table-header">
                                    <div className="table-cell">User</div>
                                    <div className="table-cell">Action</div>
                                    <div className="table-cell">Description</div>
                                    <div className="table-cell">IP Address</div>
                                    <div className="table-cell">Timestamp</div>
                                </div>
                                {activities.map((activity) => (
                                    <div key={activity._id} className="table-row">
                                        <div className="table-cell">
                                            <div className="user-info">
                                                <span className="user-name">{activity.user?.name || 'Unknown'}</span>
                                                <span className="user-email">{activity.user?.email || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="table-cell">
                                            <span className="action-badge">{activity.action}</span>
                                        </div>
                                        <div className="table-cell">{activity.description}</div>
                                        <div className="table-cell">{activity.ipAddress}</div>
                                        <div className="table-cell">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New User</h3>
                            <button onClick={() => setShowAddModal(false)} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter email address"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role:</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="user">User</option>
                                    <option value="field_staff">Field Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Phone:</label>
                                <input
                                    type="text"
                                    value={newUser.phoneNumber}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="form-group">
                                <label>Address:</label>
                                <textarea
                                    value={newUser.address}
                                    onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Enter address"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowAddModal(false)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleAddUser} className="save-btn">
                                Add User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Modal */}
            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Bulk Actions ({selectedUsers.length} users selected)</h3>
                            <button onClick={() => setShowBulkModal(false)} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Action:</label>
                                <select
                                    value={bulkAction.action}
                                    onChange={(e) => setBulkAction(prev => ({ ...prev, action: e.target.value }))}
                                >
                                    <option value="">Select Action</option>
                                    <option value="approve">Approve</option>
                                    <option value="suspend">Suspend</option>
                                    <option value="activate">Activate</option>
                                    <option value="delete">Delete</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Reason (Optional):</label>
                                <textarea
                                    value={bulkAction.reason}
                                    onChange={(e) => setBulkAction(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Enter reason for this action"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowBulkModal(false)} className="cancel-btn">
                                Cancel
                            </button>
                            <button onClick={handleBulkAction} className="save-btn">
                                Apply Action
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>User Details - {selectedUser.name}</h3>
                            <button onClick={() => setShowUserDetails(false)} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="user-details">
                                <div className="detail-group">
                                    <h4>Basic Information</h4>
                                    <p><strong>Name:</strong> {selectedUser.name}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                    <p><strong>Role:</strong> 
                                        <span 
                                            className="role-badge"
                                            style={{ backgroundColor: getRoleColor(selectedUser.role) }}
                                        >
                                            {selectedUser.role}
                                        </span>
                                    </p>
                                    <p><strong>Status:</strong> 
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                                        >
                                            {selectedUser.status}
                                        </span>
                                    </p>
                                    <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                                    <p><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
                                    <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                                </div>
                                
                                <div className="detail-group">
                                    <h4>Role Management</h4>
                                    <div className="role-actions">
                                        <button 
                                            onClick={() => handleUserRoleUpdate(selectedUser._id, 'user')}
                                            className={`role-btn ${selectedUser.role === 'user' ? 'active' : ''}`}
                                        >
                                            User
                                        </button>
                                        <button 
                                            onClick={() => handleUserRoleUpdate(selectedUser._id, 'field_staff')}
                                            className={`role-btn ${selectedUser.role === 'field_staff' ? 'active' : ''}`}
                                        >
                                            Field Staff
                                        </button>
                                    </div>
                                </div>

                                <div className="detail-group">
                                    <h4>Status Management</h4>
                                    <div className="status-actions">
                                        {selectedUser.status === 'pending' && (
                                            <button 
                                                onClick={() => handleUserStatusUpdate(selectedUser._id, 'active')}
                                                className="status-btn approve"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {selectedUser.status === 'active' && (
                                            <button 
                                                onClick={() => handleUserStatusUpdate(selectedUser._id, 'suspended')}
                                                className="status-btn suspend"
                                            >
                                                Suspend
                                            </button>
                                        )}
                                        {selectedUser.status === 'suspended' && (
                                            <button 
                                                onClick={() => handleUserStatusUpdate(selectedUser._id, 'active')}
                                                className="status-btn activate"
                                            >
                                                Activate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
















