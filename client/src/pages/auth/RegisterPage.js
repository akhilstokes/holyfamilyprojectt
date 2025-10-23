import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import './AuthStyles.css';
import axios from 'axios';
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
    // Visibility toggles removed for cleaner UI
    const [step, setStep] = useState(1);
    const [profilePreview, setProfilePreview] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { register, googleSignIn } = useAuth();

    const returnTo = location.state?.from || null;

    const { name, email, phoneNumber, password, confirmPassword } = formData;
    
    // Enhanced validation functions using the validation utils
    const isValidName = (v) => {
        const r = validateName(v || '');
        return !!(r && r.valid === true);
    };

    const handleGoogleSignInSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            await googleSignIn(credentialResponse.credential);
            navigate('/user', { replace: true });
        } catch (err) {
            setErrors({ general: 'Google Sign-In failed. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };
    const isValidEmail = (v) => !validateEmail(v);
    const isValidPhone = (v) => !validatePhoneNumber(v);
    const isValidPassword = (v) => !validatePassword(v);
    const isPasswordMatch = (a,b) => a === b && !!a;
    
    // Get validation errors for real-time feedback
    const getNameError = (v) => {
        const r = validateName(v || '');
        return r && r.valid === false ? r.message : '';
    };
    const getEmailError = (v) => validateEmail(v);
    const getPhoneError = (v) => validatePhoneNumber(v);
    const getPasswordError = (v) => validatePassword(v);

    const onChange = (e) => {
        const { name, value } = e.target;
        
        // Prevent spaces in name, email, phone number, and password fields
        if (name === 'name' || name === 'email' || name === 'phoneNumber' || name === 'password' || name === 'confirmPassword') {
            const valueWithoutSpaces = value.replace(/\s/g, '');
            setFormData({ ...formData, [name]: valueWithoutSpaces });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleKeyDown = (e) => {
        // Prevent space key in name, email, phone number, and password fields
        if ((e.target.name === 'name' || e.target.name === 'email' || e.target.name === 'phoneNumber' || e.target.name === 'password' || e.target.name === 'confirmPassword') && e.key === ' ') {
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

                const registrationData = {
                    name,
                    email,
                    phoneNumber: finalPhoneNumber,
                    password
                };
                await register(registrationData);
                
                // After successful registration, redirect
                navigate('/login');
            } catch (err) {
                console.error('Registration error:', err);
                const message = err.response?.data?.message || '';
                if (err.response?.data?.errors) {
                    setErrors(err.response.data.errors);
                } else if (/already exists/i.test(message)) {
                    setErrors({ email: message });
                } else {
                    setErrors({ general: message || 'An error occurred during registration.' });
                }
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="auth-wrapper no-showcase">
            <div className="auth-grid">
            <div className="form-container">
                <div className="top-progress" />

                {/* ✅ Company Logo */}
                <div className="logo-container">
                    <img 
                        src="/images/logo.png" 
                        alt="Company Logo" 
                        className="company-logo"
                    />
                </div>

                <div className="back-row">
                    <Link to="/" className="back-link">
                        <i className="fas fa-arrow-left"></i> Back to Home
                    </Link>
                </div>
                <h2>Create Account</h2>
                {/* Google Sign-in at top */}
                <div className="google-row" style={{ width: '100%', marginBottom: '1rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSignInSuccess}
                        onError={() => setErrors({ general: 'Google Sign-In failed. Please try again.' })}
                        disabled={isLoading}
                        theme="outline"
                        size="large"
                    />
                </div>
                <div className="divider"><span>Or with email</span></div>
                {/* progress indicator */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,margin:'0 0 16px 0'}} aria-hidden>
                    {[1,2,3].map((s)=> (
                        <div key={s} style={{height:6,borderRadius:9999,background: s<=step? 'linear-gradient(90deg,#22c55e,#3b82f6)':'#e5e7eb'}} />
                    ))}
                </div>
                {errors.general && <div className="error-message">{errors.general}</div>}
                <form onSubmit={onSubmit}>
                    {step===1 && (
                    <>
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
                        <div className="helper-text">
                            {name ? (isValidName(name) ? '✓ Valid name' : getNameError(name)) : 'Letters only, no spaces or numbers'}
                        </div>
                        {isValidName(name) && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                        {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
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
                        <div className="helper-text">
                            {email ? (isValidEmail(email) ? '✓ Valid email' : getEmailError(email)) : 'We\'ll send confirmations here'}
                        </div>
                        {isValidEmail(email) && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                        {errors.email && <div className="field-error">{errors.email}</div>}
                    </div>
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
                        <div className="helper-text">
                            {phoneNumber ? (isValidPhone(phoneNumber) ? '✓ Valid phone number' : getPhoneError(phoneNumber)) : '10-digit Indian mobile number (6,7,8,9)'}
                        </div>
                        {isValidPhone(phoneNumber) && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                        {errors.phoneNumber && <div className="field-error">{errors.phoneNumber}</div>}
                    </div>
                    </>
                    )}
                    {step===2 && (
                    <>
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
                        <div className="helper-text">
                            {password ? (isValidPassword(password) ? '✓ Strong password' : getPasswordError(password)) : 'Min 6 characters, special character required, no spaces'}
                        </div>
                        {isValidPassword(password) && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                        {errors.password && <div className="field-error">{errors.password}</div>}
                    </div>
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
                        <div className="helper-text">
                            {confirmPassword ? (isPasswordMatch(password, confirmPassword) ? '✓ Passwords match' : 'Passwords do not match') : 'Must match the password'}
                        </div>
                        {isPasswordMatch(password, confirmPassword) && (
                            <span className="input-status" aria-hidden>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        )}
                        {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                    </div>
                    </>
                    )}
                    {step===3 && (
                    <>
                    <div className="input-group">
                        <label>Profile image (optional)</label>
                        <input type="file" accept="image/*" onChange={(e)=>{
                            const file = e.target.files && e.target.files[0];
                            if(file){ setProfilePreview(URL.createObjectURL(file)); }
                        }} />
                        {profilePreview && (<div className="mt-2" style={{display:'flex',justifyContent:'center'}}><img src={profilePreview} alt="preview" style={{width:96,height:96,borderRadius:'50%',objectFit:'cover',border:'2px solid #e5e7eb'}}/></div>)}
                    </div>
                    </>
                    )}
                    <button 
                        className="form-button" 
                        type="submit"
                        disabled={
                            isLoading || 
                            !isValidName(name) || 
                            !isValidEmail(email) || 
                            !isValidPhone(phoneNumber) || 
                            !isValidPassword(password) || 
                            !isPasswordMatch(password, confirmPassword)
                        }
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                    <div className="mt-2" style={{display:'flex',justifyContent:'space-between'}}>
                        <button type="button" className="form-button secondary" onClick={()=> setStep(Math.max(1, step-1))} disabled={step===1}>Previous</button>
                        <button 
                            type="button" 
                            className="form-button secondary" 
                            onClick={()=> setStep(Math.min(3, step+1))} 
                            disabled={
                                step===3 || 
                                (step===1 && (!isValidName(name) || !isValidEmail(email) || !isValidPhone(phoneNumber))) ||
                                (step===2 && (!isValidPassword(password) || !isPasswordMatch(password, confirmPassword)))
                            }
                        >
                            Next
                        </button>
                    </div>
                </form>
                <p className="form-text">
                    Already have an account? <Link to="/login" state={returnTo ? { from: returnTo } : undefined}>Login here</Link>
                </p>
            </div>
        </div>
        </div>
        
    );
};

export default RegisterPage;
