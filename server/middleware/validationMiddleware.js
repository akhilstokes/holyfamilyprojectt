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
      if (rules.required && (value === undefined || value === null || (typeof value === 'string' && !value.toString().trim()))) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
        return;
      }

      // Skip validation if field is empty and not required
      if (value === undefined || value === null || (typeof value === 'string' && !value.toString().trim())) {
        return;
      }

      // Custom validation functions
      if (rules.validate) {
        const error = rules.validate(value, req.body);
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
    photoUrl: { required: false, validate: (url) => {
      // Allow empty or valid URLs
      if (!url || typeof url !== 'string') return '';
      if (url.trim() === '') return '';
      // Basic URL check for images
      const ok = /^(https?:\/\/|\/uploads\/).+\.(png|jpe?g|webp|gif)$/i.test(url);
      return ok ? '' : 'Photo URL must be an http(s) link or /uploads/ path to an image file.';
    } },
    origin: { required: false },
    dailyWage: { required: false }
  },

  healthInfoUpdate: {
    bloodGroup: { required: false },
    medicalCertificateUrl: { required: false, validate: (url) => {
      if (typeof url !== 'string') return 'Invalid certificate URL.';
      const ok = /^(https?:\/\/).+\.(png|jpe?g|webp|pdf)$/i.test(url);
      return ok ? '' : 'Medical certificate URL must be an http(s) link to an image or PDF.';
    } },
    lastCheckupDate: { required: false, validate: (d) => isNaN(Date.parse(d)) ? 'Invalid date' : '' },
    notes: { required: false }
  },

  // Staff: Trip Log creation
  staffTripLog: {
    odometerStart: { required: true, validate: (v) => (isNaN(Number(v)) || Number(v) < 0) ? 'odometerStart must be a non-negative number.' : '' },
    odometerEnd: { required: true, validate: (v) => (isNaN(Number(v)) || Number(v) < 0) ? 'odometerEnd must be a non-negative number.' : '' },
    vehicleId: { required: false, validate: (s) => (typeof s === 'string' && s.length > 50) ? 'vehicleId is too long.' : '' },
    date: { required: false, validate: (d) => (d && isNaN(Date.parse(d))) ? 'Invalid date.' : '' }
  },

  // Staff: Barrel entry (field purchase)
  staffBarrelEntry: {
    farmerUserId: { required: true, validate: (s) => (!s || String(s).trim().length === 0) ? 'farmerUserId is required.' : '' },
    weightKg: { required: true, validate: (v) => (isNaN(Number(v)) || Number(v) <= 0) ? 'weightKg must be a positive number.' : '' },
    ratePerKg: { required: true, validate: (v) => (isNaN(Number(v)) || Number(v) <= 0) ? 'ratePerKg must be a positive number.' : '' },
    moisturePct: { required: false, validate: (v) => (v !== undefined && (isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100)) ? 'moisturePct must be between 0 and 100.' : '' },
    photoUrl: { required: false, validate: (url) => {
      if (!url) return '';
      if (typeof url !== 'string') return 'Invalid photo URL.';
      const ok = /^(https?:\/\/).+\.(png|jpe?g|webp)$/i.test(url);
      return ok ? '' : 'photoUrl must be an http(s) link to an image.';
    } },
    gps: { required: false, validate: (loc) => {
      if (!loc) return '';
      if (typeof loc !== 'object') return 'gps must be an object.';
      const { latitude, longitude } = loc || {};
      if (latitude === undefined || longitude === undefined) return 'gps must include latitude and longitude.';
      if (isNaN(Number(latitude)) || isNaN(Number(longitude))) return 'gps coordinates must be numbers.';
      return '';
    } },
    routeTaskId: { required: false },
    barrelId: { required: false }
  },

  // Staff: Barrel movement (dispatch/return basic)
  staffBarrelMovementBasic: {
    barrelId: { required: true, validate: (s) => (!s || String(s).trim().length === 0) ? 'barrelId is required.' : '' },
    volumeDelta: { required: true, validate: (v) => (isNaN(Number(v)) || Number(v) < 0) ? 'volumeDelta must be a non-negative number.' : '' },
    fromLocation: { required: false },
    toLocation: { required: false },
    notes: { required: false, validate: (s) => (typeof s === 'string' && s.length > 500) ? 'notes is too long.' : '' }
  },

  // Staff: Leave apply
  leaveApply: {
    leaveType: { required: true, validate: (s) => (!s || String(s).trim().length === 0) ? 'leaveType is required.' : '' },
    dayType: { required: false, validate: (s) => (s && !['full', 'half'].includes(s)) ? "dayType must be 'full' or 'half'." : '' },
    startDate: { required: true, validate: (d) => isNaN(Date.parse(d)) ? 'Invalid startDate.' : '' },
    endDate: { required: true, validate: (d) => isNaN(Date.parse(d)) ? 'Invalid endDate.' : '' },
    reason: { required: false, validate: (s) => (typeof s === 'string' && s.length > 500) ? 'reason is too long (max 500).' : '' }
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
  // New exports for staff flows
  validateTripLog: createValidationMiddleware(validationRules.staffTripLog),
  validateBarrelEntry: createValidationMiddleware(validationRules.staffBarrelEntry),
  validateBarrelMovementBasic: createValidationMiddleware(validationRules.staffBarrelMovementBasic),
  validateLeaveApply: createValidationMiddleware(validationRules.leaveApply),
  createValidationMiddleware
};
