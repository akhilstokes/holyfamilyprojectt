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
    
    // Simulate scanner behavior - if input ends with Enter or is long enough, process it
    if (value.includes('\n') || value.length > 8) {
      const barrelId = value.replace('\n', '').trim();
      if (barrelId) {
        processScannedBarrel(barrelId);
        setScannerInput('');
      }
    }
  };

  // Process scanned barrel ID
  const processScannedBarrel = async (barrelId) => {
    if (scannedBarrels.find(barrel => barrel.barrelId === barrelId)) {
      setMessage('Barrel already scanned');
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
      setMessage(`Barrel ${barrelId} scanned successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error scanning barrel');
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
        <div className="scanner-input-container">
          <label htmlFor="scanner">Scanner Input:</label>
          <input
            ref={scannerRef}
            id="scanner"
            type="text"
            value={scannerInput}
            onChange={handleScannerInput}
            placeholder="Scan barrel ID or type manually..."
            className="scanner-input"
            disabled={loading}
          />
          <div className="scanner-status">
            {isScanning ? (
              <span className="scanning">🔴 Scanning...</span>
            ) : (
              <span className="ready">🟢 Ready to scan</span>
            )}
          </div>
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
        <h4>Instructions:</h4>
        <ul>
          <li>Scan or manually enter barrel IDs</li>
          <li>Each scanned barrel will be added to the list</li>
          <li>Click "Complete Return" when all barrels are scanned</li>
          <li>Manager will be notified and can reassign barrels</li>
        </ul>
      </div>
    </div>
  );
};

export default ReturnBarrels;
