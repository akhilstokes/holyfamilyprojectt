const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/staffInviteController');

// Public
router.get('/invite/:token', ctrl.getInviteDetails);
router.post('/verify-invite', ctrl.verify);

// Admin-only
router.use(protect, admin);
router.post('/invite', ctrl.invite);
router.get('/invites', ctrl.list);
router.post('/invites/:id/approve', ctrl.approve);
router.post('/:id/active', ctrl.setActive);

module.exports = router;


