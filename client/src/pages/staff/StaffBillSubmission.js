import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffBillSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    amount: '',
    category: 'Transportation',
    description: '',
    receipts: []
  });
  const [myBills, setMyBills] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0
  });

  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const categories = [
    'Transportation',
    'Materials', 
    'Equipment',
    'Meals',
    'Accommodation',
    'Other'
  ];

  useEffect(() => {
    loadMyBills();
  }, []);

  const loadMyBills = async () => {
    try {
      const response = await axios.get(`${base}/api/bills/staff`, config);
      setMyBills(response.data.bills || []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 0,
        total: response.data.total || 0
      });
    } catch (e) {
      console.error('Failed to load bills:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.amount || !form.category || !form.description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${base}/api/bills/submit`, {
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description,
        receipts: form.receipts
      }, config);

      setSuccess('Bill request submitted successfully');
      setForm({
        amount: '',
        category: 'Transportation',
        description: '',
        receipts: []
      });
      await loadMyBills();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to submit bill request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('receipts', file);
      });

      const response = await axios.post(`${base}/api/upload/receipts`, formData, {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      setForm(prev => ({
        ...prev,
        receipts: [...prev.receipts, ...response.data.files]
      }));
    } catch (e) {
      setError('Failed to upload receipts');
    }
  };

  const removeReceipt = (index) => {
    setForm(prev => ({
      ...prev,
      receipts: prev.receipts.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'manager_approved': return '#3b82f6';
      case 'manager_rejected': return '#ef4444';
      case 'admin_approved': return '#10b981';
      case 'admin_rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Manager Review';
      case 'manager_approved': return 'Manager Approved - Pending Admin';
      case 'manager_rejected': return 'Rejected by Manager';
      case 'admin_approved': return 'Approved';
      case 'admin_rejected': return 'Rejected by Admin';
      default: return status;
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Submit Bill Request</h2>
        <button onClick={loadMyBills} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'tomato', marginBottom: 16, padding: 12, background: '#fee', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: 'green', marginBottom: 16, padding: 12, background: '#efe', borderRadius: 4 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Submit Form */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Submit New Bill Request</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="Enter amount"
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe the expense..."
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Receipts (Optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
              {form.receipts.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {form.receipts.map((receipt, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: 4,
                      background: '#f3f4f6',
                      borderRadius: 4,
                      marginBottom: 4
                    }}>
                      <span style={{ fontSize: 12 }}>{receipt.originalName}</span>
                      <button 
                        type="button"
                        onClick={() => removeReceipt(index)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: 12 }}
            >
              {loading ? 'Submitting...' : 'Submit Bill Request'}
            </button>
          </form>
        </div>

        {/* My Bills */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>My Bill Requests</h4>
          
          {myBills.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
              No bill requests submitted yet
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {myBills.map((bill, idx) => (
                <div key={idx} style={{ 
                  padding: 12, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 4, 
                  marginBottom: 8,
                  background: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {formatCurrency(bill.requestedAmount)}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {bill.category} • {formatDate(bill.submittedAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: 12, 
                        color: getStatusColor(bill.status),
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(bill.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    {bill.description}
                  </div>
                  
                  {bill.approvedAmount && (
                    <div style={{ fontSize: 12, color: '#10b981' }}>
                      Approved: {formatCurrency(bill.approvedAmount)}
                    </div>
                  )}
                  
                  {bill.receipts && bill.receipts.length > 0 && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                      Receipts: {bill.receipts.length} file(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="dash-card" style={{ marginTop: 24 }}>
        <h4 style={{ marginTop: 0 }}>Bill Request Process</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div>
            <h5>Submission Process:</h5>
            <ol style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Fill in the expense details and amount</li>
              <li>Upload receipts if available</li>
              <li>Submit for manager review</li>
              <li>Manager approves/rejects first</li>
              <li>Admin gives final approval</li>
            </ol>
          </div>
          
          <div>
            <h5>Important Notes:</h5>
            <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Provide clear description of expenses</li>
              <li>Upload receipts when possible</li>
              <li>Manager reviews before admin approval</li>
              <li>Approved amounts may differ from requested</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffBillSubmission;
