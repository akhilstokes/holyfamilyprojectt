import React, { useState, useEffect } from 'react';
import './VehicleInfo.css';

const VehicleInfo = () => {
  const [vehicleData, setVehicleData] = useState({
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    vehicleType: 'truck',
    capacity: '',
    fuelType: 'diesel',
    insuranceExpiry: '',
    lastService: '',
    currentLocation: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicleData();
    getCurrentLocation();
  }, []);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from API first
      const response = await fetch('/api/delivery/vehicle-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicleData(data);
      } else {
        // Fallback to localStorage
        const savedData = localStorage.getItem('deliveryVehicleData');
        if (savedData) {
          setVehicleData(JSON.parse(savedData));
        } else {
          // Default fallback data
          setVehicleData({
            vehicleNumber: 'KL-09-CD-5678',
            driverName: 'Ravi Kumar',
            driverPhone: '+91 9845678901',
            vehicleType: 'van',
            capacity: '8',
            fuelType: 'diesel',
            insuranceExpiry: '2024-11-30',
            lastService: '2024-01-10',
            currentLocation: ''
          });
        }
      }
      
      // Also load the vehicle number from ScanBarrels if available
      const savedVehicleNumber = localStorage.getItem('deliveryVehicleNumber');
      if (savedVehicleNumber && !vehicleData.vehicleNumber) {
        setVehicleData(prev => ({ ...prev, vehicleNumber: savedVehicleNumber }));
      }
    } catch (error) {
      console.error('Error loading vehicle data:', error);
      setError('Failed to load vehicle information');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback location
          setCurrentLocation({
            lat: 9.9816,
            lng: 76.2999,
            accuracy: null,
            timestamp: new Date().toISOString()
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Fallback for browsers without geolocation
      setCurrentLocation({
        lat: 9.9816,
        lng: 76.2999,
        accuracy: null,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to save to API first
      const response = await fetch('/api/delivery/vehicle-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...vehicleData,
          lastUpdated: new Date().toISOString()
        })
      });

      if (response.ok) {
        const savedData = await response.json();
        setVehicleData(savedData);
      } else {
        // Fallback to localStorage if API fails
        localStorage.setItem('deliveryVehicleData', JSON.stringify(vehicleData));
      }
      
      // Also update the vehicle number in ScanBarrels storage
      if (vehicleData.vehicleNumber) {
        localStorage.setItem('deliveryVehicleNumber', vehicleData.vehicleNumber);
      }
      
      setIsEditing(false);
      alert('Vehicle information saved successfully!');
    } catch (error) {
      console.error('Error saving vehicle data:', error);
      setError('Error saving vehicle information. Saved locally instead.');
      
      // Fallback to localStorage
      localStorage.setItem('deliveryVehicleData', JSON.stringify(vehicleData));
      if (vehicleData.vehicleNumber) {
        localStorage.setItem('deliveryVehicleNumber', vehicleData.vehicleNumber);
      }
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    loadVehicleData(); // Reset to original data
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not available';
    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  if (loading && !vehicleData.vehicleNumber) {
    return (
      <div className="vehicle-info-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-info-container">
      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-error">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="vehicle-info-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-car"></i>
          </div>
          <div className="header-text">
            <h1>Vehicle Information</h1>
            <p>Manage your delivery vehicle details and status</p>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={handleEdit}>
              <i className="fas fa-edit"></i>
              Edit Information
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleSave}
                disabled={loading}
              >
                <i className="fas fa-save"></i>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="vehicle-info-content">
        {/* Vehicle Details Card */}
        <div className="info-card">
          <div className="card-header">
            <h2><i className="fas fa-truck"></i> Vehicle Details</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Vehicle Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={vehicleData.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., KL-07-AB-1234"
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {vehicleData.vehicleNumber || 'Not set'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Vehicle Type</label>
                {isEditing ? (
                  <select
                    name="vehicleType"
                    value={vehicleData.vehicleType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                ) : (
                  <div className="form-display">
                    {vehicleData.vehicleType.charAt(0).toUpperCase() + vehicleData.vehicleType.slice(1)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Capacity (Barrels)</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="capacity"
                    value={vehicleData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 10"
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {vehicleData.capacity ? `${vehicleData.capacity} barrels` : 'Not set'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Fuel Type</label>
                {isEditing ? (
                  <select
                    name="fuelType"
                    value={vehicleData.fuelType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                ) : (
                  <div className="form-display">
                    {vehicleData.fuelType.charAt(0).toUpperCase() + vehicleData.fuelType.slice(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Details Card */}
        <div className="info-card">
          <div className="card-header">
            <h2><i className="fas fa-user"></i> Driver Details</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Driver Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="driverName"
                    value={vehicleData.driverName}
                    onChange={handleInputChange}
                    placeholder="Enter driver name"
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {vehicleData.driverName || 'Not set'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Driver Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="driverPhone"
                    value={vehicleData.driverPhone}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {vehicleData.driverPhone || 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance & Documents Card */}
        <div className="info-card">
          <div className="card-header">
            <h2><i className="fas fa-tools"></i> Maintenance & Documents</h2>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Insurance Expiry</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="insuranceExpiry"
                    value={vehicleData.insuranceExpiry}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {vehicleData.insuranceExpiry ? 
                      new Date(vehicleData.insuranceExpiry).toLocaleDateString() : 
                      'Not set'
                    }
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Last Service Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="lastService"
                    value={vehicleData.lastService}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <div className="form-display">
                    {vehicleData.lastService ? 
                      new Date(vehicleData.lastService).toLocaleDateString() : 
                      'Not set'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Location Card */}
        <div className="info-card">
          <div className="card-header">
            <h2><i className="fas fa-map-marker-alt"></i> Current Location</h2>
          </div>
          <div className="card-body">
            <div className="location-info">
              <div className="location-display">
                <i className="fas fa-location-arrow"></i>
                <span>{formatLocation(currentLocation)}</span>
                {currentLocation && currentLocation.accuracy && (
                  <span className="accuracy"> (±{Math.round(currentLocation.accuracy)}m)</span>
                )}
              </div>
              {currentLocation && (
                <>
                  <p className="location-timestamp">
                    Last updated: {new Date(currentLocation.timestamp).toLocaleString()}
                  </p>
                  <div className="location-actions">
                    <a 
                      href={`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                    >
                      <i className="fas fa-map"></i>
                      View on Map
                    </a>
                    <button 
                      className="btn btn-outline"
                      onClick={refreshLocation}
                    >
                      <i className="fas fa-sync"></i>
                      Refresh Location
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => alert('Fuel log feature coming soon!')}>
              <i className="fas fa-gas-pump"></i>
              <span>Fuel Log</span>
            </button>
            <button className="action-btn" onClick={() => alert('Maintenance feature coming soon!')}>
              <i className="fas fa-wrench"></i>
              <span>Maintenance</span>
            </button>
            <button className="action-btn" onClick={() => alert('Documents feature coming soon!')}>
              <i className="fas fa-file-alt"></i>
              <span>Documents</span>
            </button>
            <button className="action-btn" onClick={() => alert('Trip history feature coming soon!')}>
              <i className="fas fa-route"></i>
              <span>Trip History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;