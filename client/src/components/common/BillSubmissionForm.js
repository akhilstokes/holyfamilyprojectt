import React, { useState, useEffect, useCallback } from 'react';

const BillSubmissionForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [form, setForm] = useState({
    amount: initialData.amount || '',
    category: initialData.category || '',
    description: initialData.description || '',
    expenseDate: initialData.expenseDate || '',
    receipts: initialData.receipts || []
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [liveValidation, setLiveValidation] = useState({});
  const [dateRestrictions, setDateRestrictions] = useState({
    minDate: '',
    maxDate: ''
  });

  // Set date restrictions on component mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateRestrictions({
      minDate: thirtyDaysAgo.toISOString().split('T')[0],
      maxDate: today.toISOString().split('T')[0]
    });
  }, []);

  // Live validation function
  const validateField = useCallback((field, value) => {
    const newErrors = { ...errors };
    const newLiveValidation = { ...liveValidation };

    switch (field) {
      case 'amount':
        if (!value || value.trim() === '') {
          newErrors.amount = 'Amount is required';
          newLiveValidation.amount = { status: 'error', message: 'Amount is required' };
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.amount = 'Amount must be a positive number';
          newLiveValidation.amount = { status: 'error', message: 'Amount must be a positive number' };
        } else if (parseFloat(value) > 100000) {
          newErrors.amount = 'Amount seems too high. Please verify.';
          newLiveValidation.amount = { status: 'warning', message: 'Amount seems too high. Please verify.' };
        } else {
          delete newErrors.amount;
          newLiveValidation.amount = { status: 'success', message: 'Amount looks good' };
        }
        break;

      case 'category':
        if (!value) {
          newErrors.category = 'Category is required';
          newLiveValidation.category = { status: 'error', message: 'Category is required' };
        } else {
          delete newErrors.category;
          newLiveValidation.category = { status: 'success', message: 'Category selected' };
        }
        break;

      case 'description':
        if (!value || value.trim() === '') {
          newErrors.description = 'Description is required';
          newLiveValidation.description = { status: 'error', message: 'Description is required' };
        } else if (value.trim().length < 10) {
          newErrors.description = 'Description must be at least 10 characters';
          newLiveValidation.description = { status: 'error', message: 'Description must be at least 10 characters' };
        } else if (value.trim().length > 500) {
          newErrors.description = 'Description is too long (max 500 characters)';
          newLiveValidation.description = { status: 'error', message: 'Description is too long (max 500 characters)' };
        } else {
          delete newErrors.description;
          newLiveValidation.description = { status: 'success', message: 'Description looks good' };
        }
        break;

      case 'expenseDate':
        if (!value) {
          newErrors.expenseDate = 'Expense date is required';
          newLiveValidation.expenseDate = { status: 'error', message: 'Expense date is required' };
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(today.getDate() - 30);

          if (selectedDate > today) {
            newErrors.expenseDate = 'Expense date cannot be in the future';
            newLiveValidation.expenseDate = { status: 'error', message: 'Expense date cannot be in the future' };
          } else if (selectedDate < thirtyDaysAgo) {
            newErrors.expenseDate = 'Expense date cannot be more than 30 days ago';
            newLiveValidation.expenseDate = { status: 'error', message: 'Expense date cannot be more than 30 days ago' };
          } else {
            delete newErrors.expenseDate;
            newLiveValidation.expenseDate = { status: 'success', message: 'Date is valid' };
          }
        }
        break;
    }

    setErrors(newErrors);
    setLiveValidation(newLiveValidation);
  }, [errors, liveValidation]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate amount
    if (!form.amount || form.amount.trim() === '') {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(form.amount) || parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (parseFloat(form.amount) > 100000) {
      newErrors.amount = 'Amount seems too high. Please verify.';
    }
    
    // Validate category
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    
    // Validate description
    if (!form.description || form.description.trim() === '') {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (form.description.trim().length > 500) {
      newErrors.description = 'Description is too long (max 500 characters)';
    }
    
    // Validate expense date
    if (!form.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    } else {
      const selectedDate = new Date(form.expenseDate);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      if (selectedDate > today) {
        newErrors.expenseDate = 'Expense date cannot be in the future';
      } else if (selectedDate < thirtyDaysAgo) {
        newErrors.expenseDate = 'Expense date cannot be more than 30 days ago';
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
      console.error('Error submitting bill:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear previous errors for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Trigger live validation
    validateField(field, value);
  };

  const getValidationIcon = (field) => {
    const validation = liveValidation[field];
    if (!validation) return null;
    
    const iconStyle = {
      position: 'absolute',
      right: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '16px'
    };
    
    switch (validation.status) {
      case 'success':
        return <span style={{ ...iconStyle, color: '#28a745' }}>✓</span>;
      case 'warning':
        return <span style={{ ...iconStyle, color: '#ffc107' }}>⚠</span>;
      case 'error':
        return <span style={{ ...iconStyle, color: '#dc3545' }}>✗</span>;
      default:
        return null;
    }
  };

  const getValidationMessage = (field) => {
    const validation = liveValidation[field];
    if (!validation) return null;
    
    const messageStyle = {
      fontSize: '12px',
      marginTop: '4px',
      fontWeight: '500'
    };
    
    const colorMap = {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545'
    };
    
    return (
      <div style={{ ...messageStyle, color: colorMap[validation.status] }}>
        {validation.message}
      </div>
    );
  };

  return (
    <div style={{ padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
      <h4 style={{ marginBottom: 20, color: '#495057' }}>Submit Bill Request</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Amount (₹) *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              className="form-control"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              style={{ 
                borderColor: errors.amount ? '#dc3545' : liveValidation.amount?.status === 'success' ? '#28a745' : '',
                paddingRight: '30px'
              }}
            />
            {getValidationIcon('amount')}
          </div>
          {errors.amount && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.amount}
            </div>
          )}
          {getValidationMessage('amount')}
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Category *
          </label>
          <div style={{ position: 'relative' }}>
            <select
              className="form-control"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              style={{ 
                borderColor: errors.category ? '#dc3545' : liveValidation.category?.status === 'success' ? '#28a745' : '',
                paddingRight: '30px'
              }}
            >
              <option value="">Select Category</option>
              <option value="Transportation">Transportation</option>
              <option value="Materials">Materials</option>
              <option value="Equipment">Equipment</option>
              <option value="Meals">Meals</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Other">Other</option>
            </select>
            {getValidationIcon('category')}
          </div>
          {errors.category && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.category}
            </div>
          )}
          {getValidationMessage('category')}
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Expense Date *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              className="form-control"
              value={form.expenseDate}
              onChange={(e) => handleChange('expenseDate', e.target.value)}
              min={dateRestrictions.minDate}
              max={dateRestrictions.maxDate}
              style={{ 
                borderColor: errors.expenseDate ? '#dc3545' : liveValidation.expenseDate?.status === 'success' ? '#28a745' : '',
                paddingRight: '30px'
              }}
            />
            {getValidationIcon('expenseDate')}
          </div>
          {errors.expenseDate && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.expenseDate}
            </div>
          )}
          {getValidationMessage('expenseDate')}
          <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4 }}>
            Date must be within the last 30 days and not in the future
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Description *
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-control"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detailed description of the expense..."
              maxLength={500}
              style={{ 
                borderColor: errors.description ? '#dc3545' : liveValidation.description?.status === 'success' ? '#28a745' : ''
              }}
            />
          </div>
          {errors.description && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.description}
            </div>
          )}
          {getValidationMessage('description')}
          <div style={{ fontSize: 11, color: '#6c757d', marginTop: 4, textAlign: 'right' }}>
            {form.description.length}/500 characters
          </div>
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
          >
            {submitting ? 'Submitting...' : 'Submit Bill Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillSubmissionForm;










