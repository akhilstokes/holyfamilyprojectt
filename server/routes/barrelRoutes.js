 
const express = require('express');
const router = express.Router();
const { addBarrel, updateBarrel, getAllBarrels, getNextToUse, getExpiryQueue, markInUse, updateWeights, setLocation, setCondition } = require('../controllers/barrelController');
const { protect, admin, labOnly, adminOrManager } = require('../middleware/authMiddleware');

// Only admin can add new barrels
router.post('/', protect, admin, addBarrel);
// Any authorized user (admin or field staff) can update a barrel
router.put('/:id', protect, updateBarrel);
// Any authorized user can view all barrels
router.get('/', protect, getAllBarrels);

// New lifecycle endpoints
router.put('/:id/weights', protect, labOnly, updateWeights);
router.put('/:id/location', protect, setLocation); // allow lab/field via protect for now
router.put('/:id/condition', protect, adminOrManager, setCondition);
// FEFO endpoints
router.get('/fefo/next', protect, getNextToUse);
router.get('/fefo/queue', protect, getExpiryQueue);
router.post('/:id/mark-in-use', protect, markInUse);

module.exports = router;