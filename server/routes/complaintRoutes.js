const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

// User routes (all authenticated users can create and view their own complaints)
router.post('/create', protect, complaintController.createComplaint);
router.get('/my-complaints', protect, complaintController.getMyComplaints);
router.get('/my-complaints/:id', protect, complaintController.getComplaint);
router.post('/my-complaints/:id/feedback', protect, complaintController.addFeedback);

// Manager/Admin routes
router.get('/all', protect, adminOrManager, complaintController.getAllComplaints);
router.get('/stats', protect, adminOrManager, complaintController.getComplaintStats);
router.get('/:id', protect, adminOrManager, complaintController.getComplaint);
router.put('/:id', protect, adminOrManager, complaintController.updateComplaint);

module.exports = router;







