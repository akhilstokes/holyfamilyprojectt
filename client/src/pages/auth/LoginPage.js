import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

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
                
                {/* ✅ Company Logo */}
                <div className="logo-container">
                    <img 
                        src="/images/logo.png" 
                        alt="Company Logo" 
                        className="company-logo"
                    />
                </div>

                <div className="back-row">
                    <Link to="/" className="back-link">← Back to Home</Link>
                </div>

                <h2>Login to Your Account</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <input className="form-input" type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="input-group">
                        <input className="form-input" type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
                    </div>
                    <button className="form-button" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="divider">OR</div>

                <div className="google-row">
                    <GoogleLogin
                        onSuccess={handleGoogleSignInSuccess}
                        onError={() => setError('Google Sign-In failed. Please try again.')}
                        disabled={loading}
                    />
                </div>

                <div className="auth-links">
                    <Link to="/forgot-password">Forgot Password?</Link>
                    <span>Don't have an account? <Link to="/register" state={returnTo ? { from: returnTo } : undefined}>Register here</Link></span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
