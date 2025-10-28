import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SalaryNotificationBadge = ({ userId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = token ? { 
    Authorization: `Bearer ${token}`, 
    'Content-Type': 'application/json' 
  } : { 'Content-Type': 'application/json' };

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base}/api/salary-notifications`, { headers });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.data?.filter(n => !n.isRead).length || 0);
      }
    } catch (error) {
      console.error('Error loading salary notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${base}/api/salary-notifications/${notificationId}/read`, {
        method: 'PUT',
        headers
      });
      if (response.ok) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        Loading notifications...
      </div>
    );
  }

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        position: 'relative',
        padding: '8px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onClick={() => {
        // Navigate based on user role
        if (!user) {
          console.log('User not found');
          return;
        }
        
        switch (user.role) {
          case 'accountant':
            navigate('/accountant/salary'); // Accountant's My Salary page
            break;
          case 'admin':
            navigate('/admin/home'); // Admin dashboard
            break;
          case 'manager':
            navigate('/manager/home'); // Manager dashboard
            break;
          case 'staff':
          case 'field_staff':
          case 'delivery_staff':
            navigate('/staff/my-salary'); // Staff salary page
            break;
          case 'lab':
          case 'lab_staff':
          case 'lab_manager':
            navigate('/lab/dashboard'); // Lab dashboard
            break;
          default:
            navigate('/user'); // Default user dashboard
        }
      }}
      >
        <span>💰</span>
        <span>{unreadCount}</span>
        <span>Salary Alert</span>
      </div>
      
      {/* Tooltip */}
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '4px',
        padding: '8px 12px',
        backgroundColor: '#333',
        color: 'white',
        borderRadius: '4px',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        zIndex: 1000,
        opacity: 0,
        transition: 'opacity 0.2s',
        pointerEvents: 'none'
      }}
      onMouseEnter={(e) => e.target.style.opacity = '1'}
      onMouseLeave={(e) => e.target.style.opacity = '0'}
      >
        Click to view salary notifications
      </div>
    </div>
  );
};

export default SalaryNotificationBadge;
