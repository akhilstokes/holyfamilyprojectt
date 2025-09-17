import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';
import { useAuth } from '../../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { validateToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', location: '' });
  const [originalForm, setOriginalForm] = useState({ name: '', email: '', phoneNumber: '', location: '' });

  useEffect(() => {
    const init = async () => {
      try {
        // Prefill from localStorage for instant UI
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          const prefill = { name: u.name || '', email: u.email || '', phoneNumber: u.phoneNumber || '', location: u.location || '' };
          setForm(prev => ({ ...prev, ...prefill }));
          setOriginalForm(prefill);
        }
        // Fetch fresh from backend with Authorization header
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API}/api/users/profile`, { headers });
        const u = res.data;
        const fetched = { name: u.name || '', email: u.email || '', phoneNumber: u.phoneNumber || '', location: u.location || '' };
        setForm(fetched);
        setOriginalForm(fetched);
      } catch (e) {
        // Keep local values if request fails
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    try {
      setSaving(true);
      // Normalize phone: strip non-digits, drop leading +, 91 or 0
      const clean = form.phoneNumber.replace(/\D/g, '');
      const finalPhone = clean.startsWith('91') && clean.length === 12 ? clean.slice(2) : (clean.startsWith('0') ? clean.slice(1) : clean);
      const payload = { name: form.name.trim(), phoneNumber: finalPhone, location: form.location.trim() };
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.put(`${API}/api/users/profile`, payload, { headers });
      const updated = res.data.user;
      // Update local storage and refresh context
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...current, ...updated }));
      const nextState = { name: updated.name || form.name, email: form.email, phoneNumber: updated.phoneNumber || form.phoneNumber, location: updated.location || form.location };
      setForm(nextState);
      setOriginalForm(nextState);
      setMessage('Profile updated successfully');
      setEditMode(false);
      await validateToken();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(originalForm);
    setEditMode(false);
    setError('');
    setMessage('');
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My Profile</h2>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your name" disabled={!editMode} />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} disabled />
          </div>

          <div className="form-row">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} placeholder="e.g. 9876543210" disabled={!editMode} />
          </div>

          <div className="form-row">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" value={form.location} onChange={handleChange} placeholder="City, State" disabled={!editMode} />
          </div>

          <div className="form-actions">
            {!editMode && (
              <button type="button" className="btn primary" onClick={() => setEditMode(true)}>Edit</button>
            )}
            {editMode && (
              <>
                <button type="button" className="btn" onClick={handleCancel} disabled={saving} style={{ marginRight: 8 }}>Cancel</button>
                <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;