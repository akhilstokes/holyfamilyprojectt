const Joi = require('joi');

// Enhanced Role-Based Access Control Middleware
class RoleBasedAccessControl {
    constructor() {
        this.permissions = {
            admin: [
                'user_management', 'system_config', 'audit_logs', 'reports_generate',
                'barrel_management', 'worker_management', 'stock_management',
                'approval_final', 'chemical_management', 'hanger_management'
            ],
            manager: [
                'barrel_review', 'worker_review', 'stock_review', 'approval_first',
                'attendance_verify', 'leave_approve', 'repair_approve', 'damage_assign'
            ],
            labour: [
                'attendance_self', 'schedule_view', 'wage_view', 'leave_apply',
                'document_upload', 'complaint_submit', 'profile_update'
            ],
            field_staff: [
                'route_plan', 'barrel_update', 'checkpoint_update', 'delivery_alert',
                'attendance_gps', 'trip_log', 'damage_report'
            ],
            lab: [
                'sample_record', 'drc_update', 'report_generate', 'barrel_weight',
                'damage_assess', 'lumb_detect', 'quality_check'
            ],
            customer: [
                'rate_view', 'billing_view', 'barrel_request', 'complaint_submit',
                'notification_receive', 'calculator_use', 'profile_view'
            ]
        };
        
        this.moduleAccess = {
            'user_management': ['admin'],
            'system_config': ['admin'],
            'audit_logs': ['admin'],
            'reports_generate': ['admin'],
            'barrel_management': ['admin', 'manager', 'lab', 'field_staff'],
            'worker_management': ['admin', 'manager'],
            'stock_management': ['admin', 'manager', 'lab'],
            'approval_final': ['admin'],
            'approval_first': ['manager'],
            'attendance_verify': ['admin', 'manager'],
            'attendance_self': ['labour', 'field_staff'],
            'leave_approve': ['admin', 'manager'],
            'leave_apply': ['labour'],
            'repair_approve': ['admin', 'manager'],
            'damage_assign': ['manager'],
            'damage_report': ['lab', 'field_staff'],
            'route_plan': ['field_staff'],
            'barrel_update': ['field_staff', 'lab'],
            'sample_record': ['lab'],
            'drc_update': ['lab'],
            'rate_view': ['customer'],
            'billing_view': ['customer'],
            'barrel_request': ['customer']
        };
    }

    // Check if user has specific permission
    hasPermission(userRole, permission) {
        return this.permissions[userRole]?.includes(permission) || false;
    }

    // Check if user can access specific module
    canAccessModule(userRole, module) {
        return this.moduleAccess[module]?.includes(userRole) || false;
    }

    // Get accessible modules for user role
    getAccessibleModules(userRole) {
        const accessibleModules = [];
        for (const [module, roles] of Object.entries(this.moduleAccess)) {
            if (roles.includes(userRole)) {
                accessibleModules.push(module);
            }
        }
        return accessibleModules;
    }

