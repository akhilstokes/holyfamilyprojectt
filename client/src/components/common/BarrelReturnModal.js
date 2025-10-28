import React, { useState, useEffect } from 'react';
import { validateBarrelReturn } from '../../utils/barrelValidation';
import { formatTableDateTime } from '../../utils/dateUtils';

const BarrelReturnModal = ({ 
  isOpen, 
  onClose, 
  barrel, 
  currentUserId, 
  onReturn 
}) => {
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('ok');
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (barrel && isOpen) {
      const validationResult = validateBarrelReturn(barrel, currentUserId);
      setValidation(validationResult);
    }
  }, [barrel, currentUserId, isOpen]);

  const handleReturn = async () => {
    if (!validation.isValid) {
      alert(`Cannot return barrel: ${validation.errors.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      await onReturn({
        barrelId: barrel.barrelId,
        returnNotes,
        returnCondition,
        returnedAt: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      alert(`Return failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !barrel) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        maxWidth: 500,
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Return Barrel</h3>
        
        {/* Barrel Info */}
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 4, 
          marginBottom: 16 
        }}>
          <div><strong>Barrel ID:</strong> {barrel.barrelId}</div>
          <div><strong>Status:</strong> {barrel.status}</div>
          <div><strong>Current Condition:</strong> {barrel.condition || 'ok'}</div>
          {barrel.manufactureDate && (
            <div><strong>Manufacture Date:</strong> {formatTableDateTime(barrel.manufactureDate)}</div>
          )}
          {barrel.expiryDate && (
            <div><strong>Expiry Date:</strong> {formatTableDateTime(barrel.expiryDate)}</div>
          )}
        </div>

        {/* Validation Errors */}
        {!validation.isValid && (
          <div style={{
            color: 'red',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: 4,
            padding: 12,
            marginBottom: 16
          }}>
            <strong>Cannot Return Barrel:</strong>
            <ul style={{ margin: '8px 0 0 20px' }}>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {validation.warnings.length > 0 && (
          <div style={{
            color: 'orange',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: 4,
            padding: 12,
            marginBottom: 16
          }}>
            <strong>Warnings:</strong>
            <ul style={{ margin: '8px 0 0 20px' }}>
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Return Form */}
        {validation.isValid && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Return Condition:
              </label>
              <select 
                value={returnCondition} 
                onChange={(e) => setReturnCondition(e.target.value)}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              >
                <option value="ok">Good Condition</option>
                <option value="faulty">Faulty</option>
                <option value="damaged">Damaged</option>
                <option value="repair">Needs Repair</option>
                <option value="lumb-removal">Needs Lumb Removal</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
                Return Notes:
              </label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Enter any notes about the barrel return..."
                style={{ 
                  width: '100%', 
                  padding: 8, 
                  borderRadius: 4, 
                  border: '1px solid #ccc',
                  minHeight: 80,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Returning...' : 'Return Barrel'}
              </button>
            </div>
          </>
        )}

        {/* Close button for invalid returns */}
        {!validation.isValid && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarrelReturnModal;
