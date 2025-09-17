const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const wageTemplateController = require('../controllers/wageTemplateController');

// Wage template management routes
router.post('/', protect, admin, wageTemplateController.createWageTemplate);
router.get('/', protect, wageTemplateController.getAllWageTemplates);
router.get('/defaults', protect, wageTemplateController.getDefaultTemplates);
router.get('/stats', protect, wageTemplateController.getWageTemplateStats);
router.get('/:templateId', protect, wageTemplateController.getWageTemplate);
router.put('/:templateId', protect, admin, wageTemplateController.updateWageTemplate);
router.delete('/:templateId', protect, admin, wageTemplateController.deleteWageTemplate);
router.post('/:templateId/set-default', protect, admin, wageTemplateController.setDefaultTemplate);
router.post('/:templateId/clone', protect, admin, wageTemplateController.cloneWageTemplate);

module.exports = router;




