// Enhanced validation utility functions with real-time feedback

// Real-time validation state management
export class ValidationState {
    constructor() {
        this.errors = {};
        this.warnings = {};
        this.isValidating = {};
        this.validationTimers = {};
    }

    setError(field, error) {
        this.errors[field] = error;
        this.warnings[field] = null;
    }

    setWarning(field, warning) {
        this.warnings[field] = warning;
        this.errors[field] = null;
    }

    clear(field) {
        delete this.errors[field];
        delete this.warnings[field];
        delete this.isValidating[field];
    }

    isValid(field) {
        return !this.errors[field] && !this.warnings[field];
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }

    hasWarnings() {
        return Object.keys(this.warnings).length > 0;
    }

    getFieldState(field) {
        if (this.errors[field]) return 'error';
        if (this.warnings[field]) return 'warning';
        if (this.isValidating[field]) return 'validating';
        return 'valid';
    }
}

// Debounced validation for real-time feedback
export const debounceValidation = (fn, delay = 300) => {
    return (value, ...args) => {
        return new Promise((resolve) => {
            const timer = setTimeout(() => {
                const result = fn(value, ...args);
                resolve(result);
            }, delay);
        });
    };
};

// Name validation (letters and spaces only, no spaces allowed)
export const validateName = (name) => {
    if (!name || !name.trim()) {
        return { valid: false, message: 'Name is required.', severity: 'error' };
    }
    
    const trimmedName = name.trim();
    
    // Check for spaces - not allowed
    if (trimmedName.includes(' ')) {
        return { valid: false, message: 'Name cannot contain spaces.', severity: 'error' };
    }
    
    // Only letters allowed (no numbers, special characters, or spaces)
    if (!/^[a-zA-Z]+$/.test(trimmedName)) {
        return { valid: false, message: 'Name must contain only letters (no numbers, spaces, or special characters).', severity: 'error' };
    }
    
    if (trimmedName.length < 2) {
        return { valid: false, message: 'Name must be at least 2 characters long.', severity: 'error' };
    }
    
    if (trimmedName.length > 50) {
        return { valid: false, message: 'Name must be less than 50 characters.', severity: 'warning' };
    }
    
    return { valid: true, message: 'Name looks good!', severity: 'success' };
};

// Phone number validation for Indian numbers only
export const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
        return 'Phone number is required.';
    }
    
    // Check for spaces - not allowed
    if (phone.includes(' ')) {
        return 'Phone number cannot contain spaces.';
    }
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's all zeros
    if (/^0+$/.test(cleanPhone)) {
        return 'Phone number cannot be all zeros.';
    }
    
    // Only accept 10-digit Indian mobile numbers
    if (cleanPhone.length === 10) {
        // Must start with 6, 7, 8, or 9 (Indian mobile number format)
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return 'Please provide a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).';
        }
    } else {
        return 'Please provide a valid 10-digit Indian mobile number.';
    }
    
    return '';
};

// Password validation (must contain special characters, no spaces)
export const validatePassword = (password) => {
    if (!password) {
        return 'Password is required.';
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long.';
    }
    // Check for spaces - not allowed
    if (password.includes(' ')) {
        return 'Password cannot contain spaces.';
    }
    // Must contain at least one special character
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
        return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?).';
    }
    // Only allow valid characters (letters, numbers, and special characters)
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/.test(password)) {
        return 'Password contains invalid characters.';
    }
    return '';
};

// Email validation
export const validateEmail = (email) => {
    if (!email.trim()) {
        return 'Email is required.';
    }
    
    // Check for spaces
    if (email.includes(' ')) {
        return 'Email cannot contain spaces.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.';
    }
    
    // Additional validation for common email issues
    if (email.length > 254) {
        return 'Email is too long.';
    }
    
    if (email.startsWith('.') || email.endsWith('.') || email.includes('..')) {
        return 'Email format is invalid.';
    }
    
    return '';
};

// Clean phone number for submission
export const cleanPhoneNumber = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    return cleanPhone.startsWith('91') && cleanPhone.length === 12 
        ? cleanPhone.substring(2) 
        : cleanPhone.startsWith('0') 
            ? cleanPhone.substring(1) 
            : cleanPhone;
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber) => {
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length === 10) {
        return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return phoneNumber;
};

// Staff ID validation
export const validateStaffId = (staffId) => {
    if (!staffId.trim()) {
        return 'Staff ID is required.';
    }
    if (!/^[A-Z0-9]{6,12}$/.test(staffId)) {
        return 'Staff ID must be 6-12 characters long and contain only uppercase letters and numbers.';
    }
    return '';
};

// Location validation for staff check-in
export const validateLocation = (location) => {
    if (!location) {
        return 'Location is required for check-in/out.';
    }
    if (!location.latitude || !location.longitude) {
        return 'Valid GPS coordinates are required.';
    }
    if (location.accuracy > 100) {
        return 'GPS accuracy is too low. Please wait for better signal.';
    }
    if (location.latitude < -90 || location.latitude > 90) {
        return 'Invalid latitude value.';
    }
    if (location.longitude < -180 || location.longitude > 180) {
        return 'Invalid longitude value.';
    }
    return '';
};

// Photo validation for staff check-in
export const validatePhoto = (file) => {
    if (!file) {
        return 'Photo is required for check-in/out.';
    }
    if (!file.type.startsWith('image/')) {
        return 'Please select a valid image file.';
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return 'Image file size must be less than 5MB.';
    }
    return '';
};

// General form validation
export const validateForm = (formData, requiredFields = []) => {
    const errors = {};
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!formData[field] || !formData[field].toString().trim()) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
        }
    });
    
    // Validate specific fields if present
    if (formData.name) {
        const nameResult = validateName(formData.name);
        if (nameResult && nameResult.valid === false) {
            errors.name = nameResult.message;
        }
    }
    
    if (formData.email) {
        const emailError = validateEmail(formData.email);
        if (emailError) errors.email = emailError;
    }
    
    if (formData.phoneNumber) {
        const phoneError = validatePhoneNumber(formData.phoneNumber);
        if (phoneError) errors.phoneNumber = phoneError;
    }
    
    if (formData.password) {
        const passwordError = validatePassword(formData.password);
        if (passwordError) errors.password = passwordError;
    }
    
    if (formData.staffId) {
        const staffIdError = validateStaffId(formData.staffId);
        if (staffIdError) errors.staffId = staffIdError;
    }
    
    return errors;
};

// Role-specific validation
export const validateUserRegistration = (formData) => {
    const requiredFields = ['name', 'email', 'phoneNumber'];
    if (formData.role !== 'field_staff') {
        requiredFields.push('password');
        requiredFields.push('confirmPassword');
    }
    const errors = validateForm(formData, requiredFields);
    if (formData.role !== 'field_staff' && formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
};

export const validateStaffRegistration = (formData) => {
    const requiredFields = ['name', 'email', 'phoneNumber'];
    return validateForm(formData, requiredFields);
};

export const validateAdminForm = (formData) => {
    const requiredFields = ['name', 'email', 'phoneNumber', 'password'];
    return validateForm(formData, requiredFields);
};
