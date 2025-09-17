const { validateName, validateEmail, validatePhoneNumber, validatePassword, validateStaffId, validateLocation, validatePhoto } = require('../utils/validation');

// Validation middleware factory
const createValidationMiddleware = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    
    // Validate each field according to rules
    Object.keys(validationRules).forEach(field => {
      const value = req.body[field];
      const rules = validationRules[field];
      
      // Required field validation
      if (rules.required && (!value || !value.toString().trim())) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
        return;
      }
      
      // Skip validation if field is empty and not required
      if (!value || !value.toString().trim()) {
        return;
      }
      
      // Custom validation functions
      if (rules.validate) {
        const error = rules.validate(value);
        if (error) {
          errors[field] = error;
        }
      }
    });
    
    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    next();
  };
};

// Common validation rules
const validationRules = {
  userRegistration: {
    name: { required: true, validate: validateName },
    email: { required: true, validate: validateEmail },
    phoneNumber: { required: true, validate: validatePhoneNumber },
    password: { required: true, validate: validatePassword },
    role: { required: true }
  },
  
  staffRegistration: {
    name: { required: true, validate: validateName },
    email: { required: true, validate: validateEmail },
    phoneNumber: { required: true, validate: validatePhoneNumber }
  },
  
  adminForm: {
    name: { required: true, validate: validateName },
    email: { required: true, validate: validateEmail },
    phoneNumber: { required: true, validate: validatePhoneNumber },
    password: { required: true, validate: validatePassword },
    role: { required: true }
  },
  
  staffCheckIn: {
    location: { required: true, validate: validateLocation },
    photo: { required: true, validate: validatePhoto }
  },
  
  staffCheckOut: {
    location: { required: true, validate: validateLocation },
    photo: { required: true, validate: validatePhoto }
  },
  
  staffIdValidation: {
    staffId: { required: true, validate: validateStaffId }
  },
  
  workerProfileUpdate: {
    name: { required: false, validate: validateName },
    contactNumber: { required: false, validate: validatePhoneNumber },
    address: { required: false },
    emergencyContactName: { required: false, validate: validateName },
    emergencyContactNumber: { required: false, validate: validatePhoneNumber },
    aadhaarNumber: { required: false },
    photoUrl: { required: false, validate: validatePhoto },
    origin: { required: false },
    dailyWage: { required: false }
  },
  
  healthInfoUpdate: {
    bloodGroup: { required: false },
    medicalCertificateUrl: { required: false, validate: validatePhoto },
    lastCheckupDate: { required: false },
    notes: { required: false }
  }
};

// Export validation middlewares
module.exports = {
  validateUserRegistration: createValidationMiddleware(validationRules.userRegistration),
  validateStaffRegistration: createValidationMiddleware(validationRules.staffRegistration),
  validateAdminForm: createValidationMiddleware(validationRules.adminForm),
  validateStaffCheckIn: createValidationMiddleware(validationRules.staffCheckIn),
  validateStaffCheckOut: createValidationMiddleware(validationRules.staffCheckOut),
  validateStaffId: createValidationMiddleware(validationRules.staffIdValidation),
  validateWorkerProfileUpdate: createValidationMiddleware(validationRules.workerProfileUpdate),
  validateHealthInfoUpdate: createValidationMiddleware(validationRules.healthInfoUpdate),
  createValidationMiddleware
};
