const express = require('express');
const router = express.Router();
const {
  predictPrice,
  classifyQuality,
  forecastDemand,
  segmentCustomer,
  detectAnomaly,
  getModelMetrics
} = require('../controllers/knnController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/knn/predict-price
 * @desc    Predict price using KNN algorithm
 * @access  Private (Manager, Admin)
 */
router.post('/predict-price', protect, authorize('manager', 'admin'), predictPrice);
router.post('/predict-price', protect, authorize(['manager', 'admin']), predictPrice);

/**
 * @route   POST /api/knn/classify-quality
 * @desc    Classify material quality using KNN algorithm
 * @access  Private (Lab Staff, Manager, Admin, Accountant)
 */
router.post('/classify-quality', protect, authorize('lab', 'lab_staff', 'lab_manager', 'manager', 'admin', 'accountant'), classifyQuality);

/**
 * @route   POST /api/knn/forecast-demand
 * @desc    Forecast demand using KNN algorithm
 * @access  Private (Manager, Admin)
 */
router.post('/forecast-demand', protect, authorize('manager', 'admin'), forecastDemand);
router.post('/forecast-demand', protect, authorize(['manager', 'admin']), forecastDemand);

/**
 * @route   POST /api/knn/segment-customer/:userId
 * @desc    Segment customer using KNN algorithm
 * @access  Private (Manager, Admin)
 */
router.post('/segment-customer/:userId', protect, authorize('manager', 'admin'), segmentCustomer);
router.post('/segment-customer/:userId', protect, authorize(['manager', 'admin']), segmentCustomer);

/**
 * @route   POST /api/knn/detect-anomaly
 * @desc    Detect anomalies using KNN algorithm
 * @access  Private (Admin)
 */
router.post('/detect-anomaly', protect, authorize('admin'), detectAnomaly);
router.post('/detect-anomaly', protect, authorize(['admin']), detectAnomaly);

/**
 * @route   GET /api/knn/metrics/:modelType
 * @desc    Get KNN model performance metrics
 * @access  Private (Admin)
 */
router.get('/metrics/:modelType', protect, authorize('admin'), getModelMetrics);
router.get('/metrics/:modelType', protect, authorize(['admin']), getModelMetrics);

module.exports = router;

