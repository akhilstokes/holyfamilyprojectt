const express = require('express');
const router = express.Router();
const { protect, admin, adminOrManager, adminManagerAccountant } = require('../middleware/authMiddleware');

const ctrl = require('../controllers/hangerSpaceController');

// Publicly nothing

// Staff: view vacant and claim/free
router.get('/vacant', protect, ctrl.vacant);
router.post('/:id/assign', protect, ctrl.staffAssign); // body: { action: 'claim'|'free', product? }

// Admin/Manager/Accountant: view and mark status; Admin: seed, bulk mark, and upsert/delete
router.get('/', protect, adminManagerAccountant, ctrl.list);
router.put('/:id/status', protect, adminManagerAccountant, ctrl.markStatus);

router.post('/seed-grid', protect, admin, ctrl.seedGrid);
// Bulk mark by ids
router.post('/bulk/status', protect, adminManagerAccountant, async (req, res) => {
  try {
    const { ids = [], status = 'vacant' } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'ids required' });
    if (!['vacant','occupied','empty_barrel','complete_bill'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const n = await require('mongoose').model('HangerSpace').updateMany(
      { _id: { $in: ids } },
      { $set: { status, updatedBy: req.user?._id || 'system', updatedAt: new Date() } }
    );
    res.json({ updated: n.modifiedCount || 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
router.post('/', protect, admin, ctrl.upsert);
router.delete('/:id', protect, admin, ctrl.delete);

module.exports = router;