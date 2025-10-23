import React, { useState } from 'react';

const StaffIssues = () => {
  const [form, setForm] = useState({ subject: '', description: '', category: 'general', priority: 'normal' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      // TODO: POST to backend endpoint like /api/requests/issues or /api/enquiries
      // await api.post('/api/requests/issues', form)
      await new Promise((r) => setTimeout(r, 600));
      setMessage('Issue submitted successfully.');
      setForm({ subject: '', description: '', category: 'general', priority: 'normal' });
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Failed to submit issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h2>Raise an Issue / Complaint</h2>
      <p>Please describe your issue. Our team will review and respond.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <div>
          <label>Subject</label>
          <input name="subject" value={form.subject} onChange={onChange} required style={{ width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Category</label>
            <select name="category" value={form.category} onChange={onChange}>
              <option value="general">General</option>
              <option value="salary">Salary</option>
              <option value="schedule">Schedule</option>
              <option value="safety">Safety</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ width: 200 }}>
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={onChange}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={onChange} rows={5} required style={{ width: '100%' }} />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Issue'}
          </button>
        </div>
        {message && <div role="status" style={{ opacity: 0.9 }}>{message}</div>}
      </form>
    </div>
  );
};

export default StaffIssues;
