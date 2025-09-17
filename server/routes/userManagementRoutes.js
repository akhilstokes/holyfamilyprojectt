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
    bulkUserActions
} = require('../controllers/userManagementController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect, admin);

// User management routes
router.get('/', getAllUsers);
router.get('/activity-logs', getUserActivityLogs);
router.get('/staff', getAllUsers); // Specific route for staff before the generic :id route
router.get('/farmers', getAllUsers); // Specific route for farmers
router.get('/admins', getAllUsers); // Specific route for admins
router.get('/:id', getUserById);
router.post('/add', addUser);
router.put('/:id/status', updateUserStatus);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);
router.post('/bulk-actions', bulkUserActions);

// Seed demo staff endpoint removed per request to avoid creating demo data
module.exports = router;



































