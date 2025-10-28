const express = require('express');
const router = express.Router();
const { protect, adminOrManager, admin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/barrelCreationRequestController');


// Manager: Create request to admin for barrel creation
router.post('/', protect, adminOrManager, ctrl.createBarrelCreationRequest);

// Admin: List all barrel creation requests
router.get('/', protect, admin, ctrl.listBarrelCreationRequests);

// Admin: Update barrel creation request
router.put('/:id', protect, admin, ctrl.updateBarrelCreationRequest);

// Admin: Mark as completed
router.put('/:id/complete', protect, admin, ctrl.completeBarrelCreationRequest);

module.exports = router;

