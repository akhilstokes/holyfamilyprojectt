import React, { useState, useEffect } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, ProgressIndicator, Tooltip } from '../common/RoleThemeProvider';

// Manager Verification Dashboard
export const ManagerVerificationDashboard = () => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [pendingBarrels, setPendingBarrels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBarrel, setSelectedBarrel] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchPendingBarrels();
        const interval = setInterval(fetchPendingBarrels, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchPendingBarrels = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/barrels/verification/pending', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setPendingBarrels(data.barrels || []);
        } catch (error) {
            console.error('Error fetching pending barrels:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyBarrel = async (barrelId, action, notes = '') => {
        try {
            const response = await fetch(`/api/barrels/verification/${barrelId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    notes,
                    verifiedBy: userRole,
                    verifiedAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action} barrel`);
            }

            // Update local state
            setPendingBarrels(prev => 
                prev.filter(barrel => barrel.barrelId !== barrelId)
            );

            // Send notification to relevant parties
            await sendNotification(barrelId, action);

        } catch (error) {
            console.error(`Error ${action}ing barrel:`, error);
        }
    };

    const sendNotification = async (barrelId, action) => {
        try {
            await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: 'BARREL_VERIFICATION',
                    recipientRole: action === 'approve' ? 'customer' : 'lab',
                    title: `Barrel ${barrelId} ${action === 'approve' ? 'Approved' : 'Rejected'}`,
                    message: `Barrel ${barrelId} has been ${action === 'approve' ? 'approved for billing' : 'rejected and requires review'}`,
                    priority: 'medium',
                    data: { barrelId, action }
                })
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const filteredBarrels = pendingBarrels.filter(barrel => {
        if (filterStatus === 'all') return true;
        return barrel.status === filterStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            'pending_verification': 'warning',
            'verified': 'success',
            'rejected': 'error',
            'damaged': 'error'
        };
        return colors[status] || 'info';
    };

    return (
        <div className="manager-verification-dashboard">
            <div className="dashboard-header">
                <h2>Barrel Verification Dashboard</h2>
                <div className="filter-controls">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="pending_verification">Pending Verification</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="damaged">Damaged</option>
                    </select>
                </div>
            </div>

            <div className="verification-grid">
                {/* Pending Barrels List */}
                <RoleDashboardCard title="Pending Verification" icon="fas fa-clipboard-check" className="mb-6">
                    {loading ? (
                        <div className="loading">Loading barrels...</div>
                    ) : filteredBarrels.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-check-circle"></i>
                            <p>No barrels pending verification</p>
                        </div>
                    ) : (
                        <div className="barrel-list">
                            {filteredBarrels.map((barrel) => (
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
                                            <span>DRC:</span>
                                            <span>{barrel.drc}%</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Effective Rubber:</span>
                                            <span>{barrel.effectiveRubber} L</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Market Rate:</span>
                                            <span>₹{barrel.marketRate}/L</span>
                                        </div>
                                        <div className="detail-row total">
                                            <span>Calculated Price:</span>
                                            <span>₹{barrel.calculatedPrice}</span>
                                        </div>
                                    </div>

                                    <div className="barrel-actions">
                                        <Tooltip content="Approve this barrel for customer billing">
                                            <RoleButton
                                                onClick={() => verifyBarrel(barrel.barrelId, 'approve', verificationNotes)}
                                                size="small"
                                                disabled={barrel.status !== 'pending_verification'}
                                            >
                                                <i className="fas fa-check"></i> Approve
                                            </RoleButton>
                                        </Tooltip>
                                        
                                        <Tooltip content="Reject this barrel and send back to lab">
                                            <RoleButton
                                                onClick={() => verifyBarrel(barrel.barrelId, 'reject', verificationNotes)}
                                                size="small"
                                                variant="outline"
                                                disabled={barrel.status !== 'pending_verification'}
                                            >
                                                <i className="fas fa-times"></i> Reject
                                            </RoleButton>
                                        </Tooltip>
                                        
                                        <Tooltip content="View detailed barrel information">
                                            <RoleButton
                                                onClick={() => setSelectedBarrel(barrel)}
                                                size="small"
                                                variant="outline"
                                            >
                                                <i className="fas fa-eye"></i> Details
                                            </RoleButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </RoleDashboardCard>

                {/* Verification Summary */}
                <RoleDashboardCard title="Verification Summary" icon="fas fa-chart-bar" className="mb-6">
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-value">{pendingBarrels.length}</span>
                            <span className="stat-label">Pending Review</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                {pendingBarrels.filter(b => b.status === 'verified').length}
                            </span>
                            <span className="stat-label">Verified Today</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">
                                ₹{pendingBarrels.reduce((sum, b) => sum + (b.calculatedPrice || 0), 0).toFixed(2)}
                            </span>
                            <span className="stat-label">Total Value</span>
                        </div>
                    </div>
                    
                    <ProgressIndicator 
                        progress={pendingBarrels.length > 0 ? 
                            (pendingBarrels.filter(b => b.status === 'verified').length / pendingBarrels.length) * 100 : 0
                        }
                        label="Verification Progress"
                    />
                </RoleDashboardCard>

                {/* Verification Notes */}
                <RoleDashboardCard title="Verification Notes" icon="fas fa-sticky-note" className="mb-6">
                    <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add notes for verification decisions..."
                        className="notes-textarea"
                        rows="4"
                    />
                    <div className="notes-actions">
                        <RoleButton
                            onClick={() => setVerificationNotes('')}
                            size="small"
                            variant="outline"
                        >
                            Clear Notes
                        </RoleButton>
                    </div>
                </RoleDashboardCard>
            </div>

            {/* Barrel Detail Modal */}
            {selectedBarrel && (
                <BarrelDetailModal
                    barrel={selectedBarrel}
                    onClose={() => setSelectedBarrel(null)}
                    onVerify={(action) => {
                        verifyBarrel(selectedBarrel.barrelId, action, verificationNotes);
                        setSelectedBarrel(null);
                    }}
                />
            )}
        </div>
    );
};

// Barrel Detail Modal Component
const BarrelDetailModal = ({ barrel, onClose, onVerify }) => {
    const [notes, setNotes] = useState('');

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Barrel Details - {barrel.barrelId}</h3>
                    <button onClick={onClose} className="close-button">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="barrel-details-grid">
                        <div className="detail-section">
                            <h4>Physical Properties</h4>
                            <div className="detail-item">
                                <span>Capacity:</span>
                                <span>{barrel.capacity} L</span>
                            </div>
                            <div className="detail-item">
                                <span>Current Weight:</span>
                                <span>{barrel.currentWeight || 'N/A'} kg</span>
                            </div>
                            <div className="detail-item">
                                <span>Location:</span>
                                <span>{barrel.currentLocation || 'Unknown'}</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>DRC Measurements</h4>
                            <div className="detail-item">
                                <span>DRC Percentage:</span>
                                <span>{barrel.drc}%</span>
                            </div>
                            <div className="detail-item">
                                <span>Effective Rubber:</span>
                                <span>{barrel.effectiveRubber} L</span>
                            </div>
                            <div className="detail-item">
                                <span>Market Rate:</span>
                                <span>₹{barrel.marketRate}/L</span>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>Calculations</h4>
                            <div className="detail-item total">
                                <span>Calculated Price:</span>
                                <span>₹{barrel.calculatedPrice}</span>
                            </div>
                            <div className="detail-item">
                                <span>Status:</span>
                                <StatusIndicator status={barrel.status === 'pending_verification' ? 'warning' : 'success'}>
                                    {barrel.status.replace('_', ' ')}
                                </StatusIndicator>
                            </div>
                        </div>
                    </div>

                    <div className="verification-notes">
                        <label>Verification Notes:</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add verification notes..."
                            rows="3"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <RoleButton onClick={onClose} variant="outline">
                        Cancel
                    </RoleButton>
                    <RoleButton onClick={() => onVerify('reject')} variant="outline">
                        Reject
                    </RoleButton>
                    <RoleButton onClick={() => onVerify('approve')}>
                        Approve
                    </RoleButton>
                </div>
            </div>
        </div>
    );
};

export default ManagerVerificationDashboard;
