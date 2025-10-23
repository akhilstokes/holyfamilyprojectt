import React, { useState, useEffect } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, FloatingPrompt, ProgressIndicator } from '../common/RoleThemeProvider';
import BarrelQRScanner from '../workflows/BarrelQRScanner';

// Field Staff Dashboard with QR Scanning and Location Updates
export const FieldStaffDashboard = () => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [todayStats, setTodayStats] = useState({
        barrelsScanned: 0,
        barrelsPickedUp: 0,
        barrelsDelivered: 0,
        barrelsDamaged: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [showPrompt, setShowPrompt] = useState(true);

    useEffect(() => {
        fetchTodayStats();
        fetchRecentActivity();
    }, []);

    const fetchTodayStats = async () => {
        try {
            const response = await fetch('/api/field-staff/stats/today', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setTodayStats(data);
        } catch (error) {
            console.error('Error fetching today stats:', error);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const response = await fetch('/api/field-staff/activity/recent', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setRecentActivity(data.activities || []);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        }
    };

    const handleBarrelScanned = (barrel) => {
        setTodayStats(prev => ({
            ...prev,
            barrelsScanned: prev.barrelsScanned + 1
        }));
        fetchRecentActivity();
    };

    const handleLocationUpdate = (barrelId, status, location) => {
        setTodayStats(prev => ({
            ...prev,
            [`barrels${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}`]: 
                prev[`barrels${status.charAt(0).toUpperCase() + status.slice(1).replace('_', '')}`] + 1
        }));
        fetchRecentActivity();
    };

    return (
        <div className="field-staff-dashboard">
            <div className="dashboard-header">
                <h2>Field Staff Dashboard</h2>
                <div className="header-actions">
                    <RoleButton
                        onClick={() => setIsScanning(!isScanning)}
                        variant={isScanning ? 'outline' : 'primary'}
                    >
                        <i className="fas fa-qrcode"></i>
                        {isScanning ? 'Stop Scanning' : 'Start QR Scanning'}
                    </RoleButton>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Today's Statistics */}
                <RoleDashboardCard title="Today's Performance" icon="fas fa-chart-line" className="mb-6">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.barrelsScanned}</div>
                            <div className="stat-label">Barrels Scanned</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.barrelsPickedUp}</div>
                            <div className="stat-label">Picked Up</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.barrelsDelivered}</div>
                            <div className="stat-label">Delivered</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.barrelsDamaged}</div>
                            <div className="stat-label">Damaged</div>
                        </div>
                    </div>
                    
                    <ProgressIndicator 
                        progress={todayStats.barrelsScanned > 0 ? 
                            (todayStats.barrelsDelivered / todayStats.barrelsScanned) * 100 : 0
                        }
                        label="Delivery Completion Rate"
                    />
                </RoleDashboardCard>

                {/* QR Scanner */}
                {isScanning && (
                    <BarrelQRScanner
                        onBarrelScanned={handleBarrelScanned}
                        onLocationUpdate={handleLocationUpdate}
                    />
                )}

                {/* Recent Activity */}
                <RoleDashboardCard title="Recent Activity" icon="fas fa-history" className="mb-6">
                    {recentActivity.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-clock"></i>
                            <p>No recent activity</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        <i className={`fas fa-${getActivityIcon(activity.type)}`}></i>
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">{activity.title}</div>
                                        <div className="activity-description">{activity.description}</div>
                                        <div className="activity-time">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <StatusIndicator status={getActivityStatus(activity.status)}>
                                        {activity.status}
                                    </StatusIndicator>
                                </div>
                            ))}
                        </div>
                    )}
                </RoleDashboardCard>

                {/* Quick Actions */}
                <RoleDashboardCard title="Quick Actions" icon="fas fa-bolt" className="mb-6">
                    <div className="quick-actions">
                        <RoleButton
                            onClick={() => setIsScanning(true)}
                            size="large"
                            className="action-button"
                        >
                            <i className="fas fa-qrcode"></i>
                            Scan Barrel QR
                        </RoleButton>
                        
                        <RoleButton
                            onClick={() => window.open('/field-staff/routes', '_blank')}
                            size="large"
                            variant="outline"
                            className="action-button"
                        >
                            <i className="fas fa-route"></i>
                            View Routes
                        </RoleButton>
                        
                        <RoleButton
                            onClick={() => window.open('/field-staff/reports', '_blank')}
                            size="large"
                            variant="outline"
                            className="action-button"
                        >
                            <i className="fas fa-chart-bar"></i>
                            Daily Reports
                        </RoleButton>
                    </div>
                </RoleDashboardCard>

                {/* Location Status */}
                <RoleDashboardCard title="Location Services" icon="fas fa-map-marker-alt" className="mb-6">
                    <div className="location-status">
                        <StatusIndicator status="success">
                            GPS Active
                        </StatusIndicator>
                        <p>Location tracking is enabled for barrel updates</p>
                        <RoleButton
                            onClick={() => navigator.geolocation.getCurrentPosition(
                                (pos) => console.log('Location updated'),
                                (err) => console.error('Location error:', err)
                            )}
                            size="small"
                            variant="outline"
                        >
                            Refresh Location
                        </RoleButton>
                    </div>
                </RoleDashboardCard>
            </div>

            {/* Floating Prompt */}
            <FloatingPrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
            >
                <div className="prompt-content">
                    <h5>Field Staff Workflow</h5>
                    <ol>
                        <li>Scan barrel QR codes at pickup locations</li>
                        <li>Update barrel status to "Picked Up"</li>
                        <li>Deliver barrels to lab and mark "Delivered"</li>
                        <li>Report any damage immediately</li>
                        <li>Track your daily performance metrics</li>
                    </ol>
                </div>
            </FloatingPrompt>
        </div>
    );
};

// Helper functions
function getActivityIcon(type) {
    const icons = {
        'scan': 'qrcode',
        'pickup': 'hand-paper',
        'delivery': 'truck',
        'damage': 'exclamation-triangle',
        'location': 'map-marker-alt'
    };
    return icons[type] || 'circle';
}

function getActivityStatus(status) {
    const statusMap = {
        'completed': 'success',
        'pending': 'warning',
        'error': 'error',
        'in_progress': 'info'
    };
    return statusMap[status] || 'info';
}

export default FieldStaffDashboard;
