import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiTrendingUp, FiUsers, FiCalendar, FiAlertCircle, FiCheckCircle, FiBarChart2, FiPieChart, FiDownload } from 'react-icons/fi';
import InvoiceManagement from './InvoiceManagement';
import PaymentManagement from './PaymentManagement';
import SalaryManagement from './SalaryManagement';
import AccountantTimeTracking from './AccountantTimeTracking';

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    overview: {},
    financial: {},
    recent: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [overviewRes, financialRes, recentRes] = await Promise.all([
        fetch('/api/accountant/financial-reports/daily', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/accountant/time-tracking/summary', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/invoices/financial/summary', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setDashboardData({
        overview: overviewRes.data,
        timeTracking: timeTrackingRes.data,
        financial: financialRes.data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Staff</p>
              <p className="text-2xl font-bold">{dashboardData.timeTracking?.totalStaff || 0}</p>
            </div>
            <FiUsers className="text-3xl text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">On Time Today</p>
              <p className="text-2xl font-bold">{dashboardData.timeTracking?.onTime || 0}</p>
            </div>
            <FiCheckCircle className="text-3xl text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Late Arrivals</p>
              <p className="text-2xl font-bold">{dashboardData.timeTracking?.late || 0}</p>
            </div>
            <FiAlertCircle className="text-3xl text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Overtime</p>
              <p className="text-2xl font-bold">{dashboardData.timeTracking?.overtime || 0} hrs</p>
            </div>
            <FiClock className="text-3xl text-purple-200" />
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiDollarSign className="mr-2 text-green-600" />
          Today's Financial Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Salaries</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{(dashboardData.overview?.totalSalaries || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Invoices</p>
            <p className="text-2xl font-bold text-orange-600">
              ₹{(dashboardData.overview?.totalInvoices || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Net Cash Flow</p>
            <p className={`text-2xl font-bold ${(dashboardData.overview?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(dashboardData.overview?.netCashFlow || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('invoices')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
          >
            <FiDollarSign className="mx-auto text-2xl text-blue-600 mb-2" />
            <p className="text-sm font-medium">Manage Invoices</p>
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
          >
            <FiDollarSign className="mx-auto text-2xl text-green-600 mb-2" />
            <p className="text-sm font-medium">Record Payments</p>
          </button>
          <button
            onClick={() => setActiveTab('salaries')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors"
          >
            <FiUsers className="mx-auto text-2xl text-purple-600 mb-2" />
            <p className="text-sm font-medium">Generate Salaries</p>
          </button>
          <button
            onClick={() => setActiveTab('time-tracking')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors"
          >
            <FiClock className="mx-auto text-2xl text-orange-600 mb-2" />
            <p className="text-sm font-medium">Time Tracking</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'invoices':
        return <InvoiceManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'salaries':
        return <SalaryManagement />;
      case 'time-tracking':
        return <AccountantTimeTracking />;
      default:
        return renderOverview();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'invoices', label: 'Invoices', icon: FiDollarSign },
    { id: 'payments', label: 'Payments', icon: FiDollarSign },
    { id: 'salaries', label: 'Salaries', icon: FiUsers },
    { id: 'time-tracking', label: 'Time Tracking', icon: FiClock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default AccountantDashboard;