    // Middleware to check permission
    requirePermission(permission) {
        return (req, res, next) => {
            const userRole = req.user?.role;
            
            if (!userRole) {
                return res.status(401).json({ 
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            if (!this.hasPermission(userRole, permission)) {
                return res.status(403).json({ 
                    message: `Access denied. Required permission: ${permission}`,
                    code: 'PERMISSION_DENIED',
                    userRole,
                    requiredPermission: permission
                });
            }

            next();
        };
    }

    // Middleware to check module access
    requireModuleAccess(module) {
        return (req, res, next) => {
            const userRole = req.user?.role;
            
            if (!userRole) {
                return res.status(401).json({ 
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            if (!this.canAccessModule(userRole, module)) {
                return res.status(403).json({ 
                    message: `Access denied. Required module access: ${module}`,
                    code: 'MODULE_ACCESS_DENIED',
                    userRole,
                    requiredModule: module
                });
            }

            next();
        };
    }

    // Middleware to check if user can access specific resource
    requireResourceAccess(resourceType, action) {
        return (req, res, next) => {
            const userRole = req.user?.role;
            const resourceId = req.params.id;
            const userId = req.user._id;

            if (!userRole) {
                return res.status(401).json({ 
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                });
            }

            // Admin can access all resources
            if (userRole === 'admin') {
                return next();
            }

            // Check if user can access their own resources
            if (resourceType === 'worker' && resourceId === userId) {
                return next();
            }

            // Check if user can access resources they created
            if (action === 'read' && req.resource?.createdBy?.toString() === userId.toString()) {
                return next();
            }

            // Check role-specific permissions
            const permission = `${resourceType}_${action}`;
            if (!this.hasPermission(userRole, permission)) {
                return res.status(403).json({ 
                    message: `Access denied. Cannot ${action} ${resourceType}`,
                    code: 'RESOURCE_ACCESS_DENIED',
                    userRole,
                    resourceType,
                    action
                });
            }

            next();
        };
    }
}

// Create singleton instance
const rbac = new RoleBasedAccessControl();

// Enhanced Validation Schemas
const validationSchemas = {
    // User Registration
    userRegistration: Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Name must contain only letters',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name must be less than 50 characters'
            }),
        email: Joi.string()
            .email()
            .max(254)
            .required()
            .messages({
                'string.email': 'Please enter a valid email address',
                'string.max': 'Email is too long'
            }),
        phoneNumber: Joi.string()
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
                'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number'
            }),
        password: Joi.string()
            .min(6)
            .pattern(/^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one special character',
                'string.min': 'Password must be at least 6 characters long'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Passwords do not match'
            }),
        role: Joi.string()
            .valid('admin', 'manager', 'labour', 'field_staff', 'lab', 'customer')
            .required()
    }),

    // Barrel Management
    barrelCreation: Joi.object({
        barrelId: Joi.string()
            .min(3)
            .max(20)
            .pattern(/^[A-Z0-9]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Barrel ID must contain only uppercase letters and numbers'
            }),
        capacity: Joi.number()
            .positive()
            .max(10000)
            .required()
            .messages({
                'number.positive': 'Capacity must be a positive number',
                'number.max': 'Capacity cannot exceed 10,000 liters'
            }),
        currentVolume: Joi.number()
            .min(0)
            .max(Joi.ref('capacity'))
            .default(0)
            .messages({
                'number.min': 'Current volume cannot be negative',
                'number.max': 'Current volume cannot exceed capacity'
            }),
        status: Joi.string()
            .valid('in-storage', 'in-use', 'damaged', 'repair', 'scrap', 'disposed')
            .default('in-storage'),
        lastKnownLocation: Joi.string()
            .max(100)
            .allow(''),
        materialName: Joi.string()
            .max(100)
            .allow(''),
        batchNo: Joi.string()
            .max(50)
            .allow(''),
        manufactureDate: Joi.date()
            .max('now')
            .allow(null),
        expiryDate: Joi.date()
            .min(Joi.ref('manufactureDate'))
            .allow(null),
        unit: Joi.string()
            .valid('L', 'kg', 'ml')
            .default('L'),
        notes: Joi.string()
            .max(500)
            .allow('')
    }),

    // Weight Update
    weightUpdate: Joi.object({
        baseWeight: Joi.number()
            .positive()
            .max(1000)
            .messages({
                'number.positive': 'Base weight must be positive',
                'number.max': 'Base weight cannot exceed 1000 kg'
            }),
        emptyWeight: Joi.number()
            .positive()
            .max(1000)
            .messages({
                'number.positive': 'Empty weight must be positive',
                'number.max': 'Empty weight cannot exceed 1000 kg'
            }),
        grossWeight: Joi.number()
            .positive()
            .max(1000)
            .min(Joi.ref('emptyWeight'))
            .messages({
                'number.positive': 'Gross weight must be positive',
                'number.max': 'Gross weight cannot exceed 1000 kg',
                'number.min': 'Gross weight must be greater than empty weight'
            })
    }).custom((value, helpers) => {
        // Cross-field validation for lumb calculation
        if (value.emptyWeight && value.grossWeight) {
            const lumbPercent = ((value.grossWeight - value.emptyWeight) / value.grossWeight) * 100;
            if (lumbPercent > 50) {
                return helpers.error('custom.lumbTooHigh', { lumbPercent });
            }
        }
        return value;
    }).messages({
        'custom.lumbTooHigh': 'Lumb percentage ({{#lumbPercent}}) is unusually high. Please verify weights.'
    }),

    // Damage Report
    damageReport: Joi.object({
        barrelId: Joi.string()
            .required()
            .messages({
                'any.required': 'Barrel ID is required'
            }),
        damageType: Joi.string()
            .valid('lumbed', 'physical', 'other')
            .required()
            .messages({
                'any.only': 'Damage type must be one of: lumbed, physical, other'
            }),
        lumbPercent: Joi.number()
            .min(0)
            .max(100)
            .when('damageType', {
                is: 'lumbed',
                then: Joi.required(),
                otherwise: Joi.optional()
            })
            .messages({
                'number.min': 'Lumb percentage cannot be negative',
                'number.max': 'Lumb percentage cannot exceed 100%'
            }),
        severity: Joi.string()
            .valid('low', 'medium', 'high')
            .default('medium'),
        remarks: Joi.string()
            .max(500)
            .allow(''),
        source: Joi.string()
            .valid('lab', 'field', 'inspection')
            .default('lab')
    }),

    // Attendance
    attendance: Joi.object({
        staff: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid staff ID format'
            }),
        date: Joi.date()
            .max('now')
            .required(),
        checkInTime: Joi.date()
            .max('now')
            .required(),
        checkOutTime: Joi.date()
            .min(Joi.ref('checkInTime'))
            .max('now')
            .allow(null),
        location: Joi.object({
            latitude: Joi.number()
                .min(-90)
                .max(90)
                .required(),
            longitude: Joi.number()
                .min(-180)
                .max(180)
                .required(),
            accuracy: Joi.number()
                .max(100)
                .required()
        }).required(),
        photo: Joi.string()
            .uri()
            .allow(''),
        status: Joi.string()
            .valid('present', 'absent', 'late', 'half-day')
            .default('present')
    }),

    // Leave Request
    leaveRequest: Joi.object({
        staff: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
        startDate: Joi.date()
            .min('now')
            .required()
            .messages({
                'date.min': 'Start date must be in the future'
            }),
        endDate: Joi.date()
            .min(Joi.ref('startDate'))
            .required()
            .messages({
                'date.min': 'End date must be after start date'
            }),
        reason: Joi.string()
            .min(10)
            .max(500)
            .required()
            .messages({
                'string.min': 'Reason must be at least 10 characters',
                'string.max': 'Reason cannot exceed 500 characters'
            }),
        type: Joi.string()
            .valid('sick', 'personal', 'emergency', 'vacation')
            .required(),
        emergencyContact: Joi.string()
            .pattern(/^[6-9]\d{9}$/)
            .when('type', {
                is: 'emergency',
                then: Joi.required(),
                otherwise: Joi.optional()
            })
            .messages({
                'string.pattern.base': 'Emergency contact must be a valid Indian mobile number'
            })
    }),

    // Stock Update
    stockUpdate: Joi.object({
        productName: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.min': 'Product name must be at least 2 characters',
                'string.max': 'Product name cannot exceed 100 characters'
            }),
        quantityChange: Joi.number()
            .required()
            .messages({
                'any.required': 'Quantity change is required'
            }),
        unit: Joi.string()
            .valid('L', 'kg', 'ml', 'units', 'pieces')
            .required(),
        minThreshold: Joi.number()
            .min(0)
            .max(100)
            .default(10)
            .messages({
                'number.min': 'Minimum threshold cannot be negative',
                'number.max': 'Minimum threshold cannot exceed 100%'
            }),
        notes: Joi.string()
            .max(200)
            .allow('')
    })
};

