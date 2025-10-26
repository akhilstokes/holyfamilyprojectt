const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createMovement } = require('../controllers/barrelMovementController');
const { validateBarrelMovementBasic } = require('../middleware/validationMiddleware');

// Staff barrel operations (moved from admin)
router.use(protect);

// Dispatch barrels -> treat as movement type 'out'
router.post('/dispatch', validateBarrelMovementBasic, (req, res, next) => {
  req.body = req.body || {};
  // default movement semantics for dispatch
  if (!req.body.type) req.body.type = 'out';
  return createMovement(req, res, next);
});

// Return barrels -> treat as movement type 'in'
router.post('/return', validateBarrelMovementBasic, (req, res, next) => {
  req.body = req.body || {};
  if (!req.body.type) req.body.type = 'in';
  return createMovement(req, res, next);
});

module.exports = router;








































