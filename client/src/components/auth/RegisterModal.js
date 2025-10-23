import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const RegisterModal = ({ isOpen, onClose, onOpenLogin }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ firstName: '', mobile: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isValidEmail = (value) => /\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+/.test(value);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.firstName, // backend may expect name
        email: form.email,
        password: form.password,
        mobile: form.mobile,
      });
      setMessage('Registration request submitted. Please check your email.');
      setForm({ firstName: '', mobile: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      if (/exist|already/i.test(msg)) {
        setError('This email is already registered. Please log in or use another email.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal__backdrop" onClick={onClose}>
      <div className="login-modal__dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="login-modal__title">MEMBER REGISTRATION</div>
        <div className="login-modal__subtitle">If not a member, request for the same by filling the following details.</div>
        <div className="login-modal__divider" />

        <form onSubmit={onSubmit} className="login-form" style={{ marginTop: 8 }}>
          <div className="form-field">
            <label>FIRST NAME *</label>
            <input name="firstName" value={form.firstName} onChange={onChange} required placeholder="Enter first name" />
          </div>
          <div className="form-field">
            <label>MOBILE NO *</label>
            <input name="mobile" value={form.mobile} onChange={onChange} required placeholder="Enter mobile number" />
          </div>
          <div className="form-field">
            <label>EMAIL ID *</label>
            <input name="email" type="email" value={form.email} onChange={onChange} required placeholder="Enter email" className={!form.email || isValidEmail(form.email) ? '' : 'invalid'} />
          </div>
          <div className="form-field">
            <label>PASSWORD *</label>
            <input name="password" type="password" value={form.password} onChange={onChange} required placeholder="Enter password" />
          </div>
          <div className="form-field">
            <label>CONFIRM PASSWORD *</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} required placeholder="Confirm password" />
          </div>

          {error && <div className="error-message" role="alert">{error}</div>}
          {message && <div className="card" role="status">{message}</div>}

          <div className="login-actions">
            <div className="links">
              <span>
                Already Connected? <button type="button" className="link-like" onClick={() => { onClose?.(); onOpenLogin?.(); }}>Log In</button>
              </span>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
