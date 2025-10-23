import React, { useEffect, useState } from 'react';
import { proposeRate, listPendingRates } from '../../services/rateService';

const ManagerRateUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    effectiveDate: '',
    companyRate: '',
    marketRate: '',
    notes: ''
  });
  const [submittedRates, setSubmittedRates] = useState([]);
  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setForm(prev => ({ ...prev, effectiveDate: today }));
    loadSubmittedRates();
  }, []);

  const loadSubmittedRates = async () => {
    try {
      const list = await listPendingRates('latex60');
      setSubmittedRates(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load submitted rates:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.effectiveDate || !form.companyRate || !form.marketRate) {
      setError('Please fill in all required fields');
      return;
    }
    // Prevent past effective dates
    if (form.effectiveDate < todayISO) {
      setError('Effective Date cannot be in the past');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await proposeRate({
        effectiveDate: form.effectiveDate,
        companyRate: parseFloat(form.companyRate),
        marketRate: parseFloat(form.marketRate),
        product: 'latex60',
        notes: form.notes
      });

      setSuccess('Rate proposed for admin verification');
      setForm({
        effectiveDate: new Date().toISOString().split('T')[0],
        companyRate: '',
        marketRate: '',
        notes: ''
      });
      await loadSubmittedRates();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to submit rate update');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Propose Company & Market Rate</h2>
        <button onClick={loadSubmittedRates} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'tomato', marginBottom: 16, padding: 12, background: '#fee', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: 'green', marginBottom: 16, padding: 12, background: '#efe', borderRadius: 4 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Submit New Rate Proposal */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Submit Rate Proposal</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Today Rate *
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={form.effectiveDate}
                onChange={handleInputChange}
                min={todayISO}
                required
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Company Rate (per 100 Kg) *
              </label>
              <input
                type="number"
                name="companyRate"
                value={form.companyRate}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="Enter Company rate (₹)"
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Official Market Rate (per 100 Kg) *
              </label>
              <input
                type="number"
                name="marketRate"
                value={form.marketRate}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="Enter Market rate (₹)"
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                placeholder="Add notes for admin review..."
                rows={3}
                style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 4 }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: 12 }}
            >
              {loading ? 'Submitting...' : 'Submit for Admin Verification'}
            </button>
          </form>
        </div>

        {/* Submitted Rates */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, marginBottom: 16 }}>Pending Proposals</h4>
          
          {submittedRates.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>
              No submitted rates pending approval
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {submittedRates.map((rate, idx) => (
                <div key={idx} style={{ 
                  padding: 12, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 4, 
                  marginBottom: 8,
                  background: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>Latex 60%</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        Effective: {formatDate(rate.effectiveDate)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold' }}>{formatCurrency(rate.companyRate)}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Market: {formatCurrency(rate.marketRate)}</div>
                    </div>
                  </div>
                  
                  {rate.notes && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      <strong>Notes:</strong> {rate.notes}
                    </div>
                  )}
                  
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Submitted: {formatDate(rate.createdAt)}
                  </div>
                  
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    background: '#fef3c7', 
                    color: '#92400e',
                    fontSize: 12,
                    marginTop: 4
                  }}>
                    Pending Admin Verification
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="dash-card" style={{ marginTop: 24 }}>
        <h4 style={{ marginTop: 0 }}>Instructions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div>
            <h5>Rate Update Process:</h5>
            <ol style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Fill in the rate details for the effective date</li>
              <li>Submit the rate update for admin approval</li>
              <li>Admin will review and approve/reject the update</li>
              <li>Approved rates will be visible to customers</li>
            </ol>
          </div>
          
          <div>
            <h5>Important Notes:</h5>
            <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
              <li>Rates are per 100 Kg of product</li>
              <li>Both INR and USD rates are required</li>
              <li>Effective date cannot be in the past</li>
              <li>Admin has final approval authority</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerRateUpdate;
