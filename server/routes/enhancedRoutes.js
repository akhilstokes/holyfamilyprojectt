const express = require('express');
const router = express.Router();
const { rbac, createValidationMiddleware, validationSchemas, rateLimiter, auditLogger } = require('../middleware/enhancedAuth');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');
const {
    BarrelTrackingController,
    AuditLogController,
    NotificationController,
    DashboardController
} = require('../controllers/enhancedControllers');

// Apply rate limiting to all routes
router.use(rateLimiter());

// ==================== BARREL TRACKING ROUTES ====================

// Update barrel weights with lumb detection (Lab only)
router.put('/barrels/:barrelId/weights',
    protect,
    rbac.requirePermission('barrel_weight'),
    createValidationMiddleware(validationSchemas.weightUpdate),
    auditLogger('UPDATE', 'barrel'),
    BarrelTrackingController.updateWeights
);

// Report barrel damage (Lab, Field Staff)
router.post('/barrels/damage/report',
    protect,
    rbac.requirePermission('damage_report'),
    createValidationMiddleware(validationSchemas.damageReport),
    auditLogger('CREATE', 'damage'),
    BarrelTrackingController.reportDamage
);

// Assign repair action (Manager only)
router.post('/damages/:damageId/assign',
    protect,
    rbac.requirePermission('damage_assign'),
    auditLogger('UPDATE', 'damage'),
    BarrelTrackingController.assignRepairAction
);

// Get barrel tracking status (All roles with barrel access)
router.get('/barrels/:barrelId/tracking',
    protect,
    rbac.requireModuleAccess('barrel_management'),
    BarrelTrackingController.getTrackingStatus
);

// ==================== AUDIT LOG ROUTES ====================

// Log audit entry (System only)
router.post('/audit/log',
    protect,
    rbac.requirePermission('audit_logs'),
    AuditLogController.logEntry
);

// Get audit logs with filtering (Admin only)
router.get('/audit/logs',
    protect,
    rbac.requirePermission('audit_logs'),
    AuditLogController.getLogs
);

// Export audit logs (Admin only)
router.get('/audit/export',
    protect,
    rbac.requirePermission('audit_logs'),
    AuditLogController.exportLogs
);

// ==================== NOTIFICATION ROUTES ====================

// Send notification (System, Admin)
router.post('/notifications/send',
    protect,
    rbac.requirePermission('system_config'),
    NotificationController.sendNotification
);

// Get notifications for user (All authenticated users)
router.get('/notifications',
    protect,
    NotificationController.getNotifications
);

// Mark notification as read
router.put('/notifications/:notificationId/read',
    protect,
    NotificationController.markAsRead
);

// Mark all notifications as read
router.put('/notifications/mark-all-read',
    protect,
    NotificationController.markAllAsRead
);

// ==================== DASHBOARD ROUTES ====================

// Admin dashboard (Admin only)
router.get('/dashboard/admin',
    protect,
    rbac.requirePermission('system_config'),
    DashboardController.getAdminDashboard
);

// Manager dashboard (Manager only)
router.get('/dashboard/manager',
    protect,
    rbac.requirePermission('approval_first'),
    DashboardController.getManagerDashboard
);

// Labour dashboard (Labour only)
router.get('/dashboard/labour',
    protect,
    rbac.requirePermission('attendance_self'),
    DashboardController.getLabourDashboard
);

// Field Staff dashboard (Field Staff only)
router.get('/dashboard/field-staff',
    protect,
    rbac.requirePermission('route_plan'),
    DashboardController.getFieldStaffDashboard
);

// Lab dashboard (Lab only)
router.get('/dashboard/lab',
    protect,
    rbac.requirePermission('sample_record'),
    DashboardController.getLabDashboard
);

// Customer dashboard (Customer only)
router.get('/dashboard/customer',
    protect,
    rbac.requirePermission('rate_view'),
    DashboardController.getCustomerDashboard
);

// ==================== ENHANCED BARREL ROUTES ====================

// Create barrel with enhanced validation (Admin, Manager)
router.post('/barrels',
    protect,
    rbac.requirePermission('barrel_management'),
    createValidationMiddleware(validationSchemas.barrelCreation),
    auditLogger('CREATE', 'barrel'),
    async (req, res) => {
        try {
            const barrel = await Barrel.create({
                ...req.body,
                lastUpdatedBy: req.user._id
            });
            res.status(201).json(barrel);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Update barrel with enhanced validation (Admin, Manager, Lab, Field Staff)
router.put('/barrels/:id',
    protect,
    rbac.requireModuleAccess('barrel_management'),
    createValidationMiddleware(validationSchemas.barrelCreation),
    auditLogger('UPDATE', 'barrel'),
    async (req, res) => {
        try {
            const barrel = await Barrel.findByIdAndUpdate(
                req.params.id,
                { ...req.body, lastUpdatedBy: req.user._id },
                { new: true, runValidators: true }
            );
            
            if (!barrel) {
                return res.status(404).json({ message: 'Barrel not found' });
            }
            
            res.json(barrel);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Get barrel statistics (Admin, Manager)
router.get('/barrels/stats',
    protect,
    rbac.requirePermission('barrel_management'),
    async (req, res) => {
        try {
            const [total, damaged, inRepair, ready] = await Promise.all([
                Barrel.countDocuments(),
                Barrel.countDocuments({ condition: 'damaged' }),
                Barrel.countDocuments({ condition: 'repair' }),
                Barrel.countDocuments({ condition: 'good' })
            ]);
            
            res.json({ total, damaged, inRepair, ready });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// ==================== ENHANCED ATTENDANCE ROUTES ====================

// GPS-based check-in (Field Staff, Labour)
router.post('/attendance/check-in',
    protect,
    rbac.requirePermission('attendance_self'),
    createValidationMiddleware(validationSchemas.attendance),
    auditLogger('CREATE', 'attendance'),
    async (req, res) => {
        try {
            const { location, photo } = req.body;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if already checked in today
            const existingAttendance = await Attendance.findOne({
                staff: req.user._id,
                date: today
            });
            
            if (existingAttendance) {
                return res.status(400).json({ message: 'Already checked in today' });
            }
            
            const attendance = await Attendance.create({
                staff: req.user._id,
                date: today,
                checkInTime: new Date(),
                location,
                photo,
                status: 'present'
            });
            
            res.status(201).json(attendance);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// GPS-based check-out (Field Staff, Labour)
router.post('/attendance/check-out',
    protect,
    rbac.requirePermission('attendance_self'),
    auditLogger('UPDATE', 'attendance'),
    async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const attendance = await Attendance.findOne({
                staff: req.user._id,
                date: today
            });
            
            if (!attendance) {
                return res.status(404).json({ message: 'No check-in found for today' });
            }
            
            if (attendance.checkOutTime) {
                return res.status(400).json({ message: 'Already checked out today' });
            }
            
            attendance.checkOutTime = new Date();
            await attendance.save();
            
            res.json(attendance);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Verify attendance (Manager, Admin)
router.post('/attendance/:id/verify',
    protect,
    rbac.requirePermission('attendance_verify'),
    auditLogger('UPDATE', 'attendance'),
    async (req, res) => {
        try {
            const attendance = await Attendance.findByIdAndUpdate(
                req.params.id,
                {
                    verified: true,
                    verifiedBy: req.user._id,
                    verifiedAt: new Date()
                },
                { new: true }
            );
            
            if (!attendance) {
                return res.status(404).json({ message: 'Attendance record not found' });
            }
            
            res.json(attendance);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// ==================== ENHANCED LEAVE ROUTES ====================

// Apply for leave (Labour only)
router.post('/leaves/apply',
    protect,
    rbac.requirePermission('leave_apply'),
    createValidationMiddleware(validationSchemas.leaveRequest),
    auditLogger('CREATE', 'leave'),
    async (req, res) => {
        try {
            const leaveRequest = await LeaveRequest.create({
                ...req.body,
                staff: req.user._id,
                status: 'pending'
            });
            
            // Send notification to manager
            await Notification.create({
                type: 'LEAVE_REQUEST',
                recipientRole: 'manager',
                title: 'Leave Request Submitted',
                message: `${req.user.name} has submitted a leave request`,
                priority: 'medium',
                data: { leaveId: leaveRequest._id, staffName: req.user.name }
            });
            
            res.status(201).json(leaveRequest);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Approve leave (Manager, Admin)
router.post('/leaves/:id/approve',
    protect,
    rbac.requirePermission('leave_approve'),
    auditLogger('APPROVE', 'leave'),
    async (req, res) => {
        try {
            const leaveRequest = await LeaveRequest.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'approved',
                    approvedBy: req.user._id,
                    approvedAt: new Date()
                },
                { new: true }
            );
            
            if (!leaveRequest) {
                return res.status(404).json({ message: 'Leave request not found' });
            }
            
            res.json(leaveRequest);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// ==================== ENHANCED STOCK ROUTES ====================

// Update stock with enhanced validation (Admin, Manager, Lab)
router.put('/stock/:name',
    protect,
    rbac.requireModuleAccess('stock_management'),
    createValidationMiddleware(validationSchemas.stockUpdate),
    auditLogger('UPDATE', 'stock'),
    async (req, res) => {
        try {
            const { quantityChange } = req.body;
            
            let stock = await Stock.findOne({ productName: req.params.name });
            if (!stock) {
                return res.status(404).json({ message: 'Stock item not found' });
            }
            
            const newQuantity = stock.quantityInLiters + quantityChange;
            if (newQuantity < 0) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            
            stock.quantityInLiters = newQuantity;
            stock.lastUpdated = new Date();
            stock.lastUpdatedBy = req.user._id;
            await stock.save();
            
            // Check for low stock alert
            if (newQuantity < stock.minThreshold) {
                await Notification.create({
                    type: 'STOCK_UPDATE',
                    recipientRole: 'manager',
                    title: 'Low Stock Alert',
                    message: `${stock.productName} is running low (${newQuantity} remaining)`,
                    priority: 'high',
                    data: { productName: stock.productName, quantity: newQuantity }
                });
            }
            
            res.json(stock);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// ==================== REPAIR WORKFLOW ROUTES ====================

// Open repair job (Lab, Field Staff)
router.post('/repairs/open',
    protect,
    rbac.requirePermission('damage_report'),
    auditLogger('CREATE', 'repair'),
    async (req, res) => {
        try {
            const { barrelId, type } = req.body;
            
            const repairJob = await BarrelRepair.create({
                barrelId,
                damageId: req.body.damageId,
                type,
                assignedTo: req.user._id,
                status: 'assigned'
            });
            
            res.status(201).json(repairJob);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Log repair progress (Lab, Field Staff)
router.post('/repairs/:id/progress',
    protect,
    rbac.requirePermission('damage_report'),
    auditLogger('UPDATE', 'repair'),
    async (req, res) => {
        try {
            const { step, note } = req.body;
            
            const repairJob = await BarrelRepair.findByIdAndUpdate(
                req.params.id,
                {
                    $push: {
                        workLog: {
                            step,
                            note,
                            userId: req.user._id
                        }
                    },
                    status: 'in-progress'
                },
                { new: true }
            );
            
            if (!repairJob) {
                return res.status(404).json({ message: 'Repair job not found' });
            }
            
            res.json(repairJob);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Complete repair job (Lab, Field Staff)
router.post('/repairs/:id/complete',
    protect,
    rbac.requirePermission('damage_report'),
    auditLogger('UPDATE', 'repair'),
    async (req, res) => {
        try {
            const repairJob = await BarrelRepair.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'completed',
                    completedAt: new Date()
                },
                { new: true }
            );
            
            if (!repairJob) {
                return res.status(404).json({ message: 'Repair job not found' });
            }
            
            // Send notification to manager for approval
            await Notification.create({
                type: 'WORKFLOW_APPROVAL',
                recipientRole: 'manager',
                title: 'Repair Completion Approval Required',
                message: `Repair job for barrel ${repairJob.barrelId} is completed and requires approval`,
                priority: 'medium',
                data: { repairId: repairJob._id, barrelId: repairJob.barrelId }
            });
            
            res.json(repairJob);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Approve repair job (Manager, Admin)
router.post('/repairs/:id/approve',
    protect,
    rbac.requirePermission('repair_approve'),
    auditLogger('APPROVE', 'repair'),
    async (req, res) => {
        try {
            const repairJob = await BarrelRepair.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'approved',
                    approvedBy: req.user._id,
                    approvedAt: new Date()
                },
                { new: true }
            );
            
            if (!repairJob) {
                return res.status(404).json({ message: 'Repair job not found' });
            }
            
            // Update barrel condition
            await Barrel.findByIdAndUpdate(repairJob.barrelId, {
                condition: 'good',
                damageType: null,
                currentLocation: 'yard'
            });
            
            res.json(repairJob);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

module.exports = router;

