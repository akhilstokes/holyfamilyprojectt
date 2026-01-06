import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiAlertCircle, FiTrendingUp, FiCalendar, FiFilter, FiDownload } from 'react-icons/fi';

const AccountantTimeTracking = () => {
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    department: 'all',
    status: 'all'
  });
  const [summary, setSummary] = useState({
    totalStaff: 0,
    onTime: 0,
    late: 0,
    overtime: 0,
    earlyDeparture: 0
  });

  useEffect(() => {
    fetchTimeData();
  }, [filters]);

  const fetchTimeData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/accountant/time-tracking', {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTimeData(response.data.data);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error fetching time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'overtime':
        return 'bg-blue-100 text-blue-800';
      case 'early-departure':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on-time':
        return <FiClock className="text-green-500" />;
      case 'late':
        return <FiAlertCircle className="text-red-500" />;
      case 'overtime':
        return <FiTrendingUp className="text-blue-500" />;
      case 'early-departure':
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const calculateOvertime = (arrival, departure) => {
    if (!arrival || !departure) return 0;
    const arrTime = new Date(`2024-01-01 ${arrival}`);
    const depTime = new Date(`2024-01-01 ${departure}`);
    const diff = depTime - arrTime;
    const hours = diff / (1000 * 60 * 60);
    return hours > 8 ? (hours - 8).toFixed(2) : 0;
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Department', 'Arrival Time', 'Departure Time', 'Status', 'Overtime Hours'],
      ...timeData.map(item => [
        item.name,
        item.department,
        item.arrivalTime || 'N/A',
        item.departureTime || 'N/A',
        item.status,
        calculateOvertime(item.arrivalTime, item.departureTime)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracking-${filters.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Time Tracking</h1>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Staff</p>
              <p className="text-2xl font-bold text-blue-900">{summary.totalStaff}</p>
            </div>
            <FiClock className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">On Time</p>
              <p className="text-2xl font-bold text-green-900">{summary.onTime}</p>
            </div>
            <FiClock className="text-green-500 text-2xl" />
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Late Arrival</p>
              <p className="text-2xl font-bold text-red-900">{summary.late}</p>
            </div>
            <FiAlertCircle className="text-red-500 text-2xl" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Overtime</p>
              <p className="text-2xl font-bold text-blue-900">{summary.overtime}</p>
            </div>
            <FiTrendingUp className="text-blue-500 text-2xl" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Early Departure</p>
              <p className="text-2xl font-bold text-yellow-900">{summary.earlyDeparture}</p>
            </div>
            <FiClock className="text-yellow-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="field_staff">Field Staff</option>
              <option value="lab">Lab</option>
              <option value="delivery">Delivery</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="on-time">On Time</option>
              <option value="late">Late</option>
              <option value="overtime">Overtime</option>
              <option value="early-departure">Early Departure</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ date: new Date().toISOString().split('T')[0], department: 'all', status: 'all' })}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Time Tracking Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading time data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrival Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departure Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {record.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="capitalize">{record.department?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.arrivalTime || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.departureTime || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1 capitalize">{record.status?.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateOvertime(record.arrivalTime, record.departureTime)} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountantTimeTracking;
