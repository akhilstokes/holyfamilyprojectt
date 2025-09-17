// Validation utility functions

// Name validation (letters, spaces, and dots allowed)
export const validateName = (name) => {
    if (!name.trim()) {
        return 'Name is required.';
    }
    // Only letters, spaces, and dots allowed
    if (!/^[a-zA-Z\s.]+$/.test(name)) {
        return 'Name must contain only letters, spaces, and dots (no numbers or other special characters).';
    }
    if (name.length < 2) {
        return 'Name must be at least 2 characters long.';
    }
    if (name.length > 50) {
        return 'Name must be less than 50 characters.';
    }
    return '';
};

// Phone number validation with country code support
export const validatePhoneNumber = (phone) => {
    if (!phone.trim()) {
        return 'Phone number is required.';
    }
    
    // Check for spaces
    if (phone.includes(' ')) {
        return 'Phone number cannot contain spaces.';
    }
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's all zeros
    if (/^0+$/.test(cleanPhone)) {
        return 'Phone number cannot be all zeros.';
    }
    
    // Check for country code patterns
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        // Indian number with country code: +91 9876543210
        const numberWithoutCode = cleanPhone.substring(2);
        if (!/^[6-9]\d{9}$/.test(numberWithoutCode)) {
            return 'Invalid Indian mobile number format.';
        }
    } else if (cleanPhone.length === 10) {
        // 10-digit number without country code
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            return 'Please provide a valid 10-digit Indian mobile number.';
        }
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        // Number starting with 0
        const numberWithoutZero = cleanPhone.substring(1);
        if (!/^[6-9]\d{9}$/.test(numberWithoutZero)) {
            return 'Please provide a valid 10-digit Indian mobile number.';
        }
    } else {
        return 'Please provide a valid phone number (10 digits or +91 followed by 10 digits).';
    }
    
    return '';
};

// Password validation (must contain alphanumeric and special characters, no spaces)
export const validatePassword = (password) => {
    if (!password) {
        return 'Password is required.';
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long.';
    }
    // Check for spaces
    if (password.includes(' ')) {
        return 'Password cannot contain spaces.';
    }
    // Must contain at least one letter
    if (!/(?=.*[a-zA-Z])/.test(password)) {
        return 'Password must contain at least one letter.';
    }
    // Must contain at least one number
    if (!/(?=.*\d)/.test(password)) {
        return 'Password must contain at least one number.';
    }
    // Must contain at least one special character
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
        return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?).';
    }
    // Must contain at least one uppercase letter
    if (!/(?=.*[A-Z])/.test(password)) {
        return 'Password must contain at least one uppercase letter.';
    }
    // Must contain at least one lowercase letter
    if (!/(?=.*[a-z])/.test(password)) {
        return 'Password must contain at least one lowercase letter.';
    }
    // Only allow valid characters
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
        const nameError = validateName(formData.name);
        if (nameError) errors.name = nameError;
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
    }
    return validateForm(formData, requiredFields);
};

export const validateStaffRegistration = (formData) => {
    const requiredFields = ['name', 'email', 'phoneNumber'];
    return validateForm(formData, requiredFields);
};

export const validateAdminForm = (formData) => {
    const requiredFields = ['name', 'email', 'phoneNumber', 'password'];
    return validateForm(formData, requiredFields);
};
