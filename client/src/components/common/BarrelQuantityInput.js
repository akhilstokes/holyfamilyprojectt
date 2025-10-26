import React, { useState, useEffect } from 'react';
import { validators } from '../../utils/validation';
import NumberInput from './NumberInput';

const BarrelQuantityInput = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  label = 'Quantity (Liters)',
  required = false,
  disabled = false,
  className = '',
  helperText = '',
  maxBarrels = 1000,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Custom validation for barrel quantities
  const validateBarrelQuantity = (value) => {
    if (!value) {
      return required ? 'Quantity is required' : null;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'Quantity must be a valid number';
    }
    
    if (numValue <= 0) {
      return 'Quantity must be greater than 0';
    }
    
    if (numValue < 0.01) {
      return 'Quantity must be at least 0.01 liters';
    }
    
    if (numValue > maxBarrels) {
      return `Quantity cannot exceed ${maxBarrels} liters`;
    }
    
    // Check for reasonable increments (0.01)
    const rounded = Math.round(numValue * 100) / 100;
    if (Math.abs(numValue - rounded) > 0.001) {
      return 'Quantity must be in increments of 0.01';
    }
    
    return null;
  };

  // Validate on value change
  useEffect(() => {
    if (touched) {
      const validationError = validateBarrelQuantity(value);
      setError(validationError || '');
    }
  }, [value, touched, required, maxBarrels]);

  const handleBlur = (e) => {
    setTouched(true);
    
    const validationError = validateBarrelQuantity(value);
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
      helperText={error || helperText || `Enter quantity in liters (0.01 - ${maxBarrels})`}
      min={0.01}
      max={maxBarrels}
      step={0.01}
      type="number"
      {...props}
    />
  );
};

export default BarrelQuantityInput;
