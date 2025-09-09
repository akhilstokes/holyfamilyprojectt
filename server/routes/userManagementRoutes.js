const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    addUser,
    updateUserStatus,
    updateUserRole,
    getUserActivityLogs,
    deleteUser,
    bulkUserActions,
    seedDemoStaff
} = require('../controllers/userManagementController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect, admin);

// User management routes
router.get('/', getAllUsers);
router.get('/activity-logs', getUserActivityLogs);
router.get('/:id', getUserById);
router.post('/add', addUser);
router.put('/:id/status', updateUserStatus);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);
router.post('/bulk-actions', bulkUserActions);

// Utility: seed a demo staff for testing
router.post('/seed-demo-staff', seedDemoStaff);

module.exports = router;














