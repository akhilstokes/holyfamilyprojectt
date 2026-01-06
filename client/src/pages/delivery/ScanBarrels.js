import { useState, useEffect } from 'react';
import './ScanBarrels.css';

const ScanBarrels = () => {
  const [scanMode, setScanMode] = useState('pickup'); // 'pickup' or 'delivery'
  const [scannedBarrels, setScannedBarrels] = useState([]);
  const [currentScan, setCurrentScan] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [taskInfo, setTaskInfo] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Load current task info
    fetchCurrentTask();
    // Load saved vehicle number
    const savedVehicle = localStorage.getItem('deliveryVehicleNumber');
    if (savedVehicle) {
      setVehicleNumber(savedVehicle);
    }
  }, []);

  const fetchCurrentTask = async () => {
    try {
      // Mock data - replace with actual API call
      setTaskInfo({
        id: 'TASK002',
        type: 'pickup',
        customer: 'Jane Smith',
        address: 'Blue House, Kakkanad, Kochi',
        expectedQuantity: 3,
        phone: '+91 9876543211'
      });
    } catch (error) {
      console.error('Error fetching current task:', error);
    }
  };

  const handleScan = () => {
    if (!currentScan.trim()) {
      alert('Please enter a barrel ID');
      return;
    }

    if (!vehicleNumber.trim()) {
      alert('Please enter vehicle number first');
      return;
    }

    const barrelId = currentScan.trim().toUpperCase();
    
    // Check if already scanned
    if (scannedBarrels.find(barrel => barrel.id === barrelId)) {
      alert('This barrel has already been scanned');
      return;
    }

    // Add to scanned list
    const newBarrel = {
      id: barrelId,
      scannedAt: new Date().toISOString(),
      scanMode: scanMode,
      vehicleNumber: vehicleNumber,
      taskId: taskInfo?.id
    };

    setScannedBarrels([...scannedBarrels, newBarrel]);
    setCurrentScan('');
    
    // Save to localStorage as backup
    const updatedBarrels = [...scannedBarrels, newBarrel];
    localStorage.setItem('scannedBarrels', JSON.stringify(updatedBarrels));
    localStorage.setItem('deliveryVehicleNumber', vehicleNumber);

    // Play success sound (optional)
    playSuccessSound();
  };

  const playSuccessSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleRemoveBarrel = (barrelId) => {
    const updatedBarrels = scannedBarrels.filter(barrel => barrel.id !== barrelId);
    setScannedBarrels(updatedBarrels);
    localStorage.setItem('scannedBarrels', JSON.stringify(updatedBarrels));
  };

  const handleSubmitScans = async () => {
    if (scannedBarrels.length === 0) {
      alert('No barrels scanned yet');
      return;
    }

    if (scanMode === 'pickup' && taskInfo?.expectedQuantity && scannedBarrels.length !== taskInfo.expectedQuantity) {
      const confirm = window.confirm(
        `Expected ${taskInfo.expectedQuantity} barrels but scanned ${scannedBarrels.length}. Continue anyway?`
      );
      if (!confirm) return;
    }

    try {
      setIsScanning(true);
      
      // Submit scanned barrels to server
      const submitData = {
        taskId: taskInfo?.id,
        scanMode: scanMode,
        vehicleNumber: vehicleNumber,
        barrels: scannedBarrels,
        submittedAt: new Date().toISOString()
      };

      console.log('Submitting scanned barrels:', submitData);
      
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully submitted ${scannedBarrels.length} barrel scans for ${scanMode}`);
      
      // Clear scanned barrels after successful submission
      setScannedBarrels([]);
      localStorage.removeItem('scannedBarrels');
      
    } catch (error) {
      console.error('Error submitting scans:', error);
      alert('Error submitting scans. Data saved locally.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="scan-barrels">
      <div className="page-header">
        <h1>📱 Scan Barrels</h1>
        <p>Scan barrel IDs during pickup or delivery</p>
      </div>

      {/* Current Task Info */}
      {taskInfo && (
        <div className="task-info">
          <h2>Current Task</h2>
          <div className="task-details">
            <p><strong>Type:</strong> {taskInfo.type.toUpperCase()}</p>
            <p><strong>Customer:</strong> {taskInfo.customer}</p>
            <p><strong>Address:</strong> {taskInfo.address}</p>
            <p><strong>Phone:</strong> {taskInfo.phone}</p>
            {taskInfo.expectedQuantity && (
              <p><strong>Expected Quantity:</strong> {taskInfo.expectedQuantity} barrels</p>
            )}
          </div>
        </div>
      )}

      <div className="scan-container">
        {/* Scan Mode Selection */}
        <div className="scan-mode">
          <h3>Scan Mode</h3>
          <div className="mode-buttons">
            <button 
              className={scanMode === 'pickup' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setScanMode('pickup')}
            >
              <i className="fas fa-box-open"></i>
              Pickup Mode
            </button>
            <button 
              className={scanMode === 'delivery' ? 'mode-btn active' : 'mode-btn'}
              onClick={() => setScanMode('delivery')}
            >
              <i className="fas fa-truck"></i>
              Delivery Mode
            </button>
          </div>
        </div>

        {/* Vehicle Number */}
        <div className="vehicle-section">
          <h3>Vehicle Information</h3>
          <div className="vehicle-input">
            <input
              type="text"
              placeholder="Enter vehicle number (e.g., KL-07-AB-1234)"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="vehicle-field"
            />
          </div>
        </div>

        {/* Scanning Section */}
        <div className="scanning-section">
          <h3>Scan Barrel ID</h3>
          <div className="scan-input">
            <input
              type="text"
              placeholder="Scan or enter barrel ID"
              value={currentScan}
              onChange={(e) => setCurrentScan(e.target.value)}
              onKeyPress={handleKeyPress}
              className="scan-field"
              autoFocus
            />
            <button 
              className="scan-btn"
              onClick={handleScan}
              disabled={!currentScan.trim() || !vehicleNumber.trim()}
            >
              <i className="fas fa-plus"></i>
              Add Barrel
            </button>
          </div>
          <p className="scan-hint">
            💡 Tip: Use a barcode scanner or manually enter the barrel ID
          </p>
        </div>

        {/* Scanned Barrels List */}
        <div className="scanned-list">
          <div className="list-header">
            <h3>Scanned Barrels ({scannedBarrels.length})</h3>
            {scannedBarrels.length > 0 && (
              <button 
                className="submit-btn"
                onClick={handleSubmitScans}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Submit {scannedBarrels.length} Scans
                  </>
                )}
              </button>
            )}
          </div>

          {scannedBarrels.length === 0 ? (
            <div className="empty-list">
              <i className="fas fa-qrcode"></i>
              <p>No barrels scanned yet</p>
              <p>Start scanning to see them here</p>
            </div>
          ) : (
            <div className="barrel-list">
              {scannedBarrels.map((barrel, index) => (
                <div key={barrel.id} className="barrel-item">
                  <div className="barrel-info">
                    <div className="barrel-id">{barrel.id}</div>
                    <div className="barrel-meta">
                      <span className="scan-time">
                        {new Date(barrel.scannedAt).toLocaleTimeString()}
                      </span>
                      <span className={`scan-mode ${barrel.scanMode}`}>
                        {barrel.scanMode.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="barrel-actions">
                    <span className="barrel-number">#{index + 1}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveBarrel(barrel.id)}
                      title="Remove barrel"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="scan-stats">
          <div className="stat-item">
            <div className="stat-value">{scannedBarrels.filter(b => b.scanMode === 'pickup').length}</div>
            <div className="stat-label">Pickup Scans</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{scannedBarrels.filter(b => b.scanMode === 'delivery').length}</div>
            <div className="stat-label">Delivery Scans</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{scannedBarrels.length}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanBarrels;