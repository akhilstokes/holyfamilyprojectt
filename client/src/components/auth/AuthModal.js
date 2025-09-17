
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
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
    confirmPassword: '',
    role: 'user', // 'user' | 'field_staff' | 'accountant'
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
    const { name, email, phoneNumber, password, confirmPassword, role } = registerForm;
    if (!name || !validateEmail(email)) {
      setError('Please fill name and a valid email');
      return;
    }
    if (!password || password !== confirmPassword) {
      setError('Enter password and confirm it correctly');
      return;
    }

    try {
      setLoading(true);
      let res;
      if (role === 'field_staff') {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        // Staff registration handled by staff endpoint; password not used by backend
        res = await axios.post(`${base}/api/auth/register-staff`, { name, email, phoneNumber });
      } else {
        res = await register({ name, email, phoneNumber, password });
      }
      if (res?.success || res?.data?.token) {
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
          <h3 className="authmodal__title">Join Holy Family Polymers</h3>
          <button className="link" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="authmodal__tabs">
          <button
            className={`authmodal__tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >Sign in</button>
          <button
            className={`authmodal__tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >Create account</button>
        </div>

        {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}

        {tab === 'login' && (
          <form onSubmit={doLogin} className="authmodal__form">
            <div className="input-group">
              <label>Email address</label>
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
              {loading ? 'Signing in...' : 'Sign in'}
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
              <label>Email address</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="input-group">
              <label>Phone number</label>
              <input
                value={registerForm.phoneNumber}
                onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            {registerForm.role !== 'field_staff' && (
              <>
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Create a password"
                  />
                </div>
                <div className="input-group">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                  />
                </div>
              </>
            )}
            <div className="input-group">
              <label>Select your role</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label><input type="radio" name="role" checked={registerForm.role==='user'} onChange={()=>setRegisterForm({ ...registerForm, role:'user' })}/> User</label>
                <label><input type="radio" name="role" checked={registerForm.role==='field_staff'} onChange={()=>setRegisterForm({ ...registerForm, role:'field_staff' })}/> Staff</label>
                <label><input type="radio" name="role" checked={registerForm.role==='accountant'} onChange={()=>setRegisterForm({ ...registerForm, role:'accountant' })}/> Accountant</label>
              </div>
            </div>
            <button type="submit" className="btn-primary w-100" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="authmodal__or">Or continue with</div>

        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => setError('Google Sign-In failed. Please try again.')}
          disabled={loading}
        />
      </div>
    </div>
  );
}