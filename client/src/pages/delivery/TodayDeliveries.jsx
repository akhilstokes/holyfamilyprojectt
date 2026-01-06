import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TodayDeliveries.css';

const TodayDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending, in_progress

  useEffect(() => {
    fetchTodayDeliveries();
  }, []);

  const fetchTodayDeliveries = async () => {
    try {
      setError(null);
      const response = await fetch('/api/delivery/today-deliveries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries || []);
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching today deliveries:', error);
      setError('Failed to load today\'s deliveries - API not available');
      setDeliveries([]);
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

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    return delivery.status === filter;
  });

  const getFilterCounts = () => {
    return {
      all: deliveries.length,
      completed: deliveries.filter(d => d.status === 'completed').length,
      in_progress: deliveries.filter(d => d.status === 'in_progress').length,
      pending: deliveries.filter(d => d.status === 'assigned').length
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="today-deliveries">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading today's deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="today-deliveries">
      <div className="page-header">
        <div className="header-content">
          <Link to="/delivery" className="back-btn">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
          <div className="page-title">
            <h1>📦 Today's Deliveries</h1>
            <p>All delivery tasks scheduled for today</p>
          </div>
        </div>
        <button onClick={fetchTodayDeliveries} className="refresh-btn">
          <i className="fas fa-sync"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchTodayDeliveries} className="retry-btn">
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

      {/* Deliveries List */}
      <div className="deliveries-container">
        {filteredDeliveries.length === 0 ? (
          <div className="no-deliveries">
            <i className="fas fa-truck"></i>
            <h3>No deliveries found</h3>
            <p>
              {filter === 'all' 
                ? 'No deliveries scheduled for today'
                : `No ${filter.replace('_', ' ')} deliveries for today`
              }
            </p>
          </div>
        ) : (
          <div className="deliveries-list">
            {filteredDeliveries.map(delivery => (
              <div key={delivery.id} className="delivery-card">
                <div className="delivery-header">
                  <div className="delivery-info">
                    <div className="delivery-id">
                      <i className="fas fa-truck"></i>
                      <span>#{delivery.id}</span>
                    </div>
                    <div className={`priority-badge ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority?.toUpperCase() || 'NORMAL'}
                    </div>
                  </div>
                  <div className={`status-badge ${getStatusColor(delivery.status)}`}>
                    {delivery.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>

                <div className="delivery-body">
                  <h3>{delivery.title || `Delivery to ${delivery.customer?.name}`}</h3>
                  
                  <div className="customer-info">
                    <div className="customer-details">
                      <p><i className="fas fa-user"></i> {delivery.customer?.name || 'Unknown Customer'}</p>
                      <p><i className="fas fa-phone"></i> {delivery.customer?.phone || 'No phone'}</p>
                      <p><i className="fas fa-map-marker-alt"></i> {delivery.customer?.address || 'No address'}</p>
                    </div>
                  </div>

                  <div className="delivery-details">
                    <div className="detail-item">
                      <span className="label">Scheduled:</span>
                      <span className="value">
                        {delivery.scheduledTime 
                          ? new Date(delivery.scheduledTime).toLocaleString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span className="value">{delivery.estimatedDuration || 'Not specified'}</span>
                    </div>
                    {delivery.barrels && delivery.barrels.length > 0 && (
                      <div className="detail-item">
                        <span className="label">Barrels:</span>
                        <div className="barrel-list">
                          {delivery.barrels.map(barrelId => (
                            <span key={barrelId} className="barrel-id">{barrelId}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {delivery.completedTime && (
                      <div className="detail-item">
                        <span className="label">Completed:</span>
                        <span className="value">
                          {new Date(delivery.completedTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="delivery-actions">
                  <div className="navigation-buttons">
                    {delivery.customer?.location && (
                      <a 
                        href={delivery.customer.location} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-map"></i>
                        Google Maps
                      </a>
                    )}
                    {delivery.customer?.phone && (
                      <a 
                        href={`tel:${delivery.customer.phone}`}
                        className="btn btn-secondary"
                      >
                        <i className="fas fa-phone"></i>
                        Call Customer
                      </a>
                    )}
                    <Link 
                      to={`/delivery/task/${delivery.id}`}
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

export default TodayDeliveries;