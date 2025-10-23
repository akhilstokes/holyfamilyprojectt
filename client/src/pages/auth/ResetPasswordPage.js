import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './AuthStyles.css';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { token } = useParams(); // Gets the token from the URL
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/reset-password/${token}`,
                { password }
            );
            setMessage(response.data.message || 'Password has been reset successfully. Please log in.');
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. The token may be invalid or expired.');
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

                <h2>Reset Your Password</h2>
                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="input-group floating">
                        <input
                            className="form-input"
                            type="password"
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <label>New Password</label>
                    </div>
                    <div className="input-group floating">
                        <input
                            className="form-input"
                            type="password"
                            placeholder=" "
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <label>Confirm New Password</label>
                    </div>
                    <button
                        className="form-button"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;