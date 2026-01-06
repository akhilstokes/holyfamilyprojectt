import React, { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AccountantSelfAttendance = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMyAttendance();
  }, [month, year]);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const response = await fetch(`${base}/api/workers/field/attendance/history?from=${startDate}&to=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendance(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700';
      case 'half-day':
        return 'bg-yellow-100 text-yellow-700';
      case 'leave':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const stats = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    leave: attendance.filter(a => a.status === 'leave').length,
    total: attendance.length
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
          <h1 className="text-3xl font-bold text-slate-800">My Attendance</h1>
          <p className="text-slate-600 mt-1">View your attendance history</p>
        </div>
        <div className="flex gap-3">
          <label htmlFor="my-attendance-month-select" className="sr-only">Select month</label>
          <select
            id="my-attendance-month-select"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            aria-label="Select month for attendance history"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <label htmlFor="my-attendance-year-input" className="sr-only">Select year</label>
          <input
            id="my-attendance-year-input"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            aria-label="Select year for attendance history"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 w-24"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Days</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCalendar className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Present</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.present}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Absent</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.absent}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiXCircle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">On Leave</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.leave}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCalendar className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Attendance History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No attendance records found for this period
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatTime(record.checkInAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatTime(record.checkOutAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status || 'absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountantSelfAttendance;

