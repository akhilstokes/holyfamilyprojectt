import React, { useState } from 'react';
import { uploadDocument, addSelfWorkerDocument } from '../../services/adminService';

const WorkerDocuments = () => {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onUpload = async () => {
    setError(''); setMessage('');
    try {
      if (!file) throw new Error('Select a file');
      const res = await uploadDocument(file);
      setUrl(res?.file?.path || '');
      setMessage('Uploaded. Now save to worker profile.');
    } catch (e) { setError(e?.response?.data?.message || e?.message || 'Upload failed'); }
  };

  const onSave = async () => {
    setError(''); setMessage('');
    try {
      if (!url) throw new Error('Upload file first');
      await addSelfWorkerDocument({ label, url });
      setMessage('Saved to worker documents');
      setFile(null); setLabel(''); setUrl('');
    } catch (e) { setError(e?.response?.data?.message || e?.message || 'Save failed'); }
  };

  return (
    <div>
      <h2>Worker Documents</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <input placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <button onClick={onUpload}>Upload</button>
        <button onClick={onSave} disabled={!url}>Save</button>
      </div>
      {url && <div>URL: <code>{url}</code></div>}
      {message && <div style={{ color: 'limegreen' }}>{message}</div>}
      {error && <div style={{ color: 'tomato' }}>{error}</div>}
    </div>
  );
};

export default WorkerDocuments;
