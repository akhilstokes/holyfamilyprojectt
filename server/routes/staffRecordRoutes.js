const express = require('express');
const router = express.Router();
const {
  getAllStaffRecords,
  getStaffRecord,
  deleteStaffRecord,
  restoreStaffRecord,
  permanentlyDeleteStaffRecord,
  updateStaffRecordStatus,
  getStaffRecordByStaffId
} = require('../controllers/staffRecordController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/staff-records - Get all staff records
router.get('/', adminOrManager, getAllStaffRecords);

// GET /api/staff-records/:id - Get single staff record
router.get('/:id', adminOrManager, getStaffRecord);

// GET /api/staff-records/staff-id/:staffId - Get staff record by staff ID
router.get('/staff-id/:staffId', adminOrManager, getStaffRecordByStaffId);

// DELETE /api/staff-records/:id - Soft delete staff record (preserves login)
router.delete('/:id', adminOrManager, deleteStaffRecord);

// PUT /api/staff-records/:id/restore - Restore deleted staff record
router.put('/:id/restore', adminOrManager, restoreStaffRecord);

// DELETE /api/staff-records/:id/permanent - Permanently delete staff record (admin only)
router.delete('/:id/permanent', admin, permanentlyDeleteStaffRecord);

// PUT /api/staff-records/:id/status - Update staff record status
router.put('/:id/status', adminOrManager, updateStaffRecordStatus);

module.exports = router;




















