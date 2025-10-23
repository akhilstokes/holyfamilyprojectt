import React, { useState, useEffect, useRef } from 'react';
import { useRoleTheme, RoleDashboardCard, RoleButton, StatusIndicator, FloatingPrompt } from '../common/RoleThemeProvider';

// QR Code Scanner Component for Field Staff
export const BarrelQRScanner = ({ onBarrelScanned, onLocationUpdate }) => {
    const { userRole, getRoleColor } = useRoleTheme();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedBarrels, setScannedBarrels] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [scanningError, setScanningError] = useState('');
    const [showPrompt, setShowPrompt] = useState(true);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setScanningError('Location access required for barrel tracking');
                }
            );
        }
    };

    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            videoRef.current.srcObject = stream;
            setIsScanning(true);
            setScanningError('');
        } catch (error) {
            setScanningError('Camera access required for QR scanning');
        }
    };

    const stopScanning = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setIsScanning(false);
    };

    const processQRCode = (data) => {
        try {
            // Parse barrel ID from QR code
            const barrelId = data.trim();
            
            // Validate barrel ID format
            if (!/^[A-Z0-9]{6,12}$/.test(barrelId)) {
                throw new Error('Invalid barrel ID format');
            }

            // Check if already scanned
            if (scannedBarrels.some(barrel => barrel.barrelId === barrelId)) {
                throw new Error('Barrel already scanned');
            }

            const scannedBarrel = {
                barrelId,
                scannedAt: new Date(),
                location: currentLocation,
                status: 'scanned'
            };

            setScannedBarrels(prev => [...prev, scannedBarrel]);
            onBarrelScanned?.(scannedBarrel);
            
            // Auto-stop scanning after successful scan
            setTimeout(() => {
                stopScanning();
            }, 1000);

        } catch (error) {
            setScanningError(error.message);
        }
    };

    const updateBarrelStatus = async (barrelId, status) => {
        try {
            const response = await fetch('/api/barrels/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    barrelId,
                    status,
                    location: currentLocation,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update barrel status');
            }

            // Update local state
            setScannedBarrels(prev => 
                prev.map(barrel => 
                    barrel.barrelId === barrelId 
                        ? { ...barrel, status, updatedAt: new Date() }
                        : barrel
                )
            );

            onLocationUpdate?.(barrelId, status, currentLocation);

        } catch (error) {
            setScanningError(error.message);
        }
    };

    const markAsDamaged = async (barrelId, damageType, severity) => {
        try {
            const response = await fetch('/api/barrels/report-damage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    barrelId,
                    damageType,
                    severity,
                    reportedBy: userRole,
                    location: currentLocation,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to report damage');
            }

            // Update local state
            setScannedBarrels(prev => 
                prev.map(barrel => 
                    barrel.barrelId === barrelId 
                        ? { ...barrel, status: 'damaged', damageType, severity }
                        : barrel
                )
            );

        } catch (error) {
            setScanningError(error.message);
        }
    };

    return (
        <div className="barrel-qr-scanner">
            <RoleDashboardCard 
                title="Barrel QR Scanner" 
                icon="fas fa-qrcode"
                className="mb-6"
            >
                {/* Location Status */}
                <div className="location-status mb-4">
                    <StatusIndicator 
                        status={currentLocation ? 'success' : 'error'}
                    >
                        {currentLocation ? 'Location Active' : 'Location Required'}
                    </StatusIndicator>
                    {currentLocation && (
                        <span className="location-coords">
                            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                        </span>
                    )}
                </div>

                {/* Scanner Controls */}
                <div className="scanner-controls mb-4">
                    {!isScanning ? (
                        <RoleButton onClick={startScanning} size="large">
                            <i className="fas fa-camera"></i> Start Scanning
                        </RoleButton>
                    ) : (
                        <RoleButton onClick={stopScanning} variant="outline" size="large">
                            <i className="fas fa-stop"></i> Stop Scanning
                        </RoleButton>
                    )}
                </div>

                {/* Camera Feed */}
                {isScanning && (
                    <div className="camera-container mb-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="camera-feed"
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                )}

                {/* Error Display */}
                {scanningError && (
                    <div className="error-message mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                        {scanningError}
                    </div>
                )}

                {/* Scanned Barrels List */}
                <div className="scanned-barrels">
                    <h4>Scanned Barrels ({scannedBarrels.length})</h4>
                    {scannedBarrels.length === 0 ? (
                        <p className="text-muted">No barrels scanned yet</p>
                    ) : (
                        <div className="barrel-list">
                            {scannedBarrels.map((barrel, index) => (
                                <div key={index} className="barrel-item">
                                    <div className="barrel-info">
                                        <span className="barrel-id">{barrel.barrelId}</span>
                                        <StatusIndicator status={barrel.status === 'scanned' ? 'info' : 'success'}>
                                            {barrel.status}
                                        </StatusIndicator>
                                        <span className="scan-time">
                                            {new Date(barrel.scannedAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    
                                    <div className="barrel-actions">
                                        <RoleButton
                                            onClick={() => updateBarrelStatus(barrel.barrelId, 'picked_up')}
                                            size="small"
                                            disabled={barrel.status !== 'scanned'}
                                        >
                                            Pick Up
                                        </RoleButton>
                                        
                                        <RoleButton
                                            onClick={() => updateBarrelStatus(barrel.barrelId, 'delivered')}
                                            size="small"
                                            disabled={barrel.status !== 'picked_up'}
                                        >
                                            Deliver
                                        </RoleButton>
                                        
                                        <RoleButton
                                            onClick={() => markAsDamaged(barrel.barrelId, 'physical', 'medium')}
                                            size="small"
                                            variant="outline"
                                            disabled={barrel.status === 'damaged'}
                                        >
                                            Report Damage
                                        </RoleButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </RoleDashboardCard>

            {/* Floating Prompt */}
            <FloatingPrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
            >
                <div className="prompt-content">
                    <h5>QR Scanning Guide</h5>
                    <ol>
                        <li>Position barrel QR code in camera view</li>
                        <li>Wait for automatic scan detection</li>
                        <li>Update barrel status (Pick Up → Deliver)</li>
                        <li>Report any damage immediately</li>
                    </ol>
                </div>
            </FloatingPrompt>
        </div>
    );
};

// DRC Measurement Component for Lab Staff
export const DRCMeasurement = ({ barrelId, onDRCUpdated }) => {
    const { userRole } = useRoleTheme();
    const [drcValue, setDrcValue] = useState('');
    const [barrelCapacity, setBarrelCapacity] = useState(250);
    const [marketRate, setMarketRate] = useState(500);
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        fetchBarrelDetails();
        fetchCurrentMarketRate();
    }, [barrelId]);

    const fetchBarrelDetails = async () => {
        try {
            const response = await fetch(`/api/barrels/${barrelId}`);
            const barrel = await response.json();
            setBarrelCapacity(barrel.capacity || 250);
        } catch (error) {
            console.error('Error fetching barrel details:', error);
        }
    };

    const fetchCurrentMarketRate = async () => {
        try {
            const response = await fetch('/api/daily-rates/latest');
            const rate = await response.json();
            setMarketRate(rate.ratePerKg || 500);
        } catch (error) {
            console.error('Error fetching market rate:', error);
        }
    };

    const calculateEffectiveRubber = (drc) => {
        return (barrelCapacity * drc) / 100;
    };

    const calculatePrice = (effectiveRubber) => {
        return effectiveRubber * marketRate;
    };

    const handleDRCChange = (value) => {
        const drc = parseFloat(value);
        
        if (isNaN(drc)) {
            setDrcValue(value);
            setCalculatedPrice(0);
            setValidationError('');
            return;
        }

        if (drc < 0 || drc > 100) {
            setValidationError('DRC must be between 0% and 100%');
            return;
        }

        setDrcValue(value);
        setValidationError('');
        
        const effectiveRubber = calculateEffectiveRubber(drc);
        const price = calculatePrice(effectiveRubber);
        setCalculatedPrice(price);
    };

    const submitDRC = async () => {
        if (!drcValue || validationError) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/barrels/drc/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    barrelId,
                    drc: parseFloat(drcValue),
                    effectiveRubber: calculateEffectiveRubber(parseFloat(drcValue)),
                    calculatedPrice,
                    marketRate,
                    barrelCapacity,
                    status: 'pending_verification'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit DRC measurement');
            }

            onDRCUpdated?.({
                barrelId,
                drc: parseFloat(drcValue),
                effectiveRubber: calculateEffectiveRubber(parseFloat(drcValue)),
                calculatedPrice,
                status: 'pending_verification'
            });

        } catch (error) {
            setValidationError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RoleDashboardCard 
            title={`DRC Measurement - Barrel ${barrelId}`}
            icon="fas fa-flask"
            className="mb-6"
        >
            <div className="drc-measurement">
                <div className="measurement-inputs">
                    <div className="input-group">
                        <label>Barrel Capacity (L)</label>
                        <input
                            type="number"
                            value={barrelCapacity}
                            onChange={(e) => setBarrelCapacity(parseFloat(e.target.value))}
                            disabled
                            className="form-input"
                        />
                    </div>

                    <div className="input-group">
                        <label>DRC Percentage (%)</label>
                        <input
                            type="number"
                            value={drcValue}
                            onChange={(e) => handleDRCChange(e.target.value)}
                            placeholder="Enter DRC %"
                            className={`form-input ${validationError ? 'error' : ''}`}
                            min="0"
                            max="100"
                            step="0.01"
                        />
                        {validationError && (
                            <span className="error-message">{validationError}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <label>Market Rate (₹/L)</label>
                        <input
                            type="number"
                            value={marketRate}
                            onChange={(e) => setMarketRate(parseFloat(e.target.value))}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="calculation-results">
                    <div className="result-item">
                        <span className="result-label">Effective Rubber:</span>
                        <span className="result-value">
                            {drcValue ? calculateEffectiveRubber(parseFloat(drcValue)).toFixed(2) : '0'} L
                        </span>
                    </div>
                    
                    <div className="result-item">
                        <span className="result-label">Calculated Price:</span>
                        <span className="result-value">
                            ₹{calculatedPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="action-buttons">
                    <RoleButton
                        onClick={submitDRC}
                        disabled={!drcValue || validationError || isSubmitting}
                        loading={isSubmitting}
                    >
                        <i className="fas fa-check"></i> Submit DRC
                    </RoleButton>
                </div>
            </div>
        </RoleDashboardCard>
    );
};

export default BarrelQRScanner;
