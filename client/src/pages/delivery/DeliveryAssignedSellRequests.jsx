import React, { useEffect, useState } from 'react';
import './DeliveryAssignedSellRequests.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const DeliveryAssignedSellRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('scheduledAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const load = async () => {
    setLoading(true); 
    setError('');
   
    try {
      // Fetch delivery tasks and fallback sell-requests assignments in parallel
      const [tasksRes, assignedReqRes] = await Promise.all([
        fetch(`${API}/api/delivery/my`, { headers: authHeaders(), cache: 'no-cache' }).catch(() => null),
        fetch(`${API}/api/sell-requests/delivery/my-assigned`, { headers: authHeaders(), cache: 'no-cache' }).catch(() => null)
      ]);

      // Normalize delivery tasks
      let tasks = [];
      if (tasksRes && tasksRes.ok) {
        const data = await tasksRes.json();
        tasks = Array.isArray(data) ? data : [];
      }

      // Normalize assigned sell-requests
      let assigned = [];
      if (assignedReqRes && assignedReqRes.ok) {
        const data = await assignedReqRes.json();
        const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
        assigned = list.map(r => ({
          _id: `sr_${r._id}`,
          title: r._type ? `${r._type} Pickup` : (r.barrelCount != null ? `Sell Request Pickup (${r.barrelCount})` : 'Sell Request Pickup'),
          status: r.status || 'DELIVER_ASSIGNED',
          scheduledAt: r.assignedAt || r.updatedAt || r.createdAt,
          createdAt: r.createdAt,
          customerUserId: r.customerUserId || { name: 'Unknown Customer' },
          barrelCount: r.barrelCount || 0,
          priority: r.priority || 'medium',
          location: r.location || 'Not specified',
          phone: r.customerUserId?.phone || 'Not provided'
        }));
      }

      const merged = [...tasks, ...assigned];
      setRows(merged);
    } catch (e) {
      setError(e?.message || 'Failed to load assigned requests');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  
  // Auto-refresh every 30s (reduced frequency for better UX)
  useEffect(() => {
    const id = setInterval(() => { load(); }, 30000);
    return () => clearInterval(id);
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    setBusyId(taskId);
    try {
      const response = await fetch(`${API}/api/delivery/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setRows(prev => prev.map(row => 
          row._id === taskId ? { ...row, status: newStatus } : row
        ));
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setBusyId('');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'DELIVER_ASSIGNED': '#f59e0b',
      'pickup_scheduled': '#3b82f6',
      'enroute_pickup': '#8b5cf6',
      'picked_up': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'DELIVER_ASSIGNED': 'fa-clipboard-list',
      'pickup_scheduled': 'fa-clock',
      'enroute_pickup': 'fa-truck',
      'picked_up': 'fa-box',
      'delivered': 'fa-check-circle',
      'cancelled': 'fa-times-circle'
    };
    return statusIcons[status] || 'fa-question-circle';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return priorityColors[priority] || '#6b7280';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return '-';
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) ? '-' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  // Filter and sort logic
  const filteredAndSortedRows = rows
    .filter(row => {
      if (filter !== 'all' && row.status !== filter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          row.title?.toLowerCase().includes(searchLower) ||
          row.customerUserId?.name?.toLowerCase().includes(searchLower) ||
          row.customerUserId?.email?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'scheduledAt' || sortBy === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getTaskStats = () => {
    const stats = {
      total: rows.length,
      pending: rows.filter(r => ['DELIVER_ASSIGNED', 'pickup_scheduled'].includes(r.status)).length,
      inProgress: rows.filter(r => ['enroute_pickup', 'picked_up'].includes(r.status)).length,
      completed: rows.filter(r => r.status === 'delivered').length
    };
    return stats;
  };

  const stats = getTaskStats();

  return (
    <div className="delivery-assigned-requests">
      <div className="page-header">
        <h1>My Assigned Requests</h1>
        <p>Manage your assigned delivery and pickup tasks</p>
      </div>

      {error && (
        <div className="error-banner">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="controls">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Tasks</option>
          <option value="DELIVER_ASSIGNED">Assigned</option>
          <option value="pickup_scheduled">Scheduled</option>
          <option value="enroute_pickup">En Route</option>
          <option value="picked_up">Picked Up</option>
          <option value="delivered">Delivered</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="scheduledAt">Sort by Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="status">Sort by Status</option>
        </select>

        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filteredAndSortedRows.length === 0 ? (
            <div className="no-tasks">
              <i className="fas fa-clipboard-list"></i>
              <h3>No tasks found</h3>
              <p>No assigned requests match your current filters</p>
            </div>
          ) : (
            filteredAndSortedRows.map(row => (
              <div key={row._id} className="task-card">
                <div className="task-header">
                  <div className="task-info">
                    <h3>{row.title}</h3>
                    <div className="task-meta">
                      <span className="priority" style={{ color: getPriorityColor(row.priority) }}>
                        <i className="fas fa-flag"></i>
                        {row.priority?.toUpperCase() || 'MEDIUM'}
                      </span>
                      <span className="date">
                        <i className="fas fa-calendar"></i>
                        {formatDate(row.scheduledAt)}
                      </span>
                      <span className="time">
                        <i className="fas fa-clock"></i>
                        {formatTime(row.scheduledAt)}
                      </span>
                    </div>
                  </div>
                  <div className="task-status">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(row.status) }}
                    >
                      <i className={`fas ${getStatusIcon(row.status)}`}></i>
                      {row.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="task-body">
                  <div className="customer-info">
                    <p><i className="fas fa-user"></i> {row.customerUserId?.name || 'Unknown Customer'}</p>
                    <p><i className="fas fa-phone"></i> {row.phone || 'No phone'}</p>
                    <p><i className="fas fa-map-marker-alt"></i> {row.location || 'No location'}</p>
                    {row.barrelCount && (
                      <p><i className="fas fa-box"></i> {row.barrelCount} barrels</p>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  {row.status === 'DELIVER_ASSIGNED' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => updateTaskStatus(row._id, 'pickup_scheduled')}
                      disabled={busyId === row._id}
                    >
                      {busyId === row._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-calendar-check"></i>
                      )}
                      Schedule Pickup
                    </button>
                  )}
                  
                  {row.status === 'pickup_scheduled' && (
                    <button 
                      className="btn btn-warning"
                      onClick={() => updateTaskStatus(row._id, 'enroute_pickup')}
                      disabled={busyId === row._id}
                    >
                      {busyId === row._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-truck"></i>
                      )}
                      Start Journey
                    </button>
                  )}
                  
                  {row.status === 'enroute_pickup' && (
                    <button 
                      className="btn btn-info"
                      onClick={() => updateTaskStatus(row._id, 'picked_up')}
                      disabled={busyId === row._id}
                    >
                      {busyId === row._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-box"></i>
                      )}
                      Mark Picked Up
                    </button>
                  )}
                  
                  {row.status === 'picked_up' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => updateTaskStatus(row._id, 'delivered')}
                      disabled={busyId === row._id}
                    >
                      {busyId === row._id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-check-circle"></i>
                      )}
                      Mark Delivered
                    </button>
                  )}

                  <button className="btn btn-secondary">
                    <i className="fas fa-map"></i>
                    Navigate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignedSellRequests;
