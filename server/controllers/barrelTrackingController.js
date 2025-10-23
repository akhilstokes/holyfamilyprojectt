const Barrel = require('../models/barrelModel');
const BarrelMovement = require('../models/barrelMovementModel');
const BarrelDamage = require('../models/barrelDamageModel');
const Notification = require('../models/Notification');
const Payment = require('../models/paymentModel');
const { rbac, createValidationMiddleware, validationSchemas } = require('../middleware/enhancedAuth');

// Field Staff: Update barrel status with QR scan
const updateBarrelStatus = async (req, res) => {
    try {
        const { barrelId, status, location, timestamp } = req.body;
        
        // Validate barrel exists
        const barrel = await Barrel.findOne({ barrelId });
        if (!barrel) {
            return res.status(404).json({ message: 'Barrel not found' });
        }

        // Update barrel status and location
        barrel.status = status;
        barrel.currentLocation = getLocationFromStatus(status);
        barrel.lastUpdatedBy = req.user._id;
        await barrel.save();

        // Create movement log
        const movement = await BarrelMovement.create({
            barrel: barrel._id,
            type: 'status_update',
            fromLocation: barrel.lastKnownLocation,
            toLocation: barrel.currentLocation,
            notes: `Status changed to ${status}`,
            createdBy: req.user._id,
            location: location
        });

        // Send real-time update to manager
        await sendLocationUpdate(barrelId, status, location);

        res.json({
            success: true,
            barrel,
            movement,
            message: `Barrel ${barrelId} status updated to ${status}`
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Lab Staff: Update DRC measurement
const updateDRC = async (req, res) => {
    try {
        const { barrelId, drc, effectiveRubber, calculatedPrice, marketRate, barrelCapacity } = req.body;
        
        // Validate DRC range
        if (drc < 0 || drc > 100) {
            return res.status(400).json({ message: 'DRC must be between 0% and 100%' });
        }

        const barrel = await Barrel.findOne({ barrelId });
        if (!barrel) {
            return res.status(404).json({ message: 'Barrel not found' });
        }

        // Update barrel with DRC data
        barrel.drc = drc;
        barrel.effectiveRubber = effectiveRubber;
        barrel.calculatedPrice = calculatedPrice;
        barrel.marketRate = marketRate;
        barrel.status = 'pending_verification';
        barrel.lastUpdatedBy = req.user._id;
        await barrel.save();

        // Create movement log
        await BarrelMovement.create({
            barrel: barrel._id,
            type: 'drc_measurement',
            notes: `DRC measured: ${drc}%, Effective rubber: ${effectiveRubber}L, Price: ₹${calculatedPrice}`,
            createdBy: req.user._id
        });

        // Send notification to manager for verification
        await Notification.create({
            type: 'DRC_MEASUREMENT',
            recipientRole: 'manager',
            title: 'DRC Measurement Ready for Verification',
            message: `Barrel ${barrelId} DRC measured at ${drc}% - Price: ₹${calculatedPrice}`,
            priority: 'medium',
            data: { barrelId, drc, calculatedPrice }
        });

        res.json({
            success: true,
            barrel,
            message: 'DRC measurement recorded and sent for verification'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Manager: Get barrels pending verification
const getPendingVerification = async (req, res) => {
    try {
        const barrels = await Barrel.find({ 
            status: 'pending_verification',
            drc: { $exists: true, $ne: null }
        })
        .populate('lastUpdatedBy', 'name role')
        .sort({ updatedAt: -1 });

        res.json({ barrels });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Manager: Approve barrel verification
const approveVerification = async (req, res) => {
    try {
        const { barrelId } = req.params;
        const { notes } = req.body;

        const barrel = await Barrel.findOne({ barrelId });
        if (!barrel) {
            return res.status(404).json({ message: 'Barrel not found' });
        }

        if (barrel.status !== 'pending_verification') {
            return res.status(400).json({ message: 'Barrel is not pending verification' });
        }

        // Update barrel status
        barrel.status = 'verified';
        barrel.verifiedBy = req.user._id;
        barrel.verifiedAt = new Date();
        barrel.verificationNotes = notes;
        await barrel.save();

        // Create movement log
        await BarrelMovement.create({
            barrel: barrel._id,
            type: 'verification_approved',
            notes: `Barrel verified by manager. Notes: ${notes || 'No additional notes'}`,
            createdBy: req.user._id
        });

        // Send notification to customer
        await Notification.create({
            type: 'BARREL_VERIFIED',
            recipientRole: 'customer',
            title: 'Barrel Ready for Payment',
            message: `Barrel ${barrelId} has been verified and is ready for payment - Amount: ₹${barrel.calculatedPrice}`,
            priority: 'medium',
            data: { barrelId, calculatedPrice: barrel.calculatedPrice }
        });

        res.json({
            success: true,
            barrel,
            message: 'Barrel verification approved'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Manager: Reject barrel verification
const rejectVerification = async (req, res) => {
    try {
        const { barrelId } = req.params;
        const { notes } = req.body;

        const barrel = await Barrel.findOne({ barrelId });
        if (!barrel) {
            return res.status(404).json({ message: 'Barrel not found' });
        }

        // Update barrel status
        barrel.status = 'rejected';
        barrel.rejectedBy = req.user._id;
        barrel.rejectedAt = new Date();
        barrel.rejectionNotes = notes;
        await barrel.save();

        // Create movement log
        await BarrelMovement.create({
            barrel: barrel._id,
            type: 'verification_rejected',
            notes: `Barrel rejected by manager. Reason: ${notes || 'No reason provided'}`,
            createdBy: req.user._id
        });

        // Send notification to lab staff
        await Notification.create({
            type: 'BARREL_REJECTED',
            recipientRole: 'lab',
            title: 'Barrel Verification Rejected',
            message: `Barrel ${barrelId} verification rejected - Reason: ${notes || 'Please review and resubmit'}`,
            priority: 'high',
            data: { barrelId, rejectionNotes: notes }
        });

        res.json({
            success: true,
            barrel,
            message: 'Barrel verification rejected'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Customer: Get verified barrels for billing
const getVerifiedBarrels = async (req, res) => {
    try {
        const barrels = await Barrel.find({ 
            status: 'verified',
            calculatedPrice: { $gt: 0 }
        })
        .populate('verifiedBy', 'name')
        .sort({ verifiedAt: -1 });

        res.json({ barrels });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Customer: Process payment for barrels
const processPayment = async (req, res) => {
    try {
        const { barrelIds, totalAmount, paymentMethod, notes, paidAt } = req.body;

        if (!barrelIds || barrelIds.length === 0) {
            return res.status(400).json({ message: 'No barrels selected for payment' });
        }

        // Update barrel status to paid
        const updateResult = await Barrel.updateMany(
            { barrelId: { $in: barrelIds }, status: 'verified' },
            { 
                status: 'paid',
                paidAt: new Date(paidAt),
                paymentMethod,
                paymentNotes: notes,
                paidBy: req.user._id
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ message: 'No barrels were updated' });
        }

        // Create payment record
        const payment = await Payment.create({
            barrelIds,
            totalAmount,
            paymentMethod,
            notes,
            paidAt: new Date(paidAt),
            paidBy: req.user._id,
            status: 'completed'
        });

        // Create movement logs for each barrel
        for (const barrelId of barrelIds) {
            const barrel = await Barrel.findOne({ barrelId });
            if (barrel) {
                await BarrelMovement.create({
                    barrel: barrel._id,
                    type: 'payment_processed',
                    notes: `Payment processed - Amount: ₹${totalAmount}, Method: ${paymentMethod}`,
                    createdBy: req.user._id
                });
            }
        }

        // Send notification to accountant
        await Notification.create({
            type: 'PAYMENT_PROCESSED',
            recipientRole: 'accountant',
            title: 'Payment Processed',
            message: `Customer payment of ₹${totalAmount} processed for ${barrelIds.length} barrels`,
            priority: 'medium',
            data: { paymentId: payment._id, totalAmount, barrelCount: barrelIds.length }
        });

        res.json({
            success: true,
            payment,
            message: `Payment processed for ${updateResult.modifiedCount} barrels`
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get billing history for customer
const getBillingHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ paidBy: req.user._id })
            .sort({ paidAt: -1 })
            .limit(50);

        res.json({ payments });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Report barrel damage
const reportDamage = async (req, res) => {
    try {
        const { barrelId, damageType, severity, reportedBy, location, timestamp } = req.body;

        const barrel = await Barrel.findOne({ barrelId });
        if (!barrel) {
            return res.status(404).json({ message: 'Barrel not found' });
        }

        // Create damage report
        const damage = await BarrelDamage.create({
            barrelId: barrel._id,
            reportedBy: req.user._id,
            source: 'field',
            damageType,
            severity,
            status: 'open',
            location,
            reportedAt: new Date(timestamp)
        });

        // Update barrel status
        barrel.condition = 'damaged';
        barrel.damageType = damageType;
        barrel.status = 'damaged';
        await barrel.save();

        // Send notification to manager
        await Notification.create({
            type: 'DAMAGE_REPORT',
            recipientRole: 'manager',
            title: 'Barrel Damage Reported',
            message: `Barrel ${barrelId} reported as ${damageType} damage (${severity} severity)`,
            priority: severity === 'high' ? 'high' : 'medium',
            data: { barrelId, damageType, severity }
        });

        res.json({
            success: true,
            damage,
            message: 'Damage report submitted'
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Helper function to get location from status
function getLocationFromStatus(status) {
    const locationMap = {
        'scanned': 'field',
        'picked_up': 'in_transit',
        'delivered': 'lab',
        'drc_measured': 'lab',
        'verified': 'lab',
        'paid': 'customer',
        'damaged': 'repair_bay'
    };
    return locationMap[status] || 'unknown';
}

// Helper function to send real-time location update
async function sendLocationUpdate(barrelId, status, location) {
    try {
        // This would integrate with your real-time system (WebSocket, etc.)
        // For now, we'll just log it
        console.log(`Real-time update: Barrel ${barrelId} - Status: ${status}, Location: ${location}`);
        
        // In a real implementation, you would send this to connected manager clients
        // via WebSocket or similar real-time technology
    } catch (error) {
        console.error('Error sending real-time update:', error);
    }
}

module.exports = {
    updateBarrelStatus,
    updateDRC,
    getPendingVerification,
    approveVerification,
    rejectVerification,
    getVerifiedBarrels,
    processPayment,
    getBillingHistory,
    reportDamage
};
