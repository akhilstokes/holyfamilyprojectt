import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyStaffInvite, getInviteDetails } from '../../services/staffService';
import './AuthStyles.css';

const StaffVerify = () => {
  const { token } = useParams();
  
  console.log('StaffVerify component loaded with token:', token);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [inviteDetails, setInviteDetails] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch invitation details on component mount
  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setInitialLoading(false);
        return;
      }

      try {
        console.log('Fetching invite details for token:', token);
        const details = await getInviteDetails(token);
        console.log('Invite details received:', details);
        setInviteDetails(details);
        
        // Pre-populate form with invitation data
        setForm(prev => ({
          ...prev,
          name: details.name || ''
        }));
      } catch (err) {
        console.error('Failed to fetch invite details:', err);
        console.error('Error details:', err?.response?.data);
        setError(err?.response?.data?.message || err?.message || 'Invalid or expired invitation link');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInviteDetails();
  }, [token]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (form.name.trim().length < 2) return 'Full name must be at least 2 characters';
    if (!form.address.trim()) return 'Address is required';
    if (form.address.trim().length < 5) return 'Please enter a complete address';
    if (!form.phone.trim()) return 'Phone number is required';
    if (!/^[+]?[0-9\-\s()]{8,15}$/.test(form.phone.trim())) return 'Please enter a valid phone number (8-15 digits)';
    if (!form.password) return 'Password is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password.length > 50) return 'Password must be less than 50 characters';
    if (!form.confirmPassword) return 'Please confirm your password';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const uploadPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/uploads/public', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Photo upload failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      return data?.file?.path ? data.file.path : '';
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const v = validate();
    if (v) { setError(v); return; }
    try {
      setLoading(true);
      let photoUrl = '';
      
      // Upload photo if provided (optional)
      if (photoFile) {
        setPhotoUploading(true);
        try {
          photoUrl = await uploadPhoto(photoFile);
        } catch (err) {
          console.warn('Photo upload failed, continuing without photo:', err.message);
          // Don't block form submission if photo upload fails
          photoUrl = '';
        }
        setPhotoUploading(false);
      }

      await verifyStaffInvite({
        token,
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        photoUrl: photoUrl || undefined,
        password: form.password,
      });
      // Always pending until admin approves
      setSuccess(`Registration completed successfully! Your details have been submitted for admin approval. You will receive an email notification once approved. After approval, you can login using your Staff ID and the password you just set.`);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="auth-wrapper dark-theme no-showcase">
        <div className="auth-grid">
          <div className="form-container">
            <div className="top-progress" />
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
              <p>Loading invitation details...</p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                Token: {token ? `${token.substring(0, 8)}...` : 'Not found'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper dark-theme no-showcase">
      <div className="auth-grid">
        <div className="form-container">
          <div className="top-progress" />

          <div className="back-row">
            <Link to="/" className="back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </Link>
          </div>

          <h2>Complete Your Staff Account</h2>
          {inviteDetails && (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0B6E4F' }}>
                Invitation Details
              </h3>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Email:</strong> {inviteDetails.email}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Staff ID:</strong> {inviteDetails.staffId}
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                <strong>Role:</strong> {inviteDetails.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          )}
          <p style={{ opacity: 0.8, marginTop: -6 }}>
            Set your profile details and password. Fields marked with * are required.
          </p>

          {error && (
            <div className="error-message" role="alert">
              {error}
              <div style={{ marginTop: '15px' }}>
                <Link 
                  to="/staff/login" 
                  className="btn btn-outline"
                  style={{ 
                    display: 'inline-block', 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    padding: '8px 16px',
                    marginRight: '10px'
                  }}
                >
                  Go to Staff Login
                </Link>
                <Link 
                  to="/" 
                  className="btn btn-outline"
                  style={{ 
                    display: 'inline-block', 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    padding: '8px 16px'
                  }}
                >
                  Go to Home
                </Link>
              </div>
            </div>
          )}
          {success && (
            <div className="success-message" role="status">
              {success}
              <div style={{ marginTop: '15px' }}>
                <Link 
                  to="/staff/login" 
                  className="form-button" 
                  style={{ 
                    display: 'inline-block', 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    padding: '12px 24px',
                    backgroundColor: '#0B6E4F',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Go to Staff Login
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="input-group floating">
              <input 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                className="form-input" 
                placeholder=" " 
                required 
                maxLength="100"
              />
              <label>Full Name *</label>
            </div>
            <div className="input-group floating">
              <textarea 
                name="address" 
                value={form.address} 
                onChange={onChange} 
                className="form-input" 
                placeholder=" " 
                required 
                rows="3"
                maxLength="500"
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
              <label>Complete Address *</label>
            </div>
            <div className="input-group floating">
              <input 
                name="phone" 
                value={form.phone} 
                onChange={onChange} 
                className="form-input" 
                placeholder=" " 
                required 
                type="tel"
                maxLength="15"
              />
              <label>Phone Number *</label>
            </div>
            <div className="input-group floating">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.webp" 
                onChange={handlePhotoChange} 
                className="form-input" 
                style={{ paddingTop: '20px' }}
              />
              <label>Upload Photo (Optional)</label>
              {photoPreview && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid #ddd'
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview('');
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              {photoUploading && (
                <div style={{ marginTop: '10px', color: '#6c757d' }}>
                  Uploading photo...
                </div>
              )}
            </div>
          <div className="input-group floating">
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={onChange} 
              className="form-input" 
              placeholder=" " 
              required 
              minLength="6"
              maxLength="50"
            />
            <label>Create Password *</label>
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Minimum 6 characters. You'll use this to login after approval.
            </small>
          </div>
          <div className="input-group floating">
            <input 
              type="password" 
              name="confirmPassword" 
              value={form.confirmPassword} 
              onChange={onChange} 
              className="form-input" 
              placeholder=" " 
              required 
              minLength="6"
              maxLength="50"
            />
            <label>Confirm Password *</label>
          </div>

            <button className="form-button" type="submit" disabled={loading || success}>
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
                  Submitting Details...
                </>
              ) : success ? (
                'Registration Completed ✓'
              ) : (
                'Complete Registration'
              )}
            </button>
            
            {!success && (
              <p style={{ 
                fontSize: '13px', 
                color: '#666', 
                textAlign: 'center', 
                marginTop: '12px',
                lineHeight: '1.4'
              }}>
                After submitting, your account will be reviewed by an admin. 
                You'll receive an email notification once approved.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffVerify;
