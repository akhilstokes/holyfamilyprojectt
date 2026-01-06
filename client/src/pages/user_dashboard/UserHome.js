
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import barrelService from '../../services/barrelManagementService';
import './UserHome.css';

const UserHome = () => {
  const [userStats, setUserStats] = useState({
    currentStock: 0,
    pendingRequests: 0,
    pendingDeliveries: 0,
    pendingPayments: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [stockData, requestsData] = await Promise.all([
        barrelService.getUserStock(),
        barrelService.getUserBarrelRequests()
      ]);
      
      setUserStats({
        currentStock: stockData.currentStock || 0,
        pendingRequests: requestsData.filter(r => r.status === 'pending').length,
        pendingDeliveries: requestsData.filter(r => r.status === 'approved').length,
        pendingPayments: 0, // Will be updated when payment system is integrated
        totalEarnings: stockData.totalSold * 4500 || 0 // Estimated earnings
      });

      setRecentActivity(requestsData.slice(0, 5).map(req => ({
        id: req._id,
        type: 'request',
        message: `Barrel request for ${req.quantity} barrels - ${req.status}`,
        date: req.createdAt,
        status: req.status.toLowerCase()
      })));
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRequest = async () => {
    const quantity = prompt('How many barrels do you need?', '1');
    if (!quantity || isNaN(quantity)) return;

    try {
      setLoading(true);
      await barrelService.createBarrelRequest({
        quantity: parseInt(quantity),
        notes: 'Quick request from dashboard'
      });
      
      alert('Barrel request submitted successfully!');
      fetchUserData();
    } catch (error) {
      alert('Error submitting request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
          date: '2024-01-20T09:15:00Z',
          status: 'pending'
        },
        {
          id: 3,
          type: 'payment',
          message: 'Payment of ₹5,250 received',
          date: '2024-01-19T16:45:00Z',
          status: 'completed'
        }
      ]);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      delivery: 'fa-truck',
      request: 'fa-plus-circle',
      payment: 'fa-rupee-sign',
      sell: 'fa-handshake'
    };
    return icons[type] || 'fa-info-circle';
  };

  const getActivityColor = (type) => {
    const colors = {
      delivery: 'activity-delivery',
      request: 'activity-request',
      payment: 'activity-payment',
      sell: 'activity-sell'
    };
    return colors[type] || 'activity-default';
  };

  return (
    <div className="user-home">
      <div className="welcome-section">
        <h1>🏠 User Dashboard</h1>
        <p>Manage your barrel requests, stock, and earnings</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card stat-stock">
          <div className="stat-icon">
            <i className="fas fa-drum"></i>
          </div>
          <div className="stat-content">
            <h3>{userStats.currentStock}</h3>
            <p>Current Stock</p>
          </div>
        </div>

        <div className="stat-card stat-requests">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{userStats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="stat-card stat-deliveries">
          <div className="stat-icon">
            <i className="fas fa-truck"></i>
          </div>
          <div className="stat-content">
            <h3>{userStats.pendingDeliveries}</h3>
            <p>Pending Deliveries</p>
          </div>
        </div>

        <div className="stat-card stat-earnings">
          <div className="stat-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-content">
            <h3>₹{userStats.totalEarnings.toLocaleString()}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            onClick={handleQuickRequest} 
            className="action-card action-request"
            disabled={loading}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
          >
            <div className="action-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="action-content">
              <h3>Quick Request</h3>
              <p>Fast barrel request</p>
            </div>
          </button>

          <Link to="/user/request-barrels" className="action-card action-request">
            <div className="action-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <div className="action-content">
              <h3>Request New Barrels</h3>
              <p>Submit a detailed request</p>
            </div>
          </Link>

          <Link to="/user/my-stock" className="action-card action-stock">
            <div className="action-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <div className="action-content">
              <h3>My Barrel Stock</h3>
              <p>View your current barrel inventory</p>
            </div>
          </Link>

          <Link to="/user/sell-barrels" className="action-card action-sell">
            <div className="action-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="action-content">
              <h3>Sell Barrels</h3>
              <p>Submit barrels for selling</p>
            </div>
          </Link>

          <Link to="/user/delivery-status" className="action-card action-delivery">
            <div className="action-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="action-content">
              <h3>Delivery Status</h3>
              <p>Track your deliveries</p>
            </div>
          </Link>

          <Link to="/user/bills-payments" className="action-card action-bills">
            <div className="action-icon">
              <i className="fas fa-receipt"></i>
            </div>
            <div className="action-content">
              <h3>Bills & Payments</h3>
              <p>View bills and payment history</p>
            </div>
          </Link>

          <Link to="/user/transaction-history" className="action-card action-history">
            <div className="action-icon">
              <i className="fas fa-history"></i>
            </div>
            <div className="action-content">
              <h3>Transaction History</h3>
              <p>Complete transaction records</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className={`activity-item ${getActivityColor(activity.type)}`}>
              <div className="activity-icon">
                <i className={`fas ${getActivityIcon(activity.type)}`}></i>
              </div>
              <div className="activity-content">
                <p>{activity.message}</p>
                <span className="activity-date">
                  {new Date(activity.date).toLocaleString()}
                </span>
              </div>
              <div className={`activity-status status-${activity.status}`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
        <Link to="/user/all-activity" className="view-all-link">
          View All Activity →
        </Link>
      </div>

      {/* Additional Tools */}
      <div className="additional-tools">
        <h2>Additional Tools</h2>
        <div className="tools-grid">
          <Link to="/user/live-rate" className="tool-card">
            <i className="fas fa-chart-line"></i>
            <span>Live Rates</span>
          </Link>
          
          <Link to="/user/rate-history" className="tool-card">
            <i className="fas fa-history"></i>
            <span>Rate History</span>
          </Link>
          
          <Link to="/user/rubber-calculator" className="tool-card">
            <i className="fas fa-calculator"></i>
            <span>Calculator</span>
          </Link>
          
          <Link to="/user/notifications" className="tool-card">
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
          </Link>
          
          <Link to="/user/profile" className="tool-card">
            <i className="fas fa-user-edit"></i>
            <span>Profile</span>
          </Link>
          
          <Link to="/user/ai-doubt-resolver" className="tool-card">
            <i className="fas fa-robot"></i>
            <span>AI Expert</span>
          </Link>
        </div>
      </div>
    </div>
  );
};


 import React from 'react';
import { Link } from 'react-router-dom';

const tileStyle = {
  display: 'block',
  padding: '16px',
  borderRadius: 8,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  textDecoration: 'none',
  color: '#111827'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 16
};

const UserHome = () => (
  <div className="container py-3">
    <h2 style={{ marginBottom: 12 }}>User Dashboard</h2>
    <div style={gridStyle}>
      <Link to="/user/menu" style={tileStyle}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Menu</div>
        <div style={{ color: '#6b7280' }}>Open quick actions and tools</div>
      </Link>
    </div>
  </div>
);


export default UserHome;