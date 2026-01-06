import React, { useState, useEffect, useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiPieChart, FiDownload, FiFilter } from 'react-icons/fi';

const AccountantProfitability = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [profitData, setProfitData] = useState({
    products: [],
    batches: [],
    summary: {}
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [viewMode, setViewMode] = useState('products'); // 'products' or 'batches'

  useEffect(() => {
    fetchProfitData();
  }, [selectedPeriod, viewMode]);

  const fetchProfitData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/profitability?month=${selectedPeriod.month}&year=${selectedPeriod.year}&view=${viewMode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfitData(data.data || { products: [], batches: [], summary: {} });
      }
    } catch (error) {
      console.error('Error fetching profitability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateMargin = (revenue, cost) => {
    if (!revenue || revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
  };

  const sortedData = useMemo(() => {
    const data = viewMode === 'products' ? profitData.products : profitData.batches;
    return [...data].sort((a, b) => {
      const marginA = calculateMargin(a.revenue, a.cost);
      const marginB = calculateMargin(b.revenue, b.cost);
      return marginB - marginA;
    });
  }, [profitData, viewMode]);

  const exportToCSV = () => {
    const headers = viewMode === 'products' 
      ? ['Product', 'Revenue', 'Cost', 'Profit', 'Margin %', 'Quantity']
      : ['Batch', 'Product', 'Revenue', 'Cost', 'Profit', 'Margin %'];
    
    const rows = sortedData.map(item => {
      const profit = (item.revenue || 0) - (item.cost || 0);
      const margin = calculateMargin(item.revenue, item.cost);
      
      if (viewMode === 'products') {
        return [
          item.name || item.productName,
          item.revenue || 0,
          item.cost || 0,
          profit,
          margin.toFixed(2),
          item.quantity || 0
        ];
      } else {
        return [
          item.batchNumber || '-',
          item.productName || '-',
          item.revenue || 0,
          item.cost || 0,
          profit,
          margin.toFixed(2)
        ];
      }
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profitability_${viewMode}_${selectedPeriod.month}_${selectedPeriod.year}.csv`;
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
          <h1 className="text-3xl font-bold text-slate-800">Profitability Dashboard</h1>
          <p className="text-slate-600 mt-1">Visualize margins per product and batch</p>
        </div>
        <div className="flex gap-3">
          <label htmlFor="profitability-month-select" className="sr-only">Select month</label>
          <select
            id="profitability-month-select"
            value={selectedPeriod.month}
            onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
            aria-label="Select month for profitability analysis"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <label htmlFor="profitability-year-input" className="sr-only">Select year</label>
          <input
            id="profitability-year-input"
            type="number"
            value={selectedPeriod.year}
            onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
            aria-label="Select year for profitability analysis"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 w-24"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('products')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'products'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setViewMode('batches')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'batches'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Batches
            </button>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(profitData.summary.totalRevenue || 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Cost</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(profitData.summary.totalCost || 0)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiTrendingDown className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency((profitData.summary.totalRevenue || 0) - (profitData.summary.totalCost || 0))}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiBarChart2 className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Average Margin</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {profitData.summary.totalRevenue > 0
                  ? calculateMargin(profitData.summary.totalRevenue, profitData.summary.totalCost).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiPieChart className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Profitability Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {viewMode === 'products' ? 'Product Profitability' : 'Batch Profitability'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {viewMode === 'batches' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Batch</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  {viewMode === 'products' ? 'Product' : 'Product'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Margin %</th>
                {viewMode === 'products' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Quantity</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === 'products' ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                    No profitability data available for this period
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => {
                  const profit = (item.revenue || 0) - (item.cost || 0);
                  const margin = calculateMargin(item.revenue, item.cost);
                  const isPositive = margin >= 0;
                  
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      {viewMode === 'batches' && (
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.batchNumber || '-'}</td>
                      )}
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {item.name || item.productName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(item.revenue || 0)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(item.cost || 0)}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full ${isPositive ? 'bg-green-200' : 'bg-red-200'}`}>
                            <div
                              className={`h-2 rounded-full ${isPositive ? 'bg-green-600' : 'bg-red-600'}`}
                              style={{ width: `${Math.min(Math.abs(margin), 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      {viewMode === 'products' && (
                        <td className="px-6 py-4 text-sm text-slate-600">{item.quantity || 0}</td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Margin Distribution</h3>
          <div className="h-64 bg-slate-50 rounded flex items-center justify-center text-slate-400">
            <div className="text-center">
              <FiBarChart2 className="text-4xl mx-auto mb-2" />
              <p>Chart visualization would be rendered here</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Revenue vs Cost</h3>
          <div className="h-64 bg-slate-50 rounded flex items-center justify-center text-slate-400">
            <div className="text-center">
              <FiPieChart className="text-4xl mx-auto mb-2" />
              <p>Chart visualization would be rendered here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantProfitability;
