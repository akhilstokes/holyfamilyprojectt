import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function StaffDocumentUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  const onFileChange = (e) => {
    setError('');
    setSuccess('');
    const f = e.target.files?.[0];
    if (!f) { setFile(null); return; }
    if (!allowed.includes(f.type)) {
      setError('Invalid file type. Allowed: JPG, PNG, GIF, WEBP, PDF');
      setFile(null);
      return;
    }
    if (f.size > maxSize) {
      setError('File too large. Max 10 MB');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) { setError('Please choose a file'); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const form = new FormData();
      form.append('file', file);
      await axios.post(`${API}/api/uploads/document`, form, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Upload successful');
      setFile(null);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Upload Document</h2>
      <p style={{ color: '#555' }}>Allowed: JPG, PNG, GIF, WEBP, PDF (max 10MB).</p>
      <form onSubmit={onSubmit}>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
          onChange={onFileChange}
        />
        <div style={{ marginTop: '0.75rem' }}>
          <button disabled={loading} type="submit" className="btn btn-sm btn-primary">
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: '#c0392b', marginTop: '0.75rem' }}>{error}</p>}
      {success && <p style={{ color: '#2ecc71', marginTop: '0.75rem' }}>{success}</p>}
    </div>
  );
}