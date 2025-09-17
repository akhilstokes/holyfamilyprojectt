import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthStyles.css';

const StaffLoginPage = () => {
    const [formData, setFormData] = useState({ staffId: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { staffLogin } = useAuth();

    const { staffId } = formData;
    const onChange = e => {
        const { name, value } = e.target;
        // normalize: trim spaces and uppercase
        const cleaned = value.replace(/\s+/g, '').toUpperCase();
        setFormData({ ...formData, [name]: cleaned });
    };

    useEffect(() => {
        const prefill = location.state?.staffId;
        if (prefill) {
            setFormData({ staffId: prefill });
        }
    }, [location.state]);

    const validateForm = () => {
        if (!staffId) {
            setError('Please enter Staff ID.');
            return false;
        }
        const patternNew = /^HF[A-Z0-9]{3}$/i; // e.g., HFA42
        const patternLegacy = /^HFP-S-\d{4}$/i; // legacy pattern e.g., HFP-S-0002
        if (!patternNew.test(staffId) && !patternLegacy.test(staffId)) {
            setError('Enter a valid Staff ID like HFA42 or HFP-S-0002');
            return false;
        }
        setError('');
        return true;
    };

    const redirectStaff = (role) => {
        if (role === 'field_staff' || role === 'admin') {
            navigate('/staff/operations', { replace: true });
        } else {
            setError('This login is for staff only.');
        }
    };

    // Google Sign-In not used for staff login

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setLoading(true);
            setError('');
            const result = await staffLogin(staffId.toUpperCase());
            redirectStaff(result.user.role);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper staff-theme">
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

                <h2>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 9H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="8.5" cy="13.5" r="1.5" fill="currentColor"/>
                        <path d="M12 15c-1.2-1.6-4.8-1.6-6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Staff Portal
                </h2>

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

                <div style={{ 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#92400e', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-lg)', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Enter your Staff ID to access the staff portal
                </div>

                <form onSubmit={onSubmit}>
                    <div className="input-group floating">
                        <input 
                            className="form-input" 
                            placeholder=" "
                            name="staffId" 
                            value={staffId} 
                            onChange={onChange} 
                            required 
                            style={{ textTransform: 'uppercase' }}
                        />
                        <label>Staff ID (e.g., HFA42 or HFP-S-0002)</label>
                    </div>
                    
                    <button className="form-button staff" type="submit" disabled={loading}>
                        {loading && <span className="loading-spinner"></span>}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {loading ? 'Authenticating...' : 'Access Staff Portal'}
                    </button>
                </form>

                <div className="auth-links">
                    <Link to="/forgot-password">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Need Help?
                    </Link>
                    <span>
                        New staff member? 
                        <Link to="/staff/register">Register Here</Link>
                    </span>
                    <span>
                        Customer Login? 
                        <Link to="/login">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.25rem' }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Customer Portal
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StaffLoginPage;



