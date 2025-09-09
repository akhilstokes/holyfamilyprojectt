import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminLeavePage.css';

const AdminLeavePage = () => {
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchLeaves();
        fetchLeaveStats();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/leave/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeaves(res.data);
        } catch (err) {
            setError('Failed to fetch leave requests');
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaveStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/leave/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error('Error fetching leave stats:', err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/leave/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeaves();
            fetchLeaveStats();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating leave status');
        }
    };

    const filteredLeaves = leaves.filter(leave => {
        if (filter === 'all') return true;
        return leave.status === filter;
    });

    if (loading) {
        return (
            <div className="admin-leave-page">
                <div className="loading">Loading leave requests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-leave-page">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-leave-page">
            <div className="page-header">
                <h1>Leave Management </h1>
                <p>Manage and review staff leave requests</p>
                <div style={{ marginTop: 8 }}>
                    <button
                        className="add-rate-btn"
                        onClick={async () => {
                            try {
                                const res = await axios.post('/api/user-management/seed-demo-staff', {}, { headers: { Authorization: `Bearer ${token}` } });
                                alert(`${res.data.message}.\nEmail: ${res.data.credentials.email}\nPassword: ${res.data.credentials.password}`);
                            } catch (e) {
                                alert(e.response?.data?.message || 'Failed to seed demo staff');
                            }
                        }}
                    >
                        Seed Demo Staff
                    </button>
                </div>
            </div>

            <div className="stats-overview">
                <div className="stat-card total">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Requests</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-number">{stats.approved}</div>
                    <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card rejected">
                    <div className="stat-number">{stats.rejected}</div>
                    <div className="stat-label">Rejected</div>
                </div>
                <div className="stat-card completion">
                    <div className="stat-number">
                        {stats.total > 0 ? Math.round(((stats.approved + stats.rejected) / stats.total) * 100) : 0}%
                    </div>
                    <div className="stat-label">Completion Rate</div>
                </div>
            </div>

            <div className="controls-section">
                <div className="filter-controls">
                    <label>Filter by Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All Requests</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="summary-info">
                    <span>Showing {filteredLeaves.length} of {leaves.length} requests</span>
                </div>
            </div>

            <div className="leaves-table-container">
                <h2>Leave Requests</h2>
                {filteredLeaves.length === 0 ? (
                    <div className="no-data">
                        {filter === 'all' ? 'No leave requests found' : `No ${filter} leave requests found`}
                    </div>
                ) : (
                    <table className="leaves-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Leave Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Duration</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Applied On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map(leave => {
                                const startDate = new Date(leave.startDate);
                                const endDate = new Date(leave.endDate);
                                const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                                
                                return (
                                    <tr key={leave._id} className={`status-${leave.status}`}>
                                        <td>
                                            <div className="staff-info">
                                                <strong>{leave.staff?.name || 'Unknown'}</strong>
                                                <small>{leave.staff?.email || 'No email'}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`leave-type ${leave.leaveType.toLowerCase()}`}>
                                                {leave.leaveType}
                                            </span>
                                        </td>
                                        <td>{startDate.toLocaleDateString()}</td>
                                        <td>{endDate.toLocaleDateString()}</td>
                                        <td>{duration} day{duration !== 1 ? 's' : ''}</td>
                                        <td>
                                            <div className="reason-text" title={leave.reason}>
                                                {leave.reason?.length > 30 ? `${leave.reason.substring(0, 30)}...` : leave.reason}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${leave.status}`}>
                                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{new Date(leave.appliedAt || leave.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {leave.status === 'pending' ? (
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-approve"
                                                        onClick={() => updateStatus(leave._id, 'approved')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        className="btn-reject"
                                                        onClick={() => updateStatus(leave._id, 'rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="status-info">
                                                    <span className="completed-status">
                                                        {leave.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                                                    </span>
                                                    {leave.approvedBy && (
                                                        <small>by Admin</small>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminLeavePage;
