import React, { useState, useEffect, useMemo } from 'react';
import { FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiSearch, FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload } from 'react-icons/fi';
import './AccountantVendorLedger.css';

const AccountantVendorLedger = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    panNumber: '',
    paymentTerms: '30',
    notes: ''
  });
  const [transactionData, setTransactionData] = useState({
    type: 'purchase',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    paymentMethod: 'bank_transfer'
  });

  useEffect(() => {
    fetchVendors();
    fetchTransactions();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (vendorId = null) => {
    try {
      const token = localStorage.getItem('token');
      const url = vendorId
        ? `${base}/api/accountant/vendors/${vendorId}/transactions`
        : `${base}/api/accountant/vendors/transactions`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingVendor
        ? `${base}/api/accountant/vendors/${editingVendor._id}`
        : `${base}/api/accountant/vendors`;

      const method = editingVendor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchVendors();
        resetVendorForm();
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendor) {
      alert('Please select a vendor first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/vendors/${selectedVendor._id}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...transactionData,
          amount: parseFloat(transactionData.amount)
        })
      });

      if (response.ok) {
        await fetchTransactions(selectedVendor._id);
        resetTransactionForm();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${base}/api/accountant/vendors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchVendors();
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const resetVendorForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: '',
      panNumber: '',
      paymentTerms: '30',
      notes: ''
    });
    setEditingVendor(null);
    setShowForm(false);
  };

  const resetTransactionForm = () => {
    setTransactionData({
      type: 'purchase',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      description: '',
      paymentMethod: 'bank_transfer'
    });
    setShowTransactionForm(false);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      gstNumber: vendor.gstNumber || '',
      panNumber: vendor.panNumber || '',
      paymentTerms: vendor.paymentTerms || '30',
      notes: vendor.notes || ''
    });
    setShowForm(true);
  };

  const vendorBalances = useMemo(() => {
    const balances = {};
    vendors.forEach(vendor => {
      const vendorTransactions = transactions.filter(t => t.vendorId === vendor._id || t.vendor?._id === vendor._id);
      const purchases = vendorTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + (t.amount || 0), 0);
      const payments = vendorTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + (t.amount || 0), 0);
      balances[vendor._id] = purchases - payments;
    });
    return balances;
  }, [vendors, transactions]);

  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors;
    const term = searchTerm.toLowerCase();
    return vendors.filter(v =>
      v.name?.toLowerCase().includes(term) ||
      v.email?.toLowerCase().includes(term) ||
      v.phone?.includes(term) ||
      v.gstNumber?.toLowerCase().includes(term)
    );
  }, [vendors, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Vendor', 'Purchases', 'Payments', 'Balance', 'Contact', 'GST'];
    const rows = vendors.map(v => {
      const balance = vendorBalances[v._id] || 0;
      const vendorTransactions = transactions.filter(t => t.vendorId === v._id || t.vendor?._id === v._id);
      const purchases = vendorTransactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + (t.amount || 0), 0);
      const payments = vendorTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + (t.amount || 0), 0);

      return [
        v.name,
        purchases,
        payments,
        balance,
        v.phone || '-',
        v.gstNumber || '-'
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendor_ledger_${new Date().toISOString().split('T')[0]}.csv`;
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
    <div className="vendor-ledger-container">
      {/* Header */}
      <div className="ledger-header">
        <div className="header-title">
          <h1>Vendor Ledger</h1>
          <p>Track purchases, payments, and balances per vendor</p>
        </div>
        <div className="header-actions">
          <button onClick={exportToCSV} className="btn btn-secondary">
            <FiDownload />
            <span>Export CSV</span>
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FiPlus />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-info">
            <p className="label">Total Vendors</p>
            <p className="value">{vendors.length}</p>
          </div>
          <div className="summary-icon icon-blue">
            <FiBookOpen />
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <p className="label">Total Payable</p>
            <p className="value text-red">
              {formatCurrency(Object.values(vendorBalances).filter(b => b > 0).reduce((sum, b) => sum + b, 0))}
            </p>
          </div>
          <div className="summary-icon icon-red">
            <FiTrendingUp />
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <p className="label">Total Receivable</p>
            <p className="value text-green">
              {formatCurrency(Math.abs(Object.values(vendorBalances).filter(b => b < 0).reduce((sum, b) => sum + b, 0)))}
            </p>
          </div>
          <div className="summary-icon icon-green">
            <FiTrendingDown />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <label htmlFor="vendor-search" className="sr-only">Search vendors</label>
          <FiSearch className="search-icon" />
          <input
            id="vendor-search"
            type="text"
            className="search-input"
            placeholder="Search vendors by name, email, phone, or GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Contact</th>
              <th>GST/PAN</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  No vendors found. Add your first vendor to get started.
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => {
                const balance = vendorBalances[vendor._id] || 0;
                return (
                  <tr key={vendor._id}>
                    <td>
                      <div className="vendor-name">{vendor.name}</div>
                      {vendor.contactPerson && (
                        <div className="sub-text">{vendor.contactPerson}</div>
                      )}
                    </td>
                    <td>
                      <div>{vendor.email || '-'}</div>
                      <div className="sub-text">{vendor.phone || '-'}</div>
                    </td>
                    <td>
                      <div>{vendor.gstNumber || '-'}</div>
                      {vendor.panNumber && (
                        <div className="sub-text">PAN: {vendor.panNumber}</div>
                      )}
                    </td>
                    <td>
                      <div className={`font-semibold ${balance > 0 ? 'text-red' : balance < 0 ? 'text-green' : 'text-slate'}`}>
                        {formatCurrency(Math.abs(balance))}
                        {balance > 0 ? ' (Payable)' : balance < 0 ? ' (Receivable)' : ' (Settled)'}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            fetchTransactions(vendor._id);
                            setShowTransactionForm(true);
                          }}
                          className="action-btn btn-add-txn"
                          title="Add Transaction"
                        >
                          <FiDollarSign />
                        </button>
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="action-btn btn-edit"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
                          className="action-btn btn-delete"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Vendor Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <form onSubmit={handleVendorSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  className="form-textarea"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingVendor ? 'Update' : 'Add'} Vendor
                </button>
                <button type="button" onClick={resetVendorForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && selectedVendor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              Add Transaction - {selectedVendor.name}
            </h2>
            <form onSubmit={handleTransactionSubmit}>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  required
                  className="form-select"
                  value={transactionData.type}
                  onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value })}
                >
                  <option value="purchase">Purchase</option>
                  <option value="payment">Payment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={transactionData.date}
                  onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reference</label>
                <input
                  type="text"
                  className="form-input"
                  value={transactionData.reference}
                  onChange={(e) => setTransactionData({ ...transactionData, reference: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Add Transaction
                </button>
                <button type="button" onClick={resetTransactionForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantVendorLedger;
