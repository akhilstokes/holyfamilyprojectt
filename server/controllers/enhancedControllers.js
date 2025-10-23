const { rbac, createValidationMiddleware, validationSchemas, auditLogger } = require('../middleware/enhancedAuth');
const Barrel = require('../models/barrelModel');
const BarrelDamage = require('../models/barrelDamageModel');
const BarrelRepair = require('../models/barrelRepairModel');
const AuditLog = require('../models/auditLogModel');
const Notification = require('../models/Notification');
const BarrelMovement = require('../models/barrelMovementModel');

// Enhanced Barrel Tracking Controller
class BarrelTrackingController {
    // Update barrel weights with lumb detection
    static async updateWeights(req, res) {
        try {
            const { barrelId } = req.params;
            const { baseWeight, emptyWeight, grossWeight } = req.body;

            const barrel = await Barrel.findOne({ barrelId });
            if (!barrel) {
                return res.status(404).json({ message: 'Barrel not found' });
            }

            // Update weights
            if (baseWeight !== undefined) barrel.baseWeight = baseWeight;
            if (emptyWeight !== undefined) barrel.emptyWeight = emptyWeight;
            if (grossWeight !== undefined) barrel.grossWeight = grossWeight;

            // Calculate lumb percentage
            if (emptyWeight && grossWeight) {
                const lumbWeight = grossWeight - emptyWeight;
                const lumbPercent = (lumbWeight / grossWeight) * 100;
                
                barrel.lumbPercent = lumbPercent;
                
                // Auto-flag if lumb > 20%
                if (lumbPercent > 20) {
                    barrel.condition = 'damaged';
                    barrel.damageType = 'lumbed';
                    
                    // Create damage report
                    const damageReport = await BarrelDamage.create({
                        barrelId: barrel._id,
                        reportedBy: req.user._id,
                        source: 'lab',
                        damageType: 'lumbed',
                        lumbPercent,
                        severity: lumbPercent > 50 ? 'high' : 'medium',
                        status: 'open',
                        remarks: `Auto-detected lumb: ${lumbPercent.toFixed(2)}%`
                    });

                    // Send notification to lab for lumb removal
                    await Notification.create({
                        type: 'LUMB_REMOVAL',
                        recipientRole: 'lab',
                        title: 'Lumb Removal Required',
                        message: `Barrel ${barrelId} has ${lumbPercent.toFixed(2)}% lumb and requires removal`,
                        priority: 'high',
                        data: { barrelId, lumbPercent }
                    });
                }
            }

            barrel.lastUpdatedBy = req.user._id;
            await barrel.save();

            res.json({
                success: true,
                barrel,
                lumbPercent: barrel.lumbPercent,
                flagged: barrel.lumbPercent > 20
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Report barrel damage
    static async reportDamage(req, res) {
        try {
            const { barrelId, damageType, lumbPercent, severity, remarks, source } = req.body;

            const barrel = await Barrel.findOne({ barrelId });
            if (!barrel) {
                return res.status(404).json({ message: 'Barrel not found' });
            }

            const damageReport = await BarrelDamage.create({
                barrelId: barrel._id,
                reportedBy: req.user._id,
                source: source || 'lab',
                damageType,
                lumbPercent,
                severity: severity || 'medium',
                remarks,
                status: 'open'
            });

            // Update barrel condition
            barrel.condition = 'damaged';
            barrel.damageType = damageType;
            if (damageType === 'lumbed') {
                barrel.currentLocation = 'lumb-bay';
            }

            await barrel.save();

            // Send notification to manager
            await Notification.create({
                type: 'DAMAGE_REPORT',
                recipientRole: 'manager',
                title: 'Barrel Damage Reported',
                message: `Barrel ${barrelId} has ${damageType} damage (${severity} severity)`,
                priority: severity === 'high' ? 'high' : 'medium',
                data: { barrelId, damageType, severity }
            });

            res.status(201).json(damageReport);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Assign repair action
    static async assignRepairAction(req, res) {
        try {
            const { damageId } = req.params;
            const { assignedTo } = req.body;

            const damage = await BarrelDamage.findById(damageId);
            if (!damage) {
                return res.status(404).json({ message: 'Damage report not found' });
            }

            damage.assignedTo = assignedTo;
            damage.status = 'assigned';
            await damage.save();

            // Update barrel location
            const barrel = await Barrel.findById(damage.barrelId);
            if (barrel) {
                switch (assignedTo) {
                    case 'lumb-removal':
                        barrel.currentLocation = 'lumb-bay';
                        barrel.condition = 'lumb-removal';
                        break;
                    case 'repair':
                        barrel.currentLocation = 'repair-bay';
                        barrel.condition = 'repair';
                        break;
                    case 'scrap':
                        barrel.currentLocation = 'scrap-yard';
                        barrel.condition = 'scrap';
                        break;
                }
                await barrel.save();
            }

            res.json(damage);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Get barrel tracking status
    static async getTrackingStatus(req, res) {
        try {
            const { barrelId } = req.params;

            const barrel = await Barrel.findOne({ barrelId })
                .populate('lastUpdatedBy', 'name role')
                .lean();

            if (!barrel) {
                return res.status(404).json({ message: 'Barrel not found' });
            }

            // Get damage reports
            const damages = await BarrelDamage.find({ barrelId: barrel._id })
                .populate('reportedBy', 'name role')
                .sort({ createdAt: -1 })
                .lean();

            // Get repair jobs
            const repairs = await BarrelRepair.find({ barrelId: barrel._id })
                .populate('assignedTo', 'name role')
                .sort({ createdAt: -1 })
                .lean();

            // Get movement history
            const movements = await BarrelMovement.find({ barrel: barrel._id })
                .populate('createdBy', 'name role')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            res.json({
                barrel,
                damages,
                repairs,
                movements,
                status: {
                    condition: barrel.condition,
                    location: barrel.currentLocation,
                    lumbPercent: barrel.lumbPercent,
                    needsAttention: barrel.lumbPercent > 20 || barrel.condition === 'damaged'
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
}

// Audit Log Controller
class AuditLogController {
    // Log audit entry
    static async logEntry(req, res) {
        try {
            const auditEntry = await AuditLog.create(req.body);
            res.status(201).json(auditEntry);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Get audit logs with filtering
    static async getLogs(req, res) {
        try {
            const {
                entityType,
                entityId,
                action,
                userRole,
                dateRange,
                search,
                page = 1,
                limit = 20
            } = req.query;

            const filter = {};
            
            if (entityType) filter.entityType = entityType;
            if (entityId) filter.entityId = entityId;
            if (action) filter.action = action;
            if (userRole) filter.userRole = userRole;

            // Date range filtering
            if (dateRange) {
                const now = new Date();
                let startDate;
                
                switch (dateRange) {
                    case '1d':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90d':
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        break;
                }
                
                if (startDate) {
                    filter.timestamp = { $gte: startDate };
                }
            }

            // Text search
            if (search) {
                filter.$or = [
                    { action: { $regex: search, $options: 'i' } },
                    { 'details.message': { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const [logs, total] = await Promise.all([
                AuditLog.find(filter)
                    .populate('userId', 'name email')
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                AuditLog.countDocuments(filter)
            ]);

            res.json({
                logs,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Export audit logs
    static async exportLogs(req, res) {
        try {
            const { format = 'csv' } = req.query;
            const logs = await AuditLog.find(req.query)
                .populate('userId', 'name email')
                .sort({ timestamp: -1 })
                .lean();

            if (format === 'csv') {
                const csv = this.convertToCSV(logs);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
                res.send(csv);
            } else {
                res.json(logs);
            }
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    static convertToCSV(logs) {
        const headers = ['Timestamp', 'Action', 'User', 'Role', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
        const rows = logs.map(log => [
            log.timestamp,
            log.action,
            log.userId?.name || 'Unknown',
            log.userRole,
            log.entityType || '',
            log.entityId || '',
            JSON.stringify(log.details),
            log.ipAddress
        ]);

        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }
}

// Notification Controller
class NotificationController {
    // Send notification
    static async sendNotification(req, res) {
        try {
            const notification = await Notification.create(req.body);
            res.status(201).json(notification);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Get notifications for user
    static async getNotifications(req, res) {
        try {
            const { userId, userRole } = req.query;
            
            const filter = {
                $or: [
                    { recipientId: userId },
                    { recipientRole: userRole }
                ]
            };

            const notifications = await Notification.find(filter)
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            res.json(notifications);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Mark notification as read
    static async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            
            const notification = await Notification.findByIdAndUpdate(
                notificationId,
                { read: true, readAt: new Date() },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ message: 'Notification not found' });
            }

            res.json(notification);
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Mark all notifications as read
    static async markAllAsRead(req, res) {
        try {
            const { userId } = req.body;
            
            await Notification.updateMany(
                { recipientId: userId, read: false },
                { read: true, readAt: new Date() }
            );

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
}

// Enhanced Dashboard Controller
class DashboardController {
    // Get admin dashboard data
    static async getAdminDashboard(req, res) {
        try {
            const [
                attendanceStats,
                stockSummary,
                barrelStats,
                chemicalStock,
                pendingApprovals
            ] = await Promise.all([
                this.getAttendanceStats(),
                this.getStockSummary(),
                this.getBarrelStats(),
                this.getChemicalStock(),
                this.getPendingApprovals()
            ]);

            res.json({
                attendance: attendanceStats,
                stock: stockSummary,
                barrels: barrelStats,
                chemicalStock,
                pendingApprovals: pendingApprovals.count
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Get manager dashboard data
    static async getManagerDashboard(req, res) {
        try {
            const [
                pendingLeaves,
                pendingBills,
                attendanceVerification,
                stockAlerts,
                barrelRepairs
            ] = await Promise.all([
                this.getPendingLeaves(),
                this.getPendingBills(),
                this.getAttendanceVerification(),
                this.getStockAlerts(),
                this.getBarrelRepairs()
            ]);

            res.json({
                pendingLeaves: pendingLeaves.count,
                pendingBills: pendingBills.length,
                attendanceVerification: attendanceVerification.length,
                stockAlerts,
                barrelRepairs
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Field Staff dashboard – minimal stub
    static async getFieldStaffDashboard(req, res) {
        try {
            return res.json({
                today: { scanned: 0, pickedUp: 0, delivered: 0, damaged: 0 },
                recentActivity: []
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Lab dashboard – minimal stub
    static async getLabDashboard(req, res) {
        try {
            return res.json({
                receivedBarrels: [],
                stats: { drcMeasured: 0, pendingVerification: 0, totalValue: 0 }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Customer dashboard – minimal stub
    static async getCustomerDashboard(req, res) {
        try {
            return res.json({
                verifiedBarrels: [],
                payments: []
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Get labour dashboard data
    static async getLabourDashboard(req, res) {
        try {
            const userId = req.user._id;
            
            const [
                attendance,
                schedule,
                wages,
                leaveBalance,
                documents
            ] = await Promise.all([
                this.getWorkerAttendance(userId),
                this.getWorkerSchedule(userId),
                this.getWorkerWages(userId),
                this.getLeaveBalance(userId),
                this.getWorkerDocuments(userId)
            ]);

            res.json({
                attendance,
                schedule,
                wages,
                leaveBalance: leaveBalance.balance,
                documents
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }

    // Helper methods
    static async getAttendanceStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const total = await Worker.countDocuments();
        const present = await Attendance.countDocuments({ 
            date: today, 
            status: 'present' 
        });
        
        return { total, present, absent: total - present };
    }

    static async getStockSummary() {
        const stocks = await Stock.find({});
        const summary = {};
        
        stocks.forEach(stock => {
            summary[stock.productName.toLowerCase().replace(/\s+/g, '')] = stock.quantityInLiters;
        });
        
        return summary;
    }

    static async getBarrelStats() {
        const [total, damaged, inRepair, ready] = await Promise.all([
            Barrel.countDocuments(),
            Barrel.countDocuments({ condition: 'damaged' }),
            Barrel.countDocuments({ condition: 'repair' }),
            Barrel.countDocuments({ condition: 'good' })
        ]);
        
        return { total, damaged, inRepair, ready };
    }

    static async getChemicalStock() {
        return await ChemicalStock.find({})
            .sort({ name: 1 })
            .lean();
    }

    static async getPendingApprovals() {
        const count = await ApprovalRequest.countDocuments({ 
            status: 'pending' 
        });
        
        return { count };
    }

    static async getPendingLeaves() {
        const count = await LeaveRequest.countDocuments({ 
            status: 'pending' 
        });
        
        return { count };
    }

    static async getPendingBills() {
        return await BillRequest.find({ 
            status: 'pending' 
        }).lean();
    }

    static async getAttendanceVerification() {
        return await Attendance.find({ 
            status: 'pending_verification' 
        }).lean();
    }

    static async getStockAlerts() {
        const stocks = await Stock.find({});
        const alerts = [];
        
        stocks.forEach(stock => {
            if (stock.quantityInLiters < stock.minThreshold) {
                alerts.push({
                    type: 'low_stock',
                    message: `${stock.productName} is running low (${stock.quantityInLiters} remaining)`,
                    severity: 'warning'
                });
            }
        });
        
        return alerts;
    }

    static async getBarrelRepairs() {
        return await BarrelRepair.find({ 
            status: 'completed' 
        }).lean();
    }

    static async getWorkerAttendance(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return await Attendance.findOne({ 
            staff: userId, 
            date: today 
        }).lean();
    }

    static async getWorkerSchedule(userId) {
        return await Schedule.findOne({ 
            worker: userId 
        }).lean();
    }

    static async getWorkerWages(userId) {
        const wages = await Wage.find({ 
            worker: userId 
        }).sort({ date: -1 }).limit(1).lean();
        
        return wages[0] || { daily: 0, monthly: 0 };
    }

    static async getLeaveBalance(userId) {
        const worker = await Worker.findById(userId);
        return { balance: worker?.leaveBalance || 0 };
    }

    static async getWorkerDocuments(userId) {
        const worker = await Worker.findById(userId);
        return worker?.documents || [];
    }
}

module.exports = {
    BarrelTrackingController,
    AuditLogController,
    NotificationController,
    DashboardController
};

