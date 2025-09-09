import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AdminHome.css';

const AdminHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        suspendedUsers: 0,
        totalLeaves: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
        rejectedLeaves: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        // Only fetch stats if user is authenticated and is admin
        if (isAuthenticated && user && user.role === 'admin') {
            fetchDashboardStats();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }
            
            // Fetch user statistics
            const userResponse = await axios.get('http://localhost:5000/api/user-management', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch leave statistics
            const leaveResponse = await axios.get('http://localhost:5000/api/leave/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (userResponse.data.success && leaveResponse.data.success) {
                const userStats = userResponse.data.stats;
                const leaveStats = leaveResponse.data;
                
                setStats({
                    totalUsers: userResponse.data.total || 0,
                    activeUsers: userStats.find(s => s._id === 'active')?.count || 0,
                    suspendedUsers: userStats.find(s => s._id === 'suspended')?.count || 0,
                    totalLeaves: leaveStats.total || 0,
                    pendingLeaves: leaveStats.pending || 0,
                    approvedLeaves: leaveStats.approved || 0,
                    rejectedLeaves: leaveStats.rejected || 0
                });
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Authentication expired. Please log in again.');
            } else {
                setError('Failed to fetch dashboard statistics');
            }
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // If not authenticated or not admin, show appropriate message
    if (!isAuthenticated) {
        return (
            <div className="admin-home">
                <div className="error-message">Please log in to access the admin dashboard.</div>
            </div>
        );
    }

    if (user && user.role !== 'admin') {
        return (
            <div className="admin-home">
                <div className="error-message">Access denied. Admin privileges required.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-home">
                <div className="loading">Loading dashboard statistics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-home">
                <div className="error-message">{error}</div>
                <button 
                    className="retry-btn"
                    onClick={fetchDashboardStats}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="admin-home">
            <div className="dashboard-header">
                <h1>Holy Family Admin Dashboard</h1>
               
            </div>

            <div className="stats-grid">
                <div className="stat-card users-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <div className="stat-number">{stats.totalUsers}</div>
                        <div className="stat-details">
                            <span className="active-users">Active: {stats.activeUsers}</span>
                            <span className="suspended-users">Suspended: {stats.suspendedUsers}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card leaves-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <h3>Leave Management</h3>
                        <div className="stat-number">{stats.totalLeaves}</div>
                        <div className="stat-details">
                            <span className="pending-leaves">Pending: {stats.pendingLeaves}</span>
                            <span className="approved-leaves">Approved: {stats.approvedLeaves}</span>
                            <span className="rejected-leaves">Rejected: {stats.rejectedLeaves}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card completion-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Leave Completion Rate</h3>
                        <div className="stat-number">
                            {stats.totalLeaves > 0 
                                ? Math.round(((stats.approvedLeaves + stats.rejectedLeaves) / stats.totalLeaves) * 100)
                                : 0}%
                        </div>
                        <div className="stat-details">
                            <span>Completed: {stats.approvedLeaves + stats.rejectedLeaves}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card staff-card">
                    <div className="stat-icon">👷</div>
                    <div className="stat-content">
                        <h3>Staff Overview</h3>
                        <div className="stat-number">{stats.activeUsers}</div>
                        <div className="stat-details">
                            <span>Active Staff Members</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button className="action-btn" onClick={() => window.location.href = '/admin/user-management'}>
                        Manage Users
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/leave'}>
                        Review Leaves
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/manage-rates'}>
                        Manage Rates
                    </button>
                    <button className="action-btn" onClick={() => window.location.href = '/admin/stock'}>
                        Stock Management
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;