import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { validators, validateField, commonValidationRules } from '../../utils/validation';
import './AuthStyles.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleSignIn } = useAuth();

    const returnTo = location.state?.from || null;

    const { email, password } = formData;

    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

    const validateForm = () => {
        const emailError = validateField(email, commonValidationRules.login.email, 'Email');
        const passwordError = validateField(password, commonValidationRules.login.password, 'Password');
        
        setFieldErrors({
            email: emailError || '',
            password: passwordError || ''
        });

        return !emailError && !passwordError;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error = '';
        
        if (name === 'email') {
            error = validateField(value, commonValidationRules.login.email, 'Email');
        } else if (name === 'password') {
            error = validateField(value, commonValidationRules.login.password, 'Password');
        }
        
        setFieldErrors(prev => ({
            ...prev,
            [name]: error || ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    
    const navigatePostLogin = (loggedInUser) => {
        // If LAB user, prefer lab dashboard; only honor returnTo if it's also a lab route
        if (loggedInUser && loggedInUser.role === 'lab') {
            if (returnTo && String(returnTo).startsWith('/lab')) {
                navigate(returnTo, { replace: true });
            } else {
                navigate('/lab/dashboard', { replace: true });
            }
            return;
        }
        // Accountant users go to accountant module by default
        if (loggedInUser && loggedInUser.role === 'accountant') {
            navigate('/accountant/latex', { replace: true });
            return;
        }
        if (returnTo) {
            navigate(returnTo, { replace: true });
            return;
        }
        // Redirect by role
        if (loggedInUser && loggedInUser.role === 'admin') {
            navigate('/admin/home', { replace: true });
        } else if (loggedInUser && loggedInUser.role === 'manager') {
            navigate('/manager/home', { replace: true });
        } else if (loggedInUser && loggedInUser.role === 'delivery_staff') {
            navigate('/delivery', { replace: true });
        } else if (loggedInUser && loggedInUser.role === 'field_staff') {
            navigate('/staff', { replace: true });
        } else {
            navigate('/user', { replace: true });
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
            navigatePostLogin(res?.user);
        } catch (err) {
            console.error('Google Sign-In Error:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Google Sign-In failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setLoading(true);
                setError('');
                
                const res = await login(email, password);
                navigatePostLogin(res.user);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An error occurred during login.');
            } finally {
                setLoading(false);
            }
        }
    };
    

    return (
        <div className="auth-wrapper no-showcase">
            <div className="auth-grid">
            <div className="form-container">
                <div className="top-progress" />
                {/* Company Logo */}
                <div className="logo-container">
                    <img 
                        src="/images/logo.svg" 
                        alt="Holy Family Polymers Logo" 
                        className="company-logo"
                    />
                </div>

                <div className="back-row">
                    <Link to="/" className="back-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Back to Home
                    </Link>
                </div>

                <h2>Welcome Back</h2>
                
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

                <form onSubmit={onSubmit}>
                    <div className={`input-group floating has-status ${fieldErrors.email ? 'error' : ''}`}>
                        <input 
                            id="email"
                            className={`form-input ${!fieldErrors.email && email ? 'valid' : ''}`} 
                            type="email" 
                            placeholder=" "
                            name="email" 
                            value={email} 
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required 
                        />
                        <label htmlFor="email">Email Address</label>
                        <div className="helper-text">
                            {fieldErrors.email || 'Use your registered email'}
                        </div>
                        {!fieldErrors.email && email && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                    </div>
                    
                    <div className={`input-group floating has-status ${fieldErrors.password ? 'error' : ''}`}>
                        <input 
                            id="password"
                            className={`form-input ${!fieldErrors.password && password ? 'valid' : ''}`} 
                            type="password" 
                            placeholder=" "
                            name="password" 
                            value={password} 
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required 
                        />
                        <label htmlFor="password">Password</label>
                        <div className="helper-text">
                            {fieldErrors.password || 'At least 6 characters'}
                        </div>
                        {!fieldErrors.password && password && password.length >= 6 && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                    </div>
                    
                    <button className="form-button" type="submit" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="google-row" style={{ width: '100%' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSignInSuccess}
                        onError={() => setError('Google Sign-In failed. Please try again.')}
                        disabled={loading}
                        theme="outline"
                        size="large"
                    />
                </div>

                {/* Staff Login Entry Point removed */}

                <div className="auth-links">
                    <Link to="/forgot-password">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Forgot Password?
                    </Link>
                    <span>
                        Don't have an account? 
                        <Link to="/register" state={returnTo ? { from: returnTo } : undefined}>
                            Create Account
                        </Link>
                    </span>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LoginPage;
