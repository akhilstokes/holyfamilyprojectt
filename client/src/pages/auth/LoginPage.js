import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
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
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validateForm = () => {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if (!email || !password) {
            setError('Please enter both email and password.');
            return false;
        }
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        setError('');
        return true;
    };
    
    const navigatePostLogin = (role) => {
        if (returnTo) {
            navigate(returnTo, { replace: true });
        } else if (role === 'admin') {
            navigate('/admin/home');
        } else {
            navigate('/user/home');
        }
    };

    const handleGoogleSignInSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            setError('');
            
            const result = await googleSignIn(credentialResponse.credential);
            navigatePostLogin(result.user.role);
        } catch (err) {
            setError('Google Sign-In failed. Please try again.');
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
                
                const result = await login(email, password);
                navigatePostLogin(result.user.role);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An error occurred during login.');
            } finally {
                setLoading(false);
            }
        }
    };
    

    return (
        <div className="auth-wrapper">
            <div className="form-container">
                {/* Company Logo */}
                <div className="logo-container">
                    <img 
                        src="/images/logo.png" 
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
                    <div className="input-group floating">
                        <input 
                            className="form-input" 
                            type="email" 
                            placeholder=" "
                            name="email" 
                            value={email} 
                            onChange={onChange} 
                            required 
                        />
                        <label>Email Address</label>
                    </div>
                    
                    <div className="input-group floating">
                        <input 
                            className="form-input" 
                            type="password" 
                            placeholder=" "
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            required 
                        />
                        <label>Password</label>
                    </div>
                    
                    <button className="form-button" type="submit" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="google-row">
                    <GoogleLogin
                        onSuccess={handleGoogleSignInSuccess}
                        onError={() => setError('Google Sign-In failed. Please try again.')}
                        disabled={loading}
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>

                {/* Staff Login Entry Point */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/staff/login')}
                        className="form-button staff"
                        aria-label="Staff Login"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            width: 'auto',
                            padding: '0.75rem 1.5rem',
                            fontSize: '0.95rem'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="8.5" cy="13.5" r="1.5" fill="currentColor"/>
                            <path d="M12 15c-1.2-1.6-4.8-1.6-6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Staff Login
                    </button>
                </div>

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
    );
};

export default LoginPage;
