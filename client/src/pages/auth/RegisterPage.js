import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    validateName, 
    validateEmail, 
    validatePhoneNumber, 
    validatePassword,
    cleanPhoneNumber 
} from '../../utils/validation';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    const returnTo = location.state?.from || null;

    const { name, email, phoneNumber, password } = formData;

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
        const newErrors = {};
        
        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const phoneError = validatePhoneNumber(phoneNumber);
        const passwordError = validatePassword(password);
        
        if (nameError) newErrors.name = nameError;
        if (emailError) newErrors.email = emailError;
        if (phoneError) newErrors.phoneNumber = phoneError;
        if (passwordError) newErrors.password = passwordError;
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (validateForm()) {
            try {
                const finalPhoneNumber = cleanPhoneNumber(phoneNumber);

                const registrationData = {
                    ...formData,
                    phoneNumber: finalPhoneNumber
                };

                const result = await register(registrationData);
                
                // After successful registration, redirect
                if (returnTo) {
                    navigate(returnTo, { replace: true });
                } else if (result.user.role === 'admin') {
                    navigate('/admin/home');
                } else {
                    navigate('/user/home');
                }
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

                {/* ✅ Company Logo */}
                <div className="logo-container">
                    <img 
                        src="/images/logo.png" 
                        alt="Company Logo" 
                        className="company-logo"
                    />
                </div>

                <h2>Register Your Account</h2>
                {errors.general && <div className="error-message">{errors.general}</div>}
                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <input
                            className={`form-input ${errors.name ? 'error' : ''}`}
                            type="text"
                            placeholder="Full Name (letters, spaces, dots allowed)"
                            name="name"
                            value={name}
                            onChange={onChange}
                            maxLength={50}
                        />
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
                    <div className="input-group">
                        <input
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            type="email"
                            placeholder="Email Address"
                            name="email"
                            value={email}
                            onChange={onChange}
                        />
                        {errors.email && <div className="field-error">{errors.email}</div>}
                    </div>
                    <div className="input-group">
                        <input
                            className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                            type="text"
                            placeholder="Phone Number (10 digits or +91 9876543210)"
                            name="phoneNumber"
                            value={phoneNumber}
                            onChange={onChange}
                            maxLength={15}
                        />
                        {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
                    </div>
                    <div className="input-group">
                        <input
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            type="password"
                            placeholder="Password (letters, numbers, special chars, no spaces)"
                            name="password"
                            value={password}
                            onChange={onChange}
                            onKeyDown={handleKeyDown}
                        />
                        {errors.password && <div className="field-error">{errors.password}</div>}
                    </div>
                    <button 
                        className="form-button" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="form-text">
                    Already have an account? <Link to="/login" state={returnTo ? { from: returnTo } : undefined}>Login here</Link>
                </p>
            </div>
        </div>
        
    );
};

export default RegisterPage;
