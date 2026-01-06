const express = require('express');
const router = express.Router();
const { protect, adminManagerAccountant } = require('../middleware/authMiddleware');
const branchController = require('../controllers/branchController');

// Branch CRUD operations
router.get('/', protect, adminManagerAccountant, branchController.getBranches);
router.get('/:id', protect, adminManagerAccountant, branchController.getBranch);
router.post('/', protect, adminManagerAccountant, branchController.createBranch);
router.put('/:id', protect, adminManagerAccountant, branchController.updateBranch);
router.delete('/:id', protect, adminManagerAccountant, branchController.deleteBranch);

// Branch financial summary
router.get('/:id/financial-summary', protect, adminManagerAccountant, branchController.getBranchFinancialSummary);

module.exports = router;

