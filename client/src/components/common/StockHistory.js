import React, { useEffect, useState, useCallback } from 'react';

const StockHistory = ({ productName = null }) => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [filterForm, setFilterForm] = useState({
    fromDate: '',
    toDate: '',
    transactionType: 'all',
    performedBy: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [analytics, setAnalytics] = useState(null);
  
  // Check server connection
  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch(`${base}/`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      setConnectionStatus(res.ok ? 'connected' : 'error');
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  }, [base]);

  const loadStockHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterForm.fromDate) params.append('fromDate', filterForm.fromDate);
      if (filterForm.toDate) params.append('toDate', filterForm.toDate);
      if (filterForm.transactionType !== 'all') params.append('transactionType', filterForm.transactionType);
      if (filterForm.performedBy) params.append('performedBy', filterForm.performedBy);
      if (filterForm.location) params.append('location', filterForm.location);
      params.append('page', pagination.current);
      params.append('limit', '20');
      
      const queryString = params.toString();
      const url = productName 
        ? `${base}/api/stock-history/product/${productName}${queryString ? `?${queryString}` : ''}`
        : `${base}/api/stock-history/all${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setPagination(data.pagination || { current: 1, pages: 1, total: 0 });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load stock history');
      }
    } catch (err) {
      console.error('Error loading stock history:', err);
      setError('Failed to load stock history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [base, token, filterForm, pagination.current, productName]);

  const loadAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterForm.fromDate) params.append('fromDate', filterForm.fromDate);
      if (filterForm.toDate) params.append('toDate', filterForm.toDate);
      if (productName) params.append('productName', productName);
      
      const queryString = params.toString();
      const url = `${base}/api/stock-history/analytics${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, [base, token, productName]);

  useEffect(() => {
    if (token) {
      checkConnection();
    }
  }, [token, checkConnection]);

  useEffect(() => {
    if (token) {
      loadStockHistory();
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, productName, pagination.current]);

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadStockHistory();
    loadAnalytics();
  };

  const clearFilters = () => {
    setFilterForm({
      fromDate: '',
      toDate: '',
      transactionType: 'all',
      performedBy: '',
      location: ''
    });
    setTimeout(() => {
      loadStockHistory();
      loadAnalytics();
    }, 100);
  };

  const getTransactionTypeBadge = (type) => {
    const typeColors = {
      in: '#28a745',
      out: '#dc3545',
      adjustment: '#ffc107',
      transfer: '#17a2b8',
      return: '#6f42c1',
      waste: '#fd7e14',
      production: '#20c997'
    };
    
    return (
      <span 
        style={{ 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          backgroundColor: typeColors[type] || '#6c757d',
          color: 'white',
          textTransform: 'capitalize'
        }}
      >
        {type}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatQuantity = (quantity, unit = 'L') => {
    if (quantity === null || quantity === undefined) return '-';
    return `${parseFloat(quantity).toFixed(2)} ${unit}`;
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
  };

  if (!token) {
    return (
      <div style={{ padding: 16 }}>
        <h3>Stock History</h3>
        <div style={{ color: 'crimson', marginTop: 8 }}>
          Please log in to access stock history.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>{productName ? `Stock History - ${productName}` : 'Stock History'}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: connectionStatus === 'connected' ? '#28a745' : 
                             connectionStatus === 'disconnected' ? '#dc3545' : '#ffc107' 
            }}></div>
            <span style={{ fontSize: 12, color: '#666' }}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary" 
            onClick={() => loadStockHistory()} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'crimson', marginBottom: 16, padding: 12, backgroundColor: '#f8d7da', borderRadius: 4 }}>{error}</div>}

      {/* Analytics Summary */}
      {analytics && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16, 
          marginBottom: 20 
        }}>
          {analytics.transactionSummary?.map((stat, index) => (
            <div key={index} style={{ padding: 16, backgroundColor: '#e3f2fd', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2' }}>
                {stat.count}
              </div>
              <div style={{ fontSize: 14, color: '#666', textTransform: 'capitalize' }}>
                {stat._id} Transactions
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Total: {formatQuantity(stat.totalQuantity)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div style={{ 
          marginBottom: 20, 
          padding: 16, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}>
          <h5 style={{ marginBottom: 16 }}>Filter Stock History</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>From Date</label>
              <input
                type="date"
                className="form-control"
                value={filterForm.fromDate}
                onChange={(e) => setFilterForm(prev => ({ ...prev, fromDate: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>To Date</label>
              <input
                type="date"
                className="form-control"
                value={filterForm.toDate}
                onChange={(e) => setFilterForm(prev => ({ ...prev, toDate: e.target.value }))}
                min={filterForm.fromDate || undefined}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Transaction Type</label>
              <select
                className="form-control"
                value={filterForm.transactionType}
                onChange={(e) => setFilterForm(prev => ({ ...prev, transactionType: e.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="in">In</option>
                <option value="out">Out</option>
                <option value="adjustment">Adjustment</option>
                <option value="transfer">Transfer</option>
                <option value="return">Return</option>
                <option value="waste">Waste</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Location</label>
              <input
                type="text"
                className="form-control"
                value={filterForm.location}
                onChange={(e) => setFilterForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Filter by location"
              />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button 
              className="btn btn-sm btn-primary" 
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary" 
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Stock History Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div>Loading stock history...</div>
          </div>
        ) : (
          <table className="table table-striped table-hover" style={{ minWidth: 1000 }}>
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Before</th>
                <th>After</th>
                <th>Reason</th>
                <th>Performed By</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction._id || index}>
                  <td>{formatDate(transaction.transactionDate)}</td>
                  <td>{getTransactionTypeBadge(transaction.transactionType)}</td>
                  <td>{transaction.productName}</td>
                  <td>{formatQuantity(transaction.quantity, transaction.unit)}</td>
                  <td>{formatQuantity(transaction.quantityBefore, transaction.unit)}</td>
                  <td>{formatQuantity(transaction.quantityAfter, transaction.unit)}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {transaction.reason || '-'}
                  </td>
                  <td>{transaction.performedByName || '-'}</td>
                  <td>{transaction.location || '-'}</td>
                  <td>
                    {transaction.isReversed ? (
                      <span style={{ color: '#dc3545', fontSize: '12px' }}>Reversed</span>
                    ) : transaction.requiresApproval && !transaction.approvedBy ? (
                      <span style={{ color: '#ffc107', fontSize: '12px' }}>Pending Approval</span>
                    ) : (
                      <span style={{ color: '#28a745', fontSize: '12px' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#6c757d' }}>
                    No stock transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={pagination.current <= 1}
          >
            Previous
          </button>
          <span style={{ padding: '0 16px' }}>
            Page {pagination.current} of {pagination.pages} ({pagination.total} total)
          </span>
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={pagination.current >= pagination.pages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StockHistory;

