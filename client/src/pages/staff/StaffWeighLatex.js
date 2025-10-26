import React, { useState } from 'react';
import axios from 'axios';
import './StaffWeighLatex.css';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const StaffWeighLatex = () => {
  const [barrelId, setBarrelId] = useState('');
  const [batchDate, setBatchDate] = useState(() => new Date().toISOString().slice(0,10));
  const [grossKg, setGrossKg] = useState('');
  const [tareKg, setTareKg] = useState('');
  const [ammoniumKg, setAmmoniumKg] = useState('0');
  const [otherChemicalsKg, setOtherChemicalsKg] = useState('0');
  const [measuredDRC, setMeasuredDRC] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const net = Math.max(0, (parseFloat(grossKg)||0) - (parseFloat(tareKg)||0));
  const dryEst = Math.max(0, net - (parseFloat(ammoniumKg)||0) - (parseFloat(otherChemicalsKg)||0));
  const drc = measuredDRC ? parseFloat(measuredDRC) : (net>0 ? (dryEst/net*100) : 0);

  const submitIntake = async () => {
    if (!barrelId || !grossKg || !tareKg) { 
      setMessage('Please enter barrel ID, gross weight, and tare weight'); 
      return; 
    }
    setLoading(true); 
    setMessage('');
    try {
      await axios.post('/api/latex-intake', {
        barrelId, 
        batchDate, 
        grossKg: Number(grossKg), 
        tareKg: Number(tareKg), 
        ammoniumKg: Number(ammoniumKg||0), 
        otherChemicalsKg: Number(otherChemicalsKg||0), 
        measuredDRC: measuredDRC ? Number(measuredDRC) : undefined
      }, authHeaders());
      setBarrelId(''); 
      setGrossKg(''); 
      setTareKg(''); 
      setAmmoniumKg('0'); 
      setOtherChemicalsKg('0'); 
      setMeasuredDRC('');
      setMessage('Intake recorded successfully');
    } catch (e) {
      setMessage(e?.response?.data?.message || 'Failed to record intake');
    } finally { 
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setBarrelId('');
    setGrossKg('');
    setTareKg('');
    setAmmoniumKg('0');
    setOtherChemicalsKg('0');
    setMeasuredDRC('');
    setMessage('');
  };

  return (
    <div className="staff-weigh-latex">
      <div className="page-header">
        <h1>Weigh Latex</h1>
        <p>Record latex intake measurements and calculations</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="weigh-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Barrel ID *</label>
              <input 
                type="text" 
                placeholder="Enter barrel ID" 
                value={barrelId} 
                onChange={e=>setBarrelId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Batch Date *</label>
              <input 
                type="date" 
                value={batchDate} 
                onChange={e=>setBatchDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Weight Measurements</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Gross Weight (kg) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                inputMode="decimal"
                placeholder="Enter gross weight" 
                value={grossKg} 
                onChange={e=>setGrossKg(e.target.value.replace(/^-/, ''))}
                onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()}
                onWheel={(e)=>e.currentTarget.blur()}
                required
              />
            </div>
            <div className="form-group">
              <label>Tare Weight (kg) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                inputMode="decimal"
                placeholder="Enter tare weight" 
                value={tareKg} 
                onChange={e=>setTareKg(e.target.value.replace(/^-/, ''))}
                onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()}
                onWheel={(e)=>e.currentTarget.blur()}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Chemical Additions</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ammonium (kg)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                inputMode="decimal"
                placeholder="Enter ammonium weight" 
                value={ammoniumKg} 
                onChange={e=>setAmmoniumKg(e.target.value.replace(/^-/, ''))}
                onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()}
                onWheel={(e)=>e.currentTarget.blur()}
              />
            </div>
            <div className="form-group">
              <label>Other Chemicals (kg)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                inputMode="decimal"
                placeholder="Enter other chemicals weight" 
                value={otherChemicalsKg} 
                onChange={e=>setOtherChemicalsKg(e.target.value.replace(/^-/, ''))}
                onKeyDown={(evt)=>['e','E','+','-'].includes(evt.key) && evt.preventDefault()}
                onWheel={(e)=>e.currentTarget.blur()}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>DRC Measurement</h3>
          <div className="form-group">
            <label>Measured DRC % (optional)</label>
            <input 
              type="number" 
              step="1" 
              min="1" 
              max="100"
              inputMode="numeric"
              placeholder="Enter measured DRC percentage" 
              value={measuredDRC} 
              onChange={e=>setMeasuredDRC(e.target.value.replace(/^-/, '').replace(/\..*$/, ''))}
              onKeyDown={(evt)=>['e','E','+','-','.'].includes(evt.key) && evt.preventDefault()}
              onWheel={(e)=>e.currentTarget.blur()}
            />
            <small>Leave empty to use calculated DRC</small>
          </div>
        </div>

        <div className="calculations">
          <h3>Calculations</h3>
          <div className="calc-grid">
            <div className="calc-item">
              <span className="calc-label">Net Weight:</span>
              <span className="calc-value">{net.toFixed(2)} kg</span>
            </div>
            <div className="calc-item">
              <span className="calc-label">Estimated DRC:</span>
              <span className="calc-value">{drc.toFixed(2)}%</span>
            </div>
            <div className="calc-item">
              <span className="calc-label">Dry Weight:</span>
              <span className="calc-value">{(net*(drc/100)).toFixed(2)} kg</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={resetForm}
            disabled={loading}
          >
            Reset Form
          </button>
          <button 
            onClick={submitIntake} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Recording...' : 'Record Intake'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffWeighLatex;









































