const express = require('express');
const Joi = require('joi');
const router = express.Router();
const { rbac, createValidationMiddleware, validationSchemas, rateLimiter } = require('../middleware/enhancedAuth');
const { protect } = require('../middleware/authMiddleware');
const {
    updateBarrelStatus,
    updateDRC,
    getPendingVerification,
    approveVerification,
    rejectVerification,
    getVerifiedBarrels,
    processPayment,
    getBillingHistory,
    reportDamage
} = require('../controllers/barrelTrackingController');

// Apply rate limiting to all routes
router.use(rateLimiter());

// Field Staff: Update barrel status with QR scan
router.post('/barrels/update-status',
    protect,
    rbac.requirePermission('barrel_update'),
    updateBarrelStatus
);

// Lab Staff: Update DRC measurement
router.post('/barrels/drc/update',
    protect,
    rbac.requirePermission('drc_update'),
    createValidationMiddleware(Joi.object({
        barrelId: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).required(),
        drc: Joi.number().min(0).max(100).required(),
        effectiveRubber: Joi.number().min(0).required(),
        calculatedPrice: Joi.number().min(0).required(),
        marketRate: Joi.number().min(0).required(),
        barrelCapacity: Joi.number().min(1).required()
    })),
    updateDRC
);

// Manager: Get barrels pending verification
router.get('/barrels/verification/pending',
    protect,
    rbac.requirePermission('approval_first'),
    getPendingVerification
);

// Manager: Approve barrel verification
router.post('/barrels/verification/:barrelId/approve',
    protect,
    rbac.requirePermission('approval_first'),
    createValidationMiddleware(Joi.object({
        notes: Joi.string().max(500).allow('')
    })),
    approveVerification
);

// Manager: Reject barrel verification
router.post('/barrels/verification/:barrelId/reject',
    protect,
    rbac.requirePermission('approval_first'),
    createValidationMiddleware(Joi.object({
        notes: Joi.string().max(500).required()
    })),
    rejectVerification
);

// Customer: Get verified barrels for billing
router.get('/barrels/billing/verified',
    protect,
    rbac.requirePermission('billing_view'),
    getVerifiedBarrels
);

// Customer: Process payment for barrels
router.post('/barrels/billing/pay',
    protect,
    rbac.requirePermission('billing_view'),
    createValidationMiddleware(Joi.object({
        barrelIds: Joi.array().items(Joi.string()).min(1).required(),
        totalAmount: Joi.number().min(0).required(),
        paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'upi', 'card').required(),
        notes: Joi.string().max(500).allow(''),
        paidAt: Joi.date().max('now').required()
    })),
    processPayment
);

// Customer: Get billing history
router.get('/barrels/billing/history',
    protect,
    rbac.requirePermission('billing_view'),
    getBillingHistory
);

// Field Staff: Report barrel damage
router.post('/barrels/report-damage',
    protect,
    rbac.requirePermission('damage_report'),
    createValidationMiddleware(Joi.object({
        barrelId: Joi.string().min(3).max(20).pattern(/^[A-Z0-9]+$/).required(),
        damageType: Joi.string().valid('lumbed', 'physical', 'other').required(),
        severity: Joi.string().valid('low', 'medium', 'high').required(),
        location: Joi.object({
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required(),
            accuracy: Joi.number().max(100).required()
        }).required(),
        timestamp: Joi.date().max('now').required()
    })),
    reportDamage
);

// Get barrel tracking status (all roles with barrel access)
router.get('/barrels/:barrelId/tracking',
    protect,
    rbac.requireModuleAccess('barrel_management'),
    async (req, res) => {
        try {
            const { barrelId } = req.params;
            
            const barrel = await Barrel.findOne({ barrelId })
                .populate('lastUpdatedBy', 'name role')
                .populate('verifiedBy', 'name')
                .populate('paidBy', 'name')
                .lean();

            if (!barrel) {
                return res.status(404).json({ message: 'Barrel not found' });
            }

            // Get movement history
            const movements = await BarrelMovement.find({ barrel: barrel._id })
                .populate('createdBy', 'name role')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            // Get damage reports
            const damages = await BarrelDamage.find({ barrelId: barrel._id })
                .populate('reportedBy', 'name role')
                .sort({ createdAt: -1 })
                .lean();

            res.json({
                barrel,
                movements,
                damages,
                status: {
                    condition: barrel.condition,
                    location: barrel.currentLocation,
                    drc: barrel.drc,
                    calculatedPrice: barrel.calculatedPrice,
                    needsAttention: barrel.condition === 'damaged' || barrel.drc > 20
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Get barrel statistics for dashboard
router.get('/barrels/stats/dashboard',
    protect,
    rbac.requirePermission('barrel_management'),
    async (req, res) => {
        try {
            const [
                totalBarrels,
                pendingVerification,
                verifiedBarrels,
                paidBarrels,
                damagedBarrels
            ] = await Promise.all([
                Barrel.countDocuments(),
                Barrel.countDocuments({ status: 'pending_verification' }),
                Barrel.countDocuments({ status: 'verified' }),
                Barrel.countDocuments({ status: 'paid' }),
                Barrel.countDocuments({ condition: 'damaged' })
            ]);

            const totalValue = await Barrel.aggregate([
                { $match: { status: 'verified' } },
                { $group: { _id: null, total: { $sum: '$calculatedPrice' } } }
            ]);

            res.json({
                totalBarrels,
                pendingVerification,
                verifiedBarrels,
                paidBarrels,
                damagedBarrels,
                totalValue: totalValue[0]?.total || 0
            });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

// Get real-time barrel locations (Manager only)
router.get('/barrels/locations/live',
    protect,
    rbac.requirePermission('approval_first'),
    async (req, res) => {
        try {
            const barrels = await Barrel.find({
                status: { $in: ['picked_up', 'in_transit', 'delivered'] }
            })
            .select('barrelId status currentLocation lastUpdatedBy updatedAt')
            .populate('lastUpdatedBy', 'name role')
            .lean();

            res.json({ barrels });
        } catch (error) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
);

module.exports = router;
