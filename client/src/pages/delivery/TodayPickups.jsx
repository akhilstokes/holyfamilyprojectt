import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TodayPickups.css';

const TodayPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending, in_progress

  useEffect(() => {
    fetchTodayPickups();
  }, []);

  const fetchTodayPickups = async () => {
    try {
      setError(null);
      const response = await fetch('/api/delivery/today-pickups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPickups(data.pickups || []);
      } else {
        setPickups([]);
      }
    } catch (error) {
      console.error('Error fetching today pickups:', error);
      setError('Failed to load today\'s pickups - API not available');
      setPickups([]);
    } finally {
      setLoading(false);
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

  const filteredPickups = pickups.filter(pickup => {
    if (filter === 'all') return true;
    return pickup.status === filter;
  });

  const getFilterCounts = () => {
    return {
      all: pickups.length,
      completed: pickups.filter(p => p.status === 'completed').length,
      in_progress: pickups.filter(p => p.status === 'in_progress').length,
      pending: pickups.filter(p => p.status === 'assigned').length
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="today-pickups">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading today's pickups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="today-pickups">
      <div className="page-header">
        <div className="header-content">
          <Link to="/delivery" className="back-btn">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
          <div className="page-title">
            <h1>📦 Today's Pickups</h1>
            <p>All pickup tasks scheduled for today</p>
          </div>
        </div>
        <button onClick={fetchTodayPickups} className="refresh-btn">
          <i className="fas fa-sync"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchTodayPickups} className="retry-btn">
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
          className={`filter-tab ${filter === 'assigned' ? 'active' : ''}`}
          onClick={() => setFilter('assigned')}
        >
          Pending ({counts.pending})
        </button>
        <button 
          className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilter('in_progress')}
        >
          In Progress ({counts.in_progress})
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({counts.completed})
        </button>
      </div>

      {/* Pickups List */}
      <div className="pickups-container">
        {filteredPickups.length === 0 ? (
          <div className="no-pickups">
            <i className="fas fa-box-open"></i>
            <h3>No pickups found</h3>
            <p>
              {filter === 'all' 
                ? 'No pickups scheduled for today'
                : `No ${filter.replace('_', ' ')} pickups for today`
              }
            </p>
          </div>
        ) : (
          <div className="pickups-list">
            {filteredPickups.map(pickup => (
              <div key={pickup.id} className="pickup-card">
                <div className="pickup-header">
                  <div className="pickup-info">
                    <div className="pickup-id">
                      <i className="fas fa-box-open"></i>
                      <span>#{pickup.id}</span>
                    </div>
                    <div className={`priority-badge ${getPriorityColor(pickup.priority)}`}>
                      {pickup.priority?.toUpperCase() || 'NORMAL'}
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(pickup.status)}`}>
                    {pickup.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>

                <div className="pickup-body">
                  <h3>{pickup.title || `Pickup from ${pickup.customer?.name}`}</h3>
                  
                  <div className="customer-info">
                    <div className="customer-details">
                      <p><i className="fas fa-user"></i> {pickup.customer?.name || 'Unknown Customer'}</p>
                      <p><i className="fas fa-phone"></i> {pickup.customer?.phone || 'No phone'}</p>
                      <p><i className="fas fa-map-marker-alt"></i> {pickup.customer?.address || 'No address'}</p>
                    </div>
                  </div>

                  <div className="pickup-details">
                    <div className="detail-item">
                      <span className="label">Scheduled:</span>
                      <span className="value">
                        {pickup.scheduledTime 
                          ? new Date(pickup.scheduledTime).toLocaleString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{pickup.estimatedDuration || 'Not specified'}</span>
                    </div>
                    {pickup.quantity && (
                      <div className="detail-item">
                        <span className="label">Quantity:</span>
                        <span className="value">{pickup.quantity} barrels</span>
                      </div>
                    )}
                    {pickup.barrelType && (
                      <div className="detail-item">
                        <span className="label">Barrel Type:</span>
                        <span className="value">{pickup.barrelType}</span>
                      </div>
                    )}
                    {pickup.notes && (
                      <div className="detail-item">
                        <span className="label">Notes:</span>
                        <span className="value">{pickup.notes}</span>
                      </div>
                    )}
                    {pickup.completedTime && (
                      <div className="detail-item">
                        <span className="label">Completed:</span>
                        <span className="value">
                          {new Date(pickup.completedTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pickup-actions">
                  <div className="navigation-buttons">
                    {pickup.customer?.location && (
                      <a 
                        href={pickup.customer.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-map"></i>
                        Google Maps
                      </a>
                    )}
                    {pickup.customer?.phone && (
                      <a 
                        href={`tel:${pickup.customer.phone}`}
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-phone"></i>
                        Call Customer
                      </a>
                    )}
                    <Link 
                      to={`/delivery/task/${pickup.id}`}
                      className="btn btn-primary"
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

export default TodayPickups;