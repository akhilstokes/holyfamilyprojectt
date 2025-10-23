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
    getAdminStats
} = require('../controllers/userManagementController');
const { protect, admin, adminOrManager } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Listing routes
router.get('/staff', adminOrManager, getAllUsers); // Managers/Admins can list staff
router.get('/farmers', admin, getAllUsers);
router.get('/admins', admin, getAllUsers);
router.get('/', admin, getAllUsers);
router.get('/activity-logs', admin, getUserActivityLogs);
router.get('/stats', admin, getAdminStats);
router.get('/:id', admin, getUserById);

// Mutations (admin only)
router.post('/add', admin, addUser);
router.put('/:id/status', admin, updateUserStatus);
router.put('/:id/role', admin, updateUserRole);
router.delete('/:id', admin, deleteUser);
router.post('/bulk-actions', admin, bulkUserActions);

// Seed demo staff endpoint removed per request to avoid creating demo data
module.exports = router;



































