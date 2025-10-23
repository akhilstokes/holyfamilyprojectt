// Validation utility for admin forms

export const validateBarrelForm = (formData) => {
  const errors = {};
  
  // Barrel ID validation
  if (!formData.barrelId) {
    errors.barrelId = 'Barrel ID is required';
  } else if (!/^BHFP\d{2}$/i.test(formData.barrelId)) {
    errors.barrelId = 'Invalid format. Use BHFP followed by 2 digits (e.g., BHFP01)';
  }

  // Material validation
  if (!formData.materialName) {
    errors.materialName = 'Material is required';
  } else if (formData.materialName === 'Other' && !formData.materialOther?.trim()) {
    errors.materialOther = 'Please specify the material';
  }

  // Date validation
  if (formData.manufactureDate && formData.expiryDate) {
    const manufactureDate = new Date(formData.manufactureDate);
    const expiryDate = new Date(formData.expiryDate);
    
    if (expiryDate < manufactureDate) {
      errors.expiryDate = 'Expiry date must be after manufacture date';
    }
  }

  // Batch number validation (if required)
  if (formData.batchNo && formData.batchNo.length > 50) {
    errors.batchNo = 'Batch number is too long (max 50 characters)';
  }

  return errors;
};

export const validateStaffRecord = (formData) => {
  const errors = {};
  
  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  } else if (formData.name.length < 2 || formData.name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters';
  }

  // Email validation
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation
  if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  // Role validation
  if (!formData.role) {
    errors.role = 'Role is required';
  }

  return errors;
};

export const validateChemicalRequest = (formData) => {
  const errors = {};
  
  if (!formData.chemicalName) {
    errors.chemicalName = 'Chemical name is required';
  }
  
  if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) {
    errors.quantity = 'Please enter a valid quantity';
  }
  
  if (!formData.unit) {
    errors.unit = 'Unit is required';
  }
  
  if (!formData.priority) {
    errors.priority = 'Priority is required';
  }
  
  return errors;
};

// Generic validation functions
export const validateRequired = (value, fieldName) => {
  if (!value?.toString().trim()) {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePhone = (phone) => {
  if (phone && !/^[0-9]{10}$/.test(phone)) {
    return 'Please enter a valid 10-digit phone number';
  }
  return '';
};

export const validatePositiveNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return '';
};
