import React, { useState, useEffect } from 'react';
import { FiTruck, FiPackage, FiUser, FiPhone, FiCalendar, FiRefreshCw, FiPlus } from 'react-icons/fi';
import './AccountantDeliveryIntake.css';

const AccountantDeliveryIntake = () => {
    const [loading, setLoading] = useState(false);
    const [deliveries, setDeliveries] = useState([]);
    const [showAddIntakeModal, setShowAddIntakeModal] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Form state for new delivery intake
    const [intakeForm, setIntakeForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        buyer: '',
        phone: '',
        barrels: '',
        drcPercent: '',
        totalKg: '',
        dryKg: '',
        marketRate: '',
        amount: '',
        perBarrel: ''
    });

    // Sample delivery data
    const [sampleDeliveries] = useState([
        {
            id: 1,
            date: '2026-01-03',
            buyer: 'Sanjay Trading Co',
            phone: '+91 9876543210',
            barrels: 25,
            drcPercent: 12,
            totalKg: 1200,
            dryKg: 1056,
            marketRate: 110,
            amount: 116160,
            perBarrel: 4646.4,
            status: 'verified'
        },
        {
            id: 2,
            date: '2026-01-02',
            buyer: 'ABC Suppliers',
            phone: '+91 9876543211',
            barrels: 30,
            drcPercent: 15,
            totalKg: 1500,
            dryKg: 1275,
            marketRate: 108,
            amount: 137700,
            perBarrel: 4590,
            status: 'pending'
        }
    ]);

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                setDeliveries(sampleDeliveries);
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error('Error fetching deliveries:', err);
            setDeliveries(sampleDeliveries);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setIntakeForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Auto-calculate amount when market rate and dry kg change
        if (name === 'marketRate' || name === 'dryKg') {
            const dryKg = name === 'dryKg' ? parseFloat(value) || 0 : parseFloat(intakeForm.dryKg) || 0;
            const marketRate = name === 'marketRate' ? parseFloat(value) || 0 : parseFloat(intakeForm.marketRate) || 0;
            const calculatedAmount = dryKg * marketRate;
            
            setIntakeForm(prev => ({
                ...prev,
                amount: calculatedAmount.toFixed(2)
            }));
        }

        // Auto-calculate per barrel when amount and barrels change
        if (name === 'barrels' || (name === 'marketRate' || name === 'dryKg')) {
            const barrels = name === 'barrels' ? parseFloat(value) || 0 : parseFloat(intakeForm.barrels) || 0;
            const amount = name === 'marketRate' || name === 'dryKg' 
                ? (parseFloat(intakeForm.dryKg) || 0) * (parseFloat(intakeForm.marketRate) || 0)
                : parseFloat(intakeForm.amount) || 0;
            
            if (barrels > 0) {
                const perBarrel = amount / barrels;
                setIntakeForm(prev => ({
                    ...prev,
                    perBarrel: perBarrel.toFixed(2)
                }));
            }
        }
    };

    const handleAddIntake = async () => {
        try {
            // Validate required fields
            if (!intakeForm.buyer || !intakeForm.barrels || !intakeForm.totalKg) {
                setError('Please fill all required fields');
                return;
            }

            const newDelivery = {
                id: deliveries.length + 1,
                ...intakeForm,
                barrels: parseInt(intakeForm.barrels),
                drcPercent: parseFloat(intakeForm.drcPercent),
                totalKg: parseFloat(intakeForm.totalKg),
                dryKg: parseFloat(intakeForm.dryKg),
                marketRate: parseFloat(intakeForm.marketRate),
                amount: parseFloat(intakeForm.amount),
                perBarrel: parseFloat(intakeForm.perBarrel),
                status: 'pending'
            };

            setDeliveries(prev => [newDelivery, ...prev]);
            
            // Reset form
            setIntakeForm({
                date: new Date().toISOString().slice(0, 10),
                buyer: '',
                phone: '',
                barrels: '',
                drcPercent: '',
                totalKg: '',
                dryKg: '',
                marketRate: '',
                amount: '',
                perBarrel: ''
            });
            
            setShowAddIntakeModal(false);
            setSuccess('Delivery intake added successfully!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError('Failed to add delivery intake');
        }
    };

    const handleVerifyDelivery = (deliveryId) => {
        setDeliveries(prev => 
            prev.map(delivery => 
                delivery.id === deliveryId 
                    ? { ...delivery, status: 'verified' }
                    : delivery
            )
        );
        setSuccess('Delivery verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="delivery-intake">
            {/* Header */}
            <div className="delivery-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <FiTruck /> Delivery Intake / Verify
                    </h1>
                    <p className="page-description">
                        Lab provides DRC% and barrel count. Enter market rate to calculate amount. After calculation, the manager will verify and generate invoice.
                    </p>
                </div>
                <div className="header-right">
                    <button 
                        className="add-intake-btn"
                        onClick={() => setShowAddIntakeModal(true)}
                    >
                        <FiPlus /> Add Intake
                    </button>
                    <button 
                        className="refresh-btn"
                        onClick={fetchDeliveries}
                        disabled={loading}
                    >
                        <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && <div className="alert-success">{success}</div>}
            {error && <div className="alert-error">{error}</div>}

            {/* Delivery Table */}
            <div className="delivery-table-container">
                {loading ? (
                    <div className="delivery-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading deliveries...</p>
                    </div>
                ) : deliveries.length > 0 ? (
                    <table className="delivery-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>BUYER</th>
                                <th>PHONE</th>
                                <th>BARRELS</th>
                                <th>DRC%</th>
                                <th>TOTAL (KG)</th>
                                <th>DRY KG</th>
                                <th>MARKET RATE (₹/DRY KG)</th>
                                <th>AMOUNT (₹)</th>
                                <th>₹/BARREL</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map(delivery => (
                                <tr key={delivery.id} className={delivery.status === 'verified' ? 'verified-row' : ''}>
                                    <td>{new Date(delivery.date).toLocaleDateString()}</td>
                                    <td>{delivery.buyer}</td>
                                    <td>{delivery.phone}</td>
                                    <td>{delivery.barrels}</td>
                                    <td>{delivery.drcPercent}%</td>
                                    <td>{delivery.totalKg}</td>
                                    <td>{delivery.dryKg}</td>
                                    <td>₹{delivery.marketRate}</td>
                                    <td className="amount-cell">₹{delivery.amount.toLocaleString()}</td>
                                    <td>₹{delivery.perBarrel}</td>
                                    <td>
                                        {delivery.status === 'pending' ? (
                                            <button
                                                className="verify-btn"
                                                onClick={() => handleVerifyDelivery(delivery.id)}
                                            >
                                                Verify
                                            </button>
                                        ) : (
                                            <span className="verified-badge">✓ Verified</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-content">
                            <FiPackage className="empty-icon" />
                            <p>No pending intakes.</p>
                            <button 
                                className="add-first-intake-btn"
                                onClick={() => setShowAddIntakeModal(true)}
                            >
                                Add First Intake
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Intake Modal */}
            {showAddIntakeModal && (
                <div className="modal-overlay">
                    <div className="intake-modal">
                        <div className="intake-modal-header">
                            <h2>Add New Delivery Intake</h2>
                            <button 
                                className="modal-close" 
                                onClick={() => setShowAddIntakeModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="intake-modal-content">
                            <div className="intake-form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        <FiCalendar /> Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-input"
                                        value={intakeForm.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiUser /> Buyer Name
                                    </label>
                                    <input
                                        type="text"
                                        name="buyer"
                                        className="form-input"
                                        value={intakeForm.buyer}
                                        onChange={handleInputChange}
                                        placeholder="Enter buyer name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiPhone /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        value={intakeForm.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiPackage /> Number of Barrels
                                    </label>
                                    <input
                                        type="number"
                                        name="barrels"
                                        className="form-input"
                                        value={intakeForm.barrels}
                                        onChange={handleInputChange}
                                        placeholder="Enter barrel count"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">DRC %</label>
                                    <input
                                        type="number"
                                        name="drcPercent"
                                        className="form-input"
                                        value={intakeForm.drcPercent}
                                        onChange={handleInputChange}
                                        placeholder="Enter DRC percentage"
                                        step="0.1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Total Weight (KG)</label>
                                    <input
                                        type="number"
                                        name="totalKg"
                                        className="form-input"
                                        value={intakeForm.totalKg}
                                        onChange={handleInputChange}
                                        placeholder="Enter total weight"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Dry Weight (KG)</label>
                                    <input
                                        type="number"
                                        name="dryKg"
                                        className="form-input"
                                        value={intakeForm.dryKg}
                                        onChange={handleInputChange}
                                        placeholder="Enter dry weight"
                                        step="0.1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Market Rate (₹/Dry KG)</label>
                                    <input
                                        type="number"
                                        name="marketRate"
                                        className="form-input"
                                        value={intakeForm.marketRate}
                                        onChange={handleInputChange}
                                        placeholder="Enter market rate"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className="form-input calculated-field"
                                        value={intakeForm.amount}
                                        readOnly
                                        placeholder="Auto-calculated"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">₹/Barrel</label>
                                    <input
                                        type="number"
                                        name="perBarrel"
                                        className="form-input calculated-field"
                                        value={intakeForm.perBarrel}
                                        readOnly
                                        placeholder="Auto-calculated"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="intake-modal-footer">
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => setShowAddIntakeModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="add-btn"
                                onClick={handleAddIntake}
                            >
                                Add Intake
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountantDeliveryIntake;