import React, { useState, useEffect } from 'react';
import MobileOptimizedLayout from '../common/MobileOptimizedLayout';
import { toast } from 'react-toastify';
import { validateLocation, validatePhoto } from '../../utils/validation';

const MobileAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const [checkInPhoto, setCheckInPhoto] = useState(null);
  const [checkOutPhoto, setCheckOutPhoto] = useState(null);
  const [cameraError, setCameraError] = useState('');

  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }

    loadAttendance();
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base}/api/workers/field/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data);
      } else {
        // If offline, try to load from localStorage
        const cachedAttendance = localStorage.getItem('cachedAttendance');
        if (cachedAttendance) {
          setAttendance(JSON.parse(cachedAttendance));
        }
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
      // Load from cache if available
      const cachedAttendance = localStorage.getItem('cachedAttendance');
      if (cachedAttendance) {
        setAttendance(JSON.parse(cachedAttendance));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPendingActions = () => {
    const pending = localStorage.getItem('pendingAttendanceActions');
    if (pending) {
      setPendingActions(JSON.parse(pending));
    }
  };

  const savePendingAction = (action) => {
    const newPendingActions = [...pendingActions, action];
    setPendingActions(newPendingActions);
    localStorage.setItem('pendingAttendanceActions', JSON.stringify(newPendingActions));
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    try {
      for (const action of pendingActions) {
        await performAttendanceAction(action.type, action.data);
      }
      setPendingActions([]);
      localStorage.removeItem('pendingAttendanceActions');
      toast.success('Pending actions synced successfully');
    } catch (error) {
      console.error('Failed to sync pending actions:', error);
      toast.error('Failed to sync some actions');
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline]);

  const performAttendanceAction = async (actionType, data) => {
    const endpoint = actionType === 'checkin' ? 'check-in' : 'check-out';
    
    const response = await fetch(`${base}/api/workers/field/attendance/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...data,
        location: location,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to ${actionType}`);
    }

    return response.json();
  };

  const capturePhoto = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const photoError = validatePhoto(file);
          if (photoError) {
            reject(new Error(photoError));
            return;
          }
          resolve(file);
        } else {
          reject(new Error('No photo selected'));
        }
      };
      
      input.onerror = () => {
        reject(new Error('Camera access failed'));
      };
      
      input.click();
    });
  };

  const handleCheckIn = async () => {
    // Validate location
    const locationError = validateLocation(location);
    if (locationError) {
      toast.error(locationError);
      return;
    }

    try {
      // Capture photo for check-in
      const photo = await capturePhoto();
      setCheckInPhoto(photo);
      
      const actionData = {
        location: location,
        timestamp: new Date().toISOString(),
        type: 'checkin',
        photo: photo
      };

    if (!isOnline) {
      // Store for later sync
      savePendingAction(actionData);
      toast.info('Check-in recorded offline. Will sync when online.');
      
      // Update local state
      setAttendance(prev => ({
        ...prev,
        attendance: {
          ...prev?.attendance,
          checkInAt: new Date().toISOString(),
          location: location
        }
      }));
    } else {
      try {
        setLoading(true);
        await performAttendanceAction('checkin', actionData);
        toast.success('Checked in successfully with photo');
        loadAttendance();
      } catch (error) {
        toast.error('Failed to check in');
        console.error('Check-in error:', error);
      } finally {
        setLoading(false);
      }
    }
    } catch (error) {
      toast.error(error.message);
      setCameraError(error.message);
    }
  };

  const handleCheckOut = async () => {
    // Validate location
    const locationError = validateLocation(location);
    if (locationError) {
      toast.error(locationError);
      return;
    }

    try {
      // Capture photo for check-out
      const photo = await capturePhoto();
      setCheckOutPhoto(photo);
      
      const actionData = {
        location: location,
        timestamp: new Date().toISOString(),
        type: 'checkout',
        photo: photo
      };

    if (!isOnline) {
      // Store for later sync
      savePendingAction(actionData);
      toast.info('Check-out recorded offline. Will sync when online.');
      
      // Update local state
      setAttendance(prev => ({
        ...prev,
        attendance: {
          ...prev?.attendance,
          checkOutAt: new Date().toISOString(),
          location: location
        }
      }));
    } else {
      try {
        setLoading(true);
        await performAttendanceAction('checkout', actionData);
        toast.success('Checked out successfully with photo');
        loadAttendance();
      } catch (error) {
        toast.error('Failed to check out');
        console.error('Check-out error:', error);
      } finally {
        setLoading(false);
      }
    }
    } catch (error) {
      toast.error(error.message);
      setCameraError(error.message);
    }
  };

  const isCheckedIn = attendance?.attendance?.checkInAt;
  const isCheckedOut = attendance?.attendance?.checkOutAt;
  const canCheckIn = !isCheckedIn;
  const canCheckOut = isCheckedIn && !isCheckedOut;

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationStatus = () => {
    if (!location) return { status: 'error', text: 'Location not available' };
    if (location.accuracy > 100) return { status: 'warning', text: 'Low accuracy' };
    return { status: 'success', text: 'GPS Ready' };
  };

  const locationStatus = getLocationStatus();

  return (
    <MobileOptimizedLayout title="Attendance">
      {/* Status Cards */}
      <div className="mobile-card">
        <h3>Today's Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <i className="fas fa-clock"></i>
            <div>
              <div className="status-label">Check In</div>
              <div className="status-value">
                {formatTime(attendance?.attendance?.checkInAt)}
              </div>
            </div>
          </div>
          <div className="status-item">
            <i className="fas fa-sign-out-alt"></i>
            <div>
              <div className="status-label">Check Out</div>
              <div className="status-value">
                {formatTime(attendance?.attendance?.checkOutAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Status */}
      <div className="mobile-card">
        <h3>Location Status</h3>
        <div className={`location-status ${locationStatus.status}`}>
          <i className={`fas fa-map-marker-alt`}></i>
          <span>{locationStatus.text}</span>
          {location && (
            <div className="location-details">
              <small>
                Lat: {location.latitude.toFixed(6)}, 
                Lng: {location.longitude.toFixed(6)}
              </small>
              <small>Accuracy: {Math.round(location.accuracy)}m</small>
            </div>
          )}
        </div>
      </div>

      {/* Camera Error Display */}
      {cameraError && (
        <div className="mobile-card">
          <h3>Camera Error</h3>
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{cameraError}</span>
          </div>
        </div>
      )}

      {/* Photo Status */}
      {(checkInPhoto || checkOutPhoto) && (
        <div className="mobile-card">
          <h3>Captured Photos</h3>
          <div className="photo-status">
            {checkInPhoto && (
              <div className="photo-item">
                <i className="fas fa-camera"></i>
                <span>Check-in photo captured</span>
                <small>{new Date().toLocaleTimeString()}</small>
              </div>
            )}
            {checkOutPhoto && (
              <div className="photo-item">
                <i className="fas fa-camera"></i>
                <span>Check-out photo captured</span>
                <small>{new Date().toLocaleTimeString()}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mobile-card">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button
            className={`action-btn checkin-btn ${!canCheckIn ? 'disabled' : ''}`}
            onClick={handleCheckIn}
            disabled={!canCheckIn || loading}
          >
            <i className="fas fa-camera"></i>
            <span>Check In with Photo</span>
          </button>
          
          <button
            className={`action-btn checkout-btn ${!canCheckOut ? 'disabled' : ''}`}
            onClick={handleCheckOut}
            disabled={!canCheckOut || loading}
          >
            <i className="fas fa-camera"></i>
            <span>Check Out with Photo</span>
          </button>
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="mobile-card">
          <h3>Pending Actions</h3>
          <div className="pending-actions-list">
            {pendingActions.map((action, index) => (
              <div key={index} className="pending-action">
                <i className={`fas fa-${action.type === 'checkin' ? 'sign-in-alt' : 'sign-out-alt'}`}></i>
                <span>{action.type === 'checkin' ? 'Check In' : 'Check Out'}</span>
                <small>{new Date(action.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="mobile-card">
        <h3>Connection Status</h3>
        <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
          <i className={`fas fa-wifi ${isOnline ? 'online' : 'offline'}`}></i>
          <span>{isOnline ? 'Online - Real-time sync' : 'Offline - Actions queued'}</span>
        </div>
      </div>

      <style jsx>{`
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .status-item i {
          font-size: 20px;
          color: #007bff;
        }

        .status-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 2px;
        }

        .status-value {
          font-size: 16px;
          font-weight: 600;
          color: #343a40;
        }

        .location-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .location-status.success {
          background: #d4edda;
          color: #155724;
        }

        .location-status.warning {
          background: #fff3cd;
          color: #856404;
        }

        .location-status.error {
          background: #f8d7da;
          color: #721c24;
        }

        .location-details {
          display: flex;
          flex-direction: column;
          margin-left: auto;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checkin-btn {
          background: #28a745;
          color: white;
        }

        .checkin-btn:hover:not(.disabled) {
          background: #218838;
          transform: translateY(-2px);
        }

        .checkout-btn {
          background: #dc3545;
          color: white;
        }

        .checkout-btn:hover:not(.disabled) {
          background: #c82333;
          transform: translateY(-2px);
        }

        .action-btn.disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .action-btn i {
          font-size: 24px;
        }

        .pending-actions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pending-action {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #fff3cd;
          border-radius: 8px;
          color: #856404;
        }

        .pending-action i {
          font-size: 16px;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
        }

        .connection-status.online {
          background: #d4edda;
          color: #155724;
        }

        .connection-status.offline {
          background: #f8d7da;
          color: #721c24;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 8px;
        }

        .photo-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .photo-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #d4edda;
          color: #155724;
          border-radius: 8px;
        }

        .photo-item i {
          font-size: 16px;
        }

        .action-btn i {
          font-size: 20px;
        }
      `}</style>
    </MobileOptimizedLayout>
  );
};

export default MobileAttendance;

