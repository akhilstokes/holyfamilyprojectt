
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [deliveryStats, setDeliveryStats] = useState({
    todayDeliveries: 0,
    todayPickups: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalEarnings: 0
  });

  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveryStats();
    fetchAssignedTasks();
    getCurrentLocation();
  }, []);

  const fetchDeliveryStats = async () => {
    try {
      setError(null);
      // API call to fetch delivery statistics
      const response = await fetch('/api/delivery/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryStats(data);
      } else {
        // Show zero stats when API is not available
        setDeliveryStats({
          todayDeliveries: 0,
          todayPickups: 0,
          completedTasks: 0,
          pendingTasks: 0,
          totalEarnings: 0
        });
      }
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      setError('Failed to load delivery statistics - API not available');
      // Show zero stats when API fails
      setDeliveryStats({
        todayDeliveries: 0,
        todayPickups: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalEarnings: 0
      });
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      setError(null);
      // API call to fetch assigned tasks
      const response = await fetch('/api/delivery/tasks/assigned', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignedTasks(data.tasks || []);
      } else {
        // No fallback data - show empty state when API is not available
        setAssignedTasks([]);
      }
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      setError('Failed to load assigned tasks - API not available');
      // No fallback data - show empty state
      setAssignedTasks([]);
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
          // No fallback location - let user know location is unavailable
          setCurrentLocation(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // No geolocation support - location unavailable
      setCurrentLocation(null);
    }
  };

  const handleTaskAction = async (taskId, action) => {
    try {
      const response = await fetch(`/api/delivery/tasks/${taskId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          location: currentLocation
        })
      });

      if (response.ok) {
        // Refresh tasks after action
        await fetchAssignedTasks();
        await fetchDeliveryStats();
      } else {
        setError(`Failed to ${action} task`);
      }
    } catch (error) {
      console.error(`Error ${action} task:`, error);
      setError(`Failed to ${action} task`);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDeliveryStats(),
      fetchAssignedTasks(),
    ]);
    getCurrentLocation();
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'status-assigned',
      in_progress: 'status-progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return colors[status] || 'status-default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    return colors[priority] || 'priority-default';
  };

  const getTaskIcon = (type) => {
    return type === 'delivery' ? 'fa-truck' : 'fa-box-open';
  };

  if (loading) {
    return (
      <div className="delivery-dashboard">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard">
      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={refreshData} className="retry-btn">
            <i className="fas fa-sync"></i>
            Retry
          </button>
        </div>
      )}

      <div className="welcome-section">
        <h1>🚚 Delivery Dashboard</h1>
        <p>Manage your deliveries, pickups, and navigation</p>
        <button onClick={refreshData} className="refresh-btn">
          <i className="fas fa-sync"></i>
          Refresh Data
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <Link to="/delivery/today-deliveries" className="stat-card stat-deliveries">
          <div className="stat-icon">
            <i className="fas fa-truck"></i>
          </div>
          <div className="stat-content">
            <h3>{deliveryStats.todayDeliveries}</h3>
            <p>Today's Deliveries</p>
          </div>
        </Link>

        <Link to="/delivery/today-pickups" className="stat-card stat-pickups">
          <div className="stat-icon">
            <i className="fas fa-box-open"></i>
          </div>
          <div className="stat-content">
            <h3>{deliveryStats.todayPickups}</h3>
            <p>Today's Pickups</p>
          </div>
        </Link>

        <Link to="/delivery/pending-tasks" className="stat-card stat-pending">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{deliveryStats.pendingTasks}</h3>
            <p>Pending Tasks</p>
          </div>
        </Link>

        <Link to="/delivery/salary" className="stat-card stat-earnings">
          <div className="stat-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-content">
            <h3>₹{deliveryStats.totalEarnings}</h3>
            <p>Today's Earnings</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/delivery/barrel-scan" className="action-card action-scan">
            <div className="action-icon">
              <i className="fas fa-qrcode"></i>
            </div>
            <div className="action-content">
              <h3>Scan Barrels</h3>
              <p>Scan barrel IDs during pickup/delivery</p>
            </div>
          </Link>

          <Link to="/delivery/vehicle-info" className="action-card action-vehicle">
            <div className="action-icon">
              <i className="fas fa-car"></i>
            </div>
            <div className="action-content">
              <h3>Vehicle Information</h3>
              <p>Enter/update vehicle number</p>
            </div>
          </Link>

          <Link to="/delivery/live-location" className="action-card action-navigation">
            <div className="action-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="action-content">
              <h3>Live Location</h3>
              <p>Track and share your location</p>
            </div>
          </Link>

          <Link to="/delivery/task-history" className="action-card action-history">
            <div className="action-icon">
              <i className="fas fa-history"></i>
            </div>
            <div className="action-content">
              <h3>Task History</h3>
              <p>View completed deliveries</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="assigned-tasks">
        <h2>Today's Assigned Tasks</h2>
        {assignedTasks.length === 0 ? (
          <div className="no-tasks">
            <i className="fas fa-clipboard-list"></i>
            <h3>No tasks assigned</h3>
            <p>Check back later for new assignments</p>
          </div>
        ) : (
          <div className="tasks-list">
            {assignedTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div className="task-info">
                    <div className="task-type">
                      <i className={`fas ${getTaskIcon(task.type)}`}></i>
                      <span>{task.type.toUpperCase()}</span>
                    </div>
                    <div className={`priority-badge ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="task-body">
                  <h3>{task.title}</h3>
                  
                  <div className="customer-info">
                    <div className="customer-details">
                      <p><i className="fas fa-user"></i> {task.customer.name}</p>
                      <p><i className="fas fa-phone"></i> {task.customer.phone}</p>
                      <p><i className="fas fa-map-marker-alt"></i> {task.customer.address}</p>
                    </div>
                  </div>

                  <div className="task-details">
                    <div className="detail-item">
                      <span className="label">Scheduled:</span>
                      <span className="value">{new Date(task.scheduledTime).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{task.estimatedDuration}</span>
                    </div>
                    {task.type === 'delivery' && task.barrels && task.barrels.length > 0 && (
                      <div className="detail-item">
                        <span className="label">Barrels:</span>
                        <div className="barrel-list">
                          {task.barrels.map(barrelId => (
                            <span key={barrelId} className="barrel-id">{barrelId}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {task.type === 'pickup' && task.quantity && (
                      <div className="detail-item">
                        <span className="label">Quantity:</span>
                        <span className="value">{task.quantity} barrels</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  {task.status === 'assigned' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleTaskAction(task.id, 'start')}
                    >
                      <i className="fas fa-play"></i>
                      Start Task
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleTaskAction(task.id, 'complete')}
                    >
                      <i className="fas fa-check"></i>
                      Complete Task
                    </button>
                  )}
                  {task.status === 'completed' && task.completedTime && (
                    <div className="completed-info">
                      <i className="fas fa-check-circle"></i>
                      Completed at {new Date(task.completedTime).toLocaleString()}
                    </div>
                  )}
                  
                  <div className="navigation-buttons">
                    <a 
                      href={task.customer.location} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      <i className="fas fa-map"></i>
                      Google Maps
                    </a>
                    <a 
                      href={`https://wa.me/?text=Location: ${task.customer.location}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      <i className="fab fa-whatsapp"></i>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Location */}
      {currentLocation ? (
        <div className="location-info">
          <h3>📍 Current Location</h3>
          <p>
            Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
            {currentLocation.accuracy && (
              <span className="accuracy"> (±{Math.round(currentLocation.accuracy)}m)</span>
            )}
          </p>
          <p className="location-timestamp">
            Last updated: {new Date(currentLocation.timestamp).toLocaleString()}
          </p>
          <div className="location-actions">
            <a 
              href={`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <i className="fas fa-map-marker-alt"></i>
              View on Map
            </a>
            <button 
              onClick={getCurrentLocation}
              className="btn btn-secondary"
            >
              <i className="fas fa-sync"></i>
              Update Location
            </button>
          </div>
        </div>
      ) : (
        <div className="location-info">
          <h3>📍 Location Unavailable</h3>
          <p>Location access is not available or denied</p>
          <div className="location-actions">
            <button 
              onClick={getCurrentLocation}
              className="btn btn-primary"
            >
              <i className="fas fa-map-marker-alt"></i>
              Enable Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;

