import React, { useState, useEffect } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator } from '../common/RoleThemeProvider';

// Audit Logging Service
export class AuditLogger {
    static async logAction(action, details, userId, userRole) {
        try {
            const logEntry = {
                action,
                details,
                userId,
                userRole,
                timestamp: new Date().toISOString(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            };

            const response = await fetch('/api/audit/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(logEntry)
            });

            if (!response.ok) {
                console.error('Failed to log audit entry:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging audit entry:', error);
        }
    }

    static async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown';
        }
    }

    // Specific logging methods for different actions
    static async logBarrelAction(action, barrelId, details = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await this.logAction('BARREL_ACTION', {
            barrelId,
            action,
            ...details
        }, user._id, user.role);
    }

    static async logWorkerAction(action, workerId, details = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await this.logAction('WORKER_ACTION', {
            workerId,
            action,
            ...details
        }, user._id, user.role);
    }

    static async logCustomerAction(action, customerId, details = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await this.logAction('CUSTOMER_ACTION', {
            customerId,
            action,
            ...details
        }, user._id, user.role);
    }

    static async logApprovalAction(action, entityType, entityId, details = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await this.logAction('APPROVAL_ACTION', {
            entityType,
            entityId,
            action,
            ...details
        }, user._id, user.role);
    }

    static async logSystemAction(action, details = {}) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await this.logAction('SYSTEM_ACTION', {
            action,
            ...details
        }, user._id, user.role);
    }
}

// Audit Log Viewer Component
export const AuditLogViewer = ({ entityType, entityId, userRole }) => {
    const { getRoleColor } = useRoleTheme();
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        userRole: '',
        dateRange: '7d',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    useEffect(() => {
        fetchAuditLogs();
    }, [entityType, entityId, filters, pagination.page]);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                entityType: entityType || '',
                entityId: entityId || '',
                action: filters.action,
                userRole: filters.userRole,
                dateRange: filters.dateRange,
                search: filters.search,
                page: pagination.page,
                limit: pagination.limit
            });

            const response = await fetch(`/api/audit/logs?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            setAuditLogs(data.logs);
            setPagination(prev => ({ ...prev, total: data.total }));
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportAuditLogs = async () => {
        try {
            const queryParams = new URLSearchParams({
                entityType: entityType || '',
                entityId: entityId || '',
                action: filters.action,
                userRole: filters.userRole,
                dateRange: filters.dateRange,
                search: filters.search,
                format: 'csv'
            });

            const response = await fetch(`/api/audit/export?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (error) {
            console.error('Error exporting audit logs:', error);
        }
    };

    const getActionIcon = (action) => {
        const actionIcons = {
            'BARREL_ACTION': 'fas fa-drum',
            'WORKER_ACTION': 'fas fa-user',
            'CUSTOMER_ACTION': 'fas fa-users',
            'APPROVAL_ACTION': 'fas fa-check-circle',
            'SYSTEM_ACTION': 'fas fa-cog',
            'CREATE': 'fas fa-plus',
            'UPDATE': 'fas fa-edit',
            'DELETE': 'fas fa-trash',
            'APPROVE': 'fas fa-check',
            'REJECT': 'fas fa-times',
            'LOGIN': 'fas fa-sign-in-alt',
            'LOGOUT': 'fas fa-sign-out-alt'
        };
        return actionIcons[action] || 'fas fa-info-circle';
    };

    const getActionColor = (action) => {
        const actionColors = {
            'CREATE': 'success',
            'UPDATE': 'info',
            'DELETE': 'error',
            'APPROVE': 'success',
            'REJECT': 'warning',
            'LOGIN': 'info',
            'LOGOUT': 'warning'
        };
        return actionColors[action] || 'info';
    };

    return (
        <div className="audit-log-viewer">
            <RoleDashboardCard title="Audit Logs" className="mb-6">
                {/* Filters */}
                <div className="audit-filters">
                    <div className="filter-row">
                        <div className="filter-group">
                            <label>Action Type</label>
                            <select 
                                value={filters.action}
                                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Create</option>
                                <option value="UPDATE">Update</option>
                                <option value="DELETE">Delete</option>
                                <option value="APPROVE">Approve</option>
                                <option value="REJECT">Reject</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>User Role</label>
                            <select 
                                value={filters.userRole}
                                onChange={(e) => setFilters(prev => ({ ...prev, userRole: e.target.value }))}
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="labour">Labour</option>
                                <option value="field_staff">Field Staff</option>
                                <option value="lab">Lab</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Date Range</label>
                            <select 
                                value={filters.dateRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                            >
                                <option value="1d">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Search</label>
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>
                    
                    <div className="filter-actions">
                        <RoleButton onClick={fetchAuditLogs} size="small">
                            <i className="fas fa-search"></i> Search
                        </RoleButton>
                        <RoleButton onClick={exportAuditLogs} size="small" variant="outline">
                            <i className="fas fa-download"></i> Export
                        </RoleButton>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="audit-logs-table">
                    {loading ? (
                        <div className="loading">Loading audit logs...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Details</th>
                                    <th>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="timestamp">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-cell">
                                                <i className={`${getActionIcon(log.action)} text-${getActionColor(log.action)}`}></i>
                                                <span>{log.action}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                <span className="user-name">{log.userName}</span>
                                                <span className="user-id">#{log.userId?.slice(-6)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <StatusIndicator status={getActionColor(log.action)}>
                                                {log.userRole}
                                            </StatusIndicator>
                                        </td>
                                        <td>
                                            <div className="details">
                                                {Object.entries(log.details).map(([key, value]) => (
                                                    <div key={key} className="detail-item">
                                                        <span className="detail-key">{key}:</span>
                                                        <span className="detail-value">{JSON.stringify(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ip-address">{log.ipAddress}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <RoleButton 
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        size="small"
                        variant="outline"
                    >
                        Previous
                    </RoleButton>
                    
                    <span className="page-info">
                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    
                    <RoleButton 
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                        size="small"
                        variant="outline"
                    >
                        Next
                    </RoleButton>
                </div>
            </RoleDashboardCard>
        </div>
    );
};

// Real-time Activity Monitor
export const ActivityMonitor = () => {
    const { userRole } = useRoleTheme();
    const [activities, setActivities] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Set up WebSocket connection for real-time updates
        const ws = new WebSocket(`ws://localhost:5000/audit-stream`);
        
        ws.onopen = () => {
            setIsConnected(true);
        };
        
        ws.onmessage = (event) => {
            const activity = JSON.parse(event.data);
            setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
        };
        
        ws.onclose = () => {
            setIsConnected(false);
        };
        
        return () => {
            ws.close();
        };
    }, []);

    return (
        <RoleDashboardCard title="Real-time Activity" className="activity-monitor">
            <div className="connection-status">
                <StatusIndicator status={isConnected ? 'success' : 'error'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </StatusIndicator>
            </div>
            
            <div className="activity-list">
                {activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-header">
                            <i className={`${getActionIcon(activity.action)} text-${getActionColor(activity.action)}`}></i>
                            <span className="activity-action">{activity.action}</span>
                            <span className="activity-time">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="activity-details">
                            <span className="activity-user">{activity.userName} ({activity.userRole})</span>
                            <span className="activity-entity">{activity.entityType}: {activity.entityId}</span>
                        </div>
                    </div>
                ))}
            </div>
        </RoleDashboardCard>
    );
};

export default AuditLogger;

