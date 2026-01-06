import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MobileOptimizedLayout.css';

const MobileOptimizedLayout = ({ children, title = "Field Operations" }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  const currentLocation = useLocation();

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
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    try {
      for (const action of pendingActions) {
        await action.syncFunction();
      }
      setPendingActions([]);
      localStorage.removeItem('pendingActions');
    } catch (error) {
      console.error('Failed to sync pending actions:', error);
    }
  };

  useEffect(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline]);

  const addPendingAction = (action) => {
    const newPendingActions = [...pendingActions, action];
    setPendingActions(newPendingActions);
    localStorage.setItem('pendingActions', JSON.stringify(newPendingActions));
  };

  const quickActions = [
    { icon: 'fas fa-clock', label: 'Check In/Out', path: '/staff/attendance', color: '#28a745' },

    { icon: 'fas fa-camera', label: 'Capture Photo', action: 'photo', color: '#6f42c1' },

    { icon: 'fas fa-oil-can', label: 'Add Barrel', path: '/staff/operations/add-barrel', color: '#007bff' },
    { icon: 'fas fa-weight', label: 'Weigh Latex', path: '/staff/weigh-latex', color: '#ffc107' },
    { icon: 'fas fa-camera', label: 'Capture Photo', action: 'photo', color: '#6f42c1' },
    { icon: 'fas fa-road', label: 'Log Trip', path: '/staff/operations/trip-km', color: '#17a2b8' },

    { icon: 'fas fa-wallet', label: 'Salary', path: '/staff/salary', color: '#20c997' }
  ];

  const handleQuickAction = (action) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action === 'photo') {
      // Handle photo capture
      handlePhotoCapture();
    }
  };

  const handlePhotoCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Process photo with location data
        const photoData = {
          file,
          location,
          timestamp: new Date().toISOString(),
          action: 'work_documentation'
        };
        
        // Store for later sync if offline
        if (!isOnline) {
          addPendingAction({
            type: 'photo_upload',
            data: photoData,
            syncFunction: () => uploadPhoto(photoData)
          });
        } else {
          uploadPhoto(photoData);
        }
      }
    };
    
    input.click();
  };

  const uploadPhoto = async (photoData) => {
    const formData = new FormData();
    formData.append('photo', photoData.file);
    formData.append('location', JSON.stringify(photoData.location));
    formData.append('timestamp', photoData.timestamp);
    formData.append('action', photoData.action);

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/uploads/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        console.log('Photo uploaded successfully');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      throw error;
    }
  };

  return (
    <div className="mobile-layout">
      {/* Status Bar */}
      <div className="mobile-status-bar">
        <div className="status-item">
          <i className={`fas fa-wifi ${isOnline ? 'online' : 'offline'}`}></i>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        {location && (
          <div className="status-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>GPS</span>
          </div>
        )}
        {pendingActions.length > 0 && (
          <div className="status-item pending">
            <i className="fas fa-sync-alt"></i>
            <span>{pendingActions.length} pending</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mobile-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="mobile-title">{title}</h1>
        <button 
          className="menu-btn"
          onClick={() => navigate('/staff/operations')}
        >
          <i className="fas fa-home"></i>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action-btn"
            onClick={() => handleQuickAction(action)}
            style={{ '--action-color': action.color }}
          >
            <i className={action.icon}></i>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <button 
          className={`nav-item ${currentLocation.pathname === '/staff/attendance' ? 'active' : ''}`}
          onClick={() => navigate('/staff/attendance')}
        >
          <i className="fas fa-clock"></i>
          <span>Attendance</span>
        </button>
        <button 
          className={`nav-item ${currentLocation.pathname === '/staff/operations' ? 'active' : ''}`}
          onClick={() => navigate('/staff/operations')}
        >
          <i className="fas fa-clipboard-check"></i>
          <span>Operations</span>
        </button>
        <button 
          className={`nav-item ${currentLocation.pathname === '/staff/salary' ? 'active' : ''}`}
          onClick={() => navigate('/staff/salary')}
        >
          <i className="fas fa-wallet"></i>
          <span>Salary</span>
        </button>
        <button 
          className={`nav-item ${currentLocation.pathname === '/staff/profile' ? 'active' : ''}`}
          onClick={() => navigate('/staff/profile')}
        >
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;




