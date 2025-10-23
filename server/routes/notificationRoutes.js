const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

router.use(protect);

// GET /api/notifications?limit=20
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const docs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications: docs, unread });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification: n });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

module.exports = router;
