import React, { useState, useEffect } from 'react';

const StockTransactionForm = ({ onSubmit, onCancel, initialData = {}, productName = null }) => {
  const [form, setForm] = useState({
    productName: initialData.productName || productName || '',
    transactionType: initialData.transactionType || 'in',
    quantity: initialData.quantity || '',
    unit: initialData.unit || 'L',
    reason: initialData.reason || '',
    reference: initialData.reference || '',
    batchNumber: initialData.batchNumber || '',
    location: initialData.location || '',
    department: initialData.department || '',
    unitCost: initialData.unitCost || '',
    supplier: initialData.supplier || '',
    qualityGrade: initialData.qualityGrade || 'A',
    qualityNotes: initialData.qualityNotes || '',
    tags: initialData.tags || '',
    requiresApproval: initialData.requiresApproval || false
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);

  // Load current stock level for the product
  useEffect(() => {
    if (form.productName) {
      loadCurrentStock();
    }
  }, [form.productName]);

  const loadCurrentStock = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${base}/api/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentStock(data);
      }
    } catch (err) {
      console.error('Error loading current stock:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (!form.quantity || isNaN(form.quantity) || parseFloat(form.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!form.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (form.reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters';
    }
    
    if (form.unitCost && (isNaN(form.unitCost) || parseFloat(form.unitCost) < 0)) {
      newErrors.unitCost = 'Unit cost must be a positive number';
    }
    
    // Check for sufficient stock for out transactions
    if (form.transactionType === 'out' && currentStock && form.quantity) {
      const availableStock = currentStock.quantityInLiters || 0;
      const requestedQuantity = parseFloat(form.quantity);
      if (requestedQuantity > availableStock) {
        newErrors.quantity = `Insufficient stock. Available: ${availableStock} ${form.unit}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      in: '#28a745',
      out: '#dc3545',
      adjustment: '#ffc107',
      transfer: '#17a2b8',
      return: '#6f42c1',
      waste: '#fd7e14',
      production: '#20c997'
    };
    return colors[type] || '#6c757d';
  };

  return (
    <div style={{ padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
      <h4 style={{ marginBottom: 20, color: '#495057' }}>Stock Transaction</h4>
      
      {currentStock && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          backgroundColor: '#e3f2fd', 
          borderRadius: 4,
          border: '1px solid #bbdefb'
        }}>
          <strong>Current Stock:</strong> {currentStock.quantityInLiters} {form.unit}
          <br />
          <small style={{ color: '#666' }}>
            Last updated: {new Date(currentStock.lastUpdated).toLocaleString()}
          </small>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Product Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={form.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="Enter product name"
              style={{ borderColor: errors.productName ? '#dc3545' : '' }}
              disabled={!!productName}
            />
            {errors.productName && (
              <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                {errors.productName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Transaction Type *
            </label>
            <select
              className="form-control"
              value={form.transactionType}
              onChange={(e) => handleChange('transactionType', e.target.value)}
              style={{ 
                borderColor: errors.transactionType ? '#dc3545' : '',
                color: getTransactionTypeColor(form.transactionType)
              }}
            >
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
              <option value="return">Return</option>
              <option value="waste">Waste</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Quantity *
            </label>
            <input
              type="number"
              className="form-control"
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              placeholder="Enter quantity"
              min="0"
              step="0.01"
              style={{ borderColor: errors.quantity ? '#dc3545' : '' }}
            />
            {errors.quantity && (
              <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                {errors.quantity}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Unit
            </label>
            <select
              className="form-control"
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              <option value="L">Liters (L)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="units">Units</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Reason *
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={form.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            placeholder="Describe the reason for this transaction..."
            style={{ borderColor: errors.reason ? '#dc3545' : '' }}
          />
          {errors.reason && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.reason}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Reference
            </label>
            <input
              type="text"
              className="form-control"
              value={form.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              placeholder="Reference number or code"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Batch Number
            </label>
            <input
              type="text"
              className="form-control"
              value={form.batchNumber}
              onChange={(e) => handleChange('batchNumber', e.target.value)}
              placeholder="Batch or lot number"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Location
            </label>
            <input
              type="text"
              className="form-control"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Where is this transaction taking place?"
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Department
            </label>
            <input
              type="text"
              className="form-control"
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="Which department?"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Unit Cost
            </label>
            <input
              type="number"
              className="form-control"
              value={form.unitCost}
              onChange={(e) => handleChange('unitCost', e.target.value)}
              placeholder="Cost per unit"
              min="0"
              step="0.01"
              style={{ borderColor: errors.unitCost ? '#dc3545' : '' }}
            />
            {errors.unitCost && (
              <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                {errors.unitCost}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Supplier
            </label>
            <input
              type="text"
              className="form-control"
              value={form.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              placeholder="Supplier name"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Quality Grade
            </label>
            <select
              className="form-control"
              value={form.qualityGrade}
              onChange={(e) => handleChange('qualityGrade', e.target.value)}
            >
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Tags
            </label>
            <input
              type="text"
              className="form-control"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Quality Notes
          </label>
          <textarea
            className="form-control"
            rows={2}
            value={form.qualityNotes}
            onChange={(e) => handleChange('qualityNotes', e.target.value)}
            placeholder="Any quality-related notes..."
          />
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.requiresApproval}
              onChange={(e) => handleChange('requiresApproval', e.target.checked)}
            />
            <span style={{ fontWeight: 'bold' }}>Requires Manager Approval</span>
          </label>
          <small style={{ color: '#666', marginLeft: 24 }}>
            Check this for high-value or sensitive transactions
          </small>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || Object.keys(errors).length > 0}
            style={{ 
              backgroundColor: getTransactionTypeColor(form.transactionType),
              borderColor: getTransactionTypeColor(form.transactionType)
            }}
          >
            {submitting ? 'Processing...' : `Record ${form.transactionType.toUpperCase()} Transaction`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockTransactionForm;