// Validation middleware factory
const createValidationMiddleware = (schema, options = {}) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            ...options
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            return res.status(400).json({
                message: 'Validation failed',
                errors,
                code: 'VALIDATION_ERROR'
            });
        }

        req.body = value;
        next();
    };
};

// Rate limiting middleware
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    const requests = new Map();
    
    // More lenient limits for development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const effectiveMaxRequests = isDevelopment ? 1000 : maxRequests;
    const effectiveWindowMs = isDevelopment ? 60 * 1000 : windowMs; // 1 minute in dev, 15 minutes in prod

    return (req, res, next) => {
        const key = req.ip + ':' + req.user?._id;
        const now = Date.now();
        const windowStart = now - effectiveWindowMs;

        // Clean old entries
        for (const [requestKey, timestamps] of requests.entries()) {
            const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
            if (validTimestamps.length === 0) {
                requests.delete(requestKey);
            } else {
                requests.set(requestKey, validTimestamps);
            }
        }

        // Check current user's requests
        const userRequests = requests.get(key) || [];
        if (userRequests.length >= effectiveMaxRequests) {
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(effectiveWindowMs / 1000),
                debug: isDevelopment ? {
                    currentRequests: userRequests.length,
                    maxRequests: effectiveMaxRequests,
                    windowMs: effectiveWindowMs
                } : undefined
            });
        }

        // Add current request
        userRequests.push(now);
        requests.set(key, userRequests);

        next();
    };
};

// Audit logging middleware
const auditLogger = (action, entityType) => {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            // Log the action after response is sent
            if (res.statusCode < 400) {
                const auditData = {
                    action,
                    entityType,
                    entityId: req.params.id || req.body.id,
                    userId: req.user?._id,
                    userRole: req.user?.role,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: new Date().toISOString(),
                    requestBody: req.body,
                    responseStatus: res.statusCode
                };

                // Send to audit service (async, don't wait)
                fetch('/api/audit/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(auditData)
                }).catch(err => console.error('Audit logging failed:', err));
            }
            
            return originalSend.call(this, data);
        };

        next();
    };
};

// Global rate limit cache for clearing
let globalRateLimitCache = new Map();

// Function to clear rate limit cache (for development)
const clearRateLimitCache = () => {
    globalRateLimitCache.clear();
    console.log('Rate limit cache cleared');
};

module.exports = {
    rbac,
    validationSchemas,
    createValidationMiddleware,
    rateLimiter,
    auditLogger,
    RoleBasedAccessControl,
    clearRateLimitCache
};

