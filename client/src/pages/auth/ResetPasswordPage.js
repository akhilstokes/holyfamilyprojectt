import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

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
        <div className="auth-wrapper">
             <div className="auth-image-section"></div>
            <div className="auth-form-section">
                <div className="form-container">
                    <h2>Reset Your Password</h2>
                    {message && <div className="success-message">{message}</div>}
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={onSubmit}>
                        <div className="input-group">
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="input-group">
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            className="form-button"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                     <p className="form-text">
                        Remember your password? <Link to="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;