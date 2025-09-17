import React, { useState } from 'react';
import { createBarrelScrape } from '../../services/storeService';

const ScrapeEntryPage = () => {
  const [form, setForm] = useState({ barrelId: '', totalWeightKg: '', lumpRubberKg: '', moisturePercent: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      const payload = {
        barrelId: form.barrelId.trim(),
        totalWeightKg: Number(form.totalWeightKg),
        lumpRubberKg: Number(form.lumpRubberKg),
        moisturePercent: form.moisturePercent === '' ? null : Number(form.moisturePercent),
        notes: form.notes,
      };
      if (!payload.barrelId || Number.isNaN(payload.totalWeightKg) || Number.isNaN(payload.lumpRubberKg)) {
        setMessage('Please provide barrelId, total weight and lump rubber.');
        setSubmitting(false);
        return;
      }
      await createBarrelScrape(payload);
      setMessage('Scrape entry submitted.');
      setForm({ barrelId: '', totalWeightKg: '', lumpRubberKg: '', moisturePercent: '', notes: '' });
    } catch (e) {
      setMessage(e?.message || e?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <div className="card-header">Barrel Scrape Entry</div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Barrel Serial</label>
            <input name="barrelId" value={form.barrelId} onChange={onChange} className="form-control" placeholder="e.g. BRL-00123" />
          </div>
          <div className="form-group">
            <label>Total Weight (kg)</label>
            <input name="totalWeightKg" value={form.totalWeightKg} onChange={onChange} className="form-control" type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Lump Rubber (kg)</label>
            <input name="lumpRubberKg" value={form.lumpRubberKg} onChange={onChange} className="form-control" type="number" step="0.01" />
          </div>
          <div className="form-group">
            <label>Moisture (%)</label>
            <input name="moisturePercent" value={form.moisturePercent} onChange={onChange} className="form-control" type="number" step="0.1" min="0" max="100" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={onChange} className="form-control" rows={3} />
          </div>
          <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? 'Submitting...' : 'Submit'}</button>
        </form>
        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
};

export default ScrapeEntryPage;


