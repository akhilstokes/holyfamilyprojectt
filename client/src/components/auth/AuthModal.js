
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';

/*
  AuthModal
  - Shows tabs for Login and Register
  - Supports Google Sign-In
  - Calls onSuccess() when authenticated successfully
*/
export default function AuthModal({ open, onClose, onSuccess, compact = false }) {
  const { login, register, googleSignIn } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const validateEmail = (email) => /\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+/.test(email);

  const doLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(loginForm.email) || !loginForm.password) {
      setError('Enter valid email and password');
      return;
    }
    try {
      setLoading(true);
      const res = await login(loginForm.email, loginForm.password);
      if (res?.success) {
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async (e) => {
    e.preventDefault();
    setError('');
    const { name, email, phoneNumber, password } = registerForm;
    if (!name || !validateEmail(email) || !password) {
      setError('Please fill name, valid email and password');
      return;
    }
    try {
      setLoading(true);
      const res = await register({ name, email, phoneNumber, password });
      if (res?.success) {
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      const res = await googleSignIn(credentialResponse.credential);
      if (res?.success) {
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="authmodal-backdrop" role="dialog" aria-modal="true">
      <div className={`authmodal ${compact ? 'authmodal--compact' : ''}`}>
        <div className="authmodal__header">
          <h3 className="authmodal__title">Welcome</h3>
          <button className="link" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="authmodal__tabs">
          <button
            className={`authmodal__tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >Login</button>
          <button
            className={`authmodal__tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >Register</button>
        </div>

        {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}

        {tab === 'login' && (
          <form onSubmit={doLogin} className="authmodal__form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-100" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={doRegister} className="authmodal__form">
            <div className="input-group">
              <label>Name</label>
              <input
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label>Phone</label>
              <input
                value={registerForm.phoneNumber}
                onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="Create a password"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}

        <div className="authmodal__or">OR</div>

        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => setError('Google Sign-In failed. Please try again.')}
          disabled={loading}
        />
      </div>
    </div>
  );
}