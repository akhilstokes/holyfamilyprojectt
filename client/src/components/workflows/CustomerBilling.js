import React, { useState, useEffect } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, ProgressIndicator, Tooltip } from '../common/RoleThemeProvider';

// Customer Billing Dashboard
export const CustomerBillingDashboard = () => {
    const { userRole, getRoleColor } = useRoleTheme();
    const [verifiedBarrels, setVerifiedBarrels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBarrels, setSelectedBarrels] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchVerifiedBarrels();
        const interval = setInterval(fetchVerifiedBarrels, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchVerifiedBarrels = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/barrels/billing/verified', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setVerifiedBarrels(data.barrels || []);
        } catch (error) {
            console.error('Error fetching verified barrels:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalAmount = () => {
        return selectedBarrels.reduce((total, barrel) => total + (barrel.calculatedPrice || 0), 0);
    };

    const handleBarrelSelection = (barrelId, isSelected) => {
        if (isSelected) {
            const barrel = verifiedBarrels.find(b => b.barrelId === barrelId);
            if (barrel) {
                setSelectedBarrels(prev => [...prev, barrel]);
            }
        } else {
            setSelectedBarrels(prev => prev.filter(b => b.barrelId !== barrelId));
        }
    };

    const processPayment = async () => {
        if (selectedBarrels.length === 0) return;

        setIsProcessing(true);
        try {
            const response = await fetch('/api/barrels/billing/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    barrelIds: selectedBarrels.map(b => b.barrelId),
                    totalAmount: calculateTotalAmount(),
                    paymentMethod,
                    notes: paymentNotes,
                    paidAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Payment processing failed');
            }

            // Clear selections and refresh data
            setSelectedBarrels([]);
            setPaymentMethod('');
            setPaymentNotes('');
            await fetchVerifiedBarrels();

            // Send notification
            await sendPaymentNotification();

        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const sendPaymentNotification = async () => {
        try {
            await fetch('/api/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: 'PAYMENT_CONFIRMATION',
                    recipientRole: 'accountant',
                    title: 'Payment Processed',
                    message: `Customer payment of ₹${calculateTotalAmount().toFixed(2)} processed for ${selectedBarrels.length} barrels`,
                    priority: 'medium',
                    data: { 
                        totalAmount: calculateTotalAmount(),
                        barrelCount: selectedBarrels.length,
                        paymentMethod
                    }
                })
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'verified': 'success',
            'paid': 'success',
            'pending_payment': 'warning',
            'overdue': 'error'
        };
        return colors[status] || 'info';
    };

    return (
        <div className="customer-billing-dashboard">
            <div className="dashboard-header">
                <h2>Barrel Billing Dashboard</h2>
                <div className="billing-summary">
                    <span className="total-amount">
                        Total: ₹{calculateTotalAmount().toFixed(2)}
                    </span>
                    <span className="selected-count">
                        {selectedBarrels.length} barrels selected
                    </span>
                </div>
            </div>

            <div className="billing-grid">
                {/* Verified Barrels List */}
                <RoleDashboardCard title="Verified Barrels Ready for Payment" icon="fas fa-receipt" className="mb-6">
                    {loading ? (
                        <div className="loading">Loading verified barrels...</div>
                    ) : verifiedBarrels.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-check-circle"></i>
                            <p>No verified barrels available for payment</p>
                        </div>
                    ) : (
                        <div className="barrel-list">
                            {verifiedBarrels.map((barrel) => (
                                <div key={barrel.barrelId} className="barrel-item">
                                    <div className="barrel-header">
                                        <input
                                            type="checkbox"
                                            checked={selectedBarrels.some(b => b.barrelId === barrel.barrelId)}
                                            onChange={(e) => handleBarrelSelection(barrel.barrelId, e.target.checked)}
                                            className="barrel-checkbox"
                                        />
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
                                            <span>Rate:</span>
                                            <span>₹{barrel.marketRate}/L</span>
                                        </div>
                                        <div className="detail-row total">
                                            <span>Amount:</span>
                                            <span>₹{barrel.calculatedPrice}</span>
                                        </div>
                                    </div>

                                    <div className="barrel-actions">
                                        <Tooltip content="View detailed barrel information">
                                            <RoleButton
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

                {/* Payment Summary */}
                {selectedBarrels.length > 0 && (
                    <RoleDashboardCard title="Payment Summary" icon="fas fa-credit-card" className="mb-6">
                        <div className="payment-summary">
                            <div className="summary-table">
                                <div className="table-header">
                                    <span>Barrel ID</span>
                                    <span>Effective Rubber</span>
                                    <span>Rate</span>
                                    <span>Amount</span>
                                </div>
                                {selectedBarrels.map((barrel) => (
                                    <div key={barrel.barrelId} className="table-row">
                                        <span>{barrel.barrelId}</span>
                                        <span>{barrel.effectiveRubber} L</span>
                                        <span>₹{barrel.marketRate}/L</span>
                                        <span>₹{barrel.calculatedPrice}</span>
                                    </div>
                                ))}
                                <div className="table-footer">
                                    <span>Total Amount:</span>
                                    <span>₹{calculateTotalAmount().toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="payment-form">
                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Select Payment Method</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="upi">UPI</option>
                                        <option value="card">Card Payment</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Payment Notes (Optional)</label>
                                    <textarea
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        placeholder="Add any payment notes..."
                                        className="form-textarea"
                                        rows="3"
                                    />
                                </div>

                                <div className="payment-actions">
                                    <RoleButton
                                        onClick={() => setSelectedBarrels([])}
                                        variant="outline"
                                        disabled={isProcessing}
                                    >
                                        Clear Selection
                                    </RoleButton>
                                    <RoleButton
                                        onClick={processPayment}
                                        disabled={!paymentMethod || isProcessing}
                                        loading={isProcessing}
                                    >
                                        <i className="fas fa-credit-card"></i> Process Payment
                                    </RoleButton>
                                </div>
                            </div>
                        </div>
                    </RoleDashboardCard>
                )}

                {/* Billing History */}
                <RoleDashboardCard title="Recent Payments" icon="fas fa-history" className="mb-6">
                    <BillingHistory />
                </RoleDashboardCard>
            </div>
        </div>
    );
};

// Billing History Component
const BillingHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillingHistory();
    }, []);

    const fetchBillingHistory = async () => {
        try {
            const response = await fetch('/api/barrels/billing/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setHistory(data.payments || []);
        } catch (error) {
            console.error('Error fetching billing history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading payment history...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="no-data">
                <i className="fas fa-receipt"></i>
                <p>No payment history found</p>
            </div>
        );
    }

    return (
        <div className="billing-history">
            {history.map((payment, index) => (
                <div key={index} className="history-item">
                    <div className="history-header">
                        <span className="payment-id">Payment #{payment.id}</span>
                        <StatusIndicator status="success">
                            {payment.status}
                        </StatusIndicator>
                    </div>
                    <div className="history-details">
                        <div className="detail-row">
                            <span>Date:</span>
                            <span>{new Date(payment.paidAt).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                            <span>Amount:</span>
                            <span>₹{payment.totalAmount}</span>
                        </div>
                        <div className="detail-row">
                            <span>Method:</span>
                            <span>{payment.paymentMethod}</span>
                        </div>
                        <div className="detail-row">
                            <span>Barrels:</span>
                            <span>{payment.barrelCount}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CustomerBillingDashboard;
