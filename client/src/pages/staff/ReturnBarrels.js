import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ReturnBarrels.css';

const ReturnBarrels = () => {
  const { user } = useAuth();
  const [scannedBarrels, setScannedBarrels] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInput, setScannerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const scannerRef = useRef(null);

  // Focus scanner input when component mounts
  useEffect(() => {
    if (scannerRef.current) {
      scannerRef.current.focus();
    }
  }, []);

  // Handle scanner input (simulating barcode scanner)
  const handleScannerInput = (e) => {
    const value = e.target.value;
    setScannerInput(value);
    
    // Set scanning state when user starts typing
    if (value.length > 0) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
    
    // Simulate scanner behavior - if input ends with Enter or is long enough, process it
    if (value.includes('\n') || value.length > 8) {
      const barrelId = value.replace('\n', '').trim();
      if (barrelId) {
        processScannedBarrel(barrelId);
        setScannerInput('');
        setIsScanning(false);
      }
    }
  };

  // Handle Enter key press for manual input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && scannerInput.trim()) {
      processScannedBarrel(scannerInput.trim());
      setScannerInput('');
      setIsScanning(false);
    }
  };

  // Validate barrel ID format: BHFP + 1-3 digits
  const validateBarrelId = (barrelId) => {
    const regex = /^BHFP\d{1,3}$/;
    return regex.test(barrelId);
  };

  // Process scanned barrel ID
  const processScannedBarrel = async (barrelId) => {
    // Validate format
    if (!validateBarrelId(barrelId)) {
      setMessage('❌ Invalid format! Use: BHFP + 1-3 digits (e.g., BHFP1, BHFP12, BHFP123)');
      setTimeout(() => setMessage(''), 5000);
      return;
    }

    if (scannedBarrels.find(barrel => barrel.barrelId === barrelId)) {
      setMessage('⚠️ Barrel already scanned');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      // Add barrel to scanned list
      const newBarrel = {
        barrelId,
        scannedAt: new Date().toISOString(),
        status: 'scanned',
        scannedBy: user?.name || 'Staff'
      };
      
      setScannedBarrels(prev => [...prev, newBarrel]);
      setMessage(`✅ Barrel ${barrelId} scanned successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Error scanning barrel');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Complete return process
  const completeReturn = async () => {
    if (scannedBarrels.length === 0) {
      setMessage('No barrels to return');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const returnData = {
        barrels: scannedBarrels,
        returnedBy: user?._id,
        returnedAt: new Date().toISOString(),
        status: 'returned'
      };

      const response = await fetch('/api/barrels/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(returnData)
      });

      if (response.ok) {
        setMessage(`${scannedBarrels.length} barrels returned successfully! Manager will be notified.`);
        setScannedBarrels([]);
        
        // Notify manager
        await notifyManager();
      } else {
        throw new Error('Failed to return barrels');
      }
    } catch (error) {
      setMessage('Error completing return');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Notify manager about returned barrels
  const notifyManager = async () => {
    try {
      await fetch('/api/notifications/barrel-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          barrels: scannedBarrels,
          returnedBy: user?.name,
          message: `${scannedBarrels.length} barrels have been returned and need reassignment`
        })
      });
    } catch (error) {
      console.error('Failed to notify manager:', error);
    }
  };

  // Remove barrel from scanned list
  const removeBarrel = (barrelId) => {
    setScannedBarrels(prev => prev.filter(barrel => barrel.barrelId !== barrelId));
  };

  return (
    <div className="return-barrels-container">
      <div className="page-header">
        <h1>Return Barrels</h1>
        <p>Scan barrel IDs to mark them as returned</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="scanner-section">
        <div className="scanner-status-banner">
          {isScanning ? (
            <div className="status-indicator scanning">
              <div className="pulse-dot"></div>
              <span className="status-text">🔴 Scanning...</span>
              <div className="scanning-animation">
                <div className="scan-line"></div>
              </div>
            </div>
          ) : (
            <div className="status-indicator ready">
              <div className="ready-icon">✓</div>
              <span className="status-text">🟢 Ready to Scan</span>
              <span className="status-subtext">Scan or type Barrel ID below</span>
            </div>
          )}
        </div>
        
        <div className="scanner-input-container">
          <label htmlFor="scanner">Barrel ID Input:</label>
          <input
            ref={scannerRef}
            id="scanner"
            type="text"
            value={scannerInput}
            onChange={handleScannerInput}
            onKeyPress={handleKeyPress}
            placeholder="Scan with barcode scanner or type manually and press Enter..."
            className={`scanner-input ${isScanning ? 'active' : ''}`}
            disabled={loading}
            autoFocus
          />
          <button 
            className="manual-add-btn"
            onClick={() => {
              if (scannerInput.trim()) {
                processScannedBarrel(scannerInput.trim());
                setScannerInput('');
                setIsScanning(false);
              }
            }}
            disabled={!scannerInput.trim() || loading}
          >
            Add Barrel
          </button>
        </div>
      </div>

      <div className="scanned-barrels-section">
        <h3>Scanned Barrels ({scannedBarrels.length})</h3>
        {scannedBarrels.length === 0 ? (
          <div className="no-barrels">
            <p>No barrels scanned yet</p>
            <p>Use the scanner above to scan barrel IDs</p>
          </div>
        ) : (
          <div className="barrels-list">
            {scannedBarrels.map((barrel, index) => (
              <div key={barrel.barrelId} className="barrel-item">
                <div className="barrel-info">
                  <span className="barrel-id">{barrel.barrelId}</span>
                  <span className="scan-time">
                    Scanned: {new Date(barrel.scannedAt).toLocaleTimeString()}
                  </span>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeBarrel(barrel.barrelId)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="actions-section">
        <button 
          className="complete-return-btn"
          onClick={completeReturn}
          disabled={scannedBarrels.length === 0 || loading}
        >
          {loading ? 'Processing...' : `Complete Return (${scannedBarrels.length} barrels)`}
        </button>
      </div>

      <div className="instructions">
        <h4>📋 Instructions:</h4>
        <div className="format-example">
          <strong>✅ Valid Barrel ID Format:</strong>
          <div className="format-box">
            <span className="format-label">BHFP</span> + <span className="format-label">1-3 digits</span>
          </div>
          <div className="examples">
            <span className="valid-example">✅ BHFP1</span>
            <span className="valid-example">✅ BHFP12</span>
            <span className="valid-example">✅ BHFP123</span>
          </div>
          <div className="examples invalid">
            <span className="invalid-example">❌ bhfp90 (lowercase)</span>
            <span className="invalid-example">❌ BHFP1234 (4 digits)</span>
            <span className="invalid-example">❌ abcd78 (wrong prefix)</span>
          </div>
        </div>
        <ul>
          <li>Scan or manually enter barrel IDs in the correct format</li>
          <li>Each valid barrel will be added to the list</li>
          <li>Click "Complete Return" when all barrels are scanned</li>
          <li>Manager will be notified and can reassign barrels</li>
        </ul>
      </div>
    </div>
  );
};

export default ReturnBarrels;
