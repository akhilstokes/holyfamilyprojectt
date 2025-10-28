/**
 * Barrel Allocation Validation Utilities
 * Provides comprehensive validation for barrel allocation operations
 */

/**
 * Validate barrel allocation form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateBarrelAllocation = (formData) => {
  const errors = {};
  const { recipient, selectedBarrels, sendDate, count } = formData;

  // Recipient validation
  if (!recipient || recipient.trim() === '') {
    errors.recipient = 'Recipient is required';
  }

  // Barrel selection validation
  if (!selectedBarrels || selectedBarrels.length === 0) {
    errors.barrels = 'At least one barrel must be selected';
  }

  // Send date validation
  if (!sendDate) {
    errors.sendDate = 'Sending date is required';
  } else {
    const sendDateObj = new Date(sendDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(sendDateObj.getTime())) {
      errors.sendDate = 'Invalid date format';
    } else if (sendDateObj < today) {
      errors.sendDate = 'Sending date cannot be in the past';
    }
  }

  // Count validation (if using count-based selection)
  if (count !== undefined && count !== null) {
    const countNum = Number(count);
    if (!Number.isInteger(countNum) || countNum < 1) {
      errors.count = 'Count must be a positive integer';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate barrel eligibility for assignment
 * @param {Object} barrel - Barrel object to validate
 * @param {string} recipientId - Recipient user ID
 * @returns {Object} Validation result
 */
export const validateBarrelEligibility = (barrel, recipientId) => {
  const errors = [];
  const warnings = [];

  // CRITICAL: Check if barrel is already assigned to someone else
  if (barrel.assignedTo && barrel.assignedTo !== recipientId) {
    errors.push(`Barrel ${barrel.barrelId} is already assigned to another user and cannot be reassigned`);
    return { isValid: false, errors, warnings, isAssignedToOther: true };
  }

  // Check barrel status
  if (barrel.status === 'disposed') {
    errors.push('Barrel is disposed and cannot be assigned');
  }

  if (barrel.status === 'in-use') {
    errors.push('Barrel is already in use');
  }

  // Check if barrel needs to be returned first
  if (barrel.assignedTo === recipientId && barrel.status === 'assigned') {
    errors.push('Barrel is already assigned to this user');
  }

  // Check expiry date
  if (barrel.expiryDate) {
    const expiryDate = new Date(barrel.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      errors.push('Barrel has expired');
    } else if (daysUntilExpiry < 30) {
      warnings.push(`Barrel expires in ${daysUntilExpiry} days`);
    }
  }

  // Check manufacture date
  if (barrel.manufactureDate) {
    const manufactureDate = new Date(barrel.manufactureDate);
    const today = new Date();
    const daysSinceManufacture = Math.ceil((today - manufactureDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceManufacture < 0) {
      errors.push('Invalid manufacture date');
    }
  }

  // Check barrel condition
  if (barrel.condition && ['faulty', 'damaged', 'scrap'].includes(barrel.condition)) {
    errors.push(`Barrel is ${barrel.condition} and cannot be assigned`);
  }

  if (barrel.condition === 'repair') {
    warnings.push('Barrel is under repair');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    isAssignedToOther: false
  };
};

/**
 * Validate barrel import data
 * @param {Array} importData - Array of barrel data to import
 * @returns {Object} Validation result
 */
export const validateBarrelImport = (importData) => {
  const errors = [];
  const warnings = [];
  const validBarrels = [];

  if (!Array.isArray(importData)) {
    errors.push('Import data must be an array');
    return { isValid: false, errors, warnings, validBarrels };
  }

  if (importData.length === 0) {
    errors.push('No data to import');
    return { isValid: false, errors, warnings, validBarrels };
  }

  const requiredFields = ['barrelId', 'capacity'];
  const barrelIds = new Set();

  importData.forEach((barrel, index) => {
    const rowErrors = [];
    const rowWarnings = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (!barrel[field] || barrel[field].toString().trim() === '') {
        rowErrors.push(`Row ${index + 1}: ${field} is required`);
      }
    });

    // Check for duplicate barrel IDs
    if (barrel.barrelId) {
      if (barrelIds.has(barrel.barrelId)) {
        rowErrors.push(`Row ${index + 1}: Duplicate barrel ID: ${barrel.barrelId}`);
      } else {
        barrelIds.add(barrel.barrelId);
      }
    }

    // Validate barrel ID format
    if (barrel.barrelId && !/^[A-Z0-9-_]+$/i.test(barrel.barrelId)) {
      rowWarnings.push(`Row ${index + 1}: Barrel ID should contain only letters, numbers, hyphens, and underscores`);
    }

    // Validate capacity
    if (barrel.capacity) {
      const capacity = Number(barrel.capacity);
      if (isNaN(capacity) || capacity <= 0) {
        rowErrors.push(`Row ${index + 1}: Capacity must be a positive number`);
      } else if (capacity > 1000) {
        rowWarnings.push(`Row ${index + 1}: Capacity seems unusually high: ${capacity}L`);
      }
    }

    // Validate dates
    if (barrel.manufactureDate) {
      const mfgDate = new Date(barrel.manufactureDate);
      if (isNaN(mfgDate.getTime())) {
        rowErrors.push(`Row ${index + 1}: Invalid manufacture date format`);
      } else if (mfgDate > new Date()) {
        rowWarnings.push(`Row ${index + 1}: Manufacture date is in the future`);
      }
    }

    if (barrel.expiryDate) {
      const expDate = new Date(barrel.expiryDate);
      if (isNaN(expDate.getTime())) {
        rowErrors.push(`Row ${index + 1}: Invalid expiry date format`);
      } else if (barrel.manufactureDate) {
        const mfgDate = new Date(barrel.manufactureDate);
        if (expDate <= mfgDate) {
          rowErrors.push(`Row ${index + 1}: Expiry date must be after manufacture date`);
        }
      }
    }

    // Validate status
    if (barrel.status && !['in-storage', 'in-use', 'disposed'].includes(barrel.status)) {
      rowWarnings.push(`Row ${index + 1}: Invalid status: ${barrel.status}. Using default: in-storage`);
    }

    if (rowErrors.length === 0) {
      validBarrels.push({
        ...barrel,
        status: barrel.status || 'in-storage',
        currentVolume: barrel.currentVolume || 0,
        condition: barrel.condition || 'ok'
      });
    }

    errors.push(...rowErrors);
    warnings.push(...rowWarnings);
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validBarrels,
    totalRows: importData.length,
    validRows: validBarrels.length
  };
};

