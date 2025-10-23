import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AuthStyles.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`, 
                { email }
            );
            setMessage(response.data.message || 'Password reset link has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while sending the reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper no-showcase">
            <div className="form-container">
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

                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="input-group floating">
                        <input
                            className="form-input"
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <label>Email Address</label>
                    </div>
                    <button 
                        className="form-button" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                <div className="auth-links" style={{ marginTop: '1rem' }}>
                    <span>
                        Remember your password? <Link to="/login">Login here</Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;