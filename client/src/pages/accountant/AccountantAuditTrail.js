import React, { useState, useEffect, useMemo } from 'react';
import { FiShield, FiSearch, FiFilter, FiDownload, FiUser, FiClock, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const AccountantAuditTrail = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/audit-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.entityType?.toLowerCase().includes(term) ||
        log.entityId?.toLowerCase().includes(term) ||
        log.description?.toLowerCase().includes(term) ||
        log.user?.name?.toLowerCase().includes(term) ||
        log.user?.email?.toLowerCase().includes(term)
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user?._id === userFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateTo + 'T23:59:59'));
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [auditLogs, searchTerm, actionFilter, userFilter, dateFrom, dateTo]);

  const uniqueUsers = useMemo(() => {
    const users = new Map();
    auditLogs.forEach(log => {
      if (log.user && !users.has(log.user._id)) {
        users.set(log.user._id, log.user);
      }
    });
    return Array.from(users.values());
  }, [auditLogs]);

  const actionTypes = ['create', 'update', 'delete', 'approve', 'reject', 'payment', 'export'];

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return <FiPlus className="text-green-600" />;
      case 'update':
        return <FiEdit2 className="text-blue-600" />;
      case 'delete':
        return <FiTrash2 className="text-red-600" />;
      default:
        return <FiShield className="text-slate-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-700';
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'delete':
        return 'bg-red-100 text-red-700';
      case 'approve':
        return 'bg-purple-100 text-purple-700';
      case 'reject':
        return 'bg-orange-100 text-orange-700';
      case 'payment':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'IP Address'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.user?.name || log.user?.email || 'System',
      log.action,
      log.entityType || '-',
      log.entityId || '-',
      log.description || '-',
      log.ipAddress || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Audit Trail Viewer</h1>
          <p className="text-slate-600 mt-1">View system logs and transaction history for compliance</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <FiDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Logs</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{auditLogs.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiShield className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Today's Activity</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {auditLogs.filter(log => {
                  const today = new Date();
                  const logDate = new Date(log.timestamp);
                  return logDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiClock className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Unique Users</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{uniqueUsers.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiUser className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Filtered Results</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{filteredLogs.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FiFilter className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <label htmlFor="audit-search" className="sr-only">Search audit logs</label>
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              id="audit-search"
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search audit logs"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <label htmlFor="audit-action-filter" className="sr-only">Filter by action</label>
          <select
            id="audit-action-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter audit logs by action type"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Actions</option>
            {actionTypes.map(action => (
              <option key={action} value={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</option>
            ))}
          </select>
          <label htmlFor="audit-user-filter" className="sr-only">Filter by user</label>
          <select
            id="audit-user-filter"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            aria-label="Filter audit logs by user"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user._id} value={user._id}>{user.name || user.email}</option>
            ))}
          </select>
          <label htmlFor="audit-date-from" className="sr-only">From date</label>
          <input
            id="audit-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Filter audit logs from date"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
          <label htmlFor="audit-date-to" className="sr-only">To date</label>
          <input
            id="audit-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Filter audit logs to date"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <FiClock className="text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 p-2 rounded-full">
                          <FiUser className="text-slate-600 text-sm" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {log.user?.name || log.user?.email || 'System'}
                          </div>
                          {log.user?.role && (
                            <div className="text-xs text-slate-500">{log.user.role}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{log.entityType || '-'}</div>
                      {log.entityId && (
                        <div className="text-xs text-slate-400">{log.entityId.substring(0, 8)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{log.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-sky-600 hover:text-sky-800">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Audit Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Timestamp</label>
                <p className="text-slate-800">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">User</label>
                <p className="text-slate-800">{selectedLog.user?.name || selectedLog.user?.email || 'System'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Action</label>
                <p className="text-slate-800 capitalize">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Entity Type</label>
                <p className="text-slate-800">{selectedLog.entityType || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Entity ID</label>
                <p className="text-slate-800 font-mono text-sm">{selectedLog.entityId || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <p className="text-slate-800">{selectedLog.description || '-'}</p>
              </div>
              {selectedLog.changes && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Changes</label>
                  <pre className="bg-slate-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.ipAddress && (
                <div>
                  <label className="text-sm font-medium text-slate-700">IP Address</label>
                  <p className="text-slate-800 font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantAuditTrail;
