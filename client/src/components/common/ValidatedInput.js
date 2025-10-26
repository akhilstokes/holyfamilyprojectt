import React, { useState, useEffect } from 'react';
import { validateField } from '../../utils/validation';

const ValidatedInput = ({
  name,
  type = 'text',
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
    const newValue = e.target.value;
    onChange(e);
    
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
        placeholder=" "
        required={required}
        disabled={disabled}
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

export default ValidatedInput;

