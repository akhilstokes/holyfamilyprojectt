import { useState, useCallback } from 'react';
import { validateForm, validateField } from '../utils/validation';

export const useValidation = (initialData = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form data
  const updateField = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Mark field as touched
  const touchField = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Validate single field
  const validateSingleField = useCallback((name, value) => {
    if (validationRules[name]) {
      const error = validateField(value, validationRules[name], name);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
      return error;
    }
    return null;
  }, [validationRules]);

  // Validate entire form
  const validateEntireForm = useCallback(() => {
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData, validationRules]);

  // Handle field change
  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    updateField(name, value);
  }, [updateField]);

  // Handle field blur
  const handleFieldBlur = useCallback((e) => {
    const { name, value } = e.target;
    touchField(name);
    validateSingleField(name, value);
  }, [touchField, validateSingleField]);

  // Reset form
  const resetForm = useCallback((newData = {}) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  }, []);

  // Set form data
  const setFormDataWithValidation = useCallback((data) => {
    setFormData(data);
    // Validate all fields that are touched
    const newErrors = {};
    Object.keys(data).forEach(field => {
      if (touched[field] && validationRules[field]) {
        const error = validateField(data[field], validationRules[field], field);
        if (error) {
          newErrors[field] = error;
        }
      }
    });
    setErrors(newErrors);
  }, [touched, validationRules]);

  // Get field error
  const getFieldError = useCallback((name) => {
    return errors[name] || '';
  }, [errors]);

  // Check if field is valid
  const isFieldValid = useCallback((name) => {
    return !errors[name] && touched[name] && formData[name];
  }, [errors, touched, formData]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0 && 
           Object.keys(formData).every(key => 
             !validationRules[key] || formData[key] !== '' && formData[key] != null
           );
  }, [errors, formData, validationRules]);

  return {
    formData,
    errors,
    touched,
    updateField,
    touchField,
    validateSingleField,
    validateEntireForm,
    handleFieldChange,
    handleFieldBlur,
    resetForm,
    setFormData: setFormDataWithValidation,
    getFieldError,
    isFieldValid,
    isFormValid
  };
};

export default useValidation;

