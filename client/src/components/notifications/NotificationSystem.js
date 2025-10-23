import React, { useState, useEffect, useCallback } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, FloatingPrompt } from '../common/RoleThemeProvider';

const renderDataValue = (v) => {
    if (v == null) return '-';
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return String(v);
    if (t === 'object') return v.name || v.email || v._id || JSON.stringify(v);
    return String(v);
};

// Notification Service
export class NotificationService {
    static async sendNotification(notification) {
        try {
            const response = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(notification)
            });

            if (!response.ok) {
                console.error('Failed to send notification:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    static async getNotifications(userId, userRole) {
        try {
            const response = await fetch(`/api/notifications?userId=${userId}&userRole=${userRole}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    static async markAsRead(notificationId) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    static async markAllAsRead(userId) {
        try {
            const response = await fetch(`/api/notifications/mark-all-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId })
            });

            return response.ok;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    // Specific notification methods
    static async notifyBarrelDelivery(customerId, barrelId, deliveryTime) {
        await this.sendNotification({
            type: 'BARREL_DELIVERY',
            recipientId: customerId,
            recipientRole: 'customer',
            title: 'Barrel Delivery Scheduled',
            message: `Your barrel ${barrelId} is scheduled for delivery at ${deliveryTime}`,
            priority: 'medium',
            data: { barrelId, deliveryTime }
        });
    }

    static async notifyStockUpdate(userRole, itemName, quantity, threshold) {
        await this.sendNotification({
            type: 'STOCK_UPDATE',
            recipientRole: userRole,
            title: 'Stock Level Update',
            message: `${itemName} stock is now ${quantity} units (${threshold}% of capacity)`,
            priority: quantity < threshold ? 'high' : 'low',
            data: { itemName, quantity, threshold }
        });
    }

    static async notifyWorkflowApproval(approverRole, entityType, entityId, requesterName) {
        await this.sendNotification({
            type: 'WORKFLOW_APPROVAL',
            recipientRole: approverRole,
            title: 'Approval Required',
            message: `${requesterName} requires approval for ${entityType} ${entityId}`,
            priority: 'high',
            data: { entityType, entityId, requesterName }
        });
    }

    static async notifyDamageReport(managerId, barrelId, damageType, severity) {
        await this.sendNotification({
            type: 'DAMAGE_REPORT',
            recipientId: managerId,
            recipientRole: 'manager',
            title: 'Barrel Damage Reported',
            message: `Barrel ${barrelId} has ${damageType} damage (${severity} severity)`,
            priority: severity === 'high' ? 'high' : 'medium',
            data: { barrelId, damageType, severity }
        });
    }

    static async notifyLumbRemoval(labId, barrelId, lumbPercentage) {
        await this.sendNotification({
            type: 'LUMB_REMOVAL',
            recipientId: labId,
            recipientRole: 'lab',
            title: 'Lumb Removal Required',
            message: `Barrel ${barrelId} has ${lumbPercentage.toFixed(2)}% lumb and requires removal`,
            priority: 'high',
            data: { barrelId, lumbPercentage }
        });
    }
}

