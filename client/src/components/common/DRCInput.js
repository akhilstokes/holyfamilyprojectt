import React, { useState, useEffect } from 'react';
import { validators } from '../../utils/validation';
import NumberInput from './NumberInput';

const DRCInput = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  label = 'DRC Percentage',
  required = false,
  disabled = false,
  className = '',
  helperText = '',
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Custom validation for DRC percentage
  const validateDRC = (value) => {
    if (!value) {
      return required ? 'DRC percentage is required' : null;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'DRC percentage must be a valid number';
    }
    
    if (numValue < 0) {
      return 'DRC percentage cannot be negative';
    }
    
    if (numValue > 100) {
      return 'DRC percentage cannot exceed 100%';
    }
    
    // Check for reasonable increments (0.01)
    const rounded = Math.round(numValue * 100) / 100;
    if (Math.abs(numValue - rounded) > 0.001) {
      return 'DRC percentage must be in increments of 0.01';
    }
    
    return null;
  };

  // Validate on value change
  useEffect(() => {
    if (touched) {
      const validationError = validateDRC(value);
      setError(validationError || '');
    }
  }, [value, touched, required]);

  const handleBlur = (e) => {
    setTouched(true);
    
    const validationError = validateDRC(value);
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
      helperText={error || helperText || 'Enter DRC percentage (0 - 100)'}
      min={0}
      max={100}
      step={0.01}
      type="number"
      {...props}
    />
  );
};

export default DRCInput;

