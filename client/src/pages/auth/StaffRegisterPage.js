import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { validateStaffRegistration } from '../../utils/validation';
import './AuthStyles.css';

const StaffRegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const navigate = useNavigate();

  // Fetch next staff ID preview on mount
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${base}/api/auth/next-staff-id`);
        setAssignedStaffId(data.staffId);
      } catch (e) {
        // ignore preview failure
      }
    };
    fetchNextId();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Enhanced validation
    const validationErrors = validateStaffRegistration(form);
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join(', ');
      setError(`Validation failed: ${errorMessages}`);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Attempting staff registration with data:', form);
      const payload = { name: form.name, email: form.email, phoneNumber: form.phoneNumber };
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${base}/api/auth/register-staff`, payload);
      console.log('Registration successful:', data);
      // Do not auto-login; show assigned Staff ID then send user to staff login screen
      const newId = data.user?.staffId || '';
      setAssignedStaffId(newId);
      navigate('/staff/login', { replace: true, state: { staffId: newId } });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error types
      if (err.response?.data?.errors) {
        // Validation errors from server
        const errorMessages = Object.values(err.response.data.errors).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        // Server error message
        setError(err.response.data.message);
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Generic error
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper dark-theme no-showcase">
      <div className="form-container">
        {/* Company Logo */}
        <div className="logo-container">
          <img src="/images/logo.png" alt="Holy Family Polymers Logo" className="company-logo" />
        </div>

        <div className="back-row">
          <Link to="/" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>
        </div>

        <h2>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="8.5" cy="13.5" r="1.5" fill="currentColor"/>
            <path d="M12 15c-1.2-1.6-4.8-1.6-6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Register Staff
        </h2>

        {assignedStaffId && (
          <div className="success-message">Your Staff ID: <strong>{assignedStaffId}</strong></div>
        )}
        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="input-group floating">
            <input className="form-input" name="name" placeholder=" " value={form.name} onChange={onChange} required />
            <label>Full Name</label>
          </div>
          <div className="input-group floating">
            <input className="form-input" type="email" name="email" placeholder=" " value={form.email} onChange={onChange} required />
            <label>Email Address</label>
          </div>
          <div className="input-group floating">
            <input className="form-input" name="phoneNumber" placeholder=" " value={form.phoneNumber} onChange={onChange} required />
            <label>Phone Number</label>
          </div>
          {/* Password removed for staff registration; password will be the Staff ID and sent via email */}
          {assignedStaffId && (
            <div className="input-group floating">
              <input className="form-input" value={assignedStaffId} readOnly placeholder=" " />
              <label>Your Assigned Staff ID</label>
            </div>
          )}
          <button className="form-button staff" type="submit" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Creating...' : 'Create Staff Account'}
          </button>
        </form>
        <div className="auth-links">
          <span>Already staff? <Link to="/staff/login">Login here</Link></span>
        </div>
      </div>
    </div>
  );
};

export default StaffRegisterPage;