// Notification Center Component
export const NotificationCenter = () => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all'); // all, unread, high, medium, low

    useEffect(() => {
        fetchNotifications();
        // Set up real-time updates
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const data = await NotificationService.getNotifications(user._id, userRole);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        const success = await NotificationService.markAsRead(notificationId);
        if (success) {
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const success = await NotificationService.markAllAsRead(user._id);
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'BARREL_DELIVERY': 'fas fa-truck',
            'STOCK_UPDATE': 'fas fa-boxes',
            'WORKFLOW_APPROVAL': 'fas fa-check-circle',
            'DAMAGE_REPORT': 'fas fa-exclamation-triangle',
            'LUMB_REMOVAL': 'fas fa-tools',
            'ATTENDANCE': 'fas fa-calendar-check',
            'LEAVE_REQUEST': 'fas fa-calendar-times',
            'SYSTEM_ALERT': 'fas fa-bell'
        };
        return icons[type] || 'fas fa-bell';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'high': 'error',
            'medium': 'warning',
            'low': 'info'
        };
        return colors[priority] || 'info';
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'high') return notification.priority === 'high';
        if (filter === 'medium') return notification.priority === 'medium';
        if (filter === 'low') return notification.priority === 'low';
        return true;
    });

    return (
        <div className="notification-center">
            <RoleDashboardCard title="Notifications" className="mb-6">
                <div className="notification-header">
                    <div className="notification-filters">
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Notifications</option>
                            <option value="unread">Unread ({unreadCount})</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                        </select>
                    </div>
                    
                    <div className="notification-actions">
                        {unreadCount > 0 && (
                            <RoleButton onClick={markAllAsRead} size="small" variant="outline">
                                Mark All Read
                            </RoleButton>
                        )}
                    </div>
                </div>

                <div className="notification-list">
                    {loading ? (
                        <div className="loading">Loading notifications...</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="no-notifications">
                            <i className="fas fa-bell-slash"></i>
                            <p>No notifications found</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div 
                                key={notification._id} 
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => !notification.read && markAsRead(notification._id)}
                            >
                                <div className="notification-icon">
                                    <i className={getNotificationIcon(notification.type)}></i>
                                </div>
                                
                                <div className="notification-content">
                                    <div className="notification-header">
                                        <h4 className="notification-title">{notification.title}</h4>
                                        <div className="notification-meta">
                                            <StatusIndicator status={getPriorityColor(notification.priority)}>
                                                {notification.priority}
                                            </StatusIndicator>
                                            <span className="notification-time">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="notification-message">{notification.message}</p>
                                    
                                    {notification.data && (
                                        <div className="notification-data">
                                            {Object.entries(notification.data).map(([key, value]) => (
                                                <span key={key} className="data-item">
                                                    <strong>{key}:</strong> {renderDataValue(value)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {!notification.read && (
                                    <div className="notification-indicator">
                                        <div className="unread-dot"></div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </RoleDashboardCard>
        </div>
    );
};

// Real-time Alert System
export const AlertSystem = () => {
    const { userRole } = useRoleTheme();
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Set up WebSocket connection for real-time alerts
        const ws = new WebSocket(`ws://localhost:5000/alerts-stream`);
        
        ws.onopen = () => {
            setIsConnected(true);
        };
        
        ws.onmessage = (event) => {
            const alert = JSON.parse(event.data);
            setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
            
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                new Notification(alert.title, {
                    body: alert.message,
                    icon: '/favicon.ico'
                });
            }
        };
        
        ws.onclose = () => {
            setIsConnected(false);
        };
        
        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        return () => {
            ws.close();
        };
    }, []);

    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    return (
        <div className="alert-system">
            {alerts.map((alert) => (
                <FloatingPrompt
                    key={alert.id}
                    visible={true}
                    onClose={() => dismissAlert(alert.id)}
                    className={`alert-prompt ${alert.priority}`}
                >
                    <div className="alert-content">
                        <div className="alert-header">
                            <i className={`${getNotificationIcon(alert.type)} text-${getPriorityColor(alert.priority)}`}></i>
                            <h5>{alert.title}</h5>
                        </div>
                        <p>{alert.message}</p>
                        {alert.action && (
                            <div className="alert-actions">
                                <RoleButton size="small" onClick={alert.action.handler}>
                                    {alert.action.label}
                                </RoleButton>
                            </div>
                        )}
                    </div>
                </FloatingPrompt>
            ))}
        </div>
    );
};

// Workflow Progress Notifications
export const WorkflowProgressNotification = ({ workflowId, currentStep, totalSteps, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const newProgress = (currentStep / totalSteps) * 100;
        setProgress(newProgress);
        
        if (currentStep >= totalSteps) {
            setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 3000);
        }
    }, [currentStep, totalSteps, onComplete]);

    if (!isVisible) return null;

    return (
        <FloatingPrompt visible={isVisible} className="workflow-progress">
            <div className="progress-content">
                <h5>Workflow Progress</h5>
                <ProgressIndicator 
                    progress={progress}
                    label={`Step ${currentStep} of ${totalSteps}`}
                />
                <p>Workflow ID: {workflowId}</p>
            </div>
        </FloatingPrompt>
    );
};

export default NotificationService;

