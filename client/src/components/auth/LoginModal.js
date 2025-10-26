import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onOpenRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const isValidEmail = (value) => /\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+/.test(value);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await login(email, password);
      const role = res?.user?.role;

      const returnTo = location.state?.from;
      const labRoute = '/lab/dashboard';

      if (role === 'lab' || role === 'lab_manager') {
        if (returnTo && returnTo.startsWith('/lab')) {
          navigate(returnTo, { replace: true });
        } else {
          navigate(labRoute, { replace: true });
        }
      } else if (role === 'admin') {
        navigate(returnTo || '/admin/home', { replace: true });
      } else if (role === 'manager') {
        navigate(returnTo || '/manager/home', { replace: true });
      } else if (role === 'delivery_staff') {
        navigate('/delivery', { replace: true });
      } else {
        navigate(returnTo || '/user', { replace: true });
      }
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }
      
      const res = await googleSignIn(credentialResponse.credential);
      const role = res?.user?.role;
      const returnTo = location.state?.from;
      const labRoute = '/lab/dashboard';

      if (role === 'lab' || role === 'lab_manager') {
        if (returnTo && returnTo.startsWith('/lab')) {
          navigate(returnTo, { replace: true });
        } else {
          navigate(labRoute, { replace: true });
        }
      } else if (role === 'admin') {
        navigate(returnTo || '/admin/home', { replace: true });
      } else if (role === 'manager') {
        navigate(returnTo || '/manager/home', { replace: true });
      } else if (role === 'delivery_staff') {
        navigate('/delivery', { replace: true });
      } else {
        navigate(returnTo || '/user', { replace: true });
      }
      onClose?.();
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Google Sign-In failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal__backdrop" onClick={onClose}>
      <div className="login-modal__dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose} aria-label="Close">×</button>
        <div className="login-modal__title">LOGIN HERE!</div>
        <div className="login-modal__subtitle">If you are an existing member, use your mobile or email to login.</div>
        <div className="login-modal__divider" />

        <div className="login-modal__content">
          <div className="login-modal__left">
            <div className="google-row">
              <GoogleLogin
                onSuccess={handleGoogleSignInSuccess}
                onError={() => setError('Google Sign-In failed. Please try again.')}
                disabled={loading}
                theme="outline"
                size="large"
              />
            </div>
          </div>

          <div className="login-modal__right">
            <form onSubmit={onSubmit} className="login-form">
              <div className="form-field">
                <label>MOBILE OR EMAIL *</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter mobile or email"
                  className={!email || isValidEmail(email) ? '' : 'invalid'}
                  required
                />
              </div>
              <div className="form-field">
                <label>PASSWORD *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && <div className="error-message" role="alert">{error}</div>}

              <div className="login-actions">
                <div className="links">
                  <Link to="/forgot-password" onClick={onClose}>Forgot Password?</Link>
                  <span>
                    Don't have an account? <button type="button" className="link-like" onClick={() => { onClose?.(); onOpenRegister?.(); }}>Member Registration</button>
                  </span>
                </div>
                <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                  {loading ? 'LOGGING IN...' : 'LOG IN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
