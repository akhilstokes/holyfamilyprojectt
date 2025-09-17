import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
    cleanPhoneNumber,
    validateUserRegistration
} from '../../utils/validation';
import './AuthStyles.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'user'
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    const returnTo = location.state?.from || null;

    const { name, email, phoneNumber, password, role } = formData;

    const onChange = (e) => {
        const { name, value } = e.target;
        
        // Prevent spaces in email and phone number fields
        if (name === 'email' || name === 'phoneNumber') {
            const valueWithoutSpaces = value.replace(/\s/g, '');
            setFormData({ ...formData, [name]: valueWithoutSpaces });
        } else if (name === 'password' && value.includes(' ')) {
            return; // Don't allow spaces in password
        } else {
            setFormData({ ...formData, [name]: value });
        }
        
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleKeyDown = (e) => {
        // Prevent space key in email, phone number, and password fields
        if ((e.target.name === 'email' || e.target.name === 'phoneNumber' || e.target.name === 'password') && e.key === ' ') {
            e.preventDefault();
        }
    };

    const validateForm = () => {
        const newErrors = validateUserRegistration(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (validateForm()) {
            try {
                const finalPhoneNumber = cleanPhoneNumber(phoneNumber);

                let result;
                if (role === 'field_staff') {
                    const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                    await axios.post(`${base}/api/auth/register-staff`, {
                        name,
                        email,
                        phoneNumber: finalPhoneNumber
                    });
                    // mimic shape for navigation
                    result = { user: { role: 'field_staff' } };
                } else {
                    const registrationData = {
                        name,
                        email,
                        phoneNumber: finalPhoneNumber,
                        password
                    };
                    await register(registrationData);
                }
                
                // After successful registration, redirect
                navigate('/login');
            } catch (err) {
                console.error('Registration error:', err);
                if (err.response?.data?.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    setErrors({
                        general: err.response?.data?.message || 'An error occurred during registration.'
                    });
                }
            }
        }
        setIsLoading(false);
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

                <h2>Create Account</h2>
                
                {errors.general && (
                    <div className="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="input-group floating">
                        <input
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            type="text"
                            placeholder=" "
                            name="name"
                            value={name}
                            onChange={onChange}
                            maxLength={50}
                        />
                        <label>Full Name</label>
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>

                    <div className="input-group floating">
                        <input
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            type="email"
                            placeholder=" "
                            name="email"
                            value={email}
                            onChange={onChange}
                        />
                        <label>Email Address</label>
                        {errors.email && <div className="field-error">{errors.email}</div>}
                    </div>

                    <div className="input-group floating">
                        <input
                            className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                            type="text"
                            placeholder=" "
                            name="phoneNumber"
                            value={phoneNumber}
                            onChange={onChange}
                            maxLength={15}
                        />
                        <label>Phone Number</label>
                        {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
                    </div>

                    <div className="input-group">
                        <label style={{ marginBottom: '0.75rem', display: 'block', fontWeight: '600', color: 'var(--gray-700)' }}>
                            Account Type
                        </label>
                        <div className="radio-group">
                            <div 
                                className={`radio-option ${role === 'user' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'user' })}
                            >
                                <input 
                                    type="radio" 
                                    name="role" 
                                    checked={role === 'user'} 
                                    onChange={() => setFormData({ ...formData, role: 'user' })}
                                />
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Customer
                            </div>
                            <div 
                                className={`radio-option ${role === 'field_staff' ? 'selected' : ''}`}
                                onClick={() => setFormData({ ...formData, role: 'field_staff' })}
                            >
                                <input 
                                    type="radio" 
                                    name="role" 
                                    checked={role === 'field_staff'} 
                                    onChange={() => setFormData({ ...formData, role: 'field_staff' })}
                                />
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <circle cx="8.5" cy="13.5" r="1.5" fill="currentColor"/>
                                    <path d="M12 15c-1.2-1.6-4.8-1.6-6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Staff Member
                            </div>
                        </div>
                    </div>

                    {role !== 'field_staff' && (
                        <div className="input-group floating">
                            <input
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                type="password"
                                placeholder=" "
                                name="password"
                                value={password}
                                onChange={onChange}
                                onKeyDown={handleKeyDown}
                            />
                            <label>Password</label>
                            {errors.password && <div className="field-error">{errors.password}</div>}
                        </div>
                    )}

                    {role === 'field_staff' && (
                        <div className="info-message" style={{ 
                            background: 'var(--info-light)', 
                            color: '#1e40af', 
                            padding: '1rem', 
                            borderRadius: 'var(--radius-lg)', 
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Staff accounts don't require a password. You'll receive login credentials via email.
                        </div>
                    )}

                    <button 
                        className="form-button" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading && <span className="loading-spinner"></span>}
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-links">
                    <span>
                        Already have an account? 
                        <Link to="/login" state={returnTo ? { from: returnTo } : undefined}>
                            Sign In
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
