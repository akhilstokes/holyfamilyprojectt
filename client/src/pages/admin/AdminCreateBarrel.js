import React, { useState, useEffect } from 'react';
import { validateBarrelForm } from '../../utils/adminValidations';

function AdminCreateBarrel() {
  const token = localStorage.getItem('token');
  const MATERIAL_OPTIONS = ['Latex', 'Ammonia', 'Acetic Acid', 'Water', 'Other'];
  const [form, setForm] = useState({
    barrelId: '',
    materialName: '',
    materialOther: '',
    batchNo: '',
    manufactureDate: '',
    expiryDate: '',
    unit: 'L',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  // Action strip state
  const [actionId, setActionId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'approve'
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form on change
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      const newErrors = validateBarrelForm(form);
      setFormErrors(newErrors);
    }
  }, [form]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onBlur = (e) => {
    const { name } = e.target;
    const newErrors = validateBarrelForm(form);
    setFormErrors(prev => ({
      ...prev,
      [name]: newErrors[name] || ''
    }));
  };

  const genBarrelId = () => {
    const num = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    const id = `BHFP${num}`;
    setForm(prev => ({ ...prev, barrelId: id }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    
    // Validate form
    const newErrors = validateBarrelForm(form);
    setFormErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const finalMaterial = form.materialName === 'Other' ? form.materialOther : form.materialName;
      const payload = {
        barrelId: form.barrelId,
        capacity: 1,
        currentVolume: 0,
        status: 'in-storage',
        lastKnownLocation: 'Factory',
        materialName: finalMaterial || '',
        batchNo: form.batchNo || '',
        manufactureDate: form.manufactureDate || undefined,
        expiryDate: form.expiryDate || undefined,
        unit: form.unit || 'L',
      };
      
      const res = await fetch('/api/barrels', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': token ? `Bearer ${token}` : undefined 
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create barrel');
      }

      setSuccess(data);
      setForm({
        barrelId: '', 
        materialName: '', 
        materialOther: '', 
        batchNo: '', 
        manufactureDate: '', 
        expiryDate: '', 
        unit: 'L',
      });
      setFormErrors({});
    } catch (err) {
      setError(err.message || 'An error occurred while creating the barrel');
      console.error('Create barrel error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="card-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" className={`btn ${activeTab === 'create' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('create')}>Create Barrel</button>
          <button type="button" className={`btn ${activeTab === 'approve' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('approve')}>Approve Barrel</button>
        </div>

        {activeTab === 'approve' && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                placeholder="Barrel ID (e.g., BHFP01)"
                value={actionId}
                onChange={(e) => setActionId(e.target.value)}
                style={{ flex: 1, minWidth: 220 }}
              />
              <button
                className="btn btn-warning"
                onClick={async () => {
                  const id = (actionId || '').trim();
                  if (!id) { setActionMsg('Please enter Barrel ID'); return; }
                  if (!/^BHFP\d{2}$/i.test(id)) { setActionMsg('Invalid ID. Use format BHFP01'); return; }
                  setActionMsg(''); setActionLoading(true);
                  try {
                    const res = await fetch('/api/barrel-logistics/approve/purchase', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined },
                      body: JSON.stringify({ barrelId: id }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.message || 'Failed');
                    setActionMsg('Purchase approved');
                  } catch (e) { setActionMsg(e.message); } finally { setActionLoading(false); }
                }}
              >Approve Purchase</button>
            </div>
            <div className="text-muted" style={{ marginBottom: 4 }}>
              Note: Movement create/list is available under staff and logistics endpoints.
            </div>
            {actionMsg && (
              <div className="text-muted" style={{ marginBottom: 12 }}>{actionMsg}</div>
            )}
          </>
        )}

        {activeTab === 'create' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>Create Barrel</h2>
              <button type="button" className="btn btn-secondary" onClick={genBarrelId}>Generate ID</button>
            </div>
            <form onSubmit={submit} className="form-grid">
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Barrel ID</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  name="barrelId" 
                  value={form.barrelId} 
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="BHFP01" 
                  className={formErrors.barrelId ? 'error' : ''}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={genBarrelId}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Generate
                </button>
              </div>
              {formErrors.barrelId && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: '4px' }}>
                  {formErrors.barrelId}
                </div>
              )}
            </div>
          </div>

          {form.barrelId && (
            <div className="form-row" style={{ alignItems: 'center', marginBottom: '16px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    className="btn btn-sm btn-outline"
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(form.barrelId)}`}
                    download={`QR-${form.barrelId}.png`}
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <i className="fas fa-download"></i> Download QR
                  </a>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      const url = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(form.barrelId)}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <i className="fas fa-print"></i> Print QR
                  </button>
                  <a
                    className="btn btn-sm btn-outline"
                    href="/manager/barrel-scan"
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <i className="fas fa-qrcode"></i> Manager Scan
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Material Name *</label>
              <select 
                name="materialName" 
                value={form.materialName} 
                onChange={onChange}
                onBlur={onBlur}
                className={formErrors.materialName ? 'error' : ''}
              >
                <option value="">Select material</option>
                {MATERIAL_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {formErrors.materialName && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: '4px' }}>
                  {formErrors.materialName}
                </div>
              )}
            </div>
            
            {form.materialName === 'Other' && (
              <div className="form-group">
                <label>Specify Material *</label>
                <input 
                  name="materialOther" 
                  value={form.materialOther} 
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="Enter material name"
                  className={formErrors.materialOther ? 'error' : ''}
                />
                {formErrors.materialOther && (
                  <div className="text-danger" style={{ fontSize: 12, marginTop: '4px' }}>
                    {formErrors.materialOther}
                  </div>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label>Batch No</label>
              <input 
                name="batchNo" 
                value={form.batchNo} 
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Enter batch number"
                maxLength={50}
              />
              {formErrors.batchNo && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: '4px' }}>
                  {formErrors.batchNo}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Unit *</label>
              <select 
                name="unit" 
                value={form.unit} 
                onChange={onChange}
                onBlur={onBlur}
                className={formErrors.unit ? 'error' : ''}
              >
                <option value="L">Liters (L)</option>
                <option value="KG">Kilograms (KG)</option>
              </select>
              {formErrors.unit && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: '4px' }}>
                  {formErrors.unit}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacture Date</label>
              <input 
                name="manufactureDate" 
                type="date" 
                value={form.manufactureDate} 
                onChange={onChange}
                onBlur={onBlur}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="form-group">
              <label>Expiry Date</label>
              <input 
                name="expiryDate" 
                type="date" 
                value={form.expiryDate} 
                onChange={onChange}
                onBlur={onBlur}
                min={form.manufactureDate || new Date().toISOString().split('T')[0]}
                className={formErrors.expiryDate ? 'error' : ''}
              />
              {formErrors.expiryDate && (
                <div className="text-danger" style={{ fontSize: 12, marginTop: '4px' }}>
                  {formErrors.expiryDate}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || Object.keys(validateBarrelForm(form)).length > 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                  Creating...
                </>
              ) : 'Create Barrel'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => {
                setForm({
                  barrelId: '', 
                  materialName: '', 
                  materialOther: '', 
                  batchNo: '', 
                  manufactureDate: '', 
                  expiryDate: '', 
                  unit: 'L',
                });
                setFormErrors({});
                setError('');
                setSuccess(null);
              }}
              style={{ marginLeft: '12px' }}
            >
              Reset Form
            </button>
          </div>
        </form>

        {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}
        {success && (
          <div className="alert alert-success" style={{ marginTop: 12 }}>
            Created: <strong>{success.barrelId}</strong>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminCreateBarrel;
