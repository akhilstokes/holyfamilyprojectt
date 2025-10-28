import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import './AuthStyles.css';
import {
  cleanPhoneNumber,
  validateUserRegistration,
  validateName,
  validateEmail,
  validatePhoneNumber,
  validatePassword
} from '../../utils/validation';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { register, googleSignIn } = useAuth();

  const returnTo = location.state?.from || null;
  const { name, email, phoneNumber, password, confirmPassword } = formData;

  // ✅ Validation helpers
  const isValidName = (v) => validateName(v)?.valid || v.length > 2;
  const isValidEmail = (v) => !validateEmail(v);
  const isValidPhone = (v) => !validatePhoneNumber(v);
  const isValidPassword = (v) => !validatePassword(v);
  const isPasswordMatch = (a, b) => a === b && !!a;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleKeyDown = (e) => {
    if (
      ['name', 'email', 'phoneNumber', 'password', 'confirmPassword'].includes(e.target.name) &&
      e.key === ' '
    ) {
      e.preventDefault();
    }
  };

  const validateForm = () => {
    const newErrors = validateUserRegistration(formData) || {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignInSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      await googleSignIn(credentialResponse.credential);
      navigate('/user', { replace: true });
    } catch {
      setErrors({ general: 'Google Sign-In failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    if (validateForm()) {
      try {
        const finalPhoneNumber = cleanPhoneNumber(phoneNumber);
        const registrationData = {
          name,
          email,
          phoneNumber: finalPhoneNumber,
          password
        };

        await register(registrationData);

        setSuccessMessage('🎉 Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { registrationSuccess: true, email }
          });
        }, 2000);
      } catch (err) {
        console.error('❌ Registration error:', err);
        const message = err.response?.data?.message || '';
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        } else if (/already exists/i.test(message)) {
          setErrors({ email: message });
        } else {
          setErrors({ general: message || 'An error occurred during registration.' });
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="auth-wrapper no-showcase">
      <div className="auth-grid">
        <div className="form-container">
          <div className="top-progress" />

          <div className="logo-container">
            <img src="/images/logo.png" alt="Company Logo" className="company-logo" />
          </div>

          <div className="back-row">
            <Link to="/" className="back-link">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
          </div>

          <h2>Create Account</h2>

          <div className="google-row" style={{ width: '100%', marginBottom: '1rem' }}>
            <GoogleLogin
              onSuccess={handleGoogleSignInSuccess}
              onError={() => setErrors({ general: 'Google Sign-In failed. Please try again.' })}
              disabled={isLoading}
              theme="outline"
              size="large"
            />
          </div>

          <div className="divider">
            <span>Or with email</span>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, margin: '0 0 16px 0' }}
            aria-hidden
          >
            {[1, 2].map((s) => (
              <div
                key={s}
                style={{
                  height: 6,
                  borderRadius: 9999,
                  background: s <= step ? 'linear-gradient(90deg,#22c55e,#3b82f6)' : '#e5e7eb'
                }}
              />
            ))}
          </div>

          {errors.general && <div className="error-message">{errors.general}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={onSubmit}>
            {step === 1 && (
              <>
                {/* Name */}
                <div className="input-group has-status">
                  <input
                    id="name"
                    className={`form-input ${errors.name ? 'error' : ''} ${isValidName(name) ? 'valid' : ''}`}
                    type="text"
                    placeholder="Full Name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    maxLength={50}
                  />
                  {errors.name && <div className="field-error">{errors.name}</div>}
                </div>

                {/* Email */}
                <div className="input-group has-status">
                  <input
                    id="email"
                    className={`form-input ${errors.email ? 'error' : ''} ${isValidEmail(email) ? 'valid' : ''}`}
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={email}
                    onChange={onChange}
                  />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                {/* Phone */}
                <div className="input-group has-status">
                  <input
                    id="phoneNumber"
                    className={`form-input ${errors.phoneNumber ? 'error' : ''} ${isValidPhone(phoneNumber) ? 'valid' : ''}`}
                    type="text"
                    placeholder="Phone Number"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={onChange}
                    maxLength={15}
                  />
                  {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Password */}
                <div className="input-group has-status">
                  <input
                    id="password"
                    className={`form-input ${errors.password ? 'error' : ''} ${isValidPassword(password) ? 'valid' : ''}`}
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                  />
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>

                {/* Confirm Password */}
                <div className="input-group has-status">
                  <input
                    id="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''} ${isPasswordMatch(password, confirmPassword) ? 'valid' : ''}`}
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                  />
                  {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                </div>
              </>
            )}

            {step === 2 && (
              <button className="form-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}

            <div className="mt-2" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              {step > 1 && (
                <button type="button" className="form-button secondary" onClick={() => setStep(step - 1)}>
                  Previous
                </button>
              )}
              {step < 2 && (
                <button
                  type="button"
                  className="form-button"
                  onClick={() => {
                    if (!isValidName(name)) return setErrors({ name: 'Please enter a valid name' });
                    if (!isValidEmail(email)) return setErrors({ email: 'Please enter a valid email address' });
                    if (!isValidPhone(phoneNumber)) return setErrors({ phoneNumber: 'Please enter a valid phone number' });
                    setStep(2);
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </form>

          <p className="form-text">
            Already have an account?{' '}
            <Link to="/login" state={returnTo ? { from: returnTo } : undefined}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
