import React, { useState, useEffect } from 'react';
import { validators } from '../../utils/validation';

const DateRangeInput = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  fromDateLabel = 'From Date',
  toDateLabel = 'To Date',
  required = false,
  className = '',
  helperText = ''
}) => {
  const [fromDateError, setFromDateError] = useState('');
  const [toDateError, setToDateError] = useState('');

  // Validate from date
  useEffect(() => {
    if (fromDate) {
      const error = validators.date(fromDate, fromDateLabel);
      setFromDateError(error || '');
    } else if (required) {
      setFromDateError(`${fromDateLabel} is required`);
    } else {
      setFromDateError('');
    }
  }, [fromDate, fromDateLabel, required]);

  // Validate to date
  useEffect(() => {
    if (toDate) {
      const dateError = validators.date(toDate, toDateLabel);
      const toDateError = validators.toDate(toDate, fromDate, toDateLabel);
      setToDateError(dateError || toDateError || '');
    } else if (required) {
      setToDateError(`${toDateLabel} is required`);
    } else {
      setToDateError('');
    }
  }, [toDate, fromDate, toDateLabel, required]);

  const handleFromDateChange = (e) => {
    const newFromDate = e.target.value;
    onFromDateChange(e);
    
    // If to date is before new from date, clear it
    if (toDate && newFromDate && new Date(toDate) <= new Date(newFromDate)) {
      onToDateChange({ target: { value: '' } });
    }
  };

  const handleToDateChange = (e) => {
    onToDateChange(e);
  };

  const getMaxDate = () => {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    return oneYearFromNow.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    if (fromDate) {
      const nextDay = new Date(fromDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
    return '';
  };

  return (
    <div className={`date-range-input ${className}`}>
      <div className="date-inputs">
        <div className={`input-group ${fromDateError ? 'error' : ''}`}>
          <label htmlFor="fromDate">{fromDateLabel} {required && <span className="required">*</span>}</label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            max={getMaxDate()}
            className={`form-input ${fromDateError ? 'error' : ''}`}
            required={required}
          />
          {fromDateError && (
            <div className="error-message">{fromDateError}</div>
          )}
        </div>

        <div className={`input-group ${toDateError ? 'error' : ''}`}>
          <label htmlFor="toDate">{toDateLabel} {required && <span className="required">*</span>}</label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            min={getMinDate()}
            max={getMaxDate()}
            className={`form-input ${toDateError ? 'error' : ''}`}
            required={required}
            disabled={!fromDate}
          />
          {toDateError && (
            <div className="error-message">{toDateError}</div>
          )}
        </div>
      </div>
      
      {helperText && (
        <div className="helper-text">{helperText}</div>
      )}
      
      <style jsx>{`
        .date-range-input {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .date-inputs {
          display: flex;
          gap: 12px;
          align-items: end;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        
        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .required {
          color: #ef4444;
        }
        
        .form-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .form-input.error {
          border-color: #ef4444;
        }
        
        .form-input:disabled {
          background-color: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 2px;
        }
        
        .helper-text {
          color: #6b7280;
          font-size: 12px;
        }
        
        @media (max-width: 640px) {
          .date-inputs {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default DateRangeInput;
