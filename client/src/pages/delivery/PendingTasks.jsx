import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PendingTasks.css';

const PendingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, delivery, pickup, high_priority

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      setError(null);
      const response = await fetch('/api/delivery/pending-tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      setError('Failed to load pending tasks - API not available');
      setTasks([]);
    } finally {
      setLoading(false);
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
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Refresh tasks after action
        await fetchPendingTasks();
      } else {
        setError(`Failed to ${action} task`);
      }
    } catch (error) {
      console.error(`Error ${action} task:`, error);
      setError(`Failed to ${action} task`);
    }
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

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'delivery') return task.type === 'delivery';
    if (filter === 'pickup') return task.type === 'pickup';
    if (filter === 'high_priority') return task.priority === 'high';
    return true;
  });

  const getFilterCounts = () => {
    return {
      all: tasks.length,
      delivery: tasks.filter(t => t.type === 'delivery').length,
      pickup: tasks.filter(t => t.type === 'pickup').length,
      high_priority: tasks.filter(t => t.priority === 'high').length
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="pending-tasks">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading pending tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-tasks">
      <div className="page-header">
        <div className="header-content">
          <Link to="/delivery" className="back-btn">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
          <div className="page-title">
            <h1>⏰ Pending Tasks</h1>
            <p>All tasks waiting to be started or completed</p>
          </div>
        </div>
        <button onClick={fetchPendingTasks} className="refresh-btn">
          <i className="fas fa-sync"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchPendingTasks} className="retry-btn">
            <i className="fas fa-sync"></i>
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        <button 
          className={`filter-tab ${filter === 'delivery' ? 'active' : ''}`}
          onClick={() => setFilter('delivery')}
        >
          Deliveries ({counts.delivery})
        </button>
        <button 
          className={`filter-tab ${filter === 'pickup' ? 'active' : ''}`}
          onClick={() => setFilter('pickup')}
        >
          Pickups ({counts.pickup})
        </button>
        <button 
          className={`filter-tab ${filter === 'high_priority' ? 'active' : ''}`}
          onClick={() => setFilter('high_priority')}
        >
          High Priority ({counts.high_priority})
        </button>
      </div>

      {/* Tasks List */}
      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <i className="fas fa-clipboard-check"></i>
            <h3>No pending tasks</h3>
            <p>
              {filter === 'all' 
                ? 'All tasks are completed or no tasks assigned'
                : `No ${filter.replace('_', ' ')} tasks pending`
              }
            </p>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div className="task-info">
                    <div className="task-type">
                      <i className={`fas ${getTaskIcon(task.type)}`}></i>
                      <span>{task.type?.toUpperCase() || 'TASK'}</span>
                    </div>
                    <div className={`priority-badge ${getPriorityColor(task.priority)}`}>
                      {task.priority?.toUpperCase() || 'NORMAL'}
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(task.status)}`}>
                    {task.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </div>
                </div>

                <div className="task-body">
                  <h3>{task.title || `${task.type} task`}</h3>
                  
                  <div className="customer-info">
                    <div className="customer-details">
                      <p><i className="fas fa-user"></i> {task.customer?.name || 'Unknown Customer'}</p>
                      <p><i className="fas fa-phone"></i> {task.customer?.phone || 'No phone'}</p>
                      <p><i className="fas fa-map-marker-alt"></i> {task.customer?.address || 'No address'}</p>
                    </div>
                  </div>

                  <div className="task-details">
                    <div className="detail-item">
                      <span className="label">Scheduled:</span>
                      <span className="value">
                        {task.scheduledTime 
                          ? new Date(task.scheduledTime).toLocaleString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{task.estimatedDuration || 'Not specified'}</span>
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
                    {task.notes && (
                      <div className="detail-item">
                        <span className="label">Notes:</span>
                        <span className="value">{task.notes}</span>
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
                  
                  <div className="navigation-buttons">
                    {task.customer?.location && (
                      <a 
                        href={task.customer.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-map"></i>
                        Google Maps
                      </a>
                    )}
                    {task.customer?.phone && (
                      <a 
                        href={`tel:${task.customer.phone}`}
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-phone"></i>
                        Call Customer
                      </a>
                    )}
                    <Link 
                      to={`/delivery/task/${task.id}`}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-eye"></i>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingTasks;