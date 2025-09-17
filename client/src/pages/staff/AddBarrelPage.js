import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './AddBarrelPage.css';

const AddBarrelPage = () => {
  const [formData, setFormData] = useState({
    farmerUserId: '',
    weightKg: '',
    ratePerKg: '',
    moisturePct: '',
    barrelId: '',
    routeTaskId: '',
    photoUrl: ''
  });
  
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [proceedWithoutGps, setProceedWithoutGps] = useState(false);

  const token = localStorage.getItem('token');
  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchFarmers = useCallback(async () => {
    try {
      const response = await axios.get('/api/users/farmers', config);
      setFarmers(response.data || []);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  }, [config]);

  useEffect(() => {
    getCurrentLocation();
    fetchFarmers();
  }, [fetchFarmers]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setGpsAccuracy(position.coords.accuracy);
        setLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setError('Location permission denied. You can allow it in browser settings or proceed without GPS.');
        } else {
          setError('Error getting location: ' + error.message);
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setLoading(true);
          const formData = new FormData();
          formData.append('photo', file);
          
          const response = await axios.post('/api/upload/photo', formData, {
            ...config,
            headers: {
              ...config.headers,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          setFormData(prev => ({
            ...prev,
            photoUrl: response.data.url
          }));
          setSuccess('Photo uploaded successfully');
        } catch (error) {
          setError('Error uploading photo: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location && !proceedWithoutGps) {
      setError('Location is required. Please enable GPS or proceed without GPS.');
      return;
    }

    if (location && location.accuracy > 100) {
      setError('GPS accuracy is too low. Please wait for better signal.');
      return;
    }

    if (!formData.farmerUserId || !formData.weightKg || !formData.ratePerKg) {
      setError('Farmer, Weight, and Rate are required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const barrelData = {
        ...formData,
        weightKg: parseFloat(formData.weightKg),
        ratePerKg: parseFloat(formData.ratePerKg),
        moisturePct: parseFloat(formData.moisturePct) || 0,
        gps: location || null
      };

      await axios.post('/api/workers/field/barrels', barrelData, config);
      
      setSuccess('Barrel entry added successfully!');
      setFormData({
        farmerUserId: '',
        weightKg: '',
        ratePerKg: '',
        moisturePct: '',
        barrelId: '',
        routeTaskId: '',
        photoUrl: ''
      });
    } catch (error) {
      setError('Error adding barrel entry: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-barrel-page">
      <div className="header">
        <h2>📦 Add Barrel Entry</h2>
        <p>Record a new barrel collection with GPS location and photo</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Location Status */}
      <div className="location-status">
        <h3>📍 Location Status</h3>
        {location ? (
          <div className="location-info">
            <p>✅ GPS Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
            <p>Accuracy: {gpsAccuracy ? `${Math.round(gpsAccuracy)}m` : 'Unknown'}</p>
            {gpsAccuracy > 100 && (
              <p className="warning">⚠️ GPS accuracy is low. Please wait for better signal.</p>
            )}
          </div>
        ) : (
          <div className="location-info">
            <p>❌ Location not available</p>
            <button onClick={getCurrentLocation} disabled={loading}>
              {loading ? 'Getting Location...' : 'Get Location'}
            </button>
            {permissionDenied && (
              <div className="permission-help">
                <p>
                  Location permission is blocked. In Chrome: click the lock icon → Site settings → Allow Location.
                </p>
                <button type="button" onClick={() => setProceedWithoutGps(true)}>
                  Proceed without GPS
                </button>
              </div>
            )}
            {proceedWithoutGps && (
              <p className="warning">Proceeding without GPS. Location will be saved as empty.</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="barrel-form">
        <div className="form-group">
          <label htmlFor="farmerUserId">Farmer *</label>
          <select
            id="farmerUserId"
            name="farmerUserId"
            value={formData.farmerUserId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Farmer</option>
            {farmers.map(farmer => (
              <option key={farmer._id} value={farmer._id}>
                {farmer.name} ({farmer.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weightKg">Weight (Kg) *</label>
            <input
              type="number"
              id="weightKg"
              name="weightKg"
              value={formData.weightKg}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              inputMode="decimal"
              onWheel={(e)=>e.currentTarget.blur()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ratePerKg">Rate per Kg (₹) *</label>
            <input
              type="number"
              id="ratePerKg"
              name="ratePerKg"
              value={formData.ratePerKg}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              inputMode="decimal"
              onWheel={(e)=>e.currentTarget.blur()}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="moisturePct">Moisture %</label>
            <input
              type="number"
              id="moisturePct"
              name="moisturePct"
              value={formData.moisturePct}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              max="100"
              inputMode="decimal"
              onWheel={(e)=>e.currentTarget.blur()}
            />
          </div>

          <div className="form-group">
            <label htmlFor="barrelId">Barrel ID</label>
            <input
              type="text"
              id="barrelId"
              name="barrelId"
              value={formData.barrelId}
              onChange={handleInputChange}
              placeholder="Optional barrel identifier"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="routeTaskId">Route Task ID</label>
          <input
            type="text"
            id="routeTaskId"
            name="routeTaskId"
            value={formData.routeTaskId}
            onChange={handleInputChange}
            placeholder="Optional route task reference"
          />
        </div>

        <div className="form-group">
          <label>Photo</label>
          <div className="photo-section">
            {formData.photoUrl ? (
              <div className="photo-preview">
                <img src={formData.photoUrl} alt="Barrel" />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}>
                  Remove Photo
                </button>
              </div>
            ) : (
              <button type="button" onClick={handlePhotoCapture} className="photo-capture-btn">
                📷 Capture Photo
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={
            loading || (!location && !proceedWithoutGps) || (location && location.accuracy > 100)
          }>
            {loading ? 'Adding Barrel...' : 'Add Barrel Entry'}
          </button>
        </div>
      </form>

      {/* Calculation Preview */}
      {formData.weightKg && formData.ratePerKg && (
        <div className="calculation-preview">
          <h3>💰 Amount Calculation</h3>
          <p>Weight: {formData.weightKg} kg</p>
          <p>Rate: ₹{formData.ratePerKg} per kg</p>
          <p><strong>Total Amount: ₹{(parseFloat(formData.weightKg) * parseFloat(formData.ratePerKg)).toFixed(2)}</strong></p>
        </div>
      )}
    </div>
  );
};

export default AddBarrelPage;








