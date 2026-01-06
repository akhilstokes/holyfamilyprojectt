import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../delivery/DeliveryTheme.css';

function DocsList({ token, onAdd, onRemove }) {
  const [docs, setDocs] = useState([]);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [docType, setDocType] = useState('Aadhaar'); // Aadhaar, Health Card, Photo
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${base}/api/workers/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setDocs(json.documents || []);
      }
    };
    load();
  }, [token, base]);

  const add = async () => {
    // If file chosen, upload it first to get URL
    let finalUrl = url;
    if (file) {
      try {
        setUploading(true);
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${base}/api/uploads/document`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Upload failed');
        }
        const data = await res.json();
        finalUrl = data?.file?.path ? `${base}${data.file.path}` : finalUrl;
      } catch (e) {
        alert(e.message || 'File upload failed');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    await onAdd(label || docType, finalUrl);
    setLabel(''); setUrl(''); setFile(null);
    const res = await fetch(`${base}/api/workers/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const json = await res.json();
      setDocs(json.documents || []);
    }
  };

  const remove = async (i) => {
    await onRemove(i);
    const res = await fetch(`${base}/api/workers/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const json = await res.json();
      setDocs(json.documents || []);
    }
  };

  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
        {/* Type selector */}
        <select className="form-control" value={docType} onChange={(e)=>setDocType(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="Aadhaar">Aadhaar</option>
          <option value="Health Card">Health Card</option>
          <option value="Photo">Photo</option>
          <option value="Other">Other</option>
        </select>

        {/* Optional label */}
        <input className="form-control" placeholder="Label (optional)" value={label} onChange={(e)=>setLabel(e.target.value)} />

        {/* Either choose a file OR paste a URL */}
        <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={(e)=>setFile(e.target.files?.[0] || null)} style={{ maxWidth: 280 }} />
        <input className="form-control" placeholder="Document URL (optional if file chosen)" value={url} onChange={(e)=>setUrl(e.target.value)} />

        <button className="btn btn-primary" onClick={add} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      <ul className="list-group">
        {docs.map((d, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              {d.label ? `${d.label} - ` : ''}
              <a href={d.url} target="_blank" rel="noreferrer">{d.url}</a>
            </span>
            <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(i)}>Remove</button>
          </li>
        ))}
        {docs.length === 0 && <li className="list-group-item">No documents</li>}
      </ul>
    </div>
  );
}

const StaffProfile = () => {
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showStaffInfo, setShowStaffInfo] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoUploading, setPhotoUploading] = useState(false);
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    const fetchWorker = async () => {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      try {
        setLoading(true);
        const res = await fetch(`${base}/api/workers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setWorker({
            name: json.name || json.user?.name,
            email: json.user?.email,
            dailyWage: json.dailyWage,
            origin: json.origin,
            contactNumber: json.contactNumber,
            role: json.role,
            staffId: json.staffId || json._id,
            address: json.address,
            emergencyContactName: json.emergencyContactName,
            emergencyContactNumber: json.emergencyContactNumber,
            dateOfBirth: json.dateOfBirth,
            aadhaarNumber: json.aadhaarNumber,
            photoUrl: json.photoUrl,
            health: json.health,
          });
          setError(null);
          return;
        }
        // If worker profile is missing (e.g., 404), fall back to basic user profile
        const userRes = await fetch(`${base}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const u = await userRes.json();
          setWorker({
            name: u.name,
            email: u.email,
            dailyWage: 0,
            origin: u.location || '-',
            contactNumber: u.phoneNumber || '-',
            role: u.role || 'staff',
            staffId: u._id,
            address: u.address || '',
            emergencyContactName: '',
            emergencyContactNumber: '',
            dateOfBirth: '',
            aadhaarNumber: '',
            photoUrl: '',
            health: {},
          });
          setError(null);
        } else {
          throw new Error('Failed to load profile');
        }
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWorker();
    }
  }, [user, token]);

  // React to query parameters for view/tab routing from header menu
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    const tab = params.get('tab');
    if (view === '1' || view === 'true') {
      setShowStaffInfo(true);
    }
    if (tab === 'documents') setActiveTab('documents');
    if (tab === 'health') setActiveTab('health');
  }, [location.search]);

  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // ---------------- Validation helpers ----------------
  const isValidName = (name) => {
    if (!name || !name.trim()) return 'Name is required';
    if (!/^[a-zA-Z\s.]+$/.test(name)) return 'Only letters, spaces and dots allowed';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const isValidPhone = (phone) => {
    if (!phone || !phone.toString().trim()) return 'Phone number is required';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      const n = digits.slice(2);
      if (!/^[6-9]\d{9}$/.test(n)) return 'Invalid Indian mobile number';
    } else if (digits.length === 10) {
      if (!/^[6-9]\d{9}$/.test(digits)) return 'Invalid 10-digit mobile number';
    } else if (digits.length === 11 && digits.startsWith('0')) {
      const n = digits.slice(1);
      if (!/^[6-9]\d{9}$/.test(n)) return 'Invalid 10-digit mobile number';
    } else {
      return 'Provide 10 digits or +91 followed by 10 digits';
    }
    return '';
  };

  const isValidAddress = (addr) => {
    if (!addr || !addr.trim()) return 'Address is required';
    if (addr.trim().length < 5) return 'Address must be at least 5 characters';
    return '';
  };

  const isValidDob = (dob) => {
    if (!dob) return '';
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return 'Invalid date';
    const today = new Date();
    if (d > today) return 'Date cannot be in the future';
    const age = today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
    if (age < 18) return 'Must be at least 18 years old';
    return '';
  };

  const isValidAadhaar = (aad) => {
    if (!aad) return '';
    const digits = String(aad).replace(/\D/g, '');
    if (digits.length !== 12) return 'Aadhaar must be 12 digits';
    return '';
  };

  const isValidUrl = (val) => {
    if (!val) return '';
    try {
      // eslint-disable-next-line no-new
      new URL(val);
      return '';
    } catch {
      return 'Enter a valid URL (include http/https)';
    }
  };

  const isValidBloodGroup = (bg) => {
    if (!bg) return '';
    return /^(A|B|AB|O)[+-]$/i.test(bg) ? '' : 'Use formats like O+, A-, AB+';
  };

  const validateAndMaybeUpdate = async (field, value, toServerPayload) => {
    let message = '';
    switch (field) {
      case 'name': message = isValidName(value); break;
      case 'contactNumber': message = isValidPhone(value); break;
      case 'address': message = isValidAddress(value); break;
      case 'emergencyContactName': message = value ? isValidName(value) : ''; break;
      case 'emergencyContactNumber': message = value ? isValidPhone(value) : ''; break;
      case 'dateOfBirth': message = isValidDob(value); break;
      case 'aadhaarNumber': message = isValidAadhaar(value); break;
      // photoUrl is set via file upload; no manual URL validation
      case 'health.bloodGroup': message = isValidBloodGroup(value); break;
      case 'health.medicalCertificateUrl': message = isValidUrl(value); break;
      case 'origin': message = ['kerala','other'].includes(String(value || '').toLowerCase()) ? '' : 'Invalid option'; break;
      default: message = '';
    }

    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    if (message) return; // do not send to server when invalid

    await updateProfile(toServerPayload);
  };

  const updateProfile = async (payload) => {
    try {
      setSaving(true);
      setError(null);
      
      const res = await fetch(`${base}/api/workers/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to save' }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }
      
      const json = await res.json();
      setWorker({
        ...worker,
        name: json.name || json.user?.name,
        email: json.user?.email,
        dailyWage: json.dailyWage,
        origin: json.origin,
        contactNumber: json.contactNumber,
        address: json.address,
        emergencyContactName: json.emergencyContactName,
        emergencyContactNumber: json.emergencyContactNumber,
        dateOfBirth: json.dateOfBirth,
        aadhaarNumber: json.aadhaarNumber,
        photoUrl: json.photoUrl,
        health: json.health,
        staffId: json.staffId || json._id,
      });
      
      // Show success message briefly
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    } catch (e) {
      console.error('Profile update error:', e);
      setError(e.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    const tabs = ['personal', 'documents', 'health'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      setShowStaffInfo(true);
    }
  };

  const handleSave = async () => {
    // Validate current tab data before saving
    const errorsAccumulator = {};
    if (activeTab === 'personal') {
      errorsAccumulator.name = isValidName(worker?.name || '');
      errorsAccumulator.contactNumber = isValidPhone(worker?.contactNumber || '');
      errorsAccumulator.address = isValidAddress(worker?.address || '');
      if (worker?.emergencyContactName) errorsAccumulator.emergencyContactName = isValidName(worker.emergencyContactName);
      if (worker?.emergencyContactNumber) errorsAccumulator.emergencyContactNumber = isValidPhone(worker.emergencyContactNumber);
      errorsAccumulator.dateOfBirth = isValidDob(worker?.dateOfBirth || '');
      errorsAccumulator.aadhaarNumber = isValidAadhaar(worker?.aadhaarNumber || '');
      // photoUrl comes from upload; no URL validation required here
      errorsAccumulator.origin = ['kerala','other'].includes(String(worker?.origin || '').toLowerCase()) ? '' : 'Invalid option';
    }
    if (activeTab === 'health') {
      errorsAccumulator['health.bloodGroup'] = isValidBloodGroup(worker?.health?.bloodGroup || '');
      errorsAccumulator['health.medicalCertificateUrl'] = isValidUrl(worker?.health?.medicalCertificateUrl || '');
      if (worker?.health?.lastCheckupDate) errorsAccumulator['health.lastCheckupDate'] = isValidDob(worker.health.lastCheckupDate);
    }

    // Filter empty messages
    const cleaned = Object.fromEntries(Object.entries(errorsAccumulator).filter(([, v]) => v));
    setFieldErrors((prev) => ({ ...prev, ...cleaned }));
    if (Object.keys(cleaned).length > 0) {
      setError('Please fix the highlighted errors');
      return;
    }

    // Trigger save for current tab
    await updateProfile({});
  };

  const addDocument = async (label, url) => {
    await fetch(`${base}/api/workers/me/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label, url }),
    });
  };

  const removeDocument = async (idx) => {
    await fetch(`${base}/api/workers/me/documents/${idx}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  if (loading) return <div style={{ padding: 16 }}>Loading profile...</div>;
  
  // Display error message if any
  const ErrorMessage = () => error ? (
    <div className="alert alert-danger" style={{ marginBottom: 16 }}>
      <i className="fas fa-exclamation-triangle"></i> {error}
    </div>
  ) : null;
  
  // Display success message if any
  const SuccessMessage = () => success ? (
    <div className="alert alert-success" style={{ marginBottom: 16 }}>
      <i className="fas fa-check-circle"></i> {success}
    </div>
  ) : null;

  // Staff Information Display Component
  const StaffInfoDisplay = () => (
    <div style={{ 
      marginTop: 24, 
      padding: 20, 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: 8,
      maxWidth: 640
    }}>
      <h3 style={{ color: '#495057', marginBottom: 16 }}>Staff Information Summary</h3>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
          <strong>Staff ID:</strong>
          <span style={{ color: '#6c757d' }}>{worker?.staffId || 'Not assigned'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
          <strong>Name:</strong>
          <span style={{ color: '#6c757d' }}>{worker?.name || 'Not provided'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
          <strong>Address:</strong>
          <span style={{ color: '#6c757d', textAlign: 'right', maxWidth: '60%' }}>{worker?.address || 'Not provided'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
          <strong>Contact:</strong>
          <span style={{ color: '#6c757d' }}>{worker?.contactNumber || 'Not provided'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
          <strong>Email:</strong>
          <span style={{ color: '#6c757d' }}>{worker?.email || 'Not provided'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <strong>Role:</strong>
          <span style={{ color: '#6c757d' }}>{worker?.role || 'Staff'}</span>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => setShowStaffInfo(false)}
        >
          Edit Profile
        </button>
        <button 
          className="btn btn-success" 
          onClick={() => window.print()}
        >
          Print Profile
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <h2>My Profile</h2>
      
      <ErrorMessage />
      <SuccessMessage />
      
      {showStaffInfo ? (
        <StaffInfoDisplay />
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button className={`btn btn-${activeTab==='personal'?'primary':'light'}`} onClick={()=>setActiveTab('personal')}>Personal</button>
            <button className={`btn btn-${activeTab==='documents'?'primary':'light'}`} onClick={()=>setActiveTab('documents')}>Documents</button>
            <button className={`btn btn-${activeTab==='health'?'primary':'light'}`} onClick={()=>setActiveTab('health')}>Health</button>
          </div>
        </>
      )}

      {activeTab === 'personal' && (
        <div style={{ marginTop: 16, maxWidth: 640 }}>
          <div className="form-group">
            <label>Name</label>
            <input
              className="form-control"
              defaultValue={worker?.name||''}
              onBlur={(e)=>validateAndMaybeUpdate('name', e.target.value, { name: e.target.value })}
              onChange={()=> fieldErrors.name && setFieldErrors((p)=>({ ...p, name: '' }))}
            />
            {fieldErrors.name ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.name}</div> : null}
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input
              className="form-control"
              defaultValue={worker?.contactNumber||''}
              onBlur={(e)=>validateAndMaybeUpdate('contactNumber', e.target.value, { contactNumber: e.target.value })}
              onChange={()=> fieldErrors.contactNumber && setFieldErrors((p)=>({ ...p, contactNumber: '' }))}
            />
            {fieldErrors.contactNumber ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.contactNumber}</div> : null}
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              className="form-control"
              defaultValue={worker?.address||''}
              onBlur={(e)=>validateAndMaybeUpdate('address', e.target.value, { address: e.target.value })}
              onChange={()=> fieldErrors.address && setFieldErrors((p)=>({ ...p, address: '' }))}
            />
            {fieldErrors.address ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.address}</div> : null}
          </div>
          <div className="form-row" style={{ display:'flex', gap:12 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Emergency Contact Name</label>
              <input
                className="form-control"
                defaultValue={worker?.emergencyContactName||''}
                onBlur={(e)=>validateAndMaybeUpdate('emergencyContactName', e.target.value, { emergencyContactName: e.target.value })}
                onChange={()=> fieldErrors.emergencyContactName && setFieldErrors((p)=>({ ...p, emergencyContactName: '' }))}
              />
              {fieldErrors.emergencyContactName ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.emergencyContactName}</div> : null}
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Emergency Contact Number</label>
              <input
                className="form-control"
                defaultValue={worker?.emergencyContactNumber||''}
                onBlur={(e)=>validateAndMaybeUpdate('emergencyContactNumber', e.target.value, { emergencyContactNumber: e.target.value })}
                onChange={()=> fieldErrors.emergencyContactNumber && setFieldErrors((p)=>({ ...p, emergencyContactNumber: '' }))}
              />
              {fieldErrors.emergencyContactNumber ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.emergencyContactNumber}</div> : null}
            </div>
          </div>
          <div className="form-row" style={{ display:'flex', gap:12 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Date of Birth</label>
              <input
                type="date"
                className="form-control"
                defaultValue={worker?.dateOfBirth? String(worker.dateOfBirth).slice(0,10):''}
                onBlur={(e)=>validateAndMaybeUpdate('dateOfBirth', e.target.value, { dateOfBirth: e.target.value })}
                onChange={()=> fieldErrors.dateOfBirth && setFieldErrors((p)=>({ ...p, dateOfBirth: '' }))}
              />
              {fieldErrors.dateOfBirth ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.dateOfBirth}</div> : null}
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Origin</label>
              <select
                className="form-control"
                defaultValue={worker?.origin||'kerala'}
                onChange={(e)=>validateAndMaybeUpdate('origin', e.target.value, { origin: e.target.value })}
              >
                <option value="kerala">Kerala</option>
                <option value="other">Other State</option>
              </select>
              {fieldErrors.origin ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.origin}</div> : null}
            </div>
          </div>
          <div className="form-row" style={{ display:'flex', gap:12 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Aadhaar Number</label>
              <input
                className="form-control"
                defaultValue={worker?.aadhaarNumber||''}
                onBlur={(e)=>validateAndMaybeUpdate('aadhaarNumber', e.target.value, { aadhaarNumber: e.target.value })}
                onChange={()=> fieldErrors.aadhaarNumber && setFieldErrors((p)=>({ ...p, aadhaarNumber: '' }))}
              />
              {fieldErrors.aadhaarNumber ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors.aadhaarNumber}</div> : null}
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="form-control"
                  onChange={async (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    try {
                      setPhotoUploading(true);
                      const form = new FormData();
                      form.append('file', file);
                      const res = await fetch(`${base}/api/uploads/document`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: form,
                      });
                      if (!res.ok) {
                        const msg = await res.text();
                        throw new Error(msg || 'Upload failed');
                      }
                      const data = await res.json();
                      const url = data?.file?.path ? `${base}${data.file.path}` : '';
                      if (!url) throw new Error('No file URL returned');
                      await updateProfile({ photoUrl: url });
                    } catch (err) {
                      setError(err.message || 'Photo upload failed');
                    } finally {
                      setPhotoUploading(false);
                    }
                  }}
                />
                {photoUploading ? <span style={{ color: '#6c757d' }}>Uploading...</span> : null}
              </div>
              {worker?.photoUrl ? (
                <div style={{ marginTop: 8 }}>
                  <img src={worker.photoUrl} alt="Profile" style={{ height: 64, width: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
                </div>
              ) : null}
            </div>
          </div>
          {/* Action Buttons */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
              style={{ minWidth: 100 }}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save" style={{ marginRight: 8 }}></i>
                  Save
                </>
              )}
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleNext}
              disabled={saving}
              style={{ minWidth: 100 }}
            >
              <i className="fas fa-arrow-right" style={{ marginRight: 8 }}></i>
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div style={{ marginTop: 16 }}>
          <DocsList token={token} onAdd={addDocument} onRemove={removeDocument} />
          
          {/* Action Buttons */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
              style={{ minWidth: 100 }}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save" style={{ marginRight: 8 }}></i>
                  Save
                </>
              )}
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleNext}
              disabled={saving}
              style={{ minWidth: 100 }}
            >
              <i className="fas fa-arrow-right" style={{ marginRight: 8 }}></i>
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div style={{ marginTop: 16, maxWidth: 640 }}>
          <div className="form-row" style={{ display:'flex', gap:12 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Blood Group</label>
              <input
                className="form-control"
                defaultValue={worker?.health?.bloodGroup||''}
                onBlur={(e)=>validateAndMaybeUpdate('health.bloodGroup', e.target.value, { health: { ...worker?.health, bloodGroup: e.target.value } })}
                onChange={()=> fieldErrors['health.bloodGroup'] && setFieldErrors((p)=>({ ...p, 'health.bloodGroup': '' }))}
              />
              {fieldErrors['health.bloodGroup'] ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors['health.bloodGroup']}</div> : null}
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label>Medical Certificate URL</label>
              <input
                className="form-control"
                defaultValue={worker?.health?.medicalCertificateUrl||''}
                onBlur={(e)=>validateAndMaybeUpdate('health.medicalCertificateUrl', e.target.value, { health: { ...worker?.health, medicalCertificateUrl: e.target.value } })}

                onChange={()=> fieldErrors['health.medicalCertificateUrl'] && setFieldErrors((p)=>({ ...p, ['health.medicalCertificateUrl']: '' }))}

                onChange={()=> fieldErrors.health?.medicalCertificateUrl && setFieldErrors((p)=>({ ...p, health: { ...p.health, medicalCertificateUrl: '' } }))}

              />
              {fieldErrors['health.medicalCertificateUrl'] ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors['health.medicalCertificateUrl']}</div> : null}
            </div>
          </div>
          <div className="form-row" style={{ display:'flex', gap:12 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label>Last Checkup Date</label>
              <input
                type="date"
                className="form-control"
                defaultValue={worker?.health?.lastCheckupDate? String(worker.health.lastCheckupDate).slice(0,10):''}
                onBlur={(e)=>validateAndMaybeUpdate('health.lastCheckupDate', e.target.value, { health: { ...worker?.health, lastCheckupDate: e.target.value } })}

                onChange={()=> fieldErrors['health.lastCheckupDate'] && setFieldErrors((p)=>({ ...p, ['health.lastCheckupDate']: '' }))}

                onChange={()=> fieldErrors.health?.lastCheckupDate && setFieldErrors((p)=>({ ...p, health: { ...p.health, lastCheckupDate: '' } }))}

              />
              {fieldErrors['health.lastCheckupDate'] ? <div className="text-danger" style={{ fontSize: 12 }}>{fieldErrors['health.lastCheckupDate']}</div> : null}
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-control"
              defaultValue={worker?.health?.notes||''}
              onBlur={(e)=>updateProfile({ health: { ...worker?.health, notes: e.target.value } })}
            />
          </div>
          
          {/* Action Buttons */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleNext}
              disabled={saving}
              style={{ minWidth: 120 }}
            >
              <i className="fas fa-eye" style={{ marginRight: 8 }}></i>
              View Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProfile;


