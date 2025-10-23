import React, { useState, useEffect } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, FloatingPrompt, ProgressIndicator } from '../common/RoleThemeProvider';
import { DRCMeasurement } from '../workflows/BarrelQRScanner';

// Lab Staff Dashboard with DRC Measurement
export const LabStaffDashboard = () => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [receivedBarrels, setReceivedBarrels] = useState([]);
    const [selectedBarrel, setSelectedBarrel] = useState(null);
    const [todayStats, setTodayStats] = useState({
        barrelsReceived: 0,
        drcMeasured: 0,
        pendingVerification: 0,
        totalValue: 0
    });
    const [showPrompt, setShowPrompt] = useState(true);

    useEffect(() => {
        fetchReceivedBarrels();
        fetchTodayStats();
    }, []);

    const fetchReceivedBarrels = async () => {
        try {
            const response = await fetch('/api/lab/barrels/received', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setReceivedBarrels(data.barrels || []);
        } catch (error) {
            console.error('Error fetching received barrels:', error);
        }
    };

    const fetchTodayStats = async () => {
        try {
            const response = await fetch('/api/lab/stats/today', {
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

    const handleDRCUpdated = (drcData) => {
        setReceivedBarrels(prev => 
            prev.map(barrel => 
                barrel.barrelId === drcData.barrelId 
                    ? { ...barrel, ...drcData }
                    : barrel
            )
        );
        fetchTodayStats();
    };

    const getStatusColor = (status) => {
        const colors = {
            'received': 'info',
            'drc_measured': 'warning',
            'pending_verification': 'warning',
            'verified': 'success',
            'rejected': 'error'
        };
        return colors[status] || 'info';
    };

    return (
        <div className="lab-staff-dashboard">
            <div className="dashboard-header">
                <h2>Lab Staff Dashboard</h2>
                <div className="header-actions">
                    <RoleButton
                        onClick={fetchReceivedBarrels}
                        variant="outline"
                    >
                        <i className="fas fa-sync"></i>
                        Refresh Barrels
                    </RoleButton>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Today's Statistics */}
                <RoleDashboardCard title="Today's Performance" icon="fas fa-chart-line" className="mb-6">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.barrelsReceived}</div>
                            <div className="stat-label">Barrels Received</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.drcMeasured}</div>
                            <div className="stat-label">DRC Measured</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{todayStats.pendingVerification}</div>
                            <div className="stat-label">Pending Verification</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">₹{todayStats.totalValue.toFixed(2)}</div>
                            <div className="stat-label">Total Value</div>
                        </div>
                    </div>
                    
                    <ProgressIndicator 
                        progress={todayStats.barrelsReceived > 0 ? 
                            (todayStats.drcMeasured / todayStats.barrelsReceived) * 100 : 0
                        }
                        label="DRC Measurement Progress"
                    />
                </RoleDashboardCard>

                {/* Received Barrels List */}
                <RoleDashboardCard title="Received Barrels" icon="fas fa-boxes" className="mb-6">
                    {receivedBarrels.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-box-open"></i>
                            <p>No barrels received today</p>
                        </div>
                    ) : (
                        <div className="barrel-list">
                            {receivedBarrels.map((barrel) => (
                                <div key={barrel.barrelId} className="barrel-item">
                                    <div className="barrel-header">
                                        <span className="barrel-id">Barrel {barrel.barrelId}</span>
                                        <StatusIndicator status={getStatusColor(barrel.status)}>
                                            {barrel.status.replace('_', ' ')}
                                        </StatusIndicator>
                                    </div>
                                    
                                    <div className="barrel-details">
                                        <div className="detail-row">
                                            <span>Capacity:</span>
                                            <span>{barrel.capacity} L</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Weight:</span>
                                            <span>{barrel.currentWeight || 'N/A'} kg</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Received:</span>
                                            <span>{new Date(barrel.receivedAt).toLocaleTimeString()}</span>
                                        </div>
                                        {barrel.drc && (
                                            <div className="detail-row">
                                                <span>DRC:</span>
                                                <span>{barrel.drc}%</span>
                                            </div>
                                        )}
                                        {barrel.calculatedPrice && (
                                            <div className="detail-row total">
                                                <span>Price:</span>
                                                <span>₹{barrel.calculatedPrice}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="barrel-actions">
                                        <RoleButton
                                            onClick={() => setSelectedBarrel(barrel)}
                                            size="small"
                                            disabled={barrel.status === 'verified' || barrel.status === 'rejected'}
                                        >
                                            <i className="fas fa-flask"></i>
                                            {barrel.drc ? 'Update DRC' : 'Measure DRC'}
                                        </RoleButton>
                                        
                                        <RoleButton
                                            onClick={() => markAsDamaged(barrel.barrelId)}
                                            size="small"
                                            variant="outline"
                                            disabled={barrel.status === 'verified'}
                                        >
                                            <i className="fas fa-exclamation-triangle"></i>
                                            Report Damage
                                        </RoleButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </RoleDashboardCard>

                {/* DRC Measurement Component */}
                {selectedBarrel && (
                    <DRCMeasurement
                        barrelId={selectedBarrel.barrelId}
                        onDRCUpdated={handleDRCUpdated}
                    />
                )}

                {/* Quality Control */}
                <RoleDashboardCard title="Quality Control" icon="fas fa-microscope" className="mb-6">
                    <div className="quality-metrics">
                        <div className="metric-item">
                            <span className="metric-label">Average DRC Today:</span>
                            <span className="metric-value">
                                {calculateAverageDRC()}%
                            </span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">High Quality Barrels:</span>
                            <span className="metric-value">
                                {receivedBarrels.filter(b => b.drc && b.drc >= 30).length}
                            </span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Low Quality Barrels:</span>
                            <span className="metric-value">
                                {receivedBarrels.filter(b => b.drc && b.drc < 20).length}
                            </span>
                        </div>
                    </div>
                </RoleDashboardCard>

                {/* Lab Equipment Status */}
                <RoleDashboardCard title="Equipment Status" icon="fas fa-tools" className="mb-6">
                    <div className="equipment-list">
                        <div className="equipment-item">
                            <StatusIndicator status="success">DRC Analyzer</StatusIndicator>
                            <span>Online</span>
                        </div>
                        <div className="equipment-item">
                            <StatusIndicator status="success">Weighing Scale</StatusIndicator>
                            <span>Calibrated</span>
                        </div>
                        <div className="equipment-item">
                            <StatusIndicator status="warning">Temperature Sensor</StatusIndicator>
                            <span>Needs Calibration</span>
                        </div>
                    </div>
                </RoleDashboardCard>
            </div>

            {/* Floating Prompt */}
            <FloatingPrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
            >
                <div className="prompt-content">
                    <h5>Lab Staff Workflow</h5>
                    <ol>
                        <li>Receive barrels from field staff</li>
                        <li>Measure DRC percentage accurately</li>
                        <li>System calculates effective rubber content</li>
                        <li>Submit for manager verification</li>
                        <li>Report any quality issues or damage</li>
                    </ol>
                </div>
            </FloatingPrompt>
        </div>
    );
};

// Helper functions
function calculateAverageDRC() {
    // This would be calculated from actual data
    return 28.5; // Placeholder
}

async function markAsDamaged(barrelId) {
    try {
        const response = await fetch('/api/barrels/report-damage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                barrelId,
                damageType: 'other',
                severity: 'medium',
                location: {
                    latitude: 0,
                    longitude: 0,
                    accuracy: 0
                },
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            alert('Damage reported successfully');
        }
    } catch (error) {
        console.error('Error reporting damage:', error);
    }
}

export default LabStaffDashboard;
