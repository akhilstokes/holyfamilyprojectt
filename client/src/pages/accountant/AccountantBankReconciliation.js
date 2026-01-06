import React, { useState, useEffect, useMemo } from 'react';
import { FiCreditCard, FiUpload, FiCheckCircle, FiXCircle, FiSearch, FiDownload, FiRefreshCw } from 'react-icons/fi';

const AccountantBankReconciliation = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [statements, setStatements] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matched, setMatched] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statementsRes, transactionsRes] = await Promise.all([
        fetch(`${base}/api/accountant/bank-reconciliation/statements`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${base}/api/accountant/bank-reconciliation/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statementsRes.ok) {
        const data = await statementsRes.json();
        setStatements(data.data || []);
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data.data || []);
        setMatched(data.matched || []);
        setUnmatched(data.unmatched || []);
      }
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('statement', file);

      const response = await fetch(`${base}/api/accountant/bank-reconciliation/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        await fetchData();
        alert('Statement uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading statement:', error);
      alert('Failed to upload statement');
    }
  };

  const handleMatch = async (statementId, transactionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/bank-reconciliation/match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statementId, transactionId })
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error matching transaction:', error);
    }
  };

  const handleReconcile = async (statementId) => {
    if (!window.confirm('Are you sure you want to reconcile this statement?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/bank-reconciliation/reconcile/${statementId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchData();
        alert('Statement reconciled successfully');
      }
    } catch (error) {
      console.error('Error reconciling statement:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredUnmatched = useMemo(() => {
    if (!searchTerm) return unmatched;
    const term = searchTerm.toLowerCase();
    return unmatched.filter(item =>
      item.description?.toLowerCase().includes(term) ||
      item.reference?.toLowerCase().includes(term) ||
      item.amount?.toString().includes(term)
    );
  }, [unmatched, searchTerm]);

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
          <h1 className="text-3xl font-bold text-slate-800">Bank Reconciliation</h1>
          <p className="text-slate-600 mt-1">Match bank statements with internal records</p>
        </div>
        <div className="flex gap-3">
          <label htmlFor="bank-statement-upload" className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors cursor-pointer">
            <FiUpload />
            <span>Upload Statement</span>
            <input
              id="bank-statement-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              aria-label="Upload bank statement file"
              className="hidden"
            />
          </label>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Statements</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statements.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiCreditCard className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Matched</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{matched.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Unmatched</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{unmatched.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FiXCircle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Reconciled</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {statements.filter(s => s.reconciled).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiCheckCircle className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Statements List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Bank Statements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {statements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    No bank statements found. Upload a statement to get started.
                  </td>
                </tr>
              ) : (
                statements.map((statement) => (
                  <tr key={statement._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(statement.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">{statement.accountName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{statement.transactionCount || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        statement.reconciled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {statement.reconciled ? 'Reconciled' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedStatement(statement);
                          fetchData();
                        }}
                        className="text-sky-600 hover:text-sky-800 mr-3"
                      >
                        View
                      </button>
                      {!statement.reconciled && (
                        <button
                          onClick={() => handleReconcile(statement._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Reconcile
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unmatched Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Unmatched Transactions</h2>
          <div className="relative w-64">
            <label htmlFor="reconciliation-search" className="sr-only">Search transactions</label>
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              id="reconciliation-search"
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search bank reconciliation transactions"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUnmatched.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    {unmatched.length === 0 ? 'All transactions are matched' : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                filteredUnmatched.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">{item.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.reference || '-'}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${
                      item.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.type === 'credit'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          // Show matching dialog
                          const transactionId = prompt('Enter transaction ID to match:');
                          if (transactionId) {
                            handleMatch(item._id, transactionId);
                          }
                        }}
                        className="text-sky-600 hover:text-sky-800"
                      >
                        Match
                      </button>
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

export default AccountantBankReconciliation;
