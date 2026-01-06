import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Earnings.css';

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('today'); // today, week, month, all

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setError(null);
      const response = await fetch('/api/delivery/earnings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEarnings(data.summary || { today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
        setEarningsHistory(data.history || []);
      } else {
        setEarnings({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
        setEarningsHistory([]);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setError('Failed to load earnings data - API not available');
      setEarnings({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
      setEarningsHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEarnings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return earningsHistory.filter(earning => {
      const earningDate = new Date(earning.date);
      
      switch (filter) {
        case 'today':
          return earningDate >= today;
        case 'week':
          return earningDate >= weekStart;
        case 'month':
          return earningDate >= monthStart;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredEarnings = getFilteredEarnings();

  if (loading) {
    return (
      <div className="earnings">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings">
      <div className="page-header">
        <div className="header-content">
          <Link to="/delivery" className="back-btn">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
          <div className="page-title">
            <h1>💰 My Earnings</h1>
            <p>Track your delivery earnings and payment history</p>
          </div>
        </div>
        <button onClick={fetchEarnings} className="refresh-btn">
          <i className="fas fa-sync"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={fetchEarnings} className="retry-btn">
            <i className="fas fa-sync"></i>
            Retry
          </button>
        </div>
      )}

      {/* Earnings Summary */}
      <div className="earnings-summary">
        <div className="summary-card today">
          <div className="summary-icon">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="summary-content">
            <h3>₹{earnings.today}</h3>
            <p>Today's Earnings</p>
          </div>
        </div>

        <div className="summary-card week">
          <div className="summary-icon">
            <i className="fas fa-calendar-week"></i>
          </div>
          <div className="summary-content">
            <h3>₹{earnings.thisWeek}</h3>
            <p>This Week</p>
          </div>
        </div>

        <div className="summary-card month">
          <div className="summary-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="summary-content">
            <h3>₹{earnings.thisMonth}</h3>
            <p>This Month</p>
          </div>
        </div>

        <div className="summary-card total">
          <div className="summary-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="summary-content">
            <h3>₹{earnings.total}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
          onClick={() => setFilter('today')}
        >
          Today
        </button>
        <button 
          className={`filter-tab ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          This Week
        </button>
        <button 
          className={`filter-tab ${filter === 'month' ? 'active' : ''}`}
          onClick={() => setFilter('month')}
        >
          This Month
        </button>
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Time
        </button>
      </div>

      {/* Earnings History */}
      <div className="earnings-history">
        <h2>Earnings History</h2>
        {filteredEarnings.length === 0 ? (
          <div className="no-earnings">
            <i className="fas fa-receipt"></i>
            <h3>No earnings found</h3>
            <p>
              {filter === 'all' 
                ? 'No earnings recorded yet'
                : `No earnings for ${filter === 'today' ? 'today' : filter === 'week' ? 'this week' : 'this month'}`
              }
            </p>
          </div>
        ) : (
          <div className="earnings-list">
            {filteredEarnings.map(earning => (
              <div key={earning.id} className="earning-card">
                <div className="earning-header">
                  <div className="earning-info">
                    <div className="earning-type">
                      <i className={`fas ${earning.type === 'delivery' ? 'fa-truck' : 'fa-box-open'}`}></i>
                      <span>{earning.type?.toUpperCase() || 'TASK'}</span>
                    </div>
                    <div className="earning-date">
                      {new Date(earning.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="earning-amount">
                    ₹{earning.amount}
                  </div>
                </div>

                <div className="earning-body">
                  <div className="earning-details">
                    <p><i className="fas fa-user"></i> {earning.customer?.name || 'Unknown Customer'}</p>
                    <p><i className="fas fa-map-marker-alt"></i> {earning.location || 'No location'}</p>
                    {earning.distance && (
                      <p><i className="fas fa-route"></i> {earning.distance} km</p>
                    )}
                    {earning.duration && (
                      <p><i className="fas fa-clock"></i> {earning.duration}</p>
                    )}
                  </div>

                  {earning.breakdown && (
                    <div className="earning-breakdown">
                      <h4>Payment Breakdown</h4>
                      <div className="breakdown-items">
                        {earning.breakdown.base && (
                          <div className="breakdown-item">
                            <span>Base Rate:</span>
                            <span>₹{earning.breakdown.base}</span>
                          </div>
                        )}
                        {earning.breakdown.distance && (
                          <div className="breakdown-item">
                            <span>Distance Bonus:</span>
                            <span>₹{earning.breakdown.distance}</span>
                          </div>
                        )}
                        {earning.breakdown.bonus && (
                          <div className="breakdown-item">
                            <span>Performance Bonus:</span>
                            <span>₹{earning.breakdown.bonus}</span>
                          </div>
                        )}
                        <div className="breakdown-item total">
                          <span>Total:</span>
                          <span>₹{earning.amount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="earning-footer">
                  <div className="payment-status">
                    <span className={`status-badge ${earning.paymentStatus || 'pending'}`}>
                      {earning.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                  {earning.taskId && (
                    <Link 
                      to={`/delivery/task/${earning.taskId}`}
                      className="btn btn-outline"
                    >
                      <i className="fas fa-eye"></i>
                      View Task
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;