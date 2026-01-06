import React, { useState, useEffect } from 'react';
import { FiFolder, FiFileText, FiUploadCloud, FiDownload, FiEdit2, FiTrash2, FiSearch, FiFile } from 'react-icons/fi';
import './AccountantDocuments.css';

const AccountantDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Invoice',
        description: '',
        fileUrl: '',
        fileName: ''
    });

    const categories = ['Invoice', 'Receipt', 'Contract', 'Tax', 'Report', 'Other'];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/accountant/documents`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
            // Auto-fill title if empty
            if (!formData.title) {
                setFormData(prev => ({ ...prev, title: e.target.files[0].name.split('.')[0] }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let finalFileUrl = formData.fileUrl;
            let finalFileName = formData.fileName;

            // Upload file first if new file is selected
            if (fileToUpload) {
                const uploadData = new FormData();
                uploadData.append('file', fileToUpload);

                const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/uploads/document`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: uploadData
                });

                if (!uploadResponse.ok) throw new Error('File upload failed');

                const uploadResult = await uploadResponse.json();
                finalFileUrl = uploadResult.file.path;
                finalFileName = uploadResult.file.originalName;
            }

            const payload = {
                ...formData,
                fileUrl: finalFileUrl,
                fileName: finalFileName
            };

            const url = editMode
                ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/accountant/document/${editId}`
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/accountant/document`;

            const response = await fetch(url, {
                method: editMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchDocuments();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving document:', error);
            alert('Failed to save document.');
        } finally {
            setUploading(false);
        }
    };

    const deleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/accountant/document/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            fetchDocuments();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const resetForm = () => {
        setFormData({ title: '', category: 'Invoice', description: '', fileUrl: '', fileName: '' });
        setFileToUpload(null);
        setEditMode(false);
        setEditId(null);
    };

    const openEdit = (doc) => {
        setEditMode(true);
        setEditId(doc._id);
        setFormData({
            title: doc.title,
            category: doc.category,
            description: doc.description || '',
            fileUrl: doc.fileUrl,
            fileName: doc.fileName
        });
        setShowModal(true);
    };

    // Filtering
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="accountant-documents">
            <div className="docs-header">
                <div>
                    <h1 className="docs-title"><FiFolder /> Document Management</h1>
                    <p className="text-gray-500">Organize and manage financial records</p>
                </div>
                <button className="btn-upload" onClick={() => { resetForm(); setShowModal(true); }}>
                    <FiUploadCloud /> Upload New
                </button>
            </div>

            <div className="docs-toolbar bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        className="pl-10 p-2 border rounded-md w-full"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="p-2 border rounded-md min-w-[150px]"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center p-10">Loading...</div>
            ) : (
                <div className="documents-grid">
                    {filteredDocs.length === 0 ? (
                        <div className="empty-state">
                            <FiFolder className="empty-icon" />
                            <p>No documents found</p>
                        </div>
                    ) : (
                        filteredDocs.map(doc => (
                            <div key={doc._id} className="doc-card">
                                <div className="doc-icon-wrapper">
                                    <FiFileText />
                                </div>
                                <div className="doc-content">
                                    <div className="doc-category">{doc.category}</div>
                                    <h3 className="doc-name" title={doc.title}>{doc.title}</h3>
                                    <p className="doc-desc">{doc.description}</p>

                                    <div className="doc-meta">
                                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        <span>{(doc.fileName || '').split('.').pop().toUpperCase()}</span>
                                    </div>

                                    <div className="doc-footer">
                                        <a
                                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${doc.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-icon-action"
                                        >
                                            <FiDownload /> View
                                        </a>
                                        <button onClick={() => openEdit(doc)} className="btn-icon-action">
                                            <FiEdit2 />
                                        </button>
                                        <button onClick={() => deleteDocument(doc._id)} className="btn-icon-action delete">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{editMode ? 'Edit Document' : 'Upload Document'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    className="form-input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">File</label>
                                {!editMode && (
                                    <div className="upload-area relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.jpg,.png,.xlsx,.csv"
                                            required={!editMode}
                                        />
                                        <div className="text-center pointer-events-none">
                                            <FiUploadCloud className="mx-auto text-2xl mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">Click or Drag to Upload</p>
                                        </div>
                                    </div>
                                )}
                                {(fileToUpload || formData.fileName) && (
                                    <div className="selected-file">
                                        <FiFile />
                                        <span className="truncate flex-1">
                                            {fileToUpload ? fileToUpload.name : formData.fileName}
                                        </span>
                                        {editMode && !fileToUpload && (
                                            <label className="text-xs text-blue-600 cursor-pointer ml-2">
                                                Change
                                                <input type="file" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Save Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountantDocuments;
