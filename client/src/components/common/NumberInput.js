import React, { useState, useEffect } from 'react';
import { validators } from '../../utils/validation';

const NumberInput = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  label = '',
  validationRules = [],
  fieldName = '',
  required = false,
  disabled = false,
  className = '',
  helperText = '',
  min = 0,
  max = 999999,
  step = 0.01,
  type = 'number',
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (touched && validationRules.length > 0) {
      const validationError = validateField(value, validationRules, fieldName || name);
      setError(validationError || '');
    }
  }, [value, touched, validationRules, fieldName, name]);

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Prevent leading zeros for whole numbers
    if (type === 'number' && step === 1 && newValue.length > 1 && newValue.startsWith('0')) {
      newValue = newValue.replace(/^0+/, '') || '0';
    }
    
    // Prevent multiple decimal points
    if (newValue.split('.').length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (newValue.includes('.')) {
      const [integer, decimal] = newValue.split('.');
      if (decimal && decimal.length > 2) {
        newValue = integer + '.' + decimal.substring(0, 2);
      }
    }
    
    const newEvent = { ...e, target: { ...e.target, value: newValue } };
    onChange(newEvent);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    
    // Validate on blur
    if (validationRules.length > 0) {
      const validationError = validateField(value, validationRules, fieldName || name);
      setError(validationError || '');
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleKeyDown = (e) => {
    // Prevent invalid characters
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    const isNumber = /[0-9]/.test(e.key);
    const isDecimal = e.key === '.' && step < 1;
    const isMinus = e.key === '-' && min < 0;
    const isAllowed = allowedKeys.includes(e.key);
    
    if (!isNumber && !isDecimal && !isMinus && !isAllowed) {
      e.preventDefault();
    }
    
    // Prevent multiple decimal points
    if (e.key === '.' && value.toString().includes('.')) {
      e.preventDefault();
    }
  };

  const inputClasses = `
    form-input 
    ${error ? 'error' : ''} 
    ${!error && value && touched ? 'valid' : ''} 
    ${className}
  `.trim();

  const containerClasses = `
    input-group floating has-status 
    ${error ? 'error' : ''} 
    ${required ? 'required' : ''}
  `.trim();

  return (
    <div className={containerClasses}>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder=" "
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
        {...props}
      />
      
      {label && <label htmlFor={name}>{label}</label>}
      
      <div className="helper-text">
        {error || helperText}
      </div>
      
      {!error && value && touched && (
        <span className="input-status" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
    </div>
  );
};

export default NumberInput;
