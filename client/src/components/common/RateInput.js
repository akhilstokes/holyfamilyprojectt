import React, { useState, useEffect } from 'react';
import { validators } from '../../utils/validation';
import NumberInput from './NumberInput';

const RateInput = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  label = 'Rate (₹/kg)',
  required = false,
  disabled = false,
  className = '',
  helperText = '',
  maxRate = 10000,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Custom validation for rates
  const validateRate = (value) => {
    if (!value) {
      return required ? 'Rate is required' : null;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'Rate must be a valid number';
    }
    
    if (numValue <= 0) {
      return 'Rate must be greater than 0';
    }
    
    if (numValue < 0.01) {
      return 'Rate must be at least ₹0.01';
    }
    
    if (numValue > maxRate) {
      return `Rate cannot exceed ₹${maxRate} per kg`;
    }
    
    // Check for reasonable increments (0.01)
    const rounded = Math.round(numValue * 100) / 100;
    if (Math.abs(numValue - rounded) > 0.001) {
      return 'Rate must be in increments of 0.01';
    }
    
    return null;
  };

  // Validate on value change
  useEffect(() => {
    if (touched) {
      const validationError = validateRate(value);
      setError(validationError || '');
    }
  }, [value, touched, required, maxRate]);

  const handleBlur = (e) => {
    setTouched(true);
    
    const validationError = validateRate(value);
    setError(validationError || '');
    
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    onChange(e);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <NumberInput
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      label={label}
      required={required}
      disabled={disabled}
      className={className}
      helperText={error || helperText || `Enter rate in ₹ per kg (0.01 - ${maxRate})`}
      min={0.01}
      max={maxRate}
      step={0.01}
      type="number"
      {...props}
    />
  );
};

export default RateInput;
