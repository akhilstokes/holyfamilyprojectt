 
const express = require('express');
const router = express.Router();
const { addBarrel, updateBarrel, getAllBarrels } = require('../controllers/barrelController');
const { protect, admin } = require('../middleware/authMiddleware');

// Only admin can add new barrels
router.post('/', protect, admin, addBarrel);
// Any authorized user (admin or field staff) can update a barrel
router.put('/:id', protect, updateBarrel);
// Any authorized user can view all barrels
router.get('/', protect, getAllBarrels);

module.exports = router;