import React, { useEffect, useState } from 'react';
import './DeliveryTheme.css';
import './TaskHistory.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const DeliveryTaskHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/delivery/task-history?filter=${filter}`, {
        headers: authHeaders()
      });
      
      if (!res.ok) throw new Error(`Failed to fetch history (${res.status})`);
      
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load task history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pickup_scheduled: '#3b82f6',
      enroute_pickup: '#f59e0b',
      picked_up: '#10b981',
      enroute_drop: '#f59e0b',
      delivered: '#22c55e',
      cancelled: '#ef4444',
      completed: '#059669'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pickup_scheduled: 'fa-calendar-check',
      enroute_pickup: 'fa-truck',
      picked_up: 'fa-box',
      enroute_drop: 'fa-truck-loading',
      delivered: 'fa-check-circle',
      cancelled: 'fa-times-circle',
      completed: 'fa-check-double'
    };
    return icons[status] || 'fa-info-circle';
  };

  const getTimelineSteps = (task) => {
    const steps = [
      {
        label: 'Task Assigned',
        status: 'completed',
        icon: 'fa-user-check',
        timestamp: task.assignedAt || task.createdAt,
        description: `Manager assigned task: ${task.title}`
      },
      {
        label: 'Barrel Scan',
        status: task.barrelScanData ? 'completed' : 'pending',
        icon: 'fa-qrcode',
        timestamp: task.barrelScanData?.scannedAt,
        description: task.barrelScanData 
          ? `Scanned ${task.barrelScanData.barrelCount} barrels at ${task.barrelScanData.location || 'pickup location'}`
          : 'Waiting for barrel scan'
      },
      {
        label: 'Pickup',
        status: task.pickupAt ? 'completed' : task.status === 'enroute_pickup' ? 'in-progress' : 'pending',
        icon: 'fa-truck',
        timestamp: task.pickupAt,
        description: task.pickupAt 
          ? `Picked up from ${task.pickupAddress}`
          : task.status === 'enroute_pickup' 
            ? 'En route to pickup location'
            : 'Awaiting pickup'
      },
      {
        label: 'Live Location',
        status: task.locationUpdates?.length > 0 ? 'completed' : 'pending',
        icon: 'fa-map-marker-alt',
        timestamp: task.locationUpdates?.[task.locationUpdates.length - 1]?.timestamp,
        description: task.locationUpdates?.length 
          ? `${task.locationUpdates.length} location updates tracked`
          : 'No location updates yet'
      },
      {
        label: 'Barrel Intake',
        status: task.barrelIntake ? 'completed' : 'pending',
        icon: 'fa-warehouse',
        timestamp: task.barrelIntake?.createdAt,
        description: task.barrelIntake 
          ? `Intake recorded: ${task.barrelIntake.barrelCount} barrels - ${task.barrelIntake.name}`
          : 'Barrel intake pending'
      },
      {
        label: 'Delivery Complete',
        status: task.deliveredAt ? 'completed' : task.status === 'enroute_drop' ? 'in-progress' : 'pending',
        icon: 'fa-check-circle',
        timestamp: task.deliveredAt,
        description: task.deliveredAt 
          ? `Delivered to ${task.dropAddress}`
          : task.status === 'enroute_drop'
            ? 'En route to delivery location'
            : 'Delivery pending'
      }
    ];
    return steps;
  };

  const TaskCard = ({ task }) => {
    const completedSteps = getTimelineSteps(task).filter(s => s.status === 'completed').length;
    const totalSteps = getTimelineSteps(task).length;
    const progress = (completedSteps / totalSteps) * 100;

    return (
      <div className="task-history-card" onClick={() => setSelectedTask(task)}>
        <div className="task-card-header">
          <div className="task-title-section">
            <h4>{task.title}</h4>
            <span className="task-date">
              <i className="fas fa-clock"></i>
              {formatShortDate(task.createdAt)}
            </span>
          </div>
          <div 
            className="task-status-badge" 
            style={{ 
              background: `${getStatusColor(task.status)}20`,
              color: getStatusColor(task.status),
              border: `2px solid ${getStatusColor(task.status)}`
            }}
          >
            <i className={`fas ${getStatusIcon(task.status)}`}></i>
            {task.status.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>

        <div className="task-progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${getStatusColor(task.status)}, ${getStatusColor(task.status)}aa)`
              }}
            ></div>
          </div>
          <span className="progress-text">{completedSteps}/{totalSteps} steps completed</span>
        </div>

        <div className="task-quick-info">
          <div className="quick-info-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{task.pickupAddress}</span>
          </div>
          <i className="fas fa-arrow-right"></i>
          <div className="quick-info-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{task.dropAddress}</span>
          </div>
        </div>

        {task.barrelIntake && (
          <div className="intake-badge">
            <i className="fas fa-boxes"></i>
            {task.barrelIntake.barrelCount} barrels | {task.barrelIntake.name}
          </div>
        )}
      </div>
    );
  };

  const TaskDetailModal = ({ task, onClose }) => {
    const steps = getTimelineSteps(task);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              <i className="fas fa-tasks"></i>
              Task History Details
            </h3>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="modal-content">
            <div className="task-summary">
              <h4>{task.title}</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Task ID</span>
                  <span className="value">{task._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Created</span>
                  <span className="value">{formatDate(task.createdAt)}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Status</span>
                  <span className="value">
                    <span 
                      style={{ 
                        color: getStatusColor(task.status),
                        fontWeight: 600
                      }}
                    >
                      {task.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="timeline-section">
              <h4>
                <i className="fas fa-stream"></i>
                Workflow Timeline
              </h4>
              <div className="timeline">
                {steps.map((step, index) => (
                  <div key={index} className={`timeline-item ${step.status}`}>
                    <div className="timeline-marker">
                      <div 
                        className="marker-icon"
                        style={{
                          background: step.status === 'completed' 
                            ? '#10b981' 
                            : step.status === 'in-progress' 
                              ? '#f59e0b' 
                              : '#e5e7eb'
                        }}
                      >
                        <i className={`fas ${step.icon}`}></i>
                      </div>
                      {index < steps.length - 1 && (
                        <div 
                          className="timeline-line"
                          style={{
                            background: step.status === 'completed' ? '#10b981' : '#e5e7eb'
                          }}
                        ></div>
                      )}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h5>{step.label}</h5>
                        {step.timestamp && (
                          <span className="timeline-time">{formatDate(step.timestamp)}</span>
                        )}
                      </div>
                      <p className="timeline-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {task.barrelScanData && (
              <div className="detail-section">
                <h4>
                  <i className="fas fa-qrcode"></i>
                  Barrel Scan Details
                </h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Barrel Count</span>
                    <span className="value">{task.barrelScanData.barrelCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Scan Location</span>
                    <span className="value">{task.barrelScanData.location || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Scanned At</span>
                    <span className="value">{formatDate(task.barrelScanData.scannedAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {task.locationUpdates && task.locationUpdates.length > 0 && (
              <div className="detail-section">
                <h4>
                  <i className="fas fa-route"></i>
                  Location Tracking ({task.locationUpdates.length} updates)
                </h4>
                <div className="location-list">
                  {task.locationUpdates.slice(-5).reverse().map((loc, idx) => (
                    <div key={idx} className="location-item">
                      <i className="fas fa-map-pin"></i>
                      <div className="location-info">
                        <span className="location-coords">
                          Lat: {loc.latitude?.toFixed(6)}, Lng: {loc.longitude?.toFixed(6)}
                        </span>
                        <span className="location-time">{formatDate(loc.timestamp)}</span>
                      </div>
                      {loc.latitude && loc.longitude && (
                        <a
                          className="location-link"
                          href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.barrelIntake && (
              <div className="detail-section">
                <h4>
                  <i className="fas fa-warehouse"></i>
                  Barrel Intake Information
                </h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Customer Name</span>
                    <span className="value">{task.barrelIntake.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone</span>
                    <span className="value">{task.barrelIntake.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Barrel Count</span>
                    <span className="value">{task.barrelIntake.barrelCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status</span>
                    <span className="value intake-status">{task.barrelIntake.status}</span>
                  </div>
                  {task.barrelIntake.notes && (
                    <div className="detail-item full-width">
                      <span className="label">Notes</span>
                      <span className="value">{task.barrelIntake.notes}</span>
                    </div>
                  )}
                  {task.barrelIntake.totalAmount && (
                    <div className="detail-item">
                      <span className="label">Total Amount</span>
                      <span className="value">₹{task.barrelIntake.totalAmount}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {task.notes && (
              <div className="detail-section">
                <h4>
                  <i className="fas fa-sticky-note"></i>
                  Task Notes
                </h4>
                <p className="task-notes">{task.notes}</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="delivery-task-history">
      <div className="page-header">
        <h2>
          <i className="fas fa-history"></i>
          Task History
        </h2>
        <div className="header-actions">
          <div className="filter-group">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Tasks
            </button>
            <button 
              className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
              onClick={() => setFilter('today')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This Week
            </button>
            <button 
              className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              This Month
            </button>
          </div>
          <button className="refresh-btn" onClick={fetchHistory} disabled={loading}>
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={fetchHistory}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading task history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="no-data-container">
          <i className="fas fa-inbox"></i>
          <h3>No Task History Found</h3>
          <p>Your completed and ongoing tasks will appear here</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};

export default DeliveryTaskHistory;
