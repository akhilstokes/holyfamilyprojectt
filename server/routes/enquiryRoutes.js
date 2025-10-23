const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const {
  createEnquiry,
  getMyEnquiries,
  getAllEnquiries,
  approveEnquiry,
  rejectEnquiry,
} = require('../controllers/enquiryController');

// User routes
router.post('/', protect, createEnquiry);
router.get('/my', protect, getMyEnquiries);

// Admin routes
router.get('/', protect, admin, getAllEnquiries);
router.put('/:id/approve', protect, admin, approveEnquiry);
router.put('/:id/reject', protect, admin, rejectEnquiry);

module.exports = router;