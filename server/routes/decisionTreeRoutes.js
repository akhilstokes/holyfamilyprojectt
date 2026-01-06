const express = require('express');
const router = express.Router();
const {
  classifyQuality,
  compareWithKNN,
  getModelInfo
} = require('../controllers/decisionTreeController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/decision-tree/classify-quality
 * @desc    Classify material quality using Decision Tree algorithm
 * @access  Private (Lab Staff, Manager, Admin, Accountant)
 */
router.post('/classify-quality', protect, authorize('lab', 'lab_staff', 'lab_manager', 'manager', 'admin', 'accountant'), classifyQuality);

/**
 * @route   GET /api/decision-tree/compare-with-knn
 * @desc    Compare Decision Tree with KNN for same input
 * @access  Private (Lab Staff, Manager, Admin, Accountant)
 */
router.get('/compare-with-knn', protect, authorize('lab', 'lab_staff', 'lab_manager', 'manager', 'admin', 'accountant'), compareWithKNN);

/**
 * @route   GET /api/decision-tree/model-info
 * @desc    Get Decision Tree model information
 * @access  Private (Lab Staff, Manager, Admin, Accountant)
 */
router.get('/model-info', protect, authorize('lab', 'lab_staff', 'lab_manager', 'manager', 'admin', 'accountant'), getModelInfo);

module.exports = router;

