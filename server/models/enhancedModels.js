const mongoose = require('mongoose');

// Audit Log Model
const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'LOGOUT', 'BARREL_ACTION', 'WORKER_ACTION', 'CUSTOMER_ACTION', 'APPROVAL_ACTION', 'SYSTEM_ACTION']
    },
    entityType: {
        type: String,
        required: true,
        enum: ['barrel', 'worker', 'customer', 'stock', 'chemical', 'attendance', 'leave', 'repair', 'damage', 'user', 'system']
    },
    entityId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        required: true,
        enum: ['admin', 'manager', 'labour', 'field_staff', 'lab', 'customer']
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    requestBody: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    responseStatus: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userRole: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Notification Model
const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['BARREL_DELIVERY', 'STOCK_UPDATE', 'WORKFLOW_APPROVAL', 'DAMAGE_REPORT', 'LUMB_REMOVAL', 'ATTENDANCE', 'LEAVE_REQUEST', 'SYSTEM_ALERT']
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    recipientRole: {
        type: String,
        required: false,
        enum: ['admin', 'manager', 'labour', 'field_staff', 'lab', 'customer']
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Enhanced Barrel Model
const barrelSchema = new mongoose.Schema({
    barrelId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 10000
    },
    currentVolume: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: function(v) {
                return v <= this.capacity;
            },
            message: 'Current volume cannot exceed capacity'
        }
    },
    status: {
        type: String,
        enum: ['in-storage', 'in-use', 'damaged', 'repair', 'scrap', 'disposed'],
        default: 'in-storage'
    },
    condition: {
        type: String,
        enum: ['good', 'damaged', 'lumb-removal', 'repair', 'scrap'],
        default: 'good'
    },
    damageType: {
        type: String,
        enum: ['lumbed', 'physical', 'other'],
        default: null
    },
    currentLocation: {
        type: String,
        enum: ['yard', 'lab', 'lumb-bay', 'repair-bay', 'scrap-yard', 'in-transit'],
        default: 'yard'
    },
    lastKnownLocation: {
        type: String,
        maxlength: 100,
        default: ''
    },
    baseWeight: {
        type: Number,
        min: 0,
        max: 1000
    },
    emptyWeight: {
        type: Number,
        min: 0,
        max: 1000
    },
    grossWeight: {
        type: Number,
        min: 0,
        max: 1000
    },
    lumbPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    materialName: {
        type: String,
        maxlength: 100,
        default: ''
    },
    batchNo: {
        type: String,
        maxlength: 50,
        default: ''
    },
    manufactureDate: {
        type: Date,
        max: Date.now
    },
    expiryDate: {
        type: Date,
        min: function() {
            return this.manufactureDate;
        }
    },
    unit: {
        type: String,
        enum: ['L', 'kg', 'ml'],
        default: 'L'
    },
    notes: {
        type: String,
        maxlength: 500,
        default: ''
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    disposalRequested: {
        type: Boolean,
        default: false
    },
    purchaseApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
barrelSchema.index({ barrelId: 1 });
barrelSchema.index({ status: 1 });
barrelSchema.index({ condition: 1 });
barrelSchema.index({ currentLocation: 1 });
barrelSchema.index({ expiryDate: 1 });
barrelSchema.index({ lumbPercent: 1 });

const Barrel = mongoose.model('Barrel', barrelSchema);

// Enhanced Barrel Damage Model
const barrelDamageSchema = new mongoose.Schema({
    barrelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barrel',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        enum: ['lab', 'field', 'inspection'],
        default: 'lab'
    },
    damageType: {
        type: String,
        required: true,
        enum: ['lumbed', 'physical', 'other']
    },
    lumbPercent: {
        type: Number,
        min: 0,
        max: 100,
        required: function() {
            return this.damageType === 'lumbed';
        }
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    remarks: {
        type: String,
        maxlength: 500,
        default: ''
    },
    status: {
        type: String,
        enum: ['open', 'assigned', 'in-progress', 'resolved'],
        default: 'open'
    },
    assignedTo: {
        type: String,
        enum: ['lumb-removal', 'repair', 'scrap', 'inspection'],
        default: null
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedAt: {
        type: Date,
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for performance
barrelDamageSchema.index({ barrelId: 1, status: 1 });
barrelDamageSchema.index({ reportedBy: 1 });
barrelDamageSchema.index({ damageType: 1 });
barrelDamageSchema.index({ status: 1 });
barrelDamageSchema.index({ createdAt: -1 });

const BarrelDamage = mongoose.model('BarrelDamage', barrelDamageSchema);

// Barrel Repair Model
const barrelRepairSchema = new mongoose.Schema({
    barrelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barrel',
        required: true
    },
    damageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BarrelDamage',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['lumb-removal', 'physical-repair', 'cleaning', 'inspection']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['assigned', 'in-progress', 'completed', 'approved', 'rejected'],
        default: 'assigned'
    },
    workLog: [{
        step: {
            type: String,
            required: true
        },
        note: {
            type: String,
            maxlength: 500
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }],
    completedAt: {
        type: Date,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        maxlength: 500,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for performance
barrelRepairSchema.index({ barrelId: 1, status: 1 });
barrelRepairSchema.index({ damageId: 1 });
barrelRepairSchema.index({ assignedTo: 1 });
barrelRepairSchema.index({ status: 1 });
barrelRepairSchema.index({ createdAt: -1 });

const BarrelRepair = mongoose.model('BarrelRepair', barrelRepairSchema);

// Barrel Movement Model
const barrelMovementSchema = new mongoose.Schema({
    barrel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barrel',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['move', 'in', 'out', 'repair', 'disposal']
    },
    volumeDelta: {
        type: Number,
        default: 0
    },
    fromLocation: {
        type: String,
        maxlength: 100,
        default: ''
    },
    toLocation: {
        type: String,
        maxlength: 100,
        default: ''
    },
    notes: {
        type: String,
        maxlength: 500,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for performance
barrelMovementSchema.index({ barrel: 1, createdAt: -1 });
barrelMovementSchema.index({ type: 1 });
barrelMovementSchema.index({ createdBy: 1 });

const BarrelMovement = mongoose.model('BarrelMovement', barrelMovementSchema);

// Enhanced Worker Model
const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'manager', 'labour', 'field_staff', 'lab', 'customer']
    },
    staffId: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true
    },
    department: {
        type: String,
        enum: ['production', 'quality', 'logistics', 'maintenance', 'admin'],
        default: 'production'
    },
    shift: {
        type: String,
        enum: ['morning', 'afternoon', 'night'],
        default: 'morning'
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'terminated'],
        default: 'active'
    },
    leaveBalance: {
        type: Number,
        default: 12,
        min: 0
    },
    documents: [{
        type: {
            type: String,
            enum: ['id', 'address', 'medical', 'contract', 'other']
        },
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
workerSchema.index({ email: 1 });
workerSchema.index({ phoneNumber: 1 });
workerSchema.index({ staffId: 1 });
workerSchema.index({ role: 1 });
workerSchema.index({ status: 1 });
workerSchema.index({ department: 1 });

const Worker = mongoose.model('Worker', workerSchema);

// Enhanced Attendance Model
const attendanceSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    checkInTime: {
        type: Date,
        required: true
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    location: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        accuracy: {
            type: Number,
            required: true,
            max: 100
        },
        address: String
    },
    photo: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day'],
        default: 'present'
    },
    verified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        maxlength: 500,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for performance
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ verified: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Enhanced Stock Model
const stockSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    quantityInLiters: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ['L', 'kg', 'ml', 'units', 'pieces'],
        default: 'L'
    },
    minThreshold: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true
    },
    category: {
        type: String,
        enum: ['raw_material', 'chemical', 'finished_product', 'equipment'],
        default: 'raw_material'
    },
    supplier: {
        name: String,
        contact: String,
        address: String
    },
    expiryDate: {
        type: Date,
        default: null
    },
    batchNumber: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for performance
stockSchema.index({ productName: 1 });
stockSchema.index({ category: 1 });
stockSchema.index({ quantityInLiters: 1 });
stockSchema.index({ lastUpdated: -1 });

const Stock = mongoose.model('Stock', stockSchema);

module.exports = {
    AuditLog,
    Notification,
    Barrel,
    BarrelDamage,
    BarrelRepair,
    BarrelMovement,
    Worker,
    Attendance,
    Stock
};

