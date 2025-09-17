const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/chemicalController');

router.use(protect, admin);

router.get('/', ctrl.listChemicals);
router.post('/', ctrl.addOrUpdateChemical);
router.post('/:name/lots', ctrl.addLot);
router.post('/:name/issue', ctrl.issue);
router.get('/alerts/all', ctrl.alerts);

module.exports = router;


