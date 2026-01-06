import React, { useState } from 'react';

const ComplaintForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || 'other',
    priority: initialData.priority || 'medium',
    location: initialData.location || '',
    department: initialData.department || ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!form.priority) {
      newErrors.priority = 'Priority is required';
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
      console.error('Error submitting complaint:', error);
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

  return (
    <div style={{ padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, border: '1px solid #dee2e6' }}>
      <h4 style={{ marginBottom: 20, color: '#495057' }}>Submit Complaint</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Title *
          </label>
          <input
            type="text"
            className="form-control"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Brief description of the issue"
            style={{ borderColor: errors.title ? '#dc3545' : '' }}
          />
          {errors.title && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.title}
            </div>
          )}
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
            Description *
          </label>
          <textarea
            className="form-control"
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed description of the issue, including when and where it occurred"
            style={{ borderColor: errors.description ? '#dc3545' : '' }}
          />
          {errors.description && (
            <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
              {errors.description}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Category *
            </label>
            <select
              className="form-control"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              style={{ borderColor: errors.category ? '#dc3545' : '' }}
            >
              <option value="workplace">Workplace Issues</option>
              <option value="equipment">Equipment Problems</option>
              <option value="safety">Safety Concerns</option>
              <option value="hr">HR Related</option>
              <option value="management">Management Issues</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                {errors.category}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Priority *
            </label>
            <select
              className="form-control"
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              style={{ borderColor: errors.priority ? '#dc3545' : '' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors.priority && (
              <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                {errors.priority}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
              Location
            </label>
            <input
              type="text"
              className="form-control"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Where did this occur?"
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
              placeholder="Which department is affected?"
            />
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
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;










