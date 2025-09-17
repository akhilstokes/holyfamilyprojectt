import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './LogTripKmPage.css';

const LogTripKmPage = () => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    odometerStart: '',
    odometerEnd: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tripHistory, setTripHistory] = useState([]);
  const [totalKm, setTotalKm] = useState(0);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTripHistory = useCallback(async () => {
    try {
      const response = await axios.get('/api/workers/field/trips', config);
      setTripHistory(response.data || []);
      
      // Calculate total KM for current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTrips = response.data.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
      });
      
      const total = monthlyTrips.reduce((sum, trip) => sum + (trip.km || 0), 0);
      setTotalKm(total);
    } catch (error) {
      console.error('Error fetching trip history:', error);
    }
  }, [config]);

  useEffect(() => {
    fetchTripHistory();
  }, [fetchTripHistory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateKm = () => {
    const start = parseFloat(formData.odometerStart);
    const end = parseFloat(formData.odometerEnd);
    
    if (isNaN(start) || isNaN(end)) return 0;
    if (end < start) return 0;
    
    return end - start;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.odometerStart || !formData.odometerEnd) {
      setError('Odometer start and end readings are required');
      return;
    }

    const start = parseFloat(formData.odometerStart);
    const end = parseFloat(formData.odometerEnd);
    
    if (isNaN(start) || isNaN(end)) {
      setError('Please enter valid odometer readings');
      return;
    }
    
    if (end < start) {
      setError('End reading must be greater than or equal to start reading');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const tripData = {
        ...formData,
        odometerStart: start,
        odometerEnd: end
      };

      await axios.post('/api/workers/field/trips', tripData, config);
      
      setSuccess(`Trip logged successfully! Distance: ${calculateKm().toFixed(1)} km`);
      setFormData({
        vehicleId: '',
        odometerStart: '',
        odometerEnd: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Refresh trip history
      fetchTripHistory();
    } catch (error) {
      setError('Error logging trip: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="log-trip-page">
      <div className="header">
        <h2>🛣️ Log Trip KM</h2>
        <p>Record your vehicle trip with odometer readings</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Monthly Summary */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>📊 This Month</h3>
          <p className="big-number">{totalKm.toFixed(1)} km</p>
          <p>Total distance traveled</p>
        </div>
        <div className="summary-card">
          <h3>🚗 Trips</h3>
          <p className="big-number">{tripHistory.length}</p>
          <p>Total trips logged</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-group">
          <label htmlFor="vehicleId">Vehicle ID</label>
          <input
            type="text"
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleInputChange}
            placeholder="Optional vehicle identifier"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="odometerStart">Odometer Start (km) *</label>
            <input
              type="number"
              id="odometerStart"
              name="odometerStart"
              value={formData.odometerStart}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              inputMode="decimal"
              onWheel={(e)=>e.currentTarget.blur()}
              required
              placeholder="e.g., 12345.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="odometerEnd">Odometer End (km) *</label>
            <input
              type="number"
              id="odometerEnd"
              name="odometerEnd"
              value={formData.odometerEnd}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              inputMode="decimal"
              onWheel={(e)=>e.currentTarget.blur()}
              required
              placeholder="e.g., 12367.8"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Trip Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Distance Preview */}
        {formData.odometerStart && formData.odometerEnd && (
          <div className="distance-preview">
            <h3>📏 Distance Calculation</h3>
            <p>Start: {formData.odometerStart} km</p>
            <p>End: {formData.odometerEnd} km</p>
            <p><strong>Distance: {calculateKm().toFixed(1)} km</strong></p>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading || !formData.odometerStart || !formData.odometerEnd}>
            {loading ? 'Logging Trip...' : 'Log Trip'}
          </button>
        </div>
      </form>

      {/* Trip History */}
      {tripHistory.length > 0 && (
        <div className="trip-history">
          <h3>📋 Recent Trips</h3>
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Start (km)</th>
                  <th>End (km)</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {tripHistory.slice(0, 10).map((trip, index) => (
                  <tr key={index}>
                    <td>{formatDate(trip.date)}</td>
                    <td>{trip.vehicleId || '-'}</td>
                    <td>{trip.odometerStart}</td>
                    <td>{trip.odometerEnd}</td>
                    <td><strong>{trip.km} km</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogTripKmPage;