/**
 * Validate user eligibility for barrel assignment
 * @param {Object} user - User object to validate
 * @returns {Object} Validation result
 */
export const validateUserEligibility = (user) => {
  const errors = [];
  const warnings = [];

  if (!user) {
    errors.push('User not found');
    return { isValid: false, errors, warnings };
  }

  // Check user status
  if (user.status !== 'active') {
    errors.push('User account is not active');
  }

  // Check user role
  if (!['user', 'staff', 'farmer'].includes(user.role)) {
    errors.push('User role is not eligible for barrel assignment');
  }

  // Check if user has required permissions
  if (user.permissions && !user.permissions.includes('barrel_assignment')) {
    warnings.push('User may not have barrel assignment permissions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get validation summary for display
 * @param {Object} validationResult - Result from any validation function
 * @returns {Object} Summary for UI display
 */
export const getValidationSummary = (validationResult) => {
  const { isValid, errors, warnings } = validationResult;
  
  return {
    isValid,
    hasErrors: errors && errors.length > 0,
    hasWarnings: warnings && warnings.length > 0,
    errorCount: errors ? errors.length : 0,
    warningCount: warnings ? warnings.length : 0,
    errorMessages: errors || [],
    warningMessages: warnings || []
  };
};

/**
 * Format validation errors for display
 * @param {Array} errors - Array of error messages
 * @returns {string} Formatted error string
 */
export const formatValidationErrors = (errors) => {
  if (!errors || errors.length === 0) return '';
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};

/**
 * Check if barrel assignment is allowed based on business rules
 * @param {Array} selectedBarrels - Array of selected barrel IDs
 * @param {string} recipientId - Recipient user ID
 * @param {Array} allBarrels - All available barrels
 * @returns {Object} Business rule validation result
 */
export const validateBusinessRules = (selectedBarrels, recipientId, allBarrels) => {
  const errors = [];
  const warnings = [];

  // Check maximum barrels per user limit
  const MAX_BARRELS_PER_USER = 50;
  const userBarrelCount = allBarrels.filter(b => b.assignedTo === recipientId).length;
  
  if (userBarrelCount + selectedBarrels.length > MAX_BARRELS_PER_USER) {
    errors.push(`User already has ${userBarrelCount} barrels. Maximum limit is ${MAX_BARRELS_PER_USER}`);
  }

  // Check if user has too many barrels assigned recently
  const recentAssignments = allBarrels.filter(b => 
    b.assignedTo === recipientId && 
    b.updatedAt && 
    new Date(b.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
  ).length;

  if (recentAssignments > 10) {
    warnings.push('User has received many barrel assignments recently');
  }

  // Check barrel diversity (avoid assigning all barrels from same batch)
  const selectedBarrelObjects = allBarrels.filter(b => selectedBarrels.includes(b.barrelId));
  const batchNumbers = new Set(selectedBarrelObjects.map(b => b.batchNo).filter(Boolean));
  
  if (batchNumbers.size === 1 && selectedBarrels.length > 5) {
    warnings.push('All selected barrels are from the same batch');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate barrel return eligibility
 * @param {Object} barrel - Barrel object to validate for return
 * @param {string} currentUserId - Current user ID requesting return
 * @returns {Object} Validation result
 */
export const validateBarrelReturn = (barrel, currentUserId) => {
  const errors = [];
  const warnings = [];

  if (!barrel) {
    errors.push('Barrel not found');
    return { isValid: false, errors, warnings };
  }

  // Check if barrel is actually assigned
  if (!barrel.assignedTo) {
    errors.push('Barrel is not currently assigned to anyone');
  }

  // Check if barrel is assigned to the requesting user
  if (barrel.assignedTo && barrel.assignedTo !== currentUserId) {
    errors.push('You can only return barrels assigned to you');
  }

  // Check barrel status
  if (barrel.status === 'returned') {
    errors.push('Barrel has already been returned');
  }

  if (barrel.status === 'disposed') {
    errors.push('Barrel is disposed and cannot be returned');
  }

  // Check if barrel is in good condition for return
  if (barrel.condition && ['damaged', 'scrap'].includes(barrel.condition)) {
    warnings.push(`Barrel is ${barrel.condition} - special handling may be required`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get barrel assignment history summary
 * @param {Array} assignmentHistory - Array of assignment records
 * @param {string} barrelId - Barrel ID to get history for
 * @returns {Object} History summary
 */
export const getBarrelAssignmentHistory = (assignmentHistory, barrelId) => {
  if (!Array.isArray(assignmentHistory)) return { assignments: [], currentOwner: null, totalAssignments: 0 };

  const barrelHistory = assignmentHistory.filter(record => 
    record.barrelId === barrelId
  ).sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

  const currentAssignment = barrelHistory.find(record => 
    record.status === 'assigned' || record.status === 'active'
  );

  return {
    assignments: barrelHistory,
    currentOwner: currentAssignment ? currentAssignment.assignedTo : null,
    totalAssignments: barrelHistory.length,
    lastAssigned: barrelHistory[0]?.assignedAt || null,
    lastReturned: barrelHistory.find(r => r.status === 'returned')?.returnedAt || null
  };
};

/**
 * Validate barrel reassignment after return
 * @param {Object} barrel - Barrel object
 * @param {string} newRecipientId - New recipient user ID
 * @returns {Object} Validation result
 */
export const validateBarrelReassignment = (barrel, newRecipientId) => {
  const errors = [];
  const warnings = [];

  // Check if barrel was properly returned
  if (barrel.status !== 'returned' && barrel.assignedTo) {
    errors.push('Barrel must be returned before reassignment');
  }

  // Check if barrel is available for reassignment
  if (barrel.status === 'disposed') {
    errors.push('Disposed barrels cannot be reassigned');
  }

  // Check if barrel is being assigned to the same user
  if (barrel.assignedTo === newRecipientId) {
    warnings.push('Barrel is being assigned to the same user');
  }

  // Check barrel condition after return
  if (barrel.condition && ['faulty', 'damaged'].includes(barrel.condition)) {
    warnings.push(`Barrel condition is ${barrel.condition} - verify before reassignment`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
